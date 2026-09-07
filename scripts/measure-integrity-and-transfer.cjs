const puppeteer = require("/Users/vikram/.npm/_npx/0f94ee7615faf582/node_modules/puppeteer-core");

const scenarios = [
  { name: "Desktop Light (1440x900, 1x DPR)", theme: "light", width: 1440, height: 900, dpr: 1, isMobile: false },
  { name: "Desktop Dark (1440x900, 1x DPR)", theme: "dark", width: 1440, height: 900, dpr: 1, isMobile: false },
  { name: "Desktop Light Retina (1440x900, 2x DPR)", theme: "light", width: 1440, height: 900, dpr: 2, isMobile: false },
  { name: "Desktop Dark Retina (1440x900, 2x DPR)", theme: "dark", width: 1440, height: 900, dpr: 2, isMobile: false },
  { name: "Mobile Light (390x844, 2x DPR)", theme: "light", width: 390, height: 844, dpr: 2, isMobile: true },
  { name: "Mobile Dark (390x844, 2x DPR)", theme: "dark", width: 390, height: 844, dpr: 2, isMobile: true }
];

async function runScenario(browser, sc) {
  const page = await browser.newPage();
  await page.setViewport({
    width: sc.width,
    height: sc.height,
    deviceScaleFactor: sc.dpr,
    isMobile: sc.isMobile
  });

  const cdp = await page.target().createCDPSession();
  await cdp.send("Network.enable");
  await cdp.send("Network.clearBrowserCache");
  await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });

  const networkEntries = new Map();
  let initialTransferBytes = 0;
  let cumulativeTransferBytes = 0;
  let initialPhase = true;

  cdp.on("Network.requestWillBeSent", (e) => {
    networkEntries.set(e.requestId, {
      url: e.request.url,
      method: e.request.method,
      type: e.type,
      phase: initialPhase ? "initial" : "scroll",
      transferBytes: 0,
      encodedBytes: 0,
      status: null,
      mimeType: null,
    });
  });

  cdp.on("Network.responseReceived", (e) => {
    const entry = networkEntries.get(e.requestId);
    if (entry) {
      entry.status = e.response.status;
      entry.mimeType = e.response.mimeType;
      entry.protocol = e.response.protocol;
    }
  });

  cdp.on("Network.loadingFinished", (e) => {
    const entry = networkEntries.get(e.requestId);
    if (entry) {
      entry.encodedBytes = e.encodedDataLength;
      cumulativeTransferBytes += e.encodedDataLength;
      if (entry.phase === "initial") {
        initialTransferBytes += e.encodedDataLength;
      }
    }
  });

  const url = `http://localhost:4173/?theme=${sc.theme}`;
  await page.goto(url, { waitUntil: "networkidle0" });
  await new Promise(r => setTimeout(r, 600));

  // Mark end of initial load phase
  initialPhase = false;

  // Scroll through each section to trigger all scroll scenery, cards, and footer
  await page.evaluate(async () => {
    const totalH = document.documentElement.scrollHeight;
    const step = 450;
    for (let y = 0; y < totalH; y += step) {
      window.scrollTo(0, y);
      await new Promise(r => setTimeout(r, 120));
    }
    // Touch footer
    window.scrollTo(0, totalH);
    await new Promise(r => setTimeout(r, 400));
    // Scroll back to top
    window.scrollTo(0, 0);
    await new Promise(r => setTimeout(r, 200));
  });

  await new Promise(r => setTimeout(r, 1500));

  // Now audit all images in DOM
  const domImages = await page.evaluate(async () => {
    const imgs = Array.from(document.querySelectorAll("img"));
    const results = [];
    for (let idx = 0; idx < imgs.length; idx++) {
      const img = imgs[idx];
      const isVisible = img.offsetParent !== null && window.getComputedStyle(img).display !== "none" && window.getComputedStyle(img).visibility !== "hidden";
      let decodeSuccess = false;
      let decodeError = null;

      if (img.complete && img.naturalWidth > 0) {
        try {
          await img.decode();
          decodeSuccess = true;
        } catch (e) {
          decodeError = e.message;
        }
      }

      results.push({
        index: idx + 1,
        alt: img.alt || "(no alt)",
        currentSrc: img.currentSrc,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        complete: img.complete,
        decodeSuccess,
        decodeError,
        isVisible
      });
    }
    return results;
  });

  const requestList = Array.from(networkEntries.values());
  await page.close();

  return {
    scenario: sc,
    initialTransferBytes,
    cumulativeTransferBytes,
    requestCount: requestList.length,
    requests: requestList,
    images: domImages
  };
}

