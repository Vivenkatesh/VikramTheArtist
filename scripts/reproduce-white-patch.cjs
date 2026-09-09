const puppeteer = require("/Users/vikram/.npm/_npx/0f94ee7615faf582/node_modules/puppeteer-core");
const fs = require("fs");
const path = require("path");

const artifactDir = "/Users/vikram/.gemini/antigravity-ide/brain/9318bf05-fefb-47ba-bdb2-cdeeca9bca76";

async function findWhitePatch() {
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

  const page = (await browser.pages())[0] || await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto("http://localhost:4173/?theme=dark", { waitUntil: "networkidle0" });
  await page.bringToFront();

  // Scroll slowly through the Hero into Work
  console.log("Scrolling and checking for white patches...");
  const detections = [];

  for (let y = 600; y <= 3200; y += 40) {
    await page.evaluate((targetY) => window.scrollTo(0, targetY), y);
    await new Promise(r => setTimeout(r, 40));

    // Inspect elements visible in viewport
    const info = await page.evaluate((curY) => {
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const elements = Array.from(document.querySelectorAll("*"));
      const whiteEls = [];

      for (const el of elements) {
        const rect = el.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) continue;
        if (rect.bottom < 0 || rect.top > vh) continue;

        const style = window.getComputedStyle(el);
        const bg = style.backgroundColor;
        const bgImg = style.backgroundImage;

        // Check if background is pure white or near white on a large area
        if (
          bg === "rgb(255, 255, 255)" ||
          bg === "rgba(255, 255, 255, 1)" ||
          bg === "#ffffff" ||
          bg === "#fff" ||
          bg.startsWith("rgba(255, 255, 255, 0.9")
        ) {
          // Ignore small icons/arrows/dots
          if (rect.width > 80 && rect.height > 30) {
            whiteEls.push({
              tag: el.tagName.toLowerCase(),
              id: el.id,
              className: el.className,
              rect: { top: Math.round(rect.top), left: Math.round(rect.left), width: Math.round(rect.width), height: Math.round(rect.height) },
              bg,
              bgImg: bgImg !== "none" ? bgImg.slice(0, 50) : "none"
            });
          }
        }
      }

      return { scrollY: curY, whiteEls };
    }, y);

    if (info.whiteEls.length > 0) {
      detections.push(info);
      console.log(`At scrollY=${y}, detected white elements:`, info.whiteEls);
      // Capture screenshot at this point
      await page.screenshot({ path: path.join(artifactDir, `scratch/white-patch-y${y}.png`) });
    }
  }

  await browser.close();
  fs.writeFileSync(path.join(artifactDir, "scratch/white-patch-detections.json"), JSON.stringify(detections, null, 2));
}

findWhitePatch().catch(console.error);
