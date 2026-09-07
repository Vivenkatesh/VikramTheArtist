const { execSync } = require("child_process");
const fs = require("fs");

const configs = [
  { name: "Desktop Dark", url: "http://localhost:4173/?theme=dark", flags: "--preset=desktop" },
  { name: "Desktop Light", url: "http://localhost:4173/?theme=light", flags: "--preset=desktop" },
  { name: "Mobile Dark", url: "http://localhost:4173/?theme=dark", flags: "" },
  { name: "Mobile Light", url: "http://localhost:4173/?theme=light", flags: "" }
];

const results = {};

for (const cfg of configs) {
  console.log(`Running Lighthouse for ${cfg.name}...`);
  const tmpFile = `/tmp/lh-${Date.now()}.json`;
  const cmd = `npx lighthouse "${cfg.url}" ${cfg.flags} --output=json --output-path="${tmpFile}" --chrome-flags="--headless=new --no-sandbox --disable-gpu" --quiet`;
  try {
    execSync(cmd, { stdio: "inherit" });
    const data = JSON.parse(fs.readFileSync(tmpFile, "utf8"));
    results[cfg.name] = {
      performance: Math.round(data.categories.performance.score * 100),
      accessibility: Math.round(data.categories.accessibility.score * 100),
      bestPractices: Math.round(data.categories["best-practices"].score * 100),
      seo: Math.round(data.categories.seo.score * 100),
      fcp: data.audits["first-contentful-paint"]?.displayValue,
      lcp: data.audits["largest-contentful-paint"]?.displayValue,
      tbt: data.audits["total-blocking-time"]?.displayValue,
      cls: data.audits["cumulative-layout-shift"]?.displayValue,
      lcpElement: data.audits["largest-contentful-paint-element"]?.displayValue || "N/A"
    };
    console.log(`${cfg.name} Results:`, results[cfg.name]);
    fs.unlinkSync(tmpFile);
  } catch (err) {
    console.error(`Error auditing ${cfg.name}:`, err.message);
  }
}

const outPath = "/Users/vikram/.gemini/antigravity-ide/brain/fe76bce5-4ba6-46bc-b94b-c24bbc037e8a/scratch/final-production-audits.json";
fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
console.log(`All audits saved to ${outPath}`);
console.table(results);
