const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const artifactDir = "/Users/vikram/.gemini/antigravity-ide/brain/9318bf05-fefb-47ba-bdb2-cdeeca9bca76";
const scratchDir = path.join(artifactDir, "scratch");
if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });

const configs = [
  { name: "Desktop Dark", formFactor: "desktop", theme: "dark", url: "http://localhost:4173/?theme=dark" },
  { name: "Desktop Light", formFactor: "desktop", theme: "light", url: "http://localhost:4173/?theme=light" },
  { name: "Mobile Dark", formFactor: "mobile", theme: "dark", url: "http://localhost:4173/?theme=dark" },
  { name: "Mobile Light", formFactor: "mobile", theme: "light", url: "http://localhost:4173/?theme=light" }
];

const results = {};

for (const config of configs) {
  console.log(`\n=== Running 3 Lighthouse audits for ${config.name} ===`);
  results[config.name] = [];

  for (let run = 1; run <= 3; run++) {
    const reportPath = path.join(scratchDir, `lh-${config.formFactor}-${config.theme}-run${run}.json`);
    const flags = [
      `"${config.url}"`,
      `--output=json`,
      `--output-path="${reportPath}"`,
      `--chrome-flags="--headless --no-sandbox --disable-setuid-sandbox"`,
      `--form-factor=${config.formFactor}`,
      `--only-categories=performance,accessibility`,
      `--quiet`
    ];

    if (config.formFactor === "desktop") {
      flags.push(`--preset=desktop`);
    }

    const cmd = `CHROME_PATH="${CHROME_PATH}" npx lighthouse ${flags.join(" ")}`;
    try {
      console.log(`Running Run ${run}...`);
      execSync(cmd, { stdio: "inherit", timeout: 90000 });

      if (fs.existsSync(reportPath)) {
        const data = JSON.parse(fs.readFileSync(reportPath, "utf8"));
        const perf = Math.round((data.categories.performance?.score || 0) * 100);
        const a11y = Math.round((data.categories.accessibility?.score || 0) * 100);
        const lcp = data.audits["largest-contentful-paint"]?.numericValue || 0;
        const fcp = data.audits["first-contentful-paint"]?.numericValue || 0;
        const tbt = data.audits["total-blocking-time"]?.numericValue || 0;
        const cls = data.audits["cumulative-layout-shift"]?.numericValue || 0;
        const lcpElement = data.audits["largest-contentful-paint-element"]?.displayValue || data.audits["largest-contentful-paint-element"]?.details?.items?.[0]?.node?.nodeLabel || "N/A";

        results[config.name].push({
          run,
          perf,
          a11y,
          lcp: Math.round(lcp),
          fcp: Math.round(fcp),
          tbt: Math.round(tbt),
          cls: Number(cls.toFixed(3)),
          lcpElement,
          noLcp: data.audits["largest-contentful-paint"]?.scoreDisplayMode === "error" || lcp === 0
        });
      } else {
        results[config.name].push({ run, error: "Report file not generated" });
      }
    } catch (e) {
      console.error(`Run ${run} failed:`, e.message);
      results[config.name].push({ run, error: e.message });
    }
  }
}

// Compute Medians
const summary = {};
for (const [name, runs] of Object.entries(results)) {
  const validRuns = runs.filter(r => !r.error);
  if (validRuns.length === 0) {
    summary[name] = { error: "All runs failed" };
    continue;
  }
  const median = (arr, key) => {
    const sorted = [...arr].map(item => item[key]).sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  };

  summary[name] = {
    runs: runs,
    medianPerf: median(validRuns, "perf"),
    medianA11y: median(validRuns, "a11y"),
    medianLCP: median(validRuns, "lcp"),
    medianFCP: median(validRuns, "fcp"),
    medianTBT: median(validRuns, "tbt"),
    medianCLS: median(validRuns, "cls"),
    lcpElement: validRuns[0]?.lcpElement,
    noLcpRecurred: validRuns.some(r => r.noLcp)
  };
}

fs.writeFileSync(path.join(scratchDir, "lighthouse-summary.json"), JSON.stringify({ results, summary }, null, 2));
console.log("\n=== LIGHTHOUSE SUMMARY ===");
console.log(JSON.stringify(summary, null, 2));
