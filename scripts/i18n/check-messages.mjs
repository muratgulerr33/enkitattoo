#!/usr/bin/env node
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = process.cwd();
const MESSAGES_DIR = resolve(ROOT, "messages");
const OUT_DIR = resolve(ROOT, "docs/output");
const MISSING_PATH = resolve(OUT_DIR, "i18n-missing-keys.json");
const EMPTY_PATH = resolve(OUT_DIR, "i18n-empty-values.json");
const SUSPICIOUS_PATH = resolve(OUT_DIR, "i18n-suspicious-values.json");

function flatten(value, prefix = "") {
  const map = new Map();

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      const nextPrefix = prefix ? `${prefix}.${index}` : String(index);
      for (const [k, v] of flatten(item, nextPrefix)) {
        map.set(k, v);
      }
    });
    return map;
  }

  if (value !== null && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      const nextPrefix = prefix ? `${prefix}.${key}` : key;
      for (const [k, v] of flatten(child, nextPrefix)) {
        map.set(k, v);
      }
    }
    return map;
  }

  map.set(prefix, value);
  return map;
}

function readMessages() {
  const files = readdirSync(MESSAGES_DIR).filter((name) => name.endsWith(".json")).sort();
  const locales = files.map((file) => file.replace(/\.json$/, ""));

  const byLocale = new Map();
  for (const locale of locales) {
    const filePath = resolve(MESSAGES_DIR, `${locale}.json`);
    const parsed = JSON.parse(readFileSync(filePath, "utf8"));
    byLocale.set(locale, parsed);
  }

  return { locales, byLocale };
}

function check() {
  const { locales, byLocale } = readMessages();
  const baseLocale = "tr";

  if (!byLocale.has(baseLocale)) {
    throw new Error(`Base locale not found: ${baseLocale}`);
  }

  const baseFlat = flatten(byLocale.get(baseLocale));
  const baseKeys = [...baseFlat.keys()].sort();

  const missing = {};
  const empty = {};
  const suspicious = {};

  const suspiciousRe = /(TODO|TBD|lorem|\[\[|__)/i;

  for (const locale of locales) {
    const localeFlat = flatten(byLocale.get(locale));
    const localeKeys = new Set(localeFlat.keys());

    const missingKeys = baseKeys.filter((key) => !localeKeys.has(key));
    if (missingKeys.length > 0) {
      missing[locale] = missingKeys;
    }

    const emptyKeys = [];
    const suspiciousKeys = [];

    for (const [key, val] of localeFlat) {
      if (typeof val !== "string") continue;

      if (val.trim() === "") {
        emptyKeys.push(key);
      }

      if (suspiciousRe.test(val)) {
        suspiciousKeys.push(key);
      }
    }

    if (emptyKeys.length > 0) {
      empty[locale] = emptyKeys;
    }

    if (suspiciousKeys.length > 0) {
      suspicious[locale] = suspiciousKeys;
    }
  }

  mkdirSync(OUT_DIR, { recursive: true });

  writeFileSync(
    MISSING_PATH,
    `${JSON.stringify({ baseLocale, checkedLocales: locales, missing }, null, 2)}\n`,
    "utf8",
  );

  writeFileSync(
    EMPTY_PATH,
    `${JSON.stringify({ checkedLocales: locales, empty }, null, 2)}\n`,
    "utf8",
  );

  writeFileSync(
    SUSPICIOUS_PATH,
    `${JSON.stringify({ checkedLocales: locales, suspicious }, null, 2)}\n`,
    "utf8",
  );

  const missingCount = Object.values(missing).reduce((sum, items) => sum + items.length, 0);
  console.log(`[i18n-check] base locale: ${baseLocale}`);
  console.log(`[i18n-check] locales: ${locales.join(", ")}`);
  console.log(`[i18n-check] missing total: ${missingCount}`);
  console.log(`[i18n-check] wrote: ${MISSING_PATH}`);
  console.log(`[i18n-check] wrote: ${EMPTY_PATH}`);
  console.log(`[i18n-check] wrote: ${SUSPICIOUS_PATH}`);

  if (missingCount > 0) {
    process.exit(1);
  }
}

check();
