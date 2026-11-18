// Turns Transatel's monthly price grid (.xlsx) into scripts/source/plans.json
// and scripts/source/zones.json — the two files the rest of the pipeline
// (match-countries, classify-regions, generate-data) reads.
//
//   node scripts/import-grid.mjs <grid.xlsx> [--out <dir>]
//
// Writes into scripts/source by default. Use --out to write somewhere else
// first (for example to compare with the current files). Needs no network and
// no npm package: an .xlsx is a zip of XML files, read here with node:zlib.
//
// Selling prices are NOT in the grid. `recommended_retail_price_eur` is the
// "legacy" price that generate-data.mjs still uses as an upper cap:
// wholesale ÷ 0.4 (a 60% margin), rounded down to a whole euro, plus .99.
// A plan whose wholesale price is missing ("#N/A") gets null and is skipped.

import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------- zip reader
function readZip(buf) {
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error("Not an .xlsx file (zip directory not found).");
  const count = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  const files = new Map();
  for (let n = 0; n < count; n++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) throw new Error("Corrupt zip directory.");
    const method = buf.readUInt16LE(p + 10);
    const compSize = buf.readUInt32LE(p + 20);
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    const localOffset = buf.readUInt32LE(p + 42);
    const name = buf.toString("utf8", p + 46, p + 46 + nameLen);
    const lNameLen = buf.readUInt16LE(localOffset + 26);
    const lExtraLen = buf.readUInt16LE(localOffset + 28);
    const start = localOffset + 30 + lNameLen + lExtraLen;
    const raw = buf.subarray(start, start + compSize);
    files.set(name, method === 0 ? raw : zlib.inflateRawSync(raw));
    p += 46 + nameLen + extraLen + commentLen;
  }
  return files;
}

// ----------------------------------------------------------------- xml bits
function decode(s) {
  return s
    .replace(/_x([0-9A-Fa-f]{4})_/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&#x([0-9A-Fa-f]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function textOf(xml) {
  const parts = [];
  for (const m of xml.matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)) parts.push(m[1]);
  return decode(parts.join(""));
}

function colIndex(ref) {
  let n = 0;
  for (const ch of ref.match(/^[A-Z]+/)[0]) n = n * 26 + ch.charCodeAt(0) - 64;
  return n - 1;
}

function readSheets(files) {
  const shared = [];
  const sst = files.get("xl/sharedStrings.xml");
  if (sst) {
    const xml = sst.toString("utf8");
    for (const m of xml.matchAll(/<si>([\s\S]*?)<\/si>/g)) {
      // Ignore phonetic runs (<rPh>), keep the visible text only.
      shared.push(textOf(m[1].replace(/<rPh[\s\S]*?<\/rPh>/g, "")));
    }
  }
  const wb = files.get("xl/workbook.xml").toString("utf8");
  const rels = files.get("xl/_rels/workbook.xml.rels").toString("utf8");
  const target = new Map();
  for (const m of rels.matchAll(/<Relationship\b([^>]*)\/?>/g)) {
    const id = /Id="([^"]*)"/.exec(m[1])?.[1];
    const t = /Target="([^"]*)"/.exec(m[1])?.[1];
    if (id && t) target.set(id, t);
  }
  const sheets = {};
  for (const m of wb.matchAll(/<sheet\b([^>]*)\/?>/g)) {
    const name = decode(/name="([^"]*)"/.exec(m[1])[1]);
    const rid = /r:id="([^"]*)"/.exec(m[1])[1];
    let t = target.get(rid).replace(/^\//, "");
    if (!t.startsWith("xl/")) t = "xl/" + t;
    const xml = files.get(t).toString("utf8");
    const rows = [];
    for (const r of xml.matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/g)) {
      const cells = [];
      for (const c of r[1].matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
        const ref = /r="([A-Z]+\d+)"/.exec(c[1])?.[1];
        if (!ref) continue;
        const type = /t="([^"]*)"/.exec(c[1])?.[1];
        const body = c[2] ?? "";
        let value = null;
        if (type === "s") value = shared[Number(/<v>([\s\S]*?)<\/v>/.exec(body)?.[1])] ?? null;
        else if (type === "inlineStr") value = textOf(body);
        else {
          const v = /<v>([\s\S]*?)<\/v>/.exec(body)?.[1];
          value = v === undefined ? null : decode(v);
        }
        cells[colIndex(ref)] = value;
      }
      rows.push(cells);
    }
    sheets[name] = rows;
  }
  return sheets;
}

// ------------------------------------------------------------------ plans
const round2 = (x) => Math.round(x * 100) / 100;
const num = (v) => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

function parseAllowance(raw) {
  const s = String(raw ?? "").trim();
  if (/^unlimited$/i.test(s)) return { unlimited: true, gb: null };
  const m = /^(\d+(?:\.\d+)?)\s*(GB|MB)/i.exec(s);
  if (!m) throw new Error(`Unreadable allowance: "${raw}"`);
  const n = Number(m[1]);
  return { unlimited: false, gb: m[2].toUpperCase() === "GB" ? n : n / 1000 };
}

function parseDuration(raw) {
  const m = /^(\d+)\s*(day|month)s?$/i.exec(String(raw ?? "").trim());
  if (!m) throw new Error(`Unreadable duration: "${raw}"`);
  return m[2].toLowerCase() === "day"
    ? { days: Number(m[1]), months: null }
    : { days: null, months: Number(m[1]) };
}

