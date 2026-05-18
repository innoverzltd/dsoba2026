import { chromium } from "playwright";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inputPath = path.join(__dirname, "assets", "dsoba-shield-logo.jpeg");
const outputPath = path.join(__dirname, "assets", "dsoba-shield-logo-transparent.png");

const source = await readFile(inputPath);
const dataUrl = `data:image/jpeg;base64,${source.toString("base64")}`;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

const pngBase64 = await page.evaluate(async (src) => {
  const image = new Image();
  image.src = src;
  await image.decode();

  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(image, 0, 0);

  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const visited = new Uint8Array(width * height);
  const queue = [];

  const isBackground = (index) => {
    const i = index * 4;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    return min > 208 && max - min < 34;
  };

  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const index = y * width + x;
    if (visited[index] || !isBackground(index)) return;
    visited[index] = 1;
    queue.push(index);
  };

  for (let x = 0; x < width; x += 1) {
    push(x, 0);
    push(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    push(0, y);
    push(width - 1, y);
  }

  for (let head = 0; head < queue.length; head += 1) {
    const index = queue[head];
    const x = index % width;
    const y = Math.floor(index / width);
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }

  for (let index = 0; index < visited.length; index += 1) {
    if (!visited[index]) continue;
    data[index * 4 + 3] = 0;
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL("image/png").split(",")[1];
}, dataUrl);

await browser.close();
await writeFile(outputPath, Buffer.from(pngBase64, "base64"));
console.log(outputPath);
