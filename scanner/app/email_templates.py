"""Shared, autoescaped transactional email presentation."""
from pathlib import Path

from jinja2 import Environment, FileSystemLoader, select_autoescape

_env = Environment(
    loader=FileSystemLoader(str(Path(__file__).parent / "templates")),
    autoescape=select_autoescape(["html"]),
)


def render_email(kind: str, *, name: str, domain: str, link: str, origin: str) -> str:
    if kind not in {"confirmation", "report"}:
        raise ValueError("Unknown email kind")
    return _env.get_template("email.html").render(
        confirmation=kind == "confirmation", first=name.split(" ")[0],
        domain=domain, link=link, origin=origin.rstrip("/"),
    )
