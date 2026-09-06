#!/usr/bin/env node
/**
 * Convert Natural Earth 110m admin_0 countries shapefile → Europe-focused GeoJSON.
 * Pure Node, no deps. Prefer CONTINENT===Europe; also keep common map fringe
 * (Turkey, Maghreb, Caucasus, Cyprus). Exclude Greenland / deep Middle East.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const base = path.join(
  root,
  "assets/atlas/ne_110m_admin_0_countries/ne_110m_admin_0_countries",
);
const outPath = path.join(root, "assets/atlas/europe-110m.geojson");

const LON_MIN = -25,
  LON_MAX = 45,
  LAT_MIN = 34,
  LAT_MAX = 72;

const EXTRA = new Set([
  "Turkey",
  "Cyprus",
  "N. Cyprus",
  "Morocco",
  "Algeria",
  "Tunisia",
  "Georgia",
  "Armenia",
  "Azerbaijan",
]);

function readBuf(p) {
  return fs.readFileSync(p);
}
function readInt32BE(buf, off) {
  return buf.readInt32BE(off);
}
function readInt32LE(buf, off) {
  return buf.readInt32LE(off);
}
function readFloat64LE(buf, off) {
  return buf.readDoubleLE(off);
}
function cleanStr(s) {
  return String(s ?? "")
    .replace(/\0/g, "")
    .trim();
}

function parseDbf(buf) {
  const nRecords = readInt32LE(buf, 4);
  const headerLen = buf.readUInt16LE(8);
  const recordLen = buf.readUInt16LE(10);
  const fields = [];
  let off = 32;
  while (off < headerLen - 1 && buf[off] !== 0x0d) {
    const name = cleanStr(buf.toString("ascii", off, off + 11));
    const type = String.fromCharCode(buf[off + 11]);
    const size = buf[off + 16];
    fields.push({ name, type, size });
    off += 32;
  }
  const records = [];
  for (let i = 0; i < nRecords; i++) {
    const start = headerLen + i * recordLen;
    if (buf[start] === 0x2a) continue;
    const rec = {};
    let pos = start + 1;
    for (const f of fields) {
      const raw = cleanStr(buf.toString("utf8", pos, pos + f.size));
      if (f.type === "N" || f.type === "F") {
        const n = Number(raw);
        rec[f.name] = Number.isFinite(n) ? n : raw;
      } else {
        rec[f.name] = raw;
      }
      pos += f.size;
    }
    records.push(rec);
  }
  return { records };
}

function parsePartsPoints(buf, offset, numParts, numPoints) {
  const parts = [];
  for (let i = 0; i < numParts; i++) parts.push(readInt32LE(buf, offset + i * 4));
  const ptsOff = offset + numParts * 4;
  const points = [];
  for (let i = 0; i < numPoints; i++) {
    points.push([
      readFloat64LE(buf, ptsOff + i * 16),
      readFloat64LE(buf, ptsOff + i * 16 + 8),
    ]);
  }
  return { parts, points };
}

function ringsFromParts(parts, points) {
  const rings = [];
  for (let i = 0; i < parts.length; i++) {
    const start = parts[i];
    const end = i + 1 < parts.length ? parts[i + 1] : points.length;
    rings.push(points.slice(start, end));
  }
  return rings;
}

function area(ring) {
  let a = 0;
  for (let i = 0, n = ring.length - 1; i < n; i++) {
    a += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
  }
  return a / 2;
}

function polygonToGeoJSON(rings) {
  if (rings.length === 1) return { type: "Polygon", coordinates: rings };
  const polys = [];
  let current = null;
  for (const ring of rings) {
    const a = area(ring);
    if (current === null || a < 0) {
      current = [ring];
      polys.push(current);
    } else {
      current.push(ring);
    }
  }
  if (polys.length === 1) return { type: "Polygon", coordinates: polys[0] };
  return { type: "MultiPolygon", coordinates: polys };
}

function ringInBBox(ring) {
  for (const [lon, lat] of ring) {
    if (lon >= LON_MIN && lon <= LON_MAX && lat >= LAT_MIN && lat <= LAT_MAX)
      return true;
  }
  return false;
}

function geomTouchesBBox(geom) {
  const rings =
    geom.type === "Polygon" ? geom.coordinates : geom.coordinates.flat();
  return rings.some(ringInBBox);
}

function parseShp(buf) {
  if (readInt32BE(buf, 0) !== 9994) throw new Error("Bad shapefile");
  const shapes = [];
  let offset = 100;
  while (offset + 8 <= buf.length) {
    const contentLen = readInt32BE(buf, offset + 4) * 2;
    const start = offset + 8;
    const shapeType = readInt32LE(buf, start);
    if (shapeType === 5 || shapeType === 15 || shapeType === 25) {
      const numParts = readInt32LE(buf, start + 36);
      const numPoints = readInt32LE(buf, start + 40);
      const { parts, points } = parsePartsPoints(
        buf,
        start + 44,
        numParts,
        numPoints,
      );
      shapes.push(polygonToGeoJSON(ringsFromParts(parts, points)));
    } else {
      shapes.push(null);
    }
    offset = start + contentLen;
  }
  return shapes;
}

function keepProps(rec) {
  const keys = [
    "NAME",
    "ADMIN",
    "CONTINENT",
    "SUBREGION",
    "ISO_A2",
    "ISO_A3",
    "ADM0_A3",
  ];
  const out = {};
  for (const k of keys) {
    const v = cleanStr(rec[k]);
    if (v !== "") out[k] = v;
  }
  return out;
}

function ringCentroid(ring) {
  let sx = 0, sy = 0, n = 0;
  for (const [x, y] of ring) { sx += x; sy += y; n++; }
  return n ? [sx / n, sy / n] : [0, 0];
}

function clipGeometryToBBox(geom) {
  const clipPoly = (coords) => {
    const kept = [];
    for (const ring of coords) {
      const [cx, cy] = ringCentroid(ring);
      if (cx < LON_MIN - 5 || cx > LON_MAX + 5 || cy < LAT_MIN - 5 || cy > LAT_MAX + 5) continue;
      const clipped = ring.map(([lon, lat]) => [
        Math.max(LON_MIN - 2, Math.min(LON_MAX + 2, lon)),
        Math.max(LAT_MIN - 2, Math.min(LAT_MAX + 2, lat)),
      ]);
      if (clipped.length >= 4) kept.push(clipped);
    }
    return kept;
  };
  if (geom.type === "Polygon") {
    const rings = clipPoly(geom.coordinates);
    if (!rings.length) return null;
    return { type: "Polygon", coordinates: rings };
  }
  const polys = [];
  for (const poly of geom.coordinates) {
    const rings = clipPoly(poly);
    if (rings.length) polys.push(rings);
  }
  if (!polys.length) return null;
  if (polys.length === 1) return { type: "Polygon", coordinates: polys[0] };
  return { type: "MultiPolygon", coordinates: polys };
}

function shouldKeep(rec, geom) {
  if (!geom) return false;
  const continent = cleanStr(rec.CONTINENT);
  const name = cleanStr(rec.NAME) || cleanStr(rec.ADMIN);
  if (name === "Greenland") return false;
  if (continent === "Europe") return true;
  if (EXTRA.has(name) && geomTouchesBBox(geom)) return true;
  return false;
}

function main() {
  const { records } = parseDbf(readBuf(base + ".dbf"));
  const shapes = parseShp(readBuf(base + ".shp"));
  const features = [];
  for (let i = 0; i < records.length; i++) {
    const rec = records[i];
    const geom = shapes[i];
    if (!shouldKeep(rec, geom)) continue;
    const clipped = clipGeometryToBBox(geom);
    if (!clipped) continue;
    features.push({
      type: "Feature",
      properties: keepProps(rec),
      geometry: clipped,
    });
  }
  const fc = {
    type: "FeatureCollection",
    name: "europe-110m",
    features,
  };
  const json = JSON.stringify(fc);
  fs.writeFileSync(outPath, json);
  const names = features.map((f) => f.properties.NAME || f.properties.ADMIN);
  console.log(`Wrote ${outPath}`);
  console.log(`Features: ${features.length}, bytes: ${json.length}`);
  console.log(names.join(", "));
}

main();
