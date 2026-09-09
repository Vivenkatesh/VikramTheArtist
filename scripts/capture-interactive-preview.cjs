const puppeteer = require("/Users/vikram/.npm/_npx/0f94ee7615faf582/node_modules/puppeteer-core");
const path = require("path");

const artifactDir = "/Users/vikram/.gemini/antigravity-ide/brain/9318bf05-fefb-47ba-bdb2-cdeeca9bca76";

async function captureInteractiveDemonstration() {
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

  for (const theme of ["dark", "light"]) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await page.goto(`http://localhost:4173/?theme=${theme}`, { waitUntil: "networkidle0" });
    await page.evaluate(t => document.documentElement.setAttribute("data-theme", t), theme);
    await new Promise(r => setTimeout(r, 400));

    const card = await page.$(".ws-card .project-glass-prototype");
    await page.evaluate(el => el.scrollIntoView({ block: "center", behavior: "instant" }), card);
    await new Promise(r => setTimeout(r, 400));

    const b = await card.boundingBox();

    // 1. Resting state (no hover)
    await page.mouse.move(b.x - 50, b.y - 50);
    await new Promise(r => setTimeout(r, 300));
    await card.screenshot({ path: path.join(artifactDir, `preview-1-resting-${theme}.png`) });

    // 2. Hover top-left corner
    await page.mouse.move(b.x + b.width * 0.25, b.y + b.height * 0.25);
    await new Promise(r => setTimeout(r, 400));
    await card.screenshot({ path: path.join(artifactDir, `preview-2-hover-topleft-${theme}.png`) });

    // 3. Hover bottom-right corner
    await page.mouse.move(b.x + b.width * 0.75, b.y + b.height * 0.75);
    await new Promise(r => setTimeout(r, 400));
    await card.screenshot({ path: path.join(artifactDir, `preview-3-hover-bottomright-${theme}.png`) });

    await page.close();
  }

  await browser.close();
  console.log("Interactive preview screenshots captured successfully!");
}

captureInteractiveDemonstration().catch(console.error);
