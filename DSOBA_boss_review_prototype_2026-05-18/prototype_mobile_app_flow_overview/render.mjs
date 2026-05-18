import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir } from "node:fs/promises";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const input = path.join(__dirname, "index.html");
const outputDir = path.join(__dirname, "exports");
const output = path.join(outputDir, "mobile-app-pages-flow-overview.png");

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 2300, height: 5200 },
  deviceScaleFactor: 2,
});

await page.goto(`file://${input}`, { waitUntil: "load" });
await page.evaluate(async () => {
  const images = Array.from(document.images);
  await Promise.all(images.map((img) => {
    if (img.complete) return Promise.resolve();
    return new Promise((resolve, reject) => {
      img.addEventListener("load", resolve, { once: true });
      img.addEventListener("error", reject, { once: true });
    });
  }));
});

await page.locator("body").screenshot({ path: output });
await browser.close();

console.log(`Exported mobile app page and flow overview to ${output}`);