function buildPlans(rows) {
  const header = rows.findIndex((r) => String(r[0] ?? "").trim() === "Technical reference");
  if (header < 0) throw new Error('Row "Technical reference" not found in the price sheet.');
  const plans = [];
  for (const r of rows.slice(header + 1)) {
    const ref = String(r[0] ?? "").trim();
    if (!ref.startsWith("WW_")) continue;
    const { unlimited, gb } = parseAllowance(r[4]);
    const { days, months } = parseDuration(r[5]);
    const wholesaleRaw = r[9];
    const wholesale = num(wholesaleRaw) === null ? String(wholesaleRaw ?? "#N/A") : round2(num(wholesaleRaw));
    const area = String(r[3] ?? "").trim();
    // A few cells in the grid have an empty description; rebuild it the way the others read.
    const title = (t) => t.toLowerCase().replace(/(^|[\s(+-])([a-z])/g, (_, a, b) => a + b.toUpperCase());
    const description =
      String(r[1] ?? "").trim() ||
      `${String(r[2] ?? "").trim()} ${title(area)} ${String(r[4] ?? "").trim()} ${String(r[5] ?? "").trim()}`;
    const legacyPrice = typeof wholesale === "number" ? Math.floor(wholesale / 0.4 + 1e-9) + 0.99 : null;
    plans.push({
      technical_reference: ref,
      description,
      bundle_type: String(r[2] ?? "").trim(),
      area,
      data_gb: gb,
      unlimited_data: unlimited,
      duration_days: days,
      duration_months: months,
      retail_price_incl_vat_eur: num(r[6]) === null ? null : round2(num(r[6])),
      recommended_retail_price_excl_vat_eur: num(r[7]) === null ? null : round2(num(r[7])),
      wholesale_price_excl_vat_eur: wholesale,
      status: String(r[10] ?? "").trim() || null,
      recommended_retail_price_eur: legacyPrice,
      margin_pct: legacyPrice === null ? null : Math.round(((legacyPrice - wholesale) / legacyPrice) * 1000) / 10,
      // The "BEST …" areas are Transatel's budget-tier regions.
      is_budget_global_tier: area.startsWith("BEST"),
    });
  }
  return plans;
}

// ------------------------------------------------------------------ zones
// The grid renames some zones from one month to the next (e.g. BESTAFRICA2).
// Everything downstream uses the original names, so map them back here.
const ZONE_RENAMES = {
  AFRICA2: "AFRICA",
  BESTAFRICA2: "BEST AFRICA",
  BESTASIA3: "BEST ASIA",
  BESTLATAM2: "BEST LATAM",
  BESTMIDDLEEAST: "BEST MIDDLE EAST",
  EU28PLUS: "EU28PLUS (EUROPE)",
  MIDDLE_EAST: "MIDDLE EAST",
  "SCANDINAVIA&BALTIC": "SCANDINAVIA  & BALTIC",
};

function buildZones(rows, previous) {
  // Header row: the first row whose second cell is a zone name next to "AMERICA".
  const header = rows.findIndex((r) => r.some((c) => String(c ?? "").trim() === "AMERICA"));
  if (header < 0) throw new Error("Zone header row not found in the zones sheet.");
  // Keep the names we already use for a country code (the grid spells some
  // differently from month to month, e.g. "Hong Kong" vs a long official name).
  // Same zone first, then any zone that already names this code.
  const knownName = new Map();
  const anyName = new Map();
  for (const [zone, list] of Object.entries(previous ?? {})) {
    for (const c of list) {
      knownName.set(`${zone}|${c.code}`, c.name);
      if (!anyName.has(c.code)) anyName.set(c.code, c.name);
    }
  }
  const zones = {};
  rows[header].forEach((cell, col) => {
    const raw = String(cell ?? "").trim();
    if (!raw || col === 0) return;
    const name = ZONE_RENAMES[raw] ?? raw;
    const members = [];
    for (const r of rows.slice(header + 1)) {
      const v = String(r[col] ?? "").replace(/ /g, " ").trim();
      if (!v) continue;
      const i = v.indexOf(",");
      if (i < 0) continue;
      const code = v.slice(0, i).trim();
      const label = v.slice(i + 1).trim();
      members.push({ code, name: knownName.get(`${name}|${code}`) ?? anyName.get(code) ?? label });
    }
    zones[name] = members;
  });
  return zones;
}

// -------------------------------------------------------------------- main
const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--"));
const outIdx = args.indexOf("--out");
const outDir = outIdx >= 0 ? path.resolve(args[outIdx + 1]) : path.join(here, "source");
if (!file) {
  console.error("Usage: node scripts/import-grid.mjs <grid.xlsx> [--out <dir>]");
  process.exit(1);
}

const sheets = readSheets(readZip(fs.readFileSync(file)));
const priceSheet = sheets["Bundles prices"];
const zoneSheet = sheets["Bundle zones details"];
if (!priceSheet || !zoneSheet) throw new Error('Expected sheets "Bundles prices" and "Bundle zones details".');

let previousZones = null;
try {
  previousZones = JSON.parse(fs.readFileSync(path.join(here, "source", "zones.json"), "utf8"));
} catch {
  /* first import: nothing to keep */
}

const plans = buildPlans(priceSheet);
const zones = buildZones(zoneSheet, previousZones);

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "plans.json"), JSON.stringify(plans, null, 2) + "\n");
fs.writeFileSync(path.join(outDir, "zones.json"), JSON.stringify(zones, null, 2) + "\n");

const oneOff = plans.filter((p) => p.bundle_type === "One-Off").length;
const noPrice = plans.filter((p) => p.recommended_retail_price_eur === null).length;
console.log(`Wrote ${plans.length} plans (${oneOff} One-Off, ${noPrice} without a wholesale price) and ${Object.keys(zones).length} zones to ${outDir}`);
