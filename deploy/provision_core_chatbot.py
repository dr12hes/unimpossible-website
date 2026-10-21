"""Provision UNimpossible's isolated visitor bot inside the Core API container.

Copy docs/chatbot-knowledge.md to /tmp/unimpossible-chatbot-knowledge.md in
that container first. Existing bot configuration is preserved on reruns.
"""

import json
from pathlib import Path

from app.database import configure_platform_database, tenant_session_scope
from app.services.chat_bots_store import create_chat_bot, list_chat_bots
from app.services.chat_bot_knowledge_store import store_page_knowledge_chunks_scoped

TENANT = "optaro"
NAME = "UNimpossible website assistant"
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
            greeting="Hello. I’m UNimpossible’s AI assistant. Tell me what takes up too much time in your business, or ask about our website audit and engineering services. For a reply from the team, use the enquiry form below.",
            persona="You are UNimpossible's website AI assistant. Use only the approved bot knowledge to explain our services. Be candid when something is unknown. Never invent prices, customers, savings, available packages or appointments. Ask one useful question at a time about the visitor's problem and current tools. Explain that you are AI, not a live engineer. For quotes and human follow-up link to https://unimpossible.co.uk/#talk; ask visitors to use that form so their enquiry is saved and the team is notified. Do not claim a message has been sent, an appointment booked or a reply guaranteed by chat. Do not request secrets or sensitive customer data. Use concise British English. Do not mention internal Optaro tenant content or unrelated businesses.",
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
