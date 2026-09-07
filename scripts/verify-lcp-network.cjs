const puppeteer = require("/Users/vikram/.npm/_npx/0f94ee7615faf582/node_modules/puppeteer-core");

async function checkHeroLcpAndNetwork(theme, isMobile = false) {
  const browser = await puppeteer.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();
  if (isMobile) {
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true });
  } else {
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  }

  const networkRequests = [];
  const client = await page.target().createCDPSession();
  await client.send("Network.enable");
  client.on("Network.requestWillBeSent", (e) => {
    if (e.request.url.includes("IMG/") || e.request.url.includes("assets/")) {
      networkRequests.push({
        url: e.request.url.split("/").pop(),
        priority: e.request.priority,
        wallTime: e.wallTime,
        timestamp: e.timestamp
      });
    }
  });

  const url = `http://localhost:4173/?theme=${theme}`;
  await page.goto(url, { waitUntil: "networkidle0" });

  const metrics = await page.evaluate(async () => {
    return new Promise((resolve) => {
      let lcpEntry = null;
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        if (entries.length > 0) {
          lcpEntry = entries[entries.length - 1];
        }
      });
      observer.observe({ type: "largest-contentful-paint", buffered: true });

      setTimeout(() => {
        observer.disconnect();
        const fcp = performance.getEntriesByName("first-contentful-paint")[0];
        resolve({
          fcpMs: fcp ? Math.round(fcp.startTime) : null,
          lcpMs: lcpEntry ? Math.round(lcpEntry.startTime) : null,
          lcpElement: lcpEntry?.element ? lcpEntry.element.tagName + (lcpEntry.element.className ? `.${lcpEntry.element.className.slice(0, 30)}` : "") : null,
          lcpUrl: lcpEntry?.url ? lcpEntry.url.split("/").pop() : null,
          lcpSize: lcpEntry ? lcpEntry.size : null
        });
      }, 500);
    });
  });

  await browser.close();
  return {
    theme,
    device: isMobile ? "mobile" : "desktop",
    ...metrics,
    requests: networkRequests.slice(0, 8)
  };
}

async function main() {
  console.log("=== VERIFYING HERO LCP & NETWORK PRIORITIZATION ===");
  const dtDark = await checkHeroLcpAndNetwork("dark", false);
  console.log("\nDesktop Dark:", dtDark);

  const dtLight = await checkHeroLcpAndNetwork("light", false);
  console.log("\nDesktop Light:", dtLight);

  const mbDark = await checkHeroLcpAndNetwork("dark", true);
  console.log("\nMobile Dark:", mbDark);

  const mbLight = await checkHeroLcpAndNetwork("light", true);
  console.log("\nMobile Light:", mbLight);
}

main().catch(console.error);
