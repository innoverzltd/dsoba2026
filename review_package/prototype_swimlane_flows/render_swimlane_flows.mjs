import { chromium } from "playwright";
import { mkdir, readdir } from "node:fs/promises";
import { dirname, resolve, basename } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const svgDir = resolve(__dirname, "svg");
const outputDir = resolve(__dirname, "exports");

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1800, height: 1800 }, deviceScaleFactor: 1 });
const files = (await readdir(svgDir)).filter((file) => file.endsWith(".svg")).sort();

for (const file of files) {
  const svgPath = resolve(svgDir, file);
  await page.goto(pathToFileURL(svgPath).href, { waitUntil: "networkidle" });
  const box = await page.locator("svg").boundingBox();
  const outputPath = resolve(outputDir, `${basename(file, ".svg")}.png`);
  await page.screenshot({
    path: outputPath,
    clip: {
      x: Math.floor(box.x),
      y: Math.floor(box.y),
      width: Math.ceil(box.width),
      height: Math.ceil(box.height),
    },
  });
}

await browser.close();
console.log(`Rendered ${files.length} swimlane PNG files to ${outputDir}`);