async function main() {
  const browser = await puppeteer.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const allResults = [];
  for (const sc of scenarios) {
    console.log(`Running scenario: ${sc.name}...`);
    const res = await runScenario(browser, sc);
    allResults.push(res);
  }
  await browser.close();

  console.log("\n" + "=".repeat(75));
  console.log("MEASURED NETWORK TRANSFERS & ASSET INTEGRITY (REAL CHROME CDP)");
  console.log("=".repeat(75));

  for (const res of allResults) {
    console.log(`\n### ${res.scenario.name}`);
    console.log(`Initial Load Transfer:    ${(res.initialTransferBytes / 1024).toFixed(1)} KiB`);
    console.log(`Cumulative Scroll Transfer: ${(res.cumulativeTransferBytes / 1024).toFixed(1)} KiB`);
    console.log(`Total HTTP Requests:       ${res.requestCount}`);

    // Categorize transfer bytes
    const categories = { Document: 0, Script: 0, Stylesheet: 0, Font: 0, Image: 0, Other: 0 };
    for (const r of res.requests) {
      if (r.type === "Document") categories.Document += r.encodedBytes;
      else if (r.type === "Script") categories.Script += r.encodedBytes;
      else if (r.type === "Stylesheet") categories.Stylesheet += r.encodedBytes;
      else if (r.type === "Font") categories.Font += r.encodedBytes;
      else if (r.type === "Image") categories.Image += r.encodedBytes;
      else categories.Other += r.encodedBytes;
    }
    console.log("Transferred Bytes by Category:");
    for (const [k, v] of Object.entries(categories)) {
      if (v > 0) console.log(`  - ${k.padEnd(12)}: ${(v / 1024).toFixed(1)} KiB`);
    }

    // Image integrity check
    const visibleImgs = res.images.filter(i => i.isVisible);
    const brokenVisible = visibleImgs.filter(i => !i.complete || i.naturalWidth === 0 || !i.decodeSuccess);
    console.log(`DOM Images: Total ${res.images.length} | Visible on page: ${visibleImgs.length}`);
    console.log(`Visible Images Valid & Decoded: ${brokenVisible.length === 0 ? "100% OK (" + visibleImgs.length + "/" + visibleImgs.length + ")" : "FAIL (" + brokenVisible.length + " broken)"}`);

    if (brokenVisible.length > 0) {
      console.log("Broken images:", brokenVisible);
    }

    // Check for any 404 or non-image responses for image requests
    const imageRequests = res.requests.filter(r => r.type === "Image" || r.url.includes("/IMG/"));
    const htmlResponsesForImages = imageRequests.filter(r => r.mimeType && r.mimeType.includes("text/html"));
    console.log(`Image HTTP Requests Returning HTML (False 200s): ${htmlResponsesForImages.length}`);
    if (htmlResponsesForImages.length > 0) {
      console.log("HTML response error URLs:", htmlResponsesForImages.map(r => r.url));
    }
  }

  // Save complete JSON results to scratch
  const fs = require("fs");
  fs.writeFileSync(
    "/Users/vikram/.gemini/antigravity-ide/brain/fe76bce5-4ba6-46bc-b94b-c24bbc037e8a/scratch/transfer-integrity-report.json",
    JSON.stringify(allResults, null, 2)
  );
  console.log("\nFull report written to scratch/transfer-integrity-report.json");
}

main().catch(err => {
  console.error("Error running validation:", err);
  process.exit(1);
});
