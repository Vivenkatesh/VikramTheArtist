const https = require("https");
const fs = require("fs");

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve(data));
    }).on("error", reject);
  });
}

(async () => {
  const js = await fetchText("https://adoptiqai.vercel.app/assets/index-CzdHVUEC.js");
  const css = await fetchText("https://adoptiqai.vercel.app/assets/index-DnoASHCW.css");
  
  fs.writeFileSync("scratch/adoptiq_css.css", css);
  
  const searchTerms = ["telemetry", "drop-offs", "funnel", "input", "waveform", "wave", "gemini", "glow", "active"];
  for (const term of searchTerms) {
    const idx = js.indexOf(term);
    if (idx !== -1) {
      console.log(`=== FOUND TERM: "${term}" at index ${idx} ===`);
      console.log(js.substring(Math.max(0, idx - 250), Math.min(js.length, idx + 650)));
      break;
    }
  }
})();
