import fs from "node:fs";

const PATCHES_PATH = "docs/output/i18n/gemini-patches.json";
const LOCALES = ["en", "sq", "sr"];
const TARGET_FILES = {
  en: "messages/en.json",
  sq: "messages/sq.json",
  sr: "messages/sr.json"
};
const TR_FILE = "messages/tr.json";

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function getAtPath(obj, pathArr) {
  let current = obj;

  for (const segment of pathArr) {
    if (!current || typeof current !== "object" || !(segment in current)) {
      return { exists: false, value: undefined };
    }
    current = current[segment];
  }

  return { exists: true, value: current };
}

function setAtPath(obj, pathArr, value) {
  let current = obj;
  for (let i = 0; i < pathArr.length - 1; i += 1) {
    current = current[pathArr[i]];
  }
  current[pathArr[pathArr.length - 1]] = value;
}

function extractPlaceholders(value) {
  if (typeof value !== "string") {
    return new Set();
  }
  const matches = value.match(/\{[^{}]+\}/g) || [];
  return new Set(matches);
}

function listMissingPlaceholders(requiredSet, candidateSet) {
  const missing = [];
  for (const token of requiredSet) {
    if (!candidateSet.has(token)) {
      missing.push(token);
    }
  }
  return missing;
}

function isPatchEntry(entry) {
  return (
    entry &&
    typeof entry === "object" &&
    !Array.isArray(entry) &&
    Array.isArray(entry.path) &&
    entry.path.every((segment) => typeof segment === "string") &&
    typeof entry.value === "string"
  );
}

function main() {
  const patchesDoc = readJson(PATCHES_PATH);
  const trMessages = readJson(TR_FILE);

  const summary = {
    en: { applied: 0, skipped: 0, missingPath: 0, placeholderMismatch: 0, nonStringLeaf: 0, invalidPatch: 0 },
    sq: { applied: 0, skipped: 0, missingPath: 0, placeholderMismatch: 0, nonStringLeaf: 0, invalidPatch: 0 },
    sr: { applied: 0, skipped: 0, missingPath: 0, placeholderMismatch: 0, nonStringLeaf: 0, invalidPatch: 0 }
  };

  const examples = {
    missingPath: [],
    nonStringLeaf: [],
    placeholderMismatch: []
  };

  const nextByLocale = {};

  for (const locale of LOCALES) {
    const target = readJson(TARGET_FILES[locale]);
    const patches = Array.isArray(patchesDoc[locale]) ? patchesDoc[locale] : [];

    for (const entry of patches) {
      if (!isPatchEntry(entry)) {
        summary[locale].invalidPatch += 1;
        continue;
      }

      const { path, value } = entry;
      const pathKey = path.join(".");
      const targetLeaf = getAtPath(target, path);

      if (!targetLeaf.exists) {
        summary[locale].missingPath += 1;
        if (examples.missingPath.length < 10) {
          examples.missingPath.push(`${locale}: ${pathKey}`);
        }
        continue;
      }

      if (typeof targetLeaf.value !== "string") {
        summary[locale].nonStringLeaf += 1;
        if (examples.nonStringLeaf.length < 10) {
          examples.nonStringLeaf.push(`${locale}: ${pathKey} (type=${typeof targetLeaf.value})`);
        }
        continue;
      }

      const trLeaf = getAtPath(trMessages, path);
      if (trLeaf.exists && typeof trLeaf.value === "string") {
        const requiredPlaceholders = extractPlaceholders(trLeaf.value);
        if (requiredPlaceholders.size > 0) {
          const patchPlaceholders = extractPlaceholders(value);
          const missing = listMissingPlaceholders(requiredPlaceholders, patchPlaceholders);

          if (missing.length > 0) {
            summary[locale].placeholderMismatch += 1;
            if (examples.placeholderMismatch.length < 10) {
              examples.placeholderMismatch.push(
                `${locale}: ${pathKey} missing ${missing.join(", ")}`
              );
            }
            continue;
          }
        }
      }

      if (targetLeaf.value === value) {
        summary[locale].skipped += 1;
        continue;
      }

      setAtPath(target, path, value);
      summary[locale].applied += 1;
    }

    nextByLocale[locale] = target;
  }

  const hasMissingPath = LOCALES.some((locale) => summary[locale].missingPath > 0);
  const hasNonStringLeaf = LOCALES.some((locale) => summary[locale].nonStringLeaf > 0);
  const hasPlaceholderMismatch = LOCALES.some((locale) => summary[locale].placeholderMismatch > 0);

  console.log("summary", summary);

  if (hasMissingPath) {
    console.error("missingPath examples (max 10):");
    for (const line of examples.missingPath) {
      console.error(`- ${line}`);
    }
    process.exit(3);
  }

  if (hasNonStringLeaf) {
    console.error("nonStringLeaf examples (max 10):");
    for (const line of examples.nonStringLeaf) {
      console.error(`- ${line}`);
    }
    process.exit(4);
  }

  if (hasPlaceholderMismatch) {
    console.error("placeholderMismatch examples (max 10):");
    for (const line of examples.placeholderMismatch) {
      console.error(`- ${line}`);
    }
    process.exit(5);
  }

  for (const locale of LOCALES) {
    fs.writeFileSync(TARGET_FILES[locale], `${JSON.stringify(nextByLocale[locale], null, 2)}\n`, "utf8");
  }

  console.log("status=PASS");
}

main();
