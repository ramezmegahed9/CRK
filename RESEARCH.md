# Crackwits Lead Engine — daily research playbook

The daily task follows this file. Output goes to `data/leads.json` only (append, never delete or edit existing leads).

## Who we are
Crackwits — premium Kuwait-based creative agency (360: strategy, branding, UX/UI, web, social, ads).
Clients/cases: Twig, Lillajar, OVO, Pizza Express, Cheesecake Factory, Dean & DeLuca, KidZania, Coya, Illicocash.
Site: https://www.crackwits.com · Cases: https://www.crackwits.com/case-studies

## Service priority
1. Website  2. Marketing (social designs, social ads, social media management, Google Ads)  3. Branding

## Markets & target
- Kuwait and Lebanon only. Class A / B businesses only (premium positioning, real budget).
- Good: new openings, rebrands, expansions (new branch/market), funding rounds, new projects/launches,
  heritage brands with outdated digital presence, explicit RFPs/tenders for website/branding/marketing.
- Skip: global chains run by HQ marketing, budget/mass-market businesses, job posts, freelancer platforms,
  agencies (competitors), anything older than ~4 months without a fresh signal.

## Rules
- Search only. Never post, like, comment, follow, join groups or message anyone.
- Every lead needs at least one dated, linkable source proving the "why now" signal.
- Never invent contact data. Leave fields empty if not found publicly.
- No duplicates: check `id` and company name against existing leads.
- Minimum 5 new leads per run; mix both markets; quality over volume.

## Lead fields
id (`kw-`/`lb-` + slug), added (YYYY-MM-DD), company, country, city, sector, tier (A/B+/B),
priority (hot/warm/cold), score (0–100 fit), services[], signal (why now, with facts), angle (our pitch),
contacts{website, instagram, linkedin, phone, email, decision_maker}, evidence[{title,url,date}],
message_en, message_ar (short, elegant, personal, reference the signal + 1–3 relevant Crackwits clients, end with a soft ask).

Set top-level `updated` to the run date.
