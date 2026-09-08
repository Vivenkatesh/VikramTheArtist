const fs = require("fs");
const path = require("path");

const distDir = path.resolve(__dirname, "../dist");
const rootIndexHtmlPath = path.join(distDir, "index.html");

if (!fs.existsSync(rootIndexHtmlPath)) {
  console.error("dist/index.html not found. Run vite build first.");
  process.exit(1);
}

const rootHtml = fs.readFileSync(rootIndexHtmlPath, "utf-8");

const routes = [
  {
    path: "adopt-landing",
    title: "ADOPT Playbook — Designing Adoption, Not Features | Vikram Venkatesh",
    description: "A behavioral framework created by Vikram Venkatesh to help teams understand why AI adoption stalls and design a path toward sustained use.",
    canonical: "https://vikramtheartist.com/adopt-landing",
    robots: "index, follow, max-image-preview:large",
    ogTitle: "ADOPT Playbook — Designing Adoption, Not Features",
    ogDescription: "A behavioral framework created by Vikram Venkatesh to help teams understand why AI adoption stalls and design a path toward sustained use.",
    ogUrl: "https://vikramtheartist.com/adopt-landing",
  },
  {
    path: "scale-copilot",
    title: "Scaling Copilot Adoption — Product Design Leadership Case Study | Vikram Venkatesh",
    description: "How Vikram Venkatesh designed a behavioral adoption framework, diagnostic health model, and 0-to-1 intervention system to scale Microsoft Copilot usage.",
    canonical: "https://vikramtheartist.com/scale-copilot",
    robots: "index, follow, max-image-preview:large",
    ogTitle: "Scaling Copilot Adoption — Product Design Leadership Case Study",
    ogDescription: "How Vikram Venkatesh designed a behavioral adoption framework, diagnostic health model, and 0-to-1 intervention system to scale Microsoft Copilot usage.",
    ogUrl: "https://vikramtheartist.com/scale-copilot",
  },
  {
    path: "scale-copilot-engage",
    title: "Scale Copilot Adoption through Engage — Community Adoption Case Study | Vikram Venkatesh",
    description: "How Vikram Venkatesh designed a Viva Engage community adoption system associated with a sustained 24% increase in Copilot active days per week in matched-peer analysis.",
    canonical: "https://vikramtheartist.com/scale-copilot-engage",
    robots: "index, follow, max-image-preview:large",
    ogTitle: "Scale Copilot Adoption through Engage — Community Adoption Case Study",
    ogDescription: "A principal product design case study connecting community discovery, prompt-first practice, and recognition to sustained Copilot behavior.",
    ogUrl: "https://vikramtheartist.com/scale-copilot-engage",
  },
  {
    path: "work/scale-copilot-engage",
    title: "Scale Copilot Adoption through Engage — Community Adoption Case Study | Vikram Venkatesh",
    description: "How Vikram Venkatesh designed a Viva Engage community adoption system associated with a sustained 24% increase in Copilot active days per week in matched-peer analysis.",
    canonical: "https://vikramtheartist.com/scale-copilot-engage",
    robots: "noindex, follow",
    ogTitle: "Scale Copilot Adoption through Engage — Community Adoption Case Study",
    ogDescription: "A principal product design case study connecting community discovery, prompt-first practice, and recognition to sustained Copilot behavior.",
    ogUrl: "https://vikramtheartist.com/scale-copilot-engage",
  },
  {
    path: "playbook/scale-copilot",
    title: "Scaling Copilot Adoption — Product Design Leadership Case Study | Vikram Venkatesh",
    description: "How Vikram Venkatesh designed a behavioral adoption framework, diagnostic health model, and 0-to-1 intervention system to scale Microsoft Copilot usage.",
    canonical: "https://vikramtheartist.com/scale-copilot",
    robots: "noindex, follow",
    ogTitle: "Scaling Copilot Adoption — Product Design Leadership Case Study",
    ogDescription: "How Vikram Venkatesh designed a behavioral adoption framework, diagnostic health model, and 0-to-1 intervention system to scale Microsoft Copilot usage.",
    ogUrl: "https://vikramtheartist.com/scale-copilot",
  },
  {
    path: "playbook/adopt-v2",
    title: "Scaling Copilot Adoption Case Study | Vikram Venkatesh",
    description: "Deep dive case study on applying the ADOPT behavioral framework to drive active AI copilot usage across enterprise organizations.",
    canonical: "https://vikramtheartist.com/scale-copilot",
    robots: "noindex, follow",
    ogTitle: "Scaling Copilot Adoption Case Study | Vikram Venkatesh",
    ogDescription: "Deep dive case study on applying the ADOPT behavioral framework to drive active AI copilot usage across enterprise organizations.",
    ogUrl: "https://vikramtheartist.com/scale-copilot",
  },
  {
    path: "playbook/adopt",
    title: "Scaling Copilot Adoption (Archive) | Vikram Venkatesh",
    description: "Case study on scaling enterprise copilot adoption with the ADOPT framework.",
    canonical: "https://vikramtheartist.com/scale-copilot",
    robots: "noindex, follow",
    ogTitle: "Scaling Copilot Adoption | Vikram Venkatesh",
    ogDescription: "Case study on scaling enterprise copilot adoption with the ADOPT framework.",
    ogUrl: "https://vikramtheartist.com/scale-copilot",
  },
  {
    path: "work/feedback-360",
    title: "Feedback 360° — Product Design Leadership Case Study | Vikram Venkatesh",
    description: "How Vikram Venkatesh led discovery, product strategy, design execution and validation for a safer, more useful workplace feedback experience.",
    canonical: "https://vikramtheartist.com/work/feedback-360",
    robots: "index, follow, max-image-preview:large",
    ogTitle: "Feedback 360° — Product Design Leadership Case Study",
    ogDescription: "How Vikram Venkatesh led discovery, product strategy, design execution and validation for a safer, more useful workplace feedback experience.",
    ogUrl: "https://vikramtheartist.com/work/feedback-360",
  },
  {
    path: "feedback-360",
    title: "Feedback 360° — Product Design Leadership Case Study | Vikram Venkatesh",
    description: "How Vikram Venkatesh led discovery, product strategy, design execution and validation for a safer, more useful workplace feedback experience.",
    canonical: "https://vikramtheartist.com/work/feedback-360",
    robots: "noindex, follow",
    ogTitle: "Feedback 360° — Product Design Leadership Case Study",
    ogDescription: "How Vikram Venkatesh led discovery, product strategy, design execution and validation for a safer, more useful workplace feedback experience.",
    ogUrl: "https://vikramtheartist.com/work/feedback-360",
  },
  {
    path: "vibe-coding",
    title: "Vibe Coding Showcase — AI-Assisted Engineering & Prototypes | Vikram Venkatesh",
    description: "Curated collection of production-grade AI applications, collaborative audio rooms, and interactive physics engines built with autonomous agentic workflows.",
    canonical: "https://vikramtheartist.com/vibe-coding",
    robots: "index, follow, max-image-preview:large",
    ogTitle: "Vibe Coding Showcase — AI-Assisted Engineering & Prototypes",
    ogDescription: "Curated collection of production-grade AI applications, collaborative audio rooms, and interactive physics engines built with autonomous agentic workflows.",
    ogUrl: "https://vikramtheartist.com/vibe-coding",
  }
];

