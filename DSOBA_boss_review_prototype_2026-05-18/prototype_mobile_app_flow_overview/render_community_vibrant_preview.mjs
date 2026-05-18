import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir } from "node:fs/promises";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const input = path.join(__dirname, "community_vibrant_preview.html");
const outputDir = path.join(__dirname, "exports");
const output = path.join(outputDir, "community-vibrant-mobile-layout-preview.png");

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1900, height: 1420 },
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

await page.locator(".frame").screenshot({ path: output });
await browser.close();

console.log(`Exported Community Vibrant preview to ${output}`);
