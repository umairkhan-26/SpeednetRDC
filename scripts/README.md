# Provider data pipeline

Converts the eSIM provider's raw `plans.json` + `zones.json` export into the
typed data the app actually consumes (`src/data/generated/*.json`, loaded by
the thin wrappers in `src/data/{countries,plans,regions}.ts`).

## Re-running after a new data drop from the provider

1. Replace `scripts/source/plans.json` and `scripts/source/zones.json` with the new export.
2. `node scripts/match-countries.mjs` — matches every single-country `area` in
   plans.json to a country in zones.json. Prints any **unmatched** areas —
   add an alias in the `aliases` map at the top of the script for each one,
   then re-run until `unmatched` is empty. Writes `country-match.json`.
3. `node scripts/classify-regions.mjs` — assigns each matched country to one
   of our region slugs (africa/asia/.../americas) based on zone membership.
   Prints any **unclassified** countries — add them to `manualOverrides`.
   Writes `region-classification.json`.
4. New countries only: add a `PHOTO_SOURCE_TITLE` entry per new country code
   in `capitals.mjs` (a Wikipedia article title — usually the capital city —
   to source a representative photo from), then run
   `node scripts/fetch-photos.mjs` to fetch them. Skips codes already in the
   32-country `curated-countries.json` list. Writes `country-photos.json`.
5. `node scripts/generate-data.mjs` — does the actual mapping (country vs.
   regional vs. global scope, budget/premium global tier split, best-value
   and price-drop/new badges, EUR pricing) and writes the three files under
   `src/data/generated/`.
6. `npm run build` to confirm everything still compiles.

Steps 2–4 only need re-running when the provider adds/removes areas; if it's
just a pricing refresh with the same area list, step 5 alone is enough.

## Known limitations from the current data drop (2026-09)

- Only `bundle_type: "One-Off"` plans are shown (1,006 of 1,059). The 51
  "Recurring Bundle with Upfront Payment" monthly-subscription plans are
  intentionally excluded — the site has no subscription/recurring-billing
  concept yet. Worth a follow-up if the business wants to sell those.
- The 2 plans with `recommended_retail_price_eur: null` (Best Latam 1GB/30d
  and 500MB/2d) are skipped entirely per the provider's own instruction,
  pending corrected pricing.
- `bestValue` and speed/hotspot fields aren't in the provider data — bestValue
  is computed here (lowest EUR/GB within each country/region/tier group);
  speed is defaulted to "4G/5G" and hotspot to `true` for every plan.
- Country hero photos for the 141 non-curated countries are automated
  Wikipedia hotlinks (capital city photo, picked programmatically), not
  hand-curated landmarks — see `capitals.mjs`. Some of these intermittently
  429 from Wikimedia's CDN under a burst of concurrent requests (e.g. loading
  the full /destinations directory cold). Fine once Next's image cache warms
  up, but worth self-hosting these before a real launch.

## SIM inventory (real eSIM/physical SIM provisioning)

`scripts/seed-sim-inventory.mjs` imports a Transatel SIM delivery file
(semicolon-delimited CSV: `TransatelId;Msisdn;Release;IccId;HLRStatus;Pin1;Puk1`)
into the `sim_inventory` MySQL table, so the checkout webhook has real SIMs
to hand out. Run with:

```
npm run seed:sims -- <path-to-csv> [esim|physical]
```

Never commit the CSV itself (`scripts/source/sim-inventory*.csv` is
gitignored) — it contains real ICCID/PIN/PUK values. Safe to re-run on the
same file; existing rows are refreshed, not duplicated, and a SIM already
assigned to an order stays assigned.

As of 2026-09, we only have a delivery file for the 1,000 **physical** SIM
cards (`M2MA_WW_TSL_SPEEDNETRDC_CSO_7434`), not the 500 **eSIMs** the site
actually sells online — the physical-SIM file has been seeded as a start,
but a matching eSIM delivery file (with QR/LPA activation data) is still
needed before real online checkout can hand out a real eSIM. See
`src/lib/transatel/inventory.ts` and the Stripe/Transatel webhook routes
under `src/app/api/` for how a reserved SIM flows through activation and
plan provisioning.
