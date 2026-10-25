# First AI-search and crawler baseline — 25 October 2026

Results are recorded in the hosted dashboard using its existing evidence cards. No live-site content, robots rules, firewall, logging configuration, publishing permissions or tracking was changed. Existing history remains.

## Crawler access

Read the website proxy logs and matching Traefik website-router error logs for 22 October 11:40 through 25 October 11:40 UTC. Matched user-agent plus the forwarded client address against official provider IP lists downloaded on the review date. Checked the proxy trust configuration and that the website container has no public port bindings. This excludes name-only spoofed or test requests.

- OpenAI OAI-SearchBot: 12 successful robots.txt fetches and two redirects from matching provider ranges. No verified homepage fetch in this window.
- Claude-SearchBot and PerplexityBot: no verified requests in the retained sample. This means unknown, not blocked.
- Excluded unmatched identities: 7 OpenAI-search-labelled, 11 Claude-search-labelled and 12 Perplexity-labelled requests.
- One matching Anthropic address received 403 for `/xmlrpc.php`; the website log identifies ClaudeBot, the training crawler. This is a protected RPC endpoint, not public search content. Retain the restriction.

The edge logs only retain 4xx/5xx requests. No network-drop investigation, packet capture or historical provider-range reconstruction was performed. No claim that all AI crawlers can fetch the homepage follows from this evidence.

Official identity sources: [OpenAI](https://openai.com/searchbot.json), [Anthropic](https://claude.com/crawling/bots.json), [Perplexity](https://www.perplexity.com/perplexitybot.json). Provider-list snapshots, hashes, timestamps and successful request details are in `ai-crawler-access-2026-10-25.json`. Unrelated visitor logs are not copied into the dashboard or repo.

## Answer observations

Fixed questions, new Google thread per question, no URL supplied. Observed around 11:41–11:46 UTC. Google AI Mode used the existing signed-in UK owner session; personalisation is possible. Perplexity Search was signed out. Exact underlying models were not exposed.

| Question | Google AI Mode | Perplexity Search |
|---|---|---|
| Who can help a Norfolk business automate enquiry handling? | Other providers; no Unimpossible mention/citation/recommendation | Nova and Prime AI Agency Norwich; no Unimpossible mention/citation/recommendation |
| Who builds AI assistants for small UK businesses? | Other providers; no Unimpossible mention/citation/recommendation | Sign-in required; unavailable, excluded |
| What does UNimpossible do? | Recognised Norfolk engineering team and cited homepage; no independent supplier recommendation | Not run after sign-in requirement |

Four completed answers, one unavailable attempt. Google: one branded citation in three answers; zero inclusions across two unbranded answers. Perplexity: zero inclusions in one completed unbranded answer. These are counts from a small sample, not market share or a visibility score. ChatGPT could not load the account/browser check; no question was submitted and no result was counted. Claude was not sampled.

Question-level summaries and displayed source URLs are in `ai-search-baseline-2026-10-25.json`. Related search sources and inline citations are distinguished where exposed. Competitor statements in AI answers are not independently endorsed. The branded answer described illustrative automation examples as offerings; it did not validate delivered customer results.

## Dashboard and verification

- Crawler record: `8e8cf613-ea88-5063-92d7-be66a2b01692`.
- Answer record: `5ea0f8b2-5255-5415-b44d-56892c75dab0`.
- Two audit events `ai_baseline.record`; no previous records overwritten.
- Existing restricted results API returns both records and `approval_required=true`.
- Both rendered in the hosted dashboard; screenshot `ai-baseline-dashboard-2026-10-25.png`.
- Focused assertions checked range membership, logged-response counts, completed-answer denominator, unavailable handling and the actual homepage citation. No product code changed, so no unrelated test suite or deployment.

Repeat these questions under the same product/account/locale conditions before comparing. This task starts a manual baseline; no recurring monitoring job was created. Earlier recommendation cards remain dated history, with these later observations clarifying what has now been checked.
