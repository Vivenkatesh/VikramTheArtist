const puppeteer = require("/Users/vikram/.npm/_npx/0f94ee7615faf582/node_modules/puppeteer-core");

async function captureWorkScreenshots() {
  const browser = await puppeteer.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();

  // Desktop Dark
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto("http://localhost:4173/?theme=dark", { waitUntil: "networkidle0" });
  await page.evaluate(() => {
    const el = document.querySelector("#work");
    if (el) el.scrollIntoView({ behavior: "instant" });
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: "/Users/vikram/.gemini/antigravity-ide/brain/fe76bce5-4ba6-46bc-b94b-c24bbc037e8a/work-desktop-dark-final.png" });

  // Desktop Light
  await page.goto("http://localhost:4173/?theme=light", { waitUntil: "networkidle0" });
  await page.evaluate(() => {
    const el = document.querySelector("#work");
    if (el) el.scrollIntoView({ behavior: "instant" });
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: "/Users/vikram/.gemini/antigravity-ide/brain/fe76bce5-4ba6-46bc-b94b-c24bbc037e8a/work-desktop-light-final.png" });

  // Mobile Dark
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true });
  await page.goto("http://localhost:4173/?theme=dark", { waitUntil: "networkidle0" });
  await page.evaluate(() => {
    const el = document.querySelector("#work");
    if (el) el.scrollIntoView({ behavior: "instant" });
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: "/Users/vikram/.gemini/antigravity-ide/brain/fe76bce5-4ba6-46bc-b94b-c24bbc037e8a/work-mobile-dark-final.png" });

  // Mobile Light
  await page.goto("http://localhost:4173/?theme=light", { waitUntil: "networkidle0" });
  await page.evaluate(() => {
    const el = document.querySelector("#work");
    if (el) el.scrollIntoView({ behavior: "instant" });
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: "/Users/vikram/.gemini/antigravity-ide/brain/fe76bce5-4ba6-46bc-b94b-c24bbc037e8a/work-mobile-light-final.png" });

  await browser.close();
  console.log("All work screenshots captured successfully!");
}

captureWorkScreenshots().catch(console.error);
