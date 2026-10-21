"""Provision UNimpossible's isolated visitor bot inside the Core API container.

Copy docs/chatbot-knowledge.md to /tmp/unimpossible-chatbot-knowledge.md in
that container first. The approved enquiry persona and delivery policy are reconciled on reruns.
"""

import json
from pathlib import Path

from app.database import (
    configure_platform_database,
    get_platform_session,
    tenant_session_scope,
)
from app.services.chat_bot_knowledge_store import store_page_knowledge_chunks_scoped
from app.services.chat_bots_store import (
    create_chat_bot,
    list_chat_bots,
    update_chat_bot_settings,
)

TENANT = "optaro"
NAME = "UNimpossible website assistant"
PERSONA = (
    "You are UNimpossible's AI enquiry assistant. Give useful, concise answers from "
    "approved bot knowledge in British English. Answer first, then ask one relevant "
    "question about the visitor's task, existing tools or timescale. Use the specific "
    "business/problem already described; never ask them to repeat it or ask several "
    "questions together. After receiving contact details, summarise the known request "
    "and ask for confirmation, rather than continuing a questionnaire. After confirmation, "
    "give a short receipt/status answer and stop qualifying. For human follow-up, collect their name and email in this chat, briefly "
    "summarise the request and ask whether they want it passed to the team. If they "
    "correct it, summarise the corrected request before asking again. Never make "
    "them repeat everything in a separate form. A provided enquiry_receipt with "
    "status emitted proves only that the enquiry is saved and delivery queued; "
    "without it, say the request is being processed and to watch for the automatic "
    "acknowledgement. Never claim an email was delivered or an appointment booked. "
    "If they decline contact details, continue helping. Do not invent prices, "
    "available subscriptions, trials, customers, savings or guarantees. The AI Enquiry "
    "Assistant subscription is being developed; signup/payment is not available yet. "
    "Do not request secrets. For a service failure, offer hello@unimpossible.co.uk "
    "or https://unimpossible.co.uk/#talk as fallback. Never expose unrelated tenant data."
)
GREETING = (
    "Hi, I'm UNimpossible's AI assistant. Tell me what you'd like to make easier "
    "in your business, or ask about our website audit. I can also take an enquiry "
    "here and pass it to the team."
)
configure_platform_database()
with tenant_session_scope(TENANT) as db:
    bot = next((b for b in list_chat_bots(db) if b["name"] == NAME), None)
    if not bot:
        bot = create_chat_bot(
            db,
            name=NAME,
            tenant_id=TENANT,
            created_by_email="david.riches@optaro.io",
            allowed_url="https://unimpossible.co.uk/*, https://www.unimpossible.co.uk/*",
            knowledge_source="bot",
            position="bottom_right",
            estate_helper=False,
            title="Ask UNimpossible",
            language="en",
            greeting=GREETING,
            persona=PERSONA,
            voice="Helpful, practical and clear. No hype or pressure.",
            widget_theme={
                "primary_color": "#0F3D33",
                "header_background": "#0F3D33",
                "header_text_color": "#FFFFFF",
                "panel_background": "#FFFFFF",
                "text_color": "#172C26",
                "link_color": "#0F3D33",
                "border_radius": "16px",
                "font_family": "Arial, sans-serif",
            },
        )
    bot_id = bot["id"]
    update_chat_bot_settings(db, bot_id=bot_id, persona=PERSONA, greeting=GREETING)
    db.commit()

# Tenant policy stays in Core's canonical skill configuration, scoped to this bot.
from app.services.skill_registry import get_registry
from app.services.skills import register_all

registry = get_registry()
registry.boot(register_all)
with get_platform_session() as db:
    config = dict(
        registry.get_state(db, TENANT, "chat_lead_capture").get("config") or {}
    )
    policies = dict(config.get("bots") or {})
    policies[str(bot_id)] = {
        "notify_email": "hello@unimpossible.co.uk",
        "from_email": "hello@unimpossible.co.uk",
        "brand_name": "UNimpossible",
        "accent": "#0F3D33",
        "acknowledge": True,
        "dispatch_sales": False,
    }
    config["bots"] = policies
    registry.set_config(db, TENANT, "chat_lead_capture", config)
    db.commit()
count = store_page_knowledge_chunks_scoped(
    TENANT,
    bot_id=bot_id,
    title="UNimpossible services and visitor FAQs",
    text_body=Path("/tmp/unimpossible-chatbot-knowledge.md").read_text(),
    page_url="https://unimpossible.co.uk/",
)
if not count:
    raise RuntimeError("No chatbot knowledge was stored")
print(
    json.dumps(
        {"botId": bot_id, "embedToken": bot["embed_token"], "knowledgeChunks": count}
    )
)
