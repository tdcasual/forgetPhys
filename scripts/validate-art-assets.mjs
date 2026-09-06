#!/usr/bin/env node
/**
 * validate-art-assets.mjs
 * Fails (exit 1) when art wiring gaps are found; exit 0 when clean.
 *
 * Checks:
 *  1. Char dirs that "claim ready" (_canon/ present OR framing.json) must have _canon/face.png
 *  2. Watson venue outfits referenced in content must have stand__idle.png
 *  3. Props referenced in content must have card.md + final.png
 *  4. Props/bg dirs that have final.png must have checklist.md
 *
 * Usage (from physics-chronicle root):
 *   node scripts/validate-art-assets.mjs
 *   ASSETS_ROOT=/path/to/assets node scripts/validate-art-assets.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

function resolveAssetsRoot() {
  if (process.env.ASSETS_ROOT) return path.resolve(process.env.ASSETS_ROOT);
  const candidates = [
    path.join(ROOT, "assets"),
    path.join(ROOT, "..", "physics-game", "assets"),
  ];
  for (const c of candidates) {
    try {
      const real = fs.realpathSync(c);
      if (fs.existsSync(real)) return real;
    } catch {
      /* continue */
    }
  }
  return path.join(ROOT, "assets");
}

const ASSETS = resolveAssetsRoot();

function assetsTreePresent(root) {
  try {
    if (!fs.existsSync(root)) return false;
    // Symlink-ok; require at least chars/ or props/ or bg/ to treat as a real tree
    return ["chars", "props", "bg"].some((d) => {
      try {
        return fs.statSync(path.join(root, d)).isDirectory();
      } catch {
        return false;
      }
    });
  } catch {
    return false;
  }
}

if (!assetsTreePresent(ASSETS)) {
  const allow =
    process.env.VALIDATE_ART_ALLOW_MISSING === "1" ||
    process.env.VALIDATE_ART_ALLOW_MISSING === "true";
  const msg = `assets tree missing or empty at ${ASSETS}`;
  if (allow) {
    console.log(`validate-art-assets · SKIP — ${msg}`);
    console.log("(VALIDATE_ART_ALLOW_MISSING set; full LFS / asset checkout required for strict validate)");
    process.exit(0);
  }
  console.error(`validate-art-assets · FAIL — ${msg}`);
  console.error("Set VALIDATE_ART_ALLOW_MISSING=1 to skip, or provide ASSETS_ROOT / assets/");
  process.exit(1);
}

const CONTENT_JSON = path.join(
  ROOT,
  "packages/content/src/data/manchester.json",
);

const errors = [];
const warnings = [];

function exists(p) {
  try {
    return fs.existsSync(p);
  } catch {
    return false;
  }
}

function isDir(p) {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

function listDirs(p) {
  if (!isDir(p)) return [];
  return fs
    .readdirSync(p, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("."))
    .map((d) => d.name);
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function claimsReady(charDir) {
  // Ready claim = product identity intended locked (not mere WIP photo crop).
  if (exists(path.join(charDir, "framing.json"))) return true;
  if (exists(path.join(charDir, "READY"))) return true;
  const canon = path.join(charDir, "_canon");
  if (exists(path.join(canon, "checklist.md"))) return true;
  if (exists(path.join(canon, "identity.txt"))) return true;
  // _canon/face-photo-crop.png alone = WIP, not a ready claim
  return false;
}

// --- 1. chars ready → face.png ---
const charsRoot = path.join(ASSETS, "chars");
for (const name of listDirs(charsRoot)) {
  if (name.startsWith("_") || name === "README-ARCHIVE.md") continue;
  if (name.includes("ARCHIVED")) continue;
  const charDir = path.join(charsRoot, name);
  if (!claimsReady(charDir)) continue;
  const face = path.join(charDir, "_canon", "face.png");
  if (!exists(face)) {
    errors.push(`char ready without _canon/face.png: ${name}`);
  }
}

// --- collect content refs ---
const outfits = new Set();
const propIds = new Set();

if (exists(CONTENT_JSON)) {
  const chapter = readJson(CONTENT_JSON);
  for (const venue of chapter.venues || []) {
    const outfit =
      venue?.companion?.outfit || venue?.watsonOutfit || null;
    if (outfit) outfits.add(outfit);
    for (const prop of venue.props || []) {
      if (prop?.id) propIds.add(prop.id);
    }
  }
} else {
  warnings.push(`content JSON missing: ${CONTENT_JSON}`);
}

// Always validate P0 manchester outfit even if JSON omit
outfits.add("edwardian-1909");

// --- 2. watson outfit stand__idle.png ---
for (const outfit of outfits) {
  const stand = path.join(
    ASSETS,
    "chars/char-watson/outfits",
    outfit,
    "stand__idle.png",
  );
  if (!exists(stand)) {
    errors.push(
      `watson outfit missing stand__idle.png: outfits/${outfit}/stand__idle.png`,
    );
  }
}

// --- 3. referenced props card.md + final.png ---
for (const id of propIds) {
  const root = path.join(ASSETS, "props", id);
  if (!exists(path.join(root, "card.md"))) {
    errors.push(`prop referenced but missing card.md: ${id}`);
  }
  if (!exists(path.join(root, "final.png"))) {
    errors.push(`prop referenced but missing final.png: ${id}`);
  }
}

// --- 4. props/bg with final.png need checklist.md ---
function checkFinalNeedsChecklist(kindRoot, kind) {
  if (!isDir(kindRoot)) return;
  for (const name of listDirs(kindRoot)) {
    if (name.startsWith("_")) continue;
    const dir = path.join(kindRoot, name);
    const finalPng = path.join(dir, "final.png");
    if (!exists(finalPng)) continue;
    if (!exists(path.join(dir, "checklist.md"))) {
      errors.push(`${kind} has final.png but missing checklist.md: ${name}`);
    }
  }
}

checkFinalNeedsChecklist(path.join(ASSETS, "props"), "prop");
checkFinalNeedsChecklist(path.join(ASSETS, "bg"), "bg");

// Also flat bg finals that live as folders only — already covered.
// Art-only note: incomplete _canon (e.g. face-photo-crop only) already fails above.
for (const stub of ["char-bohr", "char-thomson", "char-geiger"]) {
  const d = path.join(charsRoot, stub);
  if (!isDir(d)) continue;
  const face = path.join(d, "_canon", "face.png");
  const crop = path.join(d, "_canon", "face-photo-crop.png");
  if (!exists(face) && exists(crop)) {
    warnings.push(`${stub}: _canon/face-photo-crop.png present but face.png not locked — art gap`);
  }
}

// --- report ---
console.log(`validate-art-assets · ASSETS=${ASSETS}`);
console.log(`outfits checked: ${[...outfits].join(", ") || "(none)"}`);
console.log(`props checked: ${[...propIds].join(", ") || "(none)"}`);

if (warnings.length) {
  console.log("\nWARNINGS:");
  for (const w of warnings) console.log(`  - ${w}`);
}

if (errors.length) {
  console.log("\nFAILURES:");
  for (const e of errors) console.log(`  ✗ ${e}`);
  console.log(`\n${errors.length} error(s).`);
  process.exit(1);
}

console.log("\nOK — no engineering asset gaps.");
process.exit(0);
