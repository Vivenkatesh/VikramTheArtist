const puppeteer = require("/Users/vikram/.npm/_npx/0f94ee7615faf582/node_modules/puppeteer-core");
const fs = require("fs");
const path = require("path");

const artifactDir = "/Users/vikram/.gemini/antigravity-ide/brain/9318bf05-fefb-47ba-bdb2-cdeeca9bca76";

async function captureScrollFrames() {
  const browser = await puppeteer.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: false,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--window-size=1440,950",
      "--enable-gpu-rasterization"
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto("http://localhost:4173/?theme=dark", { waitUntil: "networkidle0" });
  await page.bringToFront();

  // Scroll to #work header
  const work = await page.$("#work");
  await page.evaluate(el => el.scrollIntoView({ block: "start", behavior: "instant" }), work);
  await new Promise(r => setTimeout(r, 400));

  console.log("Capturing 20 scroll step screenshots around card transitions...");
  const startY = await page.evaluate(() => window.scrollY);

  for (let i = 0; i < 25; i++) {
    const y = startY + i * 80;
    await page.evaluate((targetY) => window.scrollTo(0, targetY), y);
    // Take immediate screenshot to catch any transient render artifact / white patch
    await page.screenshot({ path: path.join(artifactDir, `scratch/scroll-frame-${i}-y${y}.png`) });
  }

  await browser.close();
  console.log("Finished capturing scroll frames!");
}

captureScrollFrames().catch(console.error);