function injectMetadata(html, meta) {
  let res = html;

  // Title
  res = res.replace(/<title>[\s\S]*?<\/title>/, `<title>${meta.title}</title>`);

  // Description
  res = res.replace(/<meta\s+name="description"\s+content="[\s\S]*?"\s*\/?>/, `<meta name="description" content="${meta.description}" />`);

  // Canonical
  res = res.replace(/<link\s+rel="canonical"\s+href="[\s\S]*?"\s*\/?>/, `<link rel="canonical" href="${meta.canonical}" />`);

  // Robots
  res = res.replace(/<meta\s+name="robots"\s+content="[\s\S]*?"\s*\/?>/, `<meta name="robots" content="${meta.robots}" />`);

  // OG Tags
  res = res.replace(/<meta\s+property="og:title"\s+content="[\s\S]*?"\s*\/?>/, `<meta property="og:title" content="${meta.ogTitle}" />`);
  res = res.replace(/<meta\s+property="og:description"\s+content="[\s\S]*?"\s*\/?>/, `<meta property="og:description" content="${meta.ogDescription}" />`);
  res = res.replace(/<meta\s+property="og:url"\s+content="[\s\S]*?"\s*\/?>/, `<meta property="og:url" content="${meta.ogUrl}" />`);

  // Twitter Tags
  res = res.replace(/<meta\s+name="twitter:title"\s+content="[\s\S]*?"\s*\/?>/, `<meta name="twitter:title" content="${meta.ogTitle}" />`);
  res = res.replace(/<meta\s+name="twitter:description"\s+content="[\s\S]*?"\s*\/?>/, `<meta name="twitter:description" content="${meta.ogDescription}" />`);

  return res;
}

console.log("Generating static route entrypoints in dist/...");

for (const r of routes) {
  const targetDir = path.join(distDir, r.path);
  fs.mkdirSync(targetDir, { recursive: true });

  const customHtml = injectMetadata(rootHtml, r);
  const targetFile = path.join(targetDir, "index.html");
  fs.writeFileSync(targetFile, customHtml, "utf-8");

  console.log(`✓ Emitted ${path.relative(distDir, targetFile)} (${customHtml.length} bytes)`);
}

// Also emit 404.html as a general fallback for GitHub Pages
fs.writeFileSync(path.join(distDir, "404.html"), rootHtml, "utf-8");
console.log("✓ Emitted 404.html SPA fallback");

console.log("Static route generation complete.");
