const puppeteer = require("/Users/vikram/.npm/_npx/0f94ee7615faf582/node_modules/puppeteer-core");

async function capturePrototypeScreenshots() {
  const browser = await puppeteer.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const artifactDir = "/Users/vikram/.gemini/antigravity-ide/brain/fe76bce5-4ba6-46bc-b94b-c24bbc037e8a";

  async function preparePage(page, theme) {
    await page.goto(`http://localhost:4173/?theme=${theme}`, { waitUntil: "networkidle0" });
    await page.evaluate((t) => {
      document.documentElement.setAttribute("data-theme", t);
      localStorage.setItem("theme", t);
    }, theme);
    await new Promise(r => setTimeout(r, 600));
  }

  // 1. Desktop Dark
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await preparePage(page, "dark");

    const cardHandle = await page.$(".ws-card .project-glass-prototype");
    if (cardHandle) {
      await page.evaluate((el) => {
        el.scrollIntoView({ block: "center", behavior: "instant" });
      }, cardHandle);
      await new Promise(r => setTimeout(r, 500));

      // Capture full viewport
      await page.screenshot({
        path: `${artifactDir}/prototype-desktop-dark-viewport.png`
      });

      // Move mouse onto card to trigger hover highlight & tilt
      const box = await cardHandle.boundingBox();
      if (box) {
        await page.mouse.move(box.x + box.width * 0.35, box.y + box.height * 0.35);
        await new Promise(r => setTimeout(r, 300));
      }

      await cardHandle.screenshot({
        path: `${artifactDir}/prototype-desktop-dark-card.png`
      });
      console.log("Captured Desktop Dark prototype screenshots.");
    }
    await page.close();
  }

  // 2. Desktop Light
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await preparePage(page, "light");

    const cardHandle = await page.$(".ws-card .project-glass-prototype");
    if (cardHandle) {
      await page.evaluate((el) => {
        el.scrollIntoView({ block: "center", behavior: "instant" });
      }, cardHandle);
      await new Promise(r => setTimeout(r, 500));

      await page.screenshot({
        path: `${artifactDir}/prototype-desktop-light-viewport.png`
      });

      const box = await cardHandle.boundingBox();
      if (box) {
        await page.mouse.move(box.x + box.width * 0.35, box.y + box.height * 0.35);
        await new Promise(r => setTimeout(r, 300));
      }

      await cardHandle.screenshot({
        path: `${artifactDir}/prototype-desktop-light-card.png`
      });
      console.log("Captured Desktop Light prototype screenshots.");
    }
    await page.close();
  }

  // 3. Mobile Dark
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true });
    await preparePage(page, "dark");

    const cardHandle = await page.$(".snap-x .project-glass-prototype");
    if (cardHandle) {
      await page.evaluate((el) => {
        el.scrollIntoView({ block: "center", behavior: "instant" });
      }, cardHandle);
      await new Promise(r => setTimeout(r, 500));

      await page.screenshot({
        path: `${artifactDir}/prototype-mobile-dark-viewport.png`
      });

      await cardHandle.screenshot({
        path: `${artifactDir}/prototype-mobile-dark-card.png`
      });
      console.log("Captured Mobile Dark prototype screenshots.");
    }
    await page.close();
  }

  // 4. Mobile Light
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true });
    await preparePage(page, "light");

    const cardHandle = await page.$(".snap-x .project-glass-prototype");
    if (cardHandle) {
      await page.evaluate((el) => {
        el.scrollIntoView({ block: "center", behavior: "instant" });
      }, cardHandle);
      await new Promise(r => setTimeout(r, 500));

      await page.screenshot({
        path: `${artifactDir}/prototype-mobile-light-viewport.png`
      });

      await cardHandle.screenshot({
        path: `${artifactDir}/prototype-mobile-light-card.png`
      });
      console.log("Captured Mobile Light prototype screenshots.");
    }
    await page.close();
  }

  await browser.close();
  console.log("All prototype screenshots captured successfully!");
}

capturePrototypeScreenshots().catch(err => {
  console.error("Screenshot capture error:", err);
  process.exit(1);
});
