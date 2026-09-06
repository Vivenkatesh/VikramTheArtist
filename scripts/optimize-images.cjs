const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const configs = [
  // ── Heavy Scenery Assets ──
  {
    input: 'public/IMG/Landing_background.png',
    widths: [768, 1440, 1586],
    avifQ: 68,
    webpQ: 80,
    outDir: 'public/IMG',
    baseName: 'Landing_background'
  },
  {
    input: 'public/IMG/Cloud with earth.png',
    widths: [768, 1280, 1584],
    avifQ: 68,
    webpQ: 80,
    outDir: 'public/IMG',
    baseName: 'Cloud with earth'
  },
  {
    input: 'public/IMG/Footer Light.png',
    widths: [768, 1280, 1672],
    avifQ: 68,
    webpQ: 80,
    outDir: 'public/IMG',
    baseName: 'Footer Light'
  },
  {
    input: 'public/IMG/Astronaut_Skateboard_Light.png',
    widths: [360, 540, 720, 960],
    avifQ: 72,
    webpQ: 82,
    outDir: 'public/IMG',
    baseName: 'Astronaut_Skateboard_Light'
  },
  {
    input: 'public/IMG/Astronaut_Standing.png',
    widths: [480, 768, 1024],
    avifQ: 72,
    webpQ: 82,
    outDir: 'public/IMG',
    baseName: 'Astronaut_Standing'
  },

  // ── Work Project Cards ──
  {
    input: 'src/assets/img/Adopt_Thumb.png',
    widths: [480, 800, 1087],
    avifQ: 68,
    webpQ: 82,
    outDir: 'public/IMG',
    baseName: 'Adopt_Thumb'
  },
  {
    input: 'public/IMG/Data Security_Card.png',
    widths: [360, 540, 728],
    avifQ: 68,
    webpQ: 82,
    outDir: 'public/IMG',
    baseName: 'Data Security_Card'
  },
  {
    input: 'public/IMG/Communities.png',
    widths: [360, 540, 728],
    avifQ: 70,
    webpQ: 82,
    outDir: 'public/IMG',
    baseName: 'Communities'
  },
  {
    input: 'public/IMG/Helpdesk_Card.png',
    widths: [360, 540, 728],
    avifQ: 68,
    webpQ: 82,
    outDir: 'public/IMG',
    baseName: 'Helpdesk_Card'
  },
  {
    input: 'public/IMG/feedback_Card.png',
    widths: [360, 540, 728],
    avifQ: 68,
    webpQ: 82,
    outDir: 'public/IMG',
    baseName: 'feedback_Card'
  },
  {
    input: 'public/IMG/Notification_Card.png',
    widths: [360, 540, 728],
    avifQ: 68,
    webpQ: 82,
    outDir: 'public/IMG',
    baseName: 'Notification_Card'
  },

  // ── Scenery Clouds ──
  {
    input: 'public/IMG/Cloud_5.png',
    widths: [360, 540, 720],
    avifQ: 70,
    webpQ: 82,
    outDir: 'public/IMG',
    baseName: 'Cloud_5'
  },
  {
    input: 'public/IMG/Clouds_1.png',
    widths: [360, 480, 600],
    avifQ: 70,
    webpQ: 82,
    outDir: 'public/IMG',
    baseName: 'Clouds_1'
  },
  {
    input: 'public/IMG/Clouds_2.png',
    widths: [320, 440, 540],
    avifQ: 70,
    webpQ: 82,
    outDir: 'public/IMG',
    baseName: 'Clouds_2'
  },
  {
    input: 'public/IMG/Clouds_3.png',
    widths: [360, 500, 640],
    avifQ: 70,
    webpQ: 82,
    outDir: 'public/IMG',
    baseName: 'Clouds_3'
  },
  {
    input: 'public/IMG/Clouds_4.png',
    widths: [240, 320],
    avifQ: 70,
    webpQ: 82,
    outDir: 'public/IMG',
    baseName: 'Clouds_4'
  },

  // ── Dark Mode Planetary & Space Imagery ──
  {
    input: 'public/IMG/Space.png',
    widths: [768, 1440, 2560],
    avifQ: 65,
    webpQ: 80,
    outDir: 'public/IMG',
    baseName: 'Space'
  },
  {
    input: 'public/IMG/Earth_only_2x.png',
    widths: [768, 1200, 1536],
    avifQ: 70,
    webpQ: 82,
    outDir: 'public/IMG',
    baseName: 'Earth_only_2x'
  },
  {
    input: 'public/IMG/Sun_only_2x.png',
    widths: [480, 768, 891],
    avifQ: 70,
    webpQ: 82,
    outDir: 'public/IMG',
    baseName: 'Sun_only_2x'
  },
  {
    input: 'public/IMG/Planet 1.png',
    widths: [128, 256, 384],
    avifQ: 72,
    webpQ: 84,
    outDir: 'public/IMG',
    baseName: 'Planet 1'
  },
  {
    input: 'public/IMG/Astronaut.png',
    widths: [200, 368],
    avifQ: 72,
    webpQ: 84,
    outDir: 'public/IMG',
    baseName: 'Astronaut'
  },
  {
    input: 'public/IMG/Top customers.png',
    widths: [768, 1440, 2048, 4096],
    avifQ: 72,
    webpQ: 85,
    outDir: 'public/IMG',
    baseName: 'Top customers'
  }
];

