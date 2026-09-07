const puppeteer = require("/Users/vikram/.npm/_npx/0f94ee7615faf582/node_modules/puppeteer-core");
const fs = require("fs");

async function main() {
  const browser = await puppeteer.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto("http://localhost:4173/?theme=dark", { waitUntil: "networkidle0" });

  // Warm scroll once
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await new Promise(r => setTimeout(r, 500));
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 300));

  // Scroll to #work
  const workTop = await page.evaluate(() => {
    const el = document.querySelector("#work");
    return el ? window.scrollY + el.getBoundingClientRect().top : 0;
  });
  await page.evaluate((top) => window.scrollTo(0, top), workTop);
  await new Promise(r => setTimeout(r, 200));

  console.log("Starting CDP Performance trace during scroll...");
  const client = await page.target().createCDPSession();
  await client.send("Tracing.start", {
    categories: "-*,devtools.timeline,blink.user_timing,disabled-by-default-devtools.timeline",
    options: "sampling-frequency=10000"
  });

  // Perform scroll across 2000ms
  await page.evaluate(async () => {
    const startY = window.scrollY;
    const duration = 2000;
    const dist = 2500;
    const start = performance.now();
    await new Promise(res => {
      const step = (now) => {
        const p = Math.min(1, (now - start) / duration);
        window.scrollTo(0, startY + dist * p);
        if (p < 1) requestAnimationFrame(step);
        else res();
      };
      requestAnimationFrame(step);
    });
  });

  const events = [];
  client.on("Tracing.dataCollected", (data) => {
    events.push(...data.value);
  });

  await new Promise(r => setTimeout(r, 200));
  await client.send("Tracing.end");
  await new Promise(r => setTimeout(r, 1000));

  await browser.close();

  // Analyze events
  console.log(`Collected ${events.length} trace events.`);
  const breakdown = {};
  let totalDurationUs = 0;

  for (const ev of events) {
    if (ev.dur) {
      breakdown[ev.name] = (breakdown[ev.name] || 0) + ev.dur;
      totalDurationUs += ev.dur;
    }
  }

  const sorted = Object.entries(breakdown)
    .map(([name, dur]) => ({ name, durationMs: Math.round(dur / 1000) }))
    .sort((a, b) => b.durationMs - a.durationMs)
    .slice(0, 25);

  console.log("\nTop 25 Trace Operations during Scroll:");
  console.table(sorted);

  fs.writeFileSync(
    "/Users/vikram/.gemini/antigravity-ide/brain/fe76bce5-4ba6-46bc-b94b-c24bbc037e8a/scratch/trace-breakdown.json",
    JSON.stringify(sorted, null, 2)
  );
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
