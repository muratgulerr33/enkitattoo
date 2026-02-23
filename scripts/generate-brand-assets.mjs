import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import pngToIco from "png-to-ico";
import sharp from "sharp";

const projectRoot = process.cwd();
const publicDir = path.join(projectRoot, "public");
const sourceIconPath = path.join(publicDir, "icon.png");
const brandBackground = "#0B0B0D";
const maskableScale = 0.78;

const generatedFiles = [];

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function createResizedPng(outputName, size) {
  const outputPath = path.join(publicDir, outputName);
  await sharp(sourceIconPath)
    .resize(size, size, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      withoutEnlargement: false,
    })
    .png()
    .toFile(outputPath);
  generatedFiles.push(outputPath);
}

async function createMaskablePng(outputName, size) {
  const outputPath = path.join(publicDir, outputName);
  const innerSize = Math.round(size * maskableScale);
  const centeredIcon = await sharp(sourceIconPath)
    .resize(innerSize, innerSize, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      withoutEnlargement: false,
    })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: brandBackground,
    },
  })
    .composite([{ input: centeredIcon, gravity: "center" }])
    .png()
    .toFile(outputPath);

  generatedFiles.push(outputPath);
}

async function createFaviconIco() {
  const temp48Path = path.join(os.tmpdir(), `enki-favicon-48-${Date.now()}.png`);
  const outputPath = path.join(publicDir, "favicon.ico");

  await sharp(sourceIconPath)
    .resize(48, 48, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      withoutEnlargement: false,
    })
    .png()
    .toFile(temp48Path);

  try {
    const icoBuffer = await pngToIco([
      path.join(publicDir, "favicon-16x16.png"),
      path.join(publicDir, "favicon-32x32.png"),
      temp48Path,
    ]);
    await fs.writeFile(outputPath, icoBuffer);
    generatedFiles.push(outputPath);
  } finally {
    await fs.unlink(temp48Path).catch(() => {});
  }
}

async function main() {
  if (!(await fileExists(sourceIconPath))) {
    throw new Error(`Missing source icon: ${sourceIconPath}`);
  }

  await createResizedPng("favicon-16x16.png", 16);
  await createResizedPng("favicon-32x32.png", 32);
  await createResizedPng("apple-touch-icon.png", 180);
  await createResizedPng("android-chrome-192x192.png", 192);
  await createResizedPng("android-chrome-512x512.png", 512);
  await createMaskablePng("android-chrome-maskable-192x192.png", 192);
  await createMaskablePng("android-chrome-maskable-512x512.png", 512);
  await createFaviconIco();

  console.log("Generated brand assets:");
  for (const filePath of generatedFiles) {
    console.log(`- ${path.relative(projectRoot, filePath)}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
