import fs from "node:fs";
import path from "node:path";

const PROJECT_ROOT = process.cwd();
const METADATA_PATH = path.join(PROJECT_ROOT, "test-results/ui-audit-tr-metadata.json");
const FINDINGS_RAW_PATH = path.join(PROJECT_ROOT, "test-results/ui-audit-tr-findings.raw.json");
const SUMMARY_OUTPUT_PATH = path.join(PROJECT_ROOT, "docs/output/ui-audit-summary.md");
const FINDINGS_OUTPUT_PATH = path.join(PROJECT_ROOT, "docs/output/ui-audit-findings.json");

const REPORT_CANDIDATES = [
  process.env.PLAYWRIGHT_JSON_OUTPUT_NAME
    ? path.join(PROJECT_ROOT, process.env.PLAYWRIGHT_JSON_OUTPUT_NAME)
    : "",
  path.join(PROJECT_ROOT, "test-results/ui-audit-tr-report.json"),
  path.join(PROJECT_ROOT, "test-results/ui-audit-report.json"),
  path.join(PROJECT_ROOT, "test-results/results.json"),
].filter(Boolean);

function readJson(filePath, fallback) {
  if (!filePath || !fs.existsSync(filePath)) return fallback;
  const raw = fs.readFileSync(filePath, "utf8").trim();
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function pickExistingReportPath() {
  for (const candidate of REPORT_CANDIDATES) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return "";
}

function flattenTests(node, acc = []) {
  if (!node || typeof node !== "object") return acc;

  if (Array.isArray(node.suites)) {
    for (const suite of node.suites) {
      flattenTests(suite, acc);
    }
  }

  if (Array.isArray(node.specs)) {
    for (const spec of node.specs) {
      const tests = Array.isArray(spec.tests) ? spec.tests : [];
      for (const testCase of tests) {
        const results = Array.isArray(testCase.results) ? testCase.results : [];
        const statuses = results.map((result) => result.status).filter(Boolean);
        const finalStatus = statuses.includes("failed")
          ? "failed"
          : statuses.includes("timedOut")
            ? "timedOut"
            : statuses.includes("interrupted")
              ? "interrupted"
              : statuses.includes("passed")
                ? "passed"
                : testCase.status || "unknown";

        acc.push({
          title: testCase.title || spec.title || "(untitled)",
          status: finalStatus,
        });
      }
    }
  }

  return acc;
}

function parseAuditTitle(title) {
  const match = /^\[ui-audit-tr\]\s+([^|]+)\s+\|\s+([^|]+)\s+\|\s+([^|]+)\s+\|\s+(.+)$/.exec(title);
  if (!match) return null;

  return {
    locale: match[1].trim(),
    theme: match[2].trim(),
    viewport: match[3].trim(),
    route: match[4].trim(),
  };
}

function formatViewportList(viewports) {
  if (!Array.isArray(viewports) || viewports.length === 0) return "[]";
  return viewports.map((entry) => `${entry.name} ${entry.width}x${entry.height}`).join(", ");
}

function buildSummaryMarkdown({
  metadata,
  reportPath,
  totalTests,
  passedTests,
  failedTests,
  nonTrCases,
  warningFindings,
}) {
  const lines = [];
  lines.push("# TR UI Audit Summary");
  lines.push("");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push("");
  lines.push("## Tarama Kapsami");
  lines.push(`- localeList = ${JSON.stringify(metadata.localeList || [])}`);
  lines.push(`- themeCount = ${(metadata.themes || []).length} (${(metadata.themes || []).join(", ")})`);
  lines.push(`- viewportCount = ${(metadata.viewports || []).length} (${formatViewportList(metadata.viewports || [])})`);
  lines.push(`- routeCount = ${metadata.routeCount ?? (metadata.routes || []).length ?? 0}`);
  lines.push(`- routesSource = ${metadata.routesSource || "unknown"}`);
  lines.push(`- coverageLow = ${Boolean(metadata.coverageLow)}`);
  lines.push(`- matrixSize = ${metadata.matrixSize ?? "unknown"}`);
  lines.push(`- trMissing = ${Boolean(metadata.trMissing)}`);
  lines.push(`- reportJson = ${reportPath || "not-found"}`);
  lines.push(`- executedTests = ${totalTests}`);
  lines.push(`- passedTests = ${passedTests}`);
  lines.push(`- failedTests = ${failedTests.length}`);
  lines.push(`- nonTrCases = ${nonTrCases.length}`);
  lines.push("");

  lines.push("## Fail List");
  if (failedTests.length === 0) {
    lines.push("- No failed Playwright case.");
  } else {
    for (const testCase of failedTests) {
      const parsed = parseAuditTitle(testCase.title);
      if (parsed) {
        lines.push(
          `- route=${parsed.route} | theme=${parsed.theme} | viewport=${parsed.viewport} | locale=${parsed.locale} | status=${testCase.status}`,
        );
      } else {
        lines.push(`- ${testCase.title} | status=${testCase.status}`);
      }
    }
  }
  lines.push("");

  lines.push("## Warning List");
  if (warningFindings.length === 0) {
    lines.push("- No DOM/measurement warnings.");
  } else {
    for (const item of warningFindings) {
      lines.push(
        `- route=${item.sourceRoute} -> ${item.localizedRoute} | theme=${item.theme} | viewport=${item.viewport} | warnings=${item.warnings.join(", ")}`,
      );
    }
  }
  lines.push("");

  lines.push("## Artifacts");
  lines.push("- Playwright HTML report: `playwright-report/index.html`");
  lines.push(`- Playwright JSON report: \`${reportPath || "not-found"}\``);
  lines.push("- Summary markdown: `docs/output/ui-audit-summary.md`");
  lines.push("- Findings JSON: `docs/output/ui-audit-findings.json`");
  lines.push("");

  return `${lines.join("\n")}\n`;
}

function main() {
  const metadata = readJson(METADATA_PATH, {
    localeList: ["tr"],
    themes: ["light", "dark"],
    viewports: [],
    routeCount: 0,
    routes: [],
    routesSource: "unknown",
    coverageLow: false,
    matrixSize: 0,
    trMissing: false,
  });

  const findings = readJson(FINDINGS_RAW_PATH, []);
  const reportPath = pickExistingReportPath();
  const reportJson = readJson(reportPath, { suites: [] });

  const tests = flattenTests(reportJson, []);
  const auditTests = tests.filter((entry) => entry.title.startsWith("[ui-audit-tr]"));
  const failedTests = auditTests.filter((entry) => entry.status !== "passed");
  const passedTests = auditTests.filter((entry) => entry.status === "passed").length;
  const nonTrCases = auditTests
    .map((entry) => parseAuditTitle(entry.title))
    .filter(Boolean)
    .filter((entry) => entry.locale !== "tr");

  const warningFindings = Array.isArray(findings)
    ? findings.filter((item) => Array.isArray(item.warnings) && item.warnings.length > 0)
    : [];

  const findingsOutput = {
    generatedAt: new Date().toISOString(),
    localeList: metadata.localeList || ["tr"],
    routesSource: metadata.routesSource || "unknown",
    routeCount: metadata.routeCount ?? (metadata.routes || []).length ?? 0,
    coverageLow: Boolean(metadata.coverageLow),
    matrixSize: metadata.matrixSize ?? 0,
    trMissing: Boolean(metadata.trMissing),
    reportJson: reportPath || "not-found",
    totals: {
      executedTests: auditTests.length,
      passedTests,
      failedTests: failedTests.length,
      warningPages: warningFindings.length,
    },
    failures: failedTests.map((entry) => {
      const parsed = parseAuditTitle(entry.title);
      if (!parsed) {
        return {
          title: entry.title,
          status: entry.status,
        };
      }
      return {
        route: parsed.route,
        theme: parsed.theme,
        viewport: parsed.viewport,
        locale: parsed.locale,
        status: entry.status,
      };
    }),
    pages: Array.isArray(findings) ? findings : [],
  };

  const summaryMarkdown = buildSummaryMarkdown({
    metadata,
    reportPath: reportPath || "not-found",
    totalTests: auditTests.length,
    passedTests,
    failedTests,
    nonTrCases,
    warningFindings,
  });

  fs.mkdirSync(path.dirname(SUMMARY_OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(SUMMARY_OUTPUT_PATH, summaryMarkdown);
  fs.writeFileSync(FINDINGS_OUTPUT_PATH, `${JSON.stringify(findingsOutput, null, 2)}\n`);
}

main();
