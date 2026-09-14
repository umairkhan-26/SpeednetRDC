import fs from "node:fs";
import { ALPHA3_TO_ALPHA2 } from "./iso-alpha3-to-alpha2.mjs";
import { PHOTO_SOURCE_TITLE } from "./capitals.mjs";

const matchData = JSON.parse(fs.readFileSync(new URL("./country-match.json", import.meta.url)));
const existingIso2 = new Set([
  "FR", "GB", "IT", "ES", "DE", "TR", "JP", "TH", "KR", "SG", "ID", "VN", "AE", "SA", "QA",
  "IL", "ZA", "MA", "EG", "KE", "MX", "BR", "AR", "CO", "DO", "JM", "BS", "AU", "NZ", "FJ",
  "US", "CA",
]);

const newCountries = matchData.matched.filter((m) => !existingIso2.has(ALPHA3_TO_ALPHA2[m.code]));

const UA = "SpeedNetRDC-DataImport/1.0 (contact: dev@speednetrdc.com)";

async function fetchBatch(titles) {
  const url =
    "https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&pithumbsize=900&origin=*&titles=" +
    encodeURIComponent(titles.join("|"));
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  const data = await res.json();
  const byTitle = {};
  for (const page of Object.values(data.query.pages)) {
    byTitle[page.title] = page.thumbnail ? page.thumbnail.source.split("?")[0] : null;
  }
  return byTitle;
}

const results = {};
const BATCH = 40;
const titleList = newCountries.map((c) => PHOTO_SOURCE_TITLE[c.code]);
for (let i = 0; i < titleList.length; i += BATCH) {
  const batch = titleList.slice(i, i + BATCH);
  const byTitle = await fetchBatch(batch);
  for (const c of newCountries.slice(i, i + BATCH)) {
    const title = PHOTO_SOURCE_TITLE[c.code];
    results[c.code] = byTitle[title] ?? null;
  }
  console.log(`Fetched batch ${i / BATCH + 1}, ${Object.keys(results).length}/${newCountries.length}`);
}

const flagLike = Object.entries(results).filter(([, url]) => url && /Flag_of/i.test(url));
const missing = Object.entries(results).filter(([, url]) => !url);
console.log("Flag-like results (need a fallback):", flagLike.length, flagLike.map(([c]) => c));
console.log("Missing entirely:", missing.length, missing.map(([c]) => c));

fs.writeFileSync(new URL("./country-photos.json", import.meta.url), JSON.stringify(results, null, 2));
console.log("Wrote country-photos.json with", Object.keys(results).length, "entries");
