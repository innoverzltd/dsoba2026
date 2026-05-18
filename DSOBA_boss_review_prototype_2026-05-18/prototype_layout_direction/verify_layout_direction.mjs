import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const input = path.join(__dirname, "index.html");
const preview = path.join(__dirname, "preview.png");

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1 });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});

await page.goto(`file://${input}`);
await page.waitForLoadState("networkidle");

const result = await page.evaluate(() => {
  const images = [...document.images].map((image) => ({
    src: image.getAttribute("src"),
    width: image.naturalWidth,
    height: image.naturalHeight,
    complete: image.complete,
  }));
  const contentImages = images.filter((image) => image.src);
  return {
    imageCount: contentImages.length,
    broken: contentImages.filter((image) => !image.complete || image.width === 0),
    buttons: document.querySelectorAll("[data-lightbox]").length,
    directions: document.querySelectorAll(".direction").length,
  };
});

await page.locator("[data-lightbox]").first().click();
const opened = await page.locator("#lightbox.open").count();
await page.keyboard.press("Escape");
const closed = await page.locator("#lightbox.open").count() === 0;
await page.screenshot({ path: preview, fullPage: true });
await browser.close();

console.log(JSON.stringify({ ...result, opened, closed, errors, preview }, null, 2));
