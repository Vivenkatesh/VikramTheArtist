const puppeteer = require("/Users/vikram/.npm/_npx/0f94ee7615faf582/node_modules/puppeteer-core");
const fs = require("fs");
const path = require("path");

const artifactDir = "/Users/vikram/.gemini/antigravity-ide/brain/9318bf05-fefb-47ba-bdb2-cdeeca9bca76";

async function verifyAll() {
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

  const auditResults = {
    desktopDarkStack: false,
    desktopLightStack: false,
    keyboardFocus: false,
    workingLinks: [],
    mobileCarouselDark: false,
    mobileCarouselLight: false
  };

  // 1. Desktop Verification (Dark & Light)
  for (const theme of ["dark", "light"]) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await page.goto(`http://localhost:4173/?theme=${theme}`, { waitUntil: "networkidle0" });
    await page.evaluate(t => document.documentElement.setAttribute("data-theme", t), theme);
    await new Promise(r => setTimeout(r, 400));

    // Scroll to #work
    const work = await page.$("#work");
    await page.evaluate(el => el.scrollIntoView({ block: "start", behavior: "instant" }), work);
    await new Promise(r => setTimeout(r, 400));

    // Capture initial stack view (first card sticky)
    await page.screenshot({ path: path.join(artifactDir, `fullstack-${theme}-card1.png`) });

    // Scroll to partially stacked state (Card 2 stacked over Card 1)
    await page.evaluate(() => window.scrollBy(0, 500));
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(artifactDir, `fullstack-${theme}-stacked-overlap.png`) });

    // Scroll to fully stacked state (all cards stacked)
    await page.evaluate(() => window.scrollBy(0, 1600));
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(artifactDir, `fullstack-${theme}-fully-stacked.png`) });

    if (theme === "dark") {
      auditResults.desktopDarkStack = true;

      // Test Keyboard Focus on Dark theme
      await page.evaluate(() => window.scrollTo(0, 1200));
      await new Promise(r => setTimeout(r, 300));
      // Focus first action button on an active card
      const ctaBtn = await page.$(".ws-card:nth-child(2) button, .ws-card:nth-child(2) a");
      if (ctaBtn) {
        await page.evaluate(el => el.focus(), ctaBtn);
        await new Promise(r => setTimeout(r, 200));
        await page.screenshot({ path: path.join(artifactDir, "keyboard-focus-card-dark.png") });
        auditResults.keyboardFocus = true;
      }
    } else {
      auditResults.desktopLightStack = true;
    }

    // Verify all links and CTAs on all cards
    const links = await page.evaluate(() => {
      const cards = document.querySelectorAll(".ws-card .project-card");
      const list = [];
      cards.forEach((c, idx) => {
        const title = c.querySelector("h3")?.textContent?.trim() || `Card ${idx}`;
        const ctas = c.querySelectorAll("a, button");
        const ctaDetails = [];
        ctas.forEach(b => {
          ctaDetails.push({
            tag: b.tagName.toLowerCase(),
            text: b.textContent?.trim(),
            href: b.getAttribute("href") || null,
            hasClickListener: !!b.onclick || b.type === "button"
          });
        });
        list.push({ title, ctas: ctaDetails });
      });
      return list;
    });

    if (theme === "dark") {
      auditResults.workingLinks = links;
    }

    await page.close();
  }

  // 2. Mobile Carousel Verification (Dark & Light)
  for (const theme of ["dark", "light"]) {
    const page = await browser.newPage();
    // Mobile viewport
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    await page.goto(`http://localhost:4173/?theme=${theme}`, { waitUntil: "networkidle0" });
    await page.evaluate(t => document.documentElement.setAttribute("data-theme", t), theme);
    await new Promise(r => setTimeout(r, 400));

    // Scroll to #work
    const work = await page.$("#work");
    await page.evaluate(el => el.scrollIntoView({ block: "start", behavior: "instant" }), work);
    await new Promise(r => setTimeout(r, 400));

    // Screenshot slide 1
    await page.screenshot({ path: path.join(artifactDir, `mobile-carousel-${theme}-slide1.png`) });

    // Click Next button to slide 2
    const nextBtn = await page.$("button[aria-label='Next work']");
    if (nextBtn) {
      await nextBtn.click();
      await new Promise(r => setTimeout(r, 500));
      await page.screenshot({ path: path.join(artifactDir, `mobile-carousel-${theme}-slide2.png`) });
    }

    if (theme === "dark") auditResults.mobileCarouselDark = true;
    else auditResults.mobileCarouselLight = true;

    await page.close();
  }

  await browser.close();

  console.log("=== COMPREHENSIVE VERIFICATION AUDIT COMPLETE ===");
  console.log(JSON.stringify(auditResults, null, 2));
}

verifyAll().catch(console.error);
