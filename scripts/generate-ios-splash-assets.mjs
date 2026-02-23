import { promises as fs } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const projectRoot = process.cwd();
const publicDir = path.join(projectRoot, "public");
const sourceIconPath = path.join(publicDir, "icon.png");
const splashDir = path.join(publicDir, "pwa");
const background = "#0B0B0D";

const splashSizes = [
  [640, 1136],
  [750, 1334],
  [828, 1792],
  [1125, 2436],
  [1170, 2532],
  [1179, 2556],
  [1242, 2208],
  [1242, 2688],
  [1284, 2778],
  [1290, 2796],
  [1536, 2048],
  [1620, 2160],
  [1640, 2360],
  [1668, 2224],
  [1668, 2388],
  [2048, 2732],
  [1136, 640],
  [1334, 750],
  [1792, 828],
  [2436, 1125],
  [2532, 1170],
  [2556, 1179],
  [2208, 1242],
  [2688, 1242],
  [2778, 1284],
  [2796, 1290],
  [2048, 1536],
  [2160, 1620],
  [2360, 1640],
  [2224, 1668],
  [2388, 1668],
  [2732, 2048],
];

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function cleanLegacyJpgFiles() {
  const files = await fs.readdir(splashDir).catch(() => []);
  const oldJpgs = files.filter((name) => name.startsWith("apple-splash-") && name.endsWith(".jpg"));
  await Promise.all(oldJpgs.map((fileName) => fs.unlink(path.join(splashDir, fileName))));
}

async function generateSplash(width, height) {
  const iconSize = Math.round(Math.min(width, height) * 0.32);
  const iconBuffer = await sharp(sourceIconPath)
    .resize(iconSize, iconSize, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      withoutEnlargement: false,
    })
    .png()
    .toBuffer();

  const outPath = path.join(splashDir, `apple-splash-${width}-${height}.png`);
  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background,
    },
  })
    .composite([{ input: iconBuffer, gravity: "center" }])
    .png()
    .toFile(outPath);

  return outPath;
}

async function main() {
  if (!(await fileExists(sourceIconPath))) {
    throw new Error(`Missing source icon: ${sourceIconPath}`);
  }

  await ensureDir(splashDir);
  await cleanLegacyJpgFiles();

  const generated = [];
  for (const [width, height] of splashSizes) {
    const filePath = await generateSplash(width, height);
    generated.push(path.relative(projectRoot, filePath));
  }

  console.log("Generated iOS splash assets:");
  for (const file of generated) {
    console.log(`- ${file}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
