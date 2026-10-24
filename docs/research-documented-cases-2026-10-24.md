# Documented optimisation cases to adapt

Researched 24 October 2026. This is an evidence library, not permission to change the live site. Publishing approval stays on. The proposed borrowing below is our interpretation, not a claim the authors tested Unimpossible.

## Recommendation

Borrow methods and measurement designs; do not promise the published percentage uplifts. Skills can organise these methods, but a published skill or popular repository is not outcome evidence. A useful recommendation must identify the actual page problem, the relevant case, why its context fits, the proposed change, and what would count as success or harm.

The strongest evidence found here for commercial results is a controlled performance comparison. AI visibility evidence is substantially less transferable: the foundational GEO experiment measures generated-answer visibility in a constrained benchmark, not a deployed website's customer acquisition. None of these cases establishes a universal recipe for ChatGPT, Claude and Google AI results.

## 1. GEO: evidence-rich content in generated answers

**Source:** [Aggarwal et al., KDD 2024, full paper](https://arxiv.org/html/2311.09735v3), especially sections 3–6 and Appendix C.1.

**Type:** Academic benchmark experiment, not a live-site randomised commercial trial. Nine content alterations were compared with unchanged sources; 10,000-query dataset, 1,000-query test split, five random seeds. The main engine used GPT-3.5 and five retrieved sources. Citations, quotations and statistics improved the authors' visibility measures, with headline gains around 30–40%; keyword stuffing did not help reliably.

**Critical limit:** The Perplexity check used 200 samples with source texts uploaded as files and answers restricted to those files. It did not prove improved discovery of public websites. Visibility scores are not clicks, leads or sales; domain effects varied, and rankings were not evaluated.

**Borrow:** Add genuinely relevant, verified evidence and clear explanations to thin claims. Preserve provenance and factual review. Evaluate a fixed set of customer questions, recording platform/date and actual cited URLs. Never fabricate statistics or promise a 40% commercial lift. The [authors' repository](https://github.com/GEO-optim/GEO) is a reproducibility lead; licensing must be checked separately before copying assets/code.

## 2. Vodafone: faster rendering without changing the offer

**Source:** [Google web.dev/Vodafone case study, 17 March 2021](https://web.dev/case-studies/vodafone).

**Type:** First-party reported controlled A/B test published with Google. Paid traffic was split 50/50 between visually/functionally identical pages. Each version reportedly received approximately 100,000 clicks and 34,000 visits daily. Test duration and raw business totals were not disclosed in the article.

**Intervention/result:** Server-rendered critical HTML/widgets, reduced render-blocking JavaScript and optimised images. LCP improved 31%, accompanied by 8% more sales, 15% better lead-to-visit rate and 11% better cart-to-visit rate.

**Limit:** Very high-traffic telecom landing page; a bundle of performance changes. Not evidence every faster small-business site gains 8%, nor evidence of AI citation improvements.

**Borrow:** Audit image loading, critical rendering and real user performance. Keep offer/content stable when evaluating speed; measure completed qualified enquiries as well as load time. Prioritise a demonstrated bottleneck rather than adding performance work indiscriminately.

## 3. SearchPilot: forcing the chosen description lost traffic

**Source:** [Which is better: our meta description or Google's?, 19 November 2020](https://www.searchpilot.com/resources/case-studies/seo-split-test-lessons-forcing-google-respect-meta-descriptions-data-nosnippet).

**Type:** Testing vendor's controlled page-group SEO experiment. Variant pages were compared with a control-based forecast; not visitor-level randomisation. Sample/page counts undisclosed. Roughly four weeks: significance within two weeks, then another couple of weeks collected.

**Intervention/result:** Applied `data-nosnippet` to restrict on-page text Google could use, encouraging use of authored descriptions on location pages. Reported organic traffic fell 3%. A subsequent attempt adding nearby locations to descriptions was inconclusive.

**Limit:** Anonymous client and context-specific snippets; raw observations not published. This does not prove writing descriptions is harmful.

**Borrow:** Allow search engines to adapt snippets; don't add restrictive snippet controls merely because Google rewrites our copy. Inspect actual query/snippet relevance and retain reversibility. This is direct evidence against assuming our authored wording must outperform the engine's choice.

## 4. SearchPilot: description removal remained inconclusive

**Source:** [How good is Google at rewriting metadata?, 1 September 2021](https://www.searchpilot.com/resources/case-studies/seo-split-test-lessons-removing-meta-descriptions).

**Type:** Vendor-reported controlled page-group test on a site with hundreds of US storefront pages. Exact allocation, duration and raw sample sizes undisclosed.

**Intervention/result:** Removed generic descriptions so Google could select location-specific page content, such as opening hours and parking. Result was **inconclusive at 95% confidence**, with a positive direction at 80% confidence.

**Limit:** The weaker threshold is not a demonstrated win. Does not justify deleting descriptions sitewide, nor treating every missing description as a proven traffic loss.

**Borrow:** Use actual snippet behaviour to identify useful customer information. Label insufficient evidence honestly and distinguish writing-quality repairs from demonstrated growth opportunities. For a low-traffic single homepage, don't disguise a short before/after comparison as a controlled result.

## 5. SearchPilot: relevant content on thin travel listing pages

**Source:** [How Does AI-Generated Content Impact Listing Pages?, 26 June 2026](https://www.searchpilot.com/resources/case-studies/how-does-ai-content-impact-listing-pages).

**Type:** Vendor-reported controlled page-group SEO experiment, comparing observed organic sessions against a control-based forecast. Public article omits exact page/sample counts, duration and numerical interval.

**Intervention/result:** Added destination-specific AI-generated descriptions to pages with little unique content, rendering the additions both server-side and client-side. Reported estimated organic-session uplift: 18%, described as statistically significant.

**Limit:** Content expansion and HTML availability changed together, so this cannot isolate AI authorship, word count, freshness or rendering. It measures traditional organic traffic, not AI-answer citations. Anonymous travel pages differ from a service homepage.

**Borrow:** Review whether each service page actually answers customer questions, then fill evidenced gaps using verified business facts and accessible HTML. Avoid bulk generic blog production. Measure page/query coverage, enquiries and quality rather than treating content volume as success.

## 6. Unbounce: one-word CTA experiment

**Source:** [Michael Aagaard, How to Design Call to Action Buttons that Convert](https://unbounce.com/conversion-rate-optimization/design-call-to-action-buttons/).

**Type:** First-party practitioner/vendor A/B-test report on Unbounce's own paid-search landing page. Ran three weeks; sample size, randomisation mechanics, intervals and completed-sale data not disclosed in the article.

**Intervention/result:** Changed the trial CTA from second-person to first-person wording. The reported result was a 90% increase in **button click-through rate**.

**Limit:** Clicks are not completed trials or customers. Old, single-context, selectively published result with limited statistical detail. It does not establish that “my” universally beats “your”.

**Borrow:** Make the action and promised outcome explicit, then evaluate suitable wording against the downstream completion event. Treat first-person phrasing as an optional hypothesis, not an automatic rewrite rule. Never declare success from CTA clicks alone.

## 7. MECLABS: form context can matter more than field count

**Source:** [Optimizing Web Forms, first research July 2014; article 23 August 2018](https://marketingexperiments.com/conversion-marketing/optimizing-web-forms-2).

**Type:** Research vendor's controlled test, protocol 1636, with an anonymous news syndication company. Duration, raw sample sizes and allocation details not disclosed.

**Intervention/result:** Control had 11 fields (10 required), navigation and competing CTAs. Two treatments removed distractions and changed form presentation: 15 fields (9 required) and 10 fields (all required). Reported lead lifts: 109% and 87%; no statistically significant difference between treatments. Contextual questions explained why information was requested. The headline 226% lift belongs to a subsequent application elsewhere, not this initial comparison.

**Limit:** Multiple changes, anonymous partner; more collected information is not proof of better sales-qualified leads. No published downstream quality result here.

**Borrow:** Explain each requested field, group questions logically and remove competing actions where justified. Track qualified enquiries and sales acceptance before declaring “lead quality” improved. Do not enforce a universal maximum field count.

## 8. MECLABS: chat clicks rose while forms and calls fell

**Source:** [Online Testing: How a pop-up chat test increased conversion 120%, 7 October 2013](https://marketingexperiments.com/lead-generation/pop-up-chat-test).

**Type:** Research vendor's experiment on an anonymous Fortune 500 B2B paid-search page. Sample size, duration and allocation not disclosed.

**Intervention/result:** Replaced timed pop-up chat with a static chat invitation; also added value copy and moved the form down. Chat clicks rose 120.60% (reported 99% confidence), but form submissions fell 60.54% (99%) and phone calls fell 33.64% (89%). The revenue benefit described was a projection, not realised revenue.

**Limit:** Bundled changes, channel substitution, incomplete downstream evidence. A chatbot or chat widget can move conversions between channels without creating more business.

**Borrow:** For the planned chatbot module, measure total qualified leads across chat, forms and calls, with duplicate handling. Keep channel loss as a guardrail; don't optimise widget engagement at the expense of the site's actual purpose.

## How these become reusable skills

These are proposed local adaptations, not installed skills or new product features:

| Workflow | Mandatory output | Evidence above |
|---|---|---|
| AI/content evidence review | Claim-source map, missing customer answers, factual review, dated visibility sample | 1, 5 |
| Search snippet review | Real query/snippet problem, proposed wording, tradeoffs, no fixed “winning” length | 3, 4 |
| CTA/offer review | User intent, promise, action, downstream conversion event | 6 |
| Form and lead review | Field purpose, friction, qualification definition, total qualified enquiries | 7 |
| Chatbot review | Cross-channel qualification outcomes and lost-conversion guardrails | 8 |
| Performance review | Measured bottleneck, small proposed fix, performance and commercial outcome | 2 |

For our small site, start with correct measurement, a small customer-question list, business-fact review and one approved material change at a time. Use observational language until volume and a defensible comparison permit stronger claims. Do not add a large experiment platform merely to satisfy a checklist. Research review is separate from software tests: lean engineering checks do not excuse unsupported marketing claims.

## Reuse boundary

Link and paraphrase these cases with attribution; publication does not make their copy, screenshots, proprietary frameworks or code freely reusable. Before adopting an external skill, record its exact repository revision, licence, maintenance date and supporting sources. Reuse the defensible procedure; write our own business-specific content. This note does not claim legal review or grant reuse permission.
