# Search cost and usage check — 25 October 2026

Recommendation: Serper Starter is the lowest unit price among the three providers already integrated with Core: $50 for 50,000 Google search credits ($1/1,000), expiring six months after purchase, excluding taxes. This makes sense for shared Core demand, not for only 90 monthly Unimpossible searches. Brave Search is $5/1,000 with $5 recurring monthly free credits; Tavily basic search is one credit per request at $0.008/credit pay-as-you-go (advanced search uses two credits). Prices checked against provider pages today.

Sources: https://serper.dev/ ; https://api-dashboard.search.brave.com/documentation/pricing ; https://docs.tavily.com/documentation/api-credits

## Observed usage

Production `agent_plugin_runs`, 1–25 October, capabilities web.search/web.research only. Counts are tool invocations, not provider invoices: one tool can try several providers or use cached/browser results. Provider identity and billed credits are not recorded per invocation, so exact billed attribution is unavailable.

| Workload | Attempts | Successful | Distinct input hashes |
|---|---:|---:|---:|
| Company/counterparty profiles | 3,574 | 1,576 | 798 |
| Editorial recommendations | 49 | 46 | 32 |
| Email reply research | 16 | 16 | 14 |
| Blog posts | 8 | 8 | 8 |
| New Unimpossible AI review | 7 | 0 | 3 |
| Personal assistant | 1 | 1 | 1 |
| Website recommendation smoke check | 1 | 1 | 1 |

Company-profile searches span 15–25 October. Repeated hashes warrant investigation; these counts alone do not establish that repetition was wasteful. The seven AI-review attempts include three queries in each of two review attempts and a scoped diagnostic. No raw private queries or credentials are included here.

Core's shared counters: Serper 1,461/2,500; Brave 1,002/1,000; Tavily 1,164/1,000. These are internal counters, not authoritative provider balances or verified calendar-month usage. Direct Serper response was HTTP400, `Not enough credits`, despite Core's counter implying remaining allowance. Brave and Tavily were paused by Core's configured budget limits; their provider balances were not independently verified. No budgets, provider settings or purchases were changed.

The current pilot requests three queries per audit, including manual audits and retries. Ninety is a nominal 30-day daily schedule, not an enforced monthly maximum. Reserve/cache/billing attribution improvements are not implemented in this slice. User initially requested free allowances only, then said they would top up after seeing price and usage; no purchase has been made by the agent.
