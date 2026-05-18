import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir } from "node:fs/promises";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const input = path.join(__dirname, "full_homepages.html");
const outputDir = path.join(__dirname, "full_homepage_exports");

const pages = [
  ["home-modern-professional", "modern-professional-homepage.png"],
  ["home-editorial-heritage", "editorial-heritage-homepage.png"],
  ["home-community-vibrant", "community-vibrant-homepage.png"],
  ["home-clean-easy", "clean-easy-homepage.png"],
];

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1600, height: 4600 },
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

for (const [id, filename] of pages) {
  const locator = page.locator(`#${id}`);
  await locator.screenshot({
    path: path.join(outputDir, filename),
  });
}

await browser.close();
console.log(`Exported ${pages.length} full homepage designs to ${outputDir}`);
