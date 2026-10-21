import pytest
from app.email_templates import render_email


@pytest.mark.parametrize("kind,action,path", [
    ("confirmation", "Confirm &amp; start my audit", "confirm"),
    ("report", "Read my audit", "report"),
])
def test_email_has_action_and_escapes_recipient_input(kind, action, path):
    link = f"https://unimpossible.co.uk/api/{path}/private-token"
    html = render_email(kind, name='<script>alert(1)</script> Reader',
                        domain='example.com<img src=x>', link=link, origin='https://unimpossible.co.uk/')
    assert action in html and html.count(f'href="{link}"') == 2
    assert '<script>' not in html and '<img src=x>' not in html
    assert '&lt;script&gt;' in html and '&lt;img src=x&gt;' in html
    assert 'https://unimpossible.co.uk/privacy' in html
    assert 'role="presentation"' in html and 'max-width: 600px' in html
    assert ('We won’t start the audit unless you confirm.' in html) == (kind == 'confirmation')


def test_unknown_template_is_rejected():
    with pytest.raises(ValueError):
        render_email('unknown', name='', domain='', link='', origin='')
