# Site audit: a real tool on the home page

Agreed 2026-10-20. Replaces the staged "seven checks" demo, which showed the same numbers for every address.

## The promise

Read a business's website the way an AI expert would, work out what the business is and how its customers buy,
derive what *that* kind of site has to do, judge the site against it, find the regional and national competitors
ourselves, judge them by the same yardstick, and say what to fix first. Nothing invented: every finding points at
a page we fetched, and when we can't tell, we say so, because that is the finding.

## Two stages

**Hook, on the page, before any email.** Fetch the home page plus about/contact/services, one Sonnet call:
"what we think you do, who for, where", the yardstick for a business like this, three observations with evidence.
About ten seconds, a few pence. Ends with "the full audit, including who you're up against, takes a few minutes.
Where shall we send it?"

**Full audit, after the email is confirmed.** Our code does the fetching and searching; the model does the judgment.

1. Crawl their site (home + up to 7 chosen pages). Technical basics: HTTPS, headers, cert, robots and AI-bot rules,
   sitemap, llms.txt, viewport, weight.
2. Companies House: registered name, age, SIC codes (free API, optional).
3. Haiku reads every page into structured notes (offers, CTAs, proof, prices, contact, audience).
4. Sonnet builds the business model: offering, customer, service area, buying journey (trigger, urgency, research
   depth, decision criteria), positioning, and from that the criteria this site is judged on, plus the searches a
   customer would make.
5. Search those queries (Brave or Serper), Google Places for the category near their area (optional). Drop
   directories and aggregators. Sonnet picks regional, national and "search" competitors with a reason each.
6. Crawl each competitor (home + 3 pages), Haiku notes, light technical read. Authority proxy via Open PageRank
   (optional). Visibility: which domains appear for which queries.
7. Sonnet assesses every site against the same criteria with evidence, then writes the report: what we think you do,
   how customers buy, the yardstick, the side-by-side, conversion, content and authority, competitors, search
   visibility, AI readiness, technical footnote, three moves, caveats, and how we did it.
8. Rendered as an HTML page, emailed as a link, copy to hello@.

## Models and cost

| Stage | Model | Typical cost |
|---|---|---|
| Hook | claude-sonnet-5-5 | 3 to 4p |
| Page notes | claude-haiku-5-5 | about 1p per audit |
| Business model, competitor pick, assessments, report | claude-sonnet-5-5 | 25 to 35p |
| Optional: final write-up on Opus | claude-opus-5-5 | +20p |

Guardrails: hook rate-limited per IP and globally; fetched pages cached a week; a domain's hook and report reused for
a week; the full audit only runs after the email is confirmed by link; private addresses and non-web ports refused;
page bodies capped at 2 MB; every outbound fetch resolved and checked before connecting.

## Where it runs

`scanner/`: a FastAPI service in the same compose file as the site, routed by Traefik at `unimpossible.co.uk/api/`,
SQLite in `/home/docker/unimpossible/data`, secrets in `/home/docker/unimpossible/.env` (never in git), shipped and
rebuilt by `deploy/deploy.sh`.

## Honesty rules in the output

- Every observation carries its evidence (a quote or a page reference).
- Confidence is stated. "We couldn't tell what you do from your site" is a valid, complete result.
- Scores, where shown, mean "how well this page does the job this kind of customer needs", nothing more generic.
- The report says how we got there: how we read the business, what we searched, why we picked those competitors.
