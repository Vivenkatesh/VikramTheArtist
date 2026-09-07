const puppeteer = require("/Users/vikram/.npm/_npx/0f94ee7615faf582/node_modules/puppeteer-core");

const configs = [
  { name: "Desktop Light (1440x900, 1x DPR)", theme: "light", width: 1440, height: 900, dpr: 1, isMobile: false },
  { name: "Desktop Dark (1440x900, 1x DPR)", theme: "dark", width: 1440, height: 900, dpr: 1, isMobile: false },
  { name: "Desktop Light Retina (1440x900, 2x DPR)", theme: "light", width: 1440, height: 900, dpr: 2, isMobile: false },
  { name: "Desktop Dark Retina (1440x900, 2x DPR)", theme: "dark", width: 1440, height: 900, dpr: 2, isMobile: false },
  { name: "Mobile Light (390x844, 2x DPR)", theme: "light", width: 390, height: 844, dpr: 2, isMobile: true },
  { name: "Mobile Dark (390x844, 2x DPR)", theme: "dark", width: 390, height: 844, dpr: 2, isMobile: true }
];

async function checkConfig(browser, cfg) {
  const page = await browser.newPage();
  await page.setViewport({
    width: cfg.width,
    height: cfg.height,
    deviceScaleFactor: cfg.dpr,
    isMobile: cfg.isMobile
  });

  const url = `http://localhost:4173/?theme=${cfg.theme}`;
  await page.goto(url, { waitUntil: "load" });

  // Scroll smoothly down the entire page
  await page.evaluate(async () => {
    const totalH = document.documentElement.scrollHeight;
    for (let y = 0; y < totalH; y += 400) {
      window.scrollTo(0, y);
      await new Promise(r => setTimeout(r, 60));
    }
    // Also scroll horizontal carousel if on mobile
    const track = document.querySelector(".work-mobile-track") || document.querySelector("[class*=\"overflow-x-auto\"]");
    if (track) {
      for (let x = 0; x < track.scrollWidth; x += 300) {
        track.scrollLeft = x;
        await new Promise(r => setTimeout(r, 60));
      }
    }
  });

  await new Promise(r => setTimeout(r, 1200));

  const results = await page.evaluate(async () => {
    const imgs = Array.from(document.querySelectorAll("img"));
    const out = [];

    for (let i = 0; i < imgs.length; i++) {
      const img = imgs[i];
      const isVisible = img.offsetParent !== null && window.getComputedStyle(img).display !== "none";
      let decodeSuccess = false;
      let decodeError = null;

      // Only decode if the image has natural dimensions (i.e. is loaded)
      if (img.naturalWidth > 0) {
        try {
          await Promise.race([
            img.decode().then(() => { decodeSuccess = true; }),
            new Promise((_, reject) => setTimeout(() => reject(new Error("decode timeout 500ms")), 500))
          ]);
        } catch (e) {
          decodeError = e.message;
        }
      }

      out.push({
        index: i + 1,
        alt: img.alt || "(none)",
        currentSrc: img.currentSrc,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        complete: img.complete,
        decodeSuccess,
        decodeError,
        isVisible
      });
    }
    return out;
  });

  await page.close();
  return { cfg, results };
}

async function main() {
  const browser = await puppeteer.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const all = [];
  for (const c of configs) {
    console.log(`Auditing: ${c.name}...`);
    const r = await checkConfig(browser, c);
    all.push(r);
  }
  await browser.close();

  console.log("\n" + "=".repeat(75));
  console.log("BROWSER ASSET INTEGRITY & DECODE VALIDATION REPORT");
  console.log("=".repeat(75));

  for (const item of all) {
    console.log(`\n### ${item.cfg.name}`);
    const visible = item.results.filter(r => r.isVisible);
    const loaded = visible.filter(r => r.naturalWidth > 0 && r.decodeSuccess);
    const broken = visible.filter(r => r.naturalWidth === 0 || !r.decodeSuccess);

    console.log(`Visible Images: ${loaded.length}/${visible.length} successfully loaded & decoded.`);
    console.log(`Failed / Broken: ${broken.length}`);

    // Show distinct successfully loaded currentSrc files
    const files = [...new Set(loaded.map(r => r.currentSrc.split("/").pop()))];
    console.log(`Rendered asset files (${files.length}):`);
    files.forEach(f => console.log(`  ✓ ${f}`));

    if (broken.length > 0) {
      console.log("Broken images:", broken);
    }
  }
}

main().catch(console.error);
