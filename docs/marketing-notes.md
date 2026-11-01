# Marketing notes: website mapped to the presentation marking areas

Source: *GETLET Market Research Report* (research cut-off 1 November 2026) and the Business Approach and Operating Model. Figures that the report labels as assumptions are labelled the same way here. Nothing in this file is observed GETLET performance.

> Place the two source PDFs in this folder: `GETLET_Business_Approach_and_Operating_Model.pdf` and `GETLET_Market_Research_Report.pdf`.

## 1. Market background
- England had 4.7 million privately renting households in 2024–25 (19% of households); the share has been broadly stable since 2013–14 (English Housing Survey, via report [S02]).
- ONS average UK private rent was £1,406 in September 2026, up 3.8% annually; England £1,466 (+4.0%), Wales £848, Scotland £1,011 (+0.7%) [S05]. ONS covers all tenancies; portal asking rents measure a different market and must not be combined.
- 45% of direct landlords own one property, 38% two to four, 17% five or more [S04]. This supports testing both small-landlord and portfolio messaging (landing pages: Portfolio, Overseas, Switch agent).
- No verified lettings-agency revenue market size exists; rental stock is the addressable market, not GETLET's fee income.
- England law: main Renters' Rights Act reforms in force 1 May 2026; landlord registration announced from 15 December 2026; ombudsman expected 2028. Website response: dated, England-only compliance page.

## 2. Site structure
Home; Services; Management Plans; Fees; How It Works; Repairs; Rent Collection; Compliance; three landlord landing pages (Overseas, Portfolio, Switch agent); About; Contact / Book a Valuation; FAQ; Privacy; Terms; Complaints; 404. The main commercial job is landlord conversion to a valuation; tenants get a secondary route (tenant form, repair form).

## 3. Marketing mix (7 Ps)
| P | Application on the site |
|---|---|
| Product | Two repair-authority models (Fully Managed, Limited Management), repair scenario, statement explainer |
| Price | Fees undecided: structure only, "Contact us for pricing", written quotation CTA; no invented "from" price |
| Place | Configurable service area; website, agreed portal packages, remote communication |
| Promotion | Local SEO, Rightmove/Zoopla, referral partners, useful social content, controlled paid-search test |
| People | Named property manager and vetted contractors; team block "to be added" until real people exist |
| Process | Nine-step How It Works; PayProp rent flow; repair workflow |
| Physical evidence | Illustrative sample statement (labelled), real photography only when it exists; no fabricated reviews or credentials |

## 4. SEO plan
Primary keyword per page (report section 5; difficulty is an analyst judgement, not measured volume; validate in Keyword Planner):

| Page | Primary keyword |
|---|---|
| Home | letting agents [town] / property management [town] |
| Management Plans | fully managed lettings [town]; limited property management [town] |
| Fees | letting agent fees [town] |
| Rent collection | how to read a landlord rent statement |
| Repairs | landlord repair approval process |
| Compliance | Renters Rights Act landlord checklist |
| Overseas / Portfolio / Switch | overseas landlord property management [town] / buy to let management [town] / switch letting agent [town] |
| Contact | rental valuation [town] |
| Services | landlord services [town] |

Technical: unique title and description per page, one H1, canonical URLs, Open Graph and Twitter metadata, sitemap.xml, robots.txt, descriptive alt text, responsive WebP images. No LocalBusiness schema until real details exist. Avoid near-duplicate location pages.

## 5. Social plan (roles to test, not proven conversion)
Facebook: local landlord trust and community. Instagram: visual property and service evidence. TikTok: tenant discovery and short explainers (landlord reach is a test). LinkedIn and email: broker/accountant referrals and landlord retention. Suggested cadence from the report is a planning proposal: Facebook 3 a week, Instagram 3 a week, TikTok 2 a week, LinkedIn 1 a week. Every post leads to one action (book a valuation, compare plans, request a viewing). Use the UTM convention in the README. Do not publish tenant faces, documents or occupied-home details without permission.

## 6. PPC pilot (planning assumptions only)
Proposed test: £600 media spend over about 30 days (about £20 a day) in one confirmed service area. Report CPC ranges are analyst assumptions: £2–£8 local landlord management, £3–£10 fees and switching.

| £600 spend | £2 CPC | £5 CPC | £8 CPC |
|---|---|---|---|
| Clicks (budget ÷ CPC) | 300 | 120 | 75 |
| Leads at 5% click-to-lead (hypothetical) | 15 | 6 | 3.75 expected |
| Media cost per lead | £40 | £100 | £160 |

If 20% of leads became instructions (hypothetical), media-only acquisition cost would be £200, £500 or £800. Add landing-page, creative and staff costs before judging profitability. Separate brand, landlord and tenant campaigns; exclude jobs, courses and free-template searches. Portal costs (Rightmove £500, Zoopla £150 a month) are internal brief assumptions and are not published on the site; review incrementality after about 90 days (a planning choice).

## 7. Affiliate and referral ideas
Mortgage brokers (reciprocal introductions), accountants and solicitors (co-authored guidance), landlord insurance providers (disclose commission), landlord associations (no logo or endorsement without membership), contractors (no undisclosed mark-up), existing-landlord referral credit (suggested only, no amount set; disclose incentives). The site invites enquiries from referral partners without claiming any existing partnership.

## 8. Analytics plan
GA4 loaded only after consent, via the config ID. Events: landlord_enquiry / generate_lead, tenant_viewing_request, repair_report, form_start, form_submit_success, phone_click, plan_comparison_used, statement_example_viewed, cta_click. No personal data sent. UTM source, medium and campaign stored with each enquiry. Report monthly: spend → valid leads → qualified leads → valuations → instructions → contribution, with tenant and repair traffic separate. KPI targets are provisional planning ranges (see README).

## 9. Improvement ideas
Run local Keyword Planner forecasts; interview landlords and tenants to validate personas; obtain written competitor quotes in the launch area; validate the 24-hour standard against contractor capacity before publishing definitions; add real photography, team and reviews only once genuine; connect a real form endpoint; run a Lighthouse/accessibility audit on the deployed site and record the result.

## Data gaps (from the report)
Service geography (England vs Scotland), permission to use real Get-Let material, social feed screenshots, live portal quotations, like-for-like competitor quotes, GETLET fees and VAT, 24-hour validation, PayProp/RBS and client money protection, local keyword data, customer interviews, GA4 baseline, property facts, and company/credential evidence.
