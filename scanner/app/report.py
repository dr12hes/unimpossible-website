"""Render a Report (the model's structured output) as a standalone HTML page."""
from __future__ import annotations

import re
import time
from pathlib import Path

from jinja2 import Environment, FileSystemLoader, select_autoescape
from markupsafe import Markup, escape

from .llm import Report

_env = Environment(loader=FileSystemLoader(str(Path(__file__).parent / "templates")), autoescape=select_autoescape(["html"]))


def _paras(text: str) -> Markup:
    parts = [p.strip() for p in re.split(r"\n\s*\n", text or "") if p.strip()]
    return Markup("".join(f"<p>{escape(p)}</p>" for p in parts))


def _band(score: int) -> str:
    return "good" if score >= 7 else ("mid" if score >= 4 else "low")


_env.filters["paras"] = _paras
_env.filters["band"] = _band


def render_report(report: Report, meta: dict) -> str:
    return _env.get_template("report.html").render(r=report, meta=meta, date=time.strftime("%-d %B %Y"))
