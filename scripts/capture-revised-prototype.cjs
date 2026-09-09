const puppeteer = require("/Users/vikram/.npm/_npx/0f94ee7615faf582/node_modules/puppeteer-core");

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const artifactDir = "/Users/vikram/.gemini/antigravity-ide/brain/9318bf05-fefb-47ba-bdb2-cdeeca9bca76";

  // Dark
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await page.goto("http://localhost:4173/?theme=dark", { waitUntil: "networkidle0" });
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "dark");
    });
    await new Promise(r => setTimeout(r, 400));
    const card = await page.$(".ws-card .project-glass-prototype");
    await page.evaluate(el => el.scrollIntoView({ block: "center", behavior: "instant" }), card);
    await new Promise(r => setTimeout(r, 400));
    await card.screenshot({ path: `${artifactDir}/revised-prototype-desktop-dark.png` });
    console.log("Captured revised-prototype-desktop-dark.png");
    await page.close();
  }

  // Light
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await page.goto("http://localhost:4173/?theme=light", { waitUntil: "networkidle0" });
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "light");
    });
    await new Promise(r => setTimeout(r, 400));
    const card = await page.$(".ws-card .project-glass-prototype");
    await page.evaluate(el => el.scrollIntoView({ block: "center", behavior: "instant" }), card);
    await new Promise(r => setTimeout(r, 400));
    await card.screenshot({ path: `${artifactDir}/revised-prototype-desktop-light.png` });
    console.log("Captured revised-prototype-desktop-light.png");
    await page.close();
  }

  await browser.close();
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
