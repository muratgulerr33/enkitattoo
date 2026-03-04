#!/usr/bin/env node
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = process.cwd();
const SOURCE_CSV = resolve(ROOT, "docs/output/enki-v1-sitemap-seo-template.csv");
const OUTPUT_CSV = resolve(ROOT, "docs/output/seo-audit-google-view.csv");
const MESSAGE_DIR = resolve(ROOT, "messages");
const PORT_CANDIDATES = [3002, 3010, 3006, 3100];

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    encoding: "utf8",
    stdio: options.stdio ?? "pipe",
  });

  if (result.status !== 0) {
    const stderr = result.stderr?.trim();
    const stdout = result.stdout?.trim();
    throw new Error([`Command failed: ${command} ${args.join(" ")}`, stderr, stdout].filter(Boolean).join("\n"));
  }

  return result.stdout ?? "";
}

function detectPackageManager() {
  const pkgJsonPath = resolve(ROOT, "package.json");
  const pkg = JSON.parse(readFileSync(pkgJsonPath, "utf8"));
  const manager = String(pkg.packageManager || "").toLowerCase();

  if (manager.startsWith("pnpm") && hasCommand("pnpm")) {
    return "pnpm";
  }
  if (manager.startsWith("yarn") && hasCommand("yarn")) {
    return "yarn";
  }
  if (hasCommand("npm")) {
    return "npm";
  }

  throw new Error("No supported package manager command found (pnpm/yarn/npm).");
}

function hasCommand(command) {
  const probe = spawnSync("sh", ["-lc", `command -v ${command}`], {
    cwd: ROOT,
    encoding: "utf8",
    stdio: "pipe",
  });

  if (probe.status === 0 && probe.stdout.trim()) {
    return true;
  }

  return false;
}

function commandForBuild(manager) {
  if (manager === "pnpm") return ["pnpm", ["build"]];
  if (manager === "yarn") return ["yarn", ["build"]];
  return ["npm", ["run", "build"]];
}

function commandForStart(manager, port) {
  if (manager === "pnpm") return ["pnpm", ["exec", "next", "start", "-p", String(port)]];
  if (manager === "yarn") return ["yarn", ["next", "start", "-p", String(port)]];
  return ["npx", ["next", "start", "-p", String(port)]];
}

function parseCsv(csvText) {
  const lines = csvText.replace(/^\uFEFF/, "").split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return [];

  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });
    return row;
  });
}

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

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function decodeEntities(text) {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)));
}

