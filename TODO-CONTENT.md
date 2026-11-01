# TODO: content to confirm

Everything the site shows as "[To be confirmed]" or hides. Fill values in `site-config.json` (placeholders section) and rebuild unless noted.

## Business basics
- [ ] **Service area / town** (`site.serviceArea`). The real Get-Let Facebook page is Scottish (Glasgow, Lanarkshire); the compliance page is England-only. Decide the jurisdiction. If it is Scotland, the compliance page must be rewritten (letting agent registration, Letting Agent Code of Practice).
- [ ] **Live site URL** (`site.siteUrl`), replacing the example.com placeholder (canonicals, sitemap, Open Graph).
- [ ] Company legal name and number (`brand.legalName`, `brand.companyNumber`).
- [ ] Contact details: email is set (agent@get-let.co.uk); still needed: phone, address, opening hours (`contact.*`).
- [ ] **Social accounts** (`social.*`); footer icons appear once set.
- [ ] Team members, roles and genuine photographs (`team`; About page).
- [ ] **Written permission to use the real Get-Let logo** (now used in the header, footer and favicon at the project owner's instruction) and any other real branding. Social material and property photography are still not used; all photos are Unsplash stock.

## Fees (`placeholders.fees.*`)
- [ ] Management charge (and whether on rent due or collected)
- [ ] Tenant-find / letting charge
- [ ] Setup, inspections, compliance arrangement
- [ ] Repair arrangement/administration charge (if any)
- [ ] Renewal and rent review, major works, exit/cancellation terms
- [ ] VAT treatment
- [ ] Internal only (never published): Rightmove and Zoopla costs; **Zoopla billing basis** (per branch / per listing / flat fee).

## Management plans
- [ ] Number of properties per model (internal planning)
- [ ] Fully Managed: **approval limit / spending ceiling**, reserve, major works rule (`placeholders.fullyManaged.*`)
- [ ] Limited Management: approval channel, landlord response window, no-reply rule (`placeholders.limitedManagement.*`)
- [ ] **Out-of-hours handling** and emergency authority per plan (`placeholders.operations.outOfHours`)
- [ ] Switching between plans (FAQ copy)

## 24-hour standard (`placeholders.standard24h.*`)
- [ ] When the clock starts, emergency vs routine, property access, parts delays, landlord approval time, escalation. Validate against contractor capacity before publishing.

## Operations (`placeholders.operations.*`)
- [ ] **Contractor team and trades** (no names published)
- [ ] **Certification agencies** (gas, electrical, EPC partners)
- [ ] **Tenant referencing** procedure
- [ ] **Deposit protection** procedure and scheme
- [ ] **Tenancy agreements** (template, who signs, tenancy information requirements)
- [ ] Takeover process for existing tenancies (Switch your agent page)
- [ ] Remote onboarding and reporting format (Overseas page), portfolio reporting (Portfolio page)

## Payments and protection (`placeholders.payments.*`)
- [ ] PayProp onboarding and the actual RBS / client-account arrangement
- [ ] Payment timing, insufficient-funds handling
- [ ] **Client money protection scheme** (required in England for agents holding client money)
- [ ] **Redress scheme** membership, complaints process and contact (`contact.complaintsContact`)

## Legal pages
- [ ] Privacy notice: controller, ICO registration, lawful bases, retention, rights
- [ ] Terms of business and website terms
- [ ] Compliance page: re-review before publishing and update "last reviewed" (`site.lastReviewedCompliance`). Recheck the landlord registration rollout (15 December 2026 start), the ombudsman (2028) and future EPC/Decent Homes dates.

## Forms and analytics
- [ ] Forms currently open the visitor's email app (addressed to the contact email). Connect a real form endpoint (`forms.mode = live`, `forms.endpoint`) for direct delivery; see README.
- [ ] GA4 measurement ID (`analytics.gaMeasurementId`), Search Console, CRM stages.
- [ ] Enable LocalBusiness structured data only after real address and phone exist.

## Imagery
- [ ] Replace stock photography with permitted, real photography of GETLET-managed homes when available. Never present stock images as managed properties.
