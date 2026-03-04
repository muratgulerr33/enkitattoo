#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = process.cwd();
const SSOT_PATH = resolve(ROOT, "docs/output/enki-v1-sitemap-seo-template.csv");
const AUDIT_PATH = resolve(ROOT, "docs/output/seo-audit-google-view.csv");

function parseCsvLine(line) {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
}

function parseCsv(text) {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = parseCsvLine(lines[0]);
  const rows = lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] ?? "";
    });
    return row;
  });

  return { headers, rows };
}

function toCsvValue(value) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function toCsv(headers, rows) {
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => toCsvValue(row[h] ?? "")).join(","));
  }
  return `${lines.join("\n")}\n`;
}

function normalizePathFromUrl(urlStr) {
  try {
    const url = new URL(urlStr);
    const raw = url.pathname || "/";
    if (raw === "/tr") return "/";
    if (raw.startsWith("/tr/")) return raw.replace(/^\/tr/, "") || "/";
    return raw;
  } catch {
    return "/";
  }
}

function main() {
  const ssot = parseCsv(readFileSync(SSOT_PATH, "utf8"));
  const audit = parseCsv(readFileSync(AUDIT_PATH, "utf8"));

  const ssotByPath = new Map();
  for (const row of ssot.rows) {
    const path = String(row.path_yolu || "").trim();
    if (!path) continue;
    ssotByPath.set(path, {
      title: row.seo_title || "",
      description: row.seo_description || "",
    });
  }

  let patchedCount = 0;
  const sample = [];

  for (const row of audit.rows) {
    if ((row.locale || "").trim() !== "tr") continue;

    const path = normalizePathFromUrl(row.url || "");
    const ssotRow = ssotByPath.get(path);
    if (!ssotRow) continue;

    const nextTitle = ssotRow.title;
    const nextDescription = ssotRow.description;

    const titleChanged = row.title !== nextTitle;
    const descChanged = row.meta_description !== nextDescription;

    if (titleChanged || descChanged) {
      row.title = nextTitle;
      row.meta_description = nextDescription;
      patchedCount += 1;
      if (sample.length < 5) {
        sample.push({
          url: row.url,
          path,
          title: nextTitle,
          meta_description: nextDescription,
        });
      }
    }
  }

  writeFileSync(AUDIT_PATH, toCsv(audit.headers, audit.rows), "utf8");

  console.log(`[patch-audit-tr] patched TR rows: ${patchedCount}`);
  console.log(`[patch-audit-tr] audit file: ${AUDIT_PATH}`);
  if (sample.length > 0) {
    console.log(`[patch-audit-tr] sample:`);
    for (const item of sample) {
      console.log(`- ${item.url} -> ${item.path}`);
      console.log(`  title: ${item.title}`);
      console.log(`  meta_description: ${item.meta_description}`);
    }
  }
}

main();
