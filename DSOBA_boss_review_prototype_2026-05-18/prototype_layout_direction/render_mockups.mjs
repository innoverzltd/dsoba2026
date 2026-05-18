import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir } from "node:fs/promises";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const input = path.join(__dirname, "mockups.html");
const outputDir = path.join(__dirname, "responsive_exports");

const frames = [
  "modern-professional-desktop",
  "modern-professional-mobile",
  "editorial-heritage-desktop",
  "editorial-heritage-mobile",
  "community-vibrant-desktop",
  "community-vibrant-mobile",
  "clean-easy-desktop",
  "clean-easy-mobile",
];

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1500, height: 1080 }, deviceScaleFactor: 1 });
await page.goto(`file://${input}`);

for (const id of frames) {
  const locator = page.locator(`#${id}`);
  await locator.screenshot({
    path: path.join(outputDir, `${id}.png`),
  });
}

await browser.close();
console.log(`Exported ${frames.length} layout direction mockups to ${outputDir}`);