async function processImage(cfg) {
  const inputPath = path.join(ROOT, cfg.input);
  if (!fs.existsSync(inputPath)) {
    console.warn('Input file not found:', inputPath);
    return;
  }

  const meta = await sharp(inputPath).metadata();
  console.log(`\nProcessing ${cfg.input} (${meta.width}x${meta.height}, ${meta.format})`);

  for (const w of cfg.widths) {
    if (w > meta.width) continue; // no upscaling

    const avifOut = path.join(ROOT, cfg.outDir, `${cfg.baseName}-${w}.avif`);
    const webpOut = path.join(ROOT, cfg.outDir, `${cfg.baseName}-${w}.webp`);

    await sharp(inputPath)
      .resize(w)
      .avif({ quality: cfg.avifQ, effort: 4 })
      .toFile(avifOut);

    await sharp(inputPath)
      .resize(w)
      .webp({ quality: cfg.webpQ, effort: 4 })
      .toFile(webpOut);

    const sAvif = (fs.statSync(avifOut).size / 1024).toFixed(1);
    const sWebp = (fs.statSync(webpOut).size / 1024).toFixed(1);
    console.log(`  -> ${w}px: AVIF ${sAvif} KB | WebP ${sWebp} KB`);
  }

  // Also write default/un-suffixed .avif and .webp at original/max width
  const maxW = Math.min(meta.width, cfg.widths[cfg.widths.length - 1]);
  const defaultAvif = path.join(ROOT, cfg.outDir, `${cfg.baseName}.avif`);
  const defaultWebp = path.join(ROOT, cfg.outDir, `${cfg.baseName}.webp`);

  await sharp(inputPath)
    .resize(maxW)
    .avif({ quality: cfg.avifQ, effort: 4 })
    .toFile(defaultAvif);

  await sharp(inputPath)
    .resize(maxW)
    .webp({ quality: cfg.webpQ, effort: 4 })
    .toFile(defaultWebp);

  console.log(`  -> Default (${maxW}px): AVIF ${(fs.statSync(defaultAvif).size / 1024).toFixed(1)} KB | WebP ${(fs.statSync(defaultWebp).size / 1024).toFixed(1)} KB`);
}

async function run() {
  for (const cfg of configs) {
    await processImage(cfg);
  }
  console.log('\nAll image optimizations completed successfully!');
}

run().catch(console.error);
