const puppeteer = require("/Users/vikram/.npm/_npx/0f94ee7615faf582/node_modules/puppeteer-core");
const path = require("path");

async function checkCadence() {
  const browser = await puppeteer.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: false,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--window-size=1440,950",
      "--enable-gpu-rasterization",
      "--disable-backgrounding-occluded-windows",
      "--disable-renderer-backgrounding"
    ]
  });

  const page = (await browser.pages())[0] || await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  const controlUrl = "file://" + path.resolve(__dirname, "../scratch/cadence-check.html");
  await page.goto(controlUrl);
  await page.bringToFront();
  await new Promise(r => setTimeout(r, 500));

  const result = await page.evaluate(async () => {
    return await window.measureCadence(3000);
  });

  console.log("=== BROWSER FRAME CADENCE CONTROL RESULT ===");
  console.log(JSON.stringify(result, null, 2));

  await browser.close();
}

checkCadence().catch(console.error);
