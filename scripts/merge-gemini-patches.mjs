import fs from "node:fs";
import path from "node:path";

const RAW_CANDIDATES = [
  "docs/output/i18n/gemini-raw-patches.txt",
  "docs/output/i18n/gemini-pathces.json"
];
const OUTPUT_PATH = "docs/output/i18n/gemini-patches.json";

function readFirstExisting(candidates) {
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return {
        filePath: candidate,
        text: fs.readFileSync(candidate, "utf8")
      };
    }
  }

  return null;
}

function extractJsonObjectCandidates(text) {
  const blocks = [];
  let depth = 0;
  let inString = false;
  let escaped = false;
  let start = -1;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
      continue;
    }

    if (ch === "{") {
      if (depth === 0) {
        start = i;
      }
      depth += 1;
      continue;
    }

    if (ch === "}") {
      if (depth === 0) {
        continue;
      }

      depth -= 1;
      if (depth === 0 && start !== -1) {
        blocks.push(text.slice(start, i + 1));
        start = -1;
      }
    }
  }

  return blocks;
}

function isPatchEntry(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const maybePath = value.path;
  const maybeValue = value.value;

  return (
    Array.isArray(maybePath) &&
    maybePath.every((segment) => typeof segment === "string") &&
    typeof maybeValue === "string"
  );
}

function mergePatches(parsedObjects) {
  const mapByLocale = {
    en: new Map(),
    sq: new Map(),
    sr: new Map()
  };
  const notesParts = [];

  for (const obj of parsedObjects) {
    for (const locale of ["en", "sq", "sr"]) {
      const arr = obj[locale];
      if (!Array.isArray(arr)) {
        continue;
      }

      for (const entry of arr) {
        if (!isPatchEntry(entry)) {
          continue;
        }

        const key = entry.path.join(".");
        mapByLocale[locale].set(key, {
          path: [...entry.path],
          value: entry.value
        });
      }
    }

    if (obj.notes && typeof obj.notes === "object" && !Array.isArray(obj.notes)) {
      notesParts.push(obj.notes);
    }
  }

  return {
    en: Array.from(mapByLocale.en.values()),
    sq: Array.from(mapByLocale.sq.values()),
    sr: Array.from(mapByLocale.sr.values()),
    notes_parts: notesParts
  };
}

function main() {
  const raw = readFirstExisting(RAW_CANDIDATES);
  if (!raw) {
    console.error(`No input file found. Tried: ${RAW_CANDIDATES.join(", ")}`);
    process.exit(1);
  }

  const candidates = extractJsonObjectCandidates(raw.text);
  const parsed = [];
  let parseFailed = 0;

  for (const candidate of candidates) {
    try {
      const parsedObj = JSON.parse(candidate);
      if (parsedObj && typeof parsedObj === "object" && !Array.isArray(parsedObj)) {
        parsed.push(parsedObj);
      }
    } catch {
      parseFailed += 1;
    }
  }

  const merged = mergePatches(parsed);
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(merged, null, 2)}\n`, "utf8");

  console.log(`input_file=${raw.filePath}`);
  console.log(`blocks_found=${candidates.length}`);
  console.log(`blocks_parsed=${parsed.length}`);
  console.log(`blocks_failed=${parseFailed}`);
  console.log(`en_patches=${merged.en.length}`);
  console.log(`sq_patches=${merged.sq.length}`);
  console.log(`sr_patches=${merged.sr.length}`);
  console.log(`notes_parts=${merged.notes_parts.length}`);
  console.log(`output_file=${OUTPUT_PATH}`);
}

main();