function normalizeText(text) {
  return decodeEntities(text.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}

function extractMetaDescription(html) {
  const match = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["'][^>]*>/i)
    || html.match(/<meta\s+content=["']([^"']*)["']\s+name=["']description["'][^>]*>/i);
  return match ? decodeEntities(match[1]).trim() : "";
}

function extractTitle(html) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? normalizeText(match[1]) : "";
}

function extractH1(html) {
  const match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  return match ? normalizeText(match[1]) : "";
}

function extractPageExcerpt(html) {
  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ");

  const paragraphs = cleaned.match(/<p[^>]*>[\s\S]*?<\/p>/gi) || [];
  for (const paragraph of paragraphs) {
    const text = normalizeText(paragraph);
    if (text.length >= 40) {
      return text.slice(0, 200);
    }
  }
  return "";
}

function getLocales() {
  if (!existsSync(MESSAGE_DIR)) {
    throw new Error(`messages directory not found: ${MESSAGE_DIR}`);
  }

  return readdirSync(MESSAGE_DIR)
    .filter((file) => file.endsWith(".json"))
    .map((file) => file.replace(/\.json$/, ""))
    .sort();
}

function getRoutePaths() {
  if (!existsSync(SOURCE_CSV)) {
    throw new Error(`Route source CSV not found: ${SOURCE_CSV}`);
  }

  const rows = parseCsv(readFileSync(SOURCE_CSV, "utf8"));
  const paths = rows
    .map((row) => String(row.path_yolu || "").trim())
    .filter(Boolean)
    .filter((path) => path.startsWith("/"));

  return [...new Set(paths)];
}

function isPortFree(port) {
  const probe = spawnSync("sh", ["-lc", `lsof -i :${port} -sTCP:LISTEN -t`], {
    cwd: ROOT,
    encoding: "utf8",
    stdio: "pipe",
  });

  if (probe.status === 0) {
    return probe.stdout.trim().length === 0;
  }

  if (probe.status === 1) {
    return true;
  }

  return false;
}

async function waitForServer(url, timeoutMs = 60000) {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    const probe = spawnSync("curl", ["-sS", "-o", "/dev/null", "-w", "%{http_code}", url], {
      encoding: "utf8",
    });

    if (probe.status === 0) {
      const status = probe.stdout?.trim();
      if (status && /^\d+$/.test(status)) {
        return;
      }
    }

    await new Promise((resolvePromise) => setTimeout(resolvePromise, 750));
  }

  throw new Error(`Timed out waiting for server: ${url}`);
}

function fetchHtml(url) {
  const output = run("curl", [
    "-sS",
    "-L",
    "-H",
    "Accept: text/html",
    "-o",
    "-",
    "-w",
    "\n__CURL_STATUS__:%{http_code}\n__CURL_TYPE__:%{content_type}\n",
    url,
  ]);

  const statusMatch = output.match(/__CURL_STATUS__:(\d+)/);
  const typeMatch = output.match(/__CURL_TYPE__:(.*)/);

  const status = statusMatch ? statusMatch[1].trim() : "";
  const contentType = typeMatch ? typeMatch[1].trim() : "";

  const body = output
    .replace(/\n__CURL_STATUS__:[\s\S]*$/, "")
    .trim();

  return { body, status, contentType };
}

function buildRows(locales, paths, baseUrl) {
  const rows = [];

  for (const locale of locales) {
    for (const path of paths) {
      const localizedPath = path === "/" ? `/${locale}` : `/${locale}${path}`;
      const url = `${baseUrl}${localizedPath}`;
      const { body, status, contentType } = fetchHtml(url);

      rows.push({
        url,
        locale,
        title: extractTitle(body),
        meta_description: extractMetaDescription(body),
        h1: extractH1(body),
        page_excerpt: extractPageExcerpt(body),
        http_status: status,
        content_type: contentType,
      });
    }
  }

  return rows;
}

function writeCsv(rows) {
  mkdirSync(resolve(ROOT, "docs/output"), { recursive: true });

  const headers = [
    "url",
    "locale",
    "title",
    "meta_description",
    "h1",
    "page_excerpt",
    "http_status",
    "content_type",
  ];

  const lines = [headers.join(",")];

  for (const row of rows) {
    const values = headers.map((header) => csvEscape(row[header] ?? ""));
    lines.push(values.join(","));
  }

  writeFileSync(OUTPUT_CSV, `${lines.join("\n")}\n`, "utf8");
}

async function main() {
  const packageManager = detectPackageManager();
  const locales = getLocales();
  const paths = getRoutePaths();

  const [buildCmd, buildArgs] = commandForBuild(packageManager);
  console.log(`[seo-audit] route source: ${SOURCE_CSV}`);
  console.log(`[seo-audit] locales (${locales.length}): ${locales.join(", ")}`);
  console.log(`[seo-audit] route count: ${paths.length}`);
  console.log(`[seo-audit] running build: ${buildCmd} ${buildArgs.join(" ")}`);
  run(buildCmd, buildArgs, { stdio: "inherit" });

  const port = PORT_CANDIDATES.find((candidate) => {
    try {
      return isPortFree(candidate);
    } catch {
      return false;
    }
  });

  if (!port) {
    throw new Error(`No free port found among: ${PORT_CANDIDATES.join(", ")}`);
  }

  const [startCmd, startArgs] = commandForStart(packageManager, port);
  console.log(`[seo-audit] starting server: ${startCmd} ${startArgs.join(" ")}`);
  const server = spawn(startCmd, startArgs, { cwd: ROOT, stdio: "inherit" });

  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    await waitForServer(`${baseUrl}/`);
    const rows = buildRows(locales, paths, baseUrl);
    writeCsv(rows);
    console.log(`[seo-audit] wrote: ${OUTPUT_CSV}`);
  } finally {
    if (!server.killed) {
      server.kill("SIGTERM");
    }
  }
}

main().catch((error) => {
  console.error(`[seo-audit] ${error.message}`);
  process.exit(1);
});
