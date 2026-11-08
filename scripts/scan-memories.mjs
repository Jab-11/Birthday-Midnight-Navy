import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const INPUT_DIR = path.resolve("src/assets/memories");
const OUTPUT_DIR = path.resolve("scripts/output");

const EXPECTED_COUNT = 29;

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

const pad = (n) => String(n).padStart(2, "0");

async function scanImage(filename, index) {
  const fullPath = path.join(INPUT_DIR, filename);

  try {
    const metadata = await sharp(fullPath).metadata();
    const stats = await fs.stat(fullPath);

    const width = metadata.width;
    const height = metadata.height;

    const ratio = Number((width / height).toFixed(3));

    let orientation = "square";

    if (width > height * 1.05) orientation = "landscape";
    if (height > width * 1.05) orientation = "portrait";

    return {
      id: `photo-${pad(index + 1)}`,
      filename,
      src: filename,
      extension: path.extname(filename).toLowerCase(),
      width,
      height,
      ratio,
      orientation,
      fileSizeKB: Number((stats.size / 1024).toFixed(1)),
      suggestedFocus: "50% 50%",
      suggestedDimensions: {
        width: width,
        height: height,
      },
      metadata: {
        format: metadata.format,
        hasAlpha: metadata.hasAlpha ?? false,
        channels: metadata.channels,
      },
    };
  } catch (error) {
    return {
      filename,
      error: error.message,
    };
  }
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const files = await fs.readdir(INPUT_DIR);

  const images = files
    .filter((file) => IMAGE_EXTENSIONS.includes(path.extname(file).toLowerCase()))
    .sort((a, b) =>
      a.localeCompare(b, undefined, {
        numeric: true,
        sensitivity: "base",
      }),
    );

  const results = [];

  for (let i = 0; i < images.length; i++) {
    console.log(`Scanning ${i + 1}/${images.length}: ${images[i]}`);

    results.push(await scanImage(images[i], i));
  }

  const report = {
    generatedAt: new Date().toISOString(),
    directory: "src/assets/memories",
    totalImages: images.length,
    expectedImages: EXPECTED_COUNT,
    missingCount: EXPECTED_COUNT - images.length,
    images: results,
  };

  const outputPath = path.join(OUTPUT_DIR, "memories-report.json");

  await createContactSheet(results);

  await fs.writeFile(outputPath, JSON.stringify(report, null, 2), "utf8");

  console.log("\nScan complete!");
  console.log(`Images found: ${images.length}`);
  console.log(`Report: ${outputPath}`);
}

main().catch((error) => {
  console.error("Memory scan failed:", error);
  process.exitCode = 1;
});

async function createContactSheet(results) {
  const valid = results.filter((item) => !item.error);

  const cellWidth = 240;
  const imageHeight = 260;
  const labelHeight = 42;
  const columns = 4;
  const rows = Math.ceil(valid.length / columns);

  const composites = [];

  for (let i = 0; i < valid.length; i++) {
    const item = valid[i];
    const input = path.join(INPUT_DIR, item.filename);

    const thumbnail = await sharp(input)
      .rotate()
      .resize(cellWidth - 16, imageHeight - 16, {
        fit: "contain",
        background: "#101a30",
      })
      .png()
      .toBuffer();

    const label = Buffer.from(`
      <svg width="${cellWidth}" height="${labelHeight}">
        <rect width="100%" height="100%" fill="#101a30"/>
        <text x="12" y="27" fill="#f3e8cc"
          font-size="15" font-family="Arial">
          ${item.id}
        </text>
      </svg>
    `);

    const cell = await sharp({
      create: {
        width: cellWidth,
        height: imageHeight + labelHeight,
        channels: 4,
        background: "#101a30",
      },
    })
      .composite([
        {
          input: thumbnail,
          left: 8,
          top: 8,
        },
        {
          input: label,
          left: 0,
          top: imageHeight,
        },
      ])
      .png()
      .toBuffer();

    composites.push({
      input: cell,
      left: (i % columns) * cellWidth,
      top: Math.floor(i / columns) * (imageHeight + labelHeight),
    });
  }

  await sharp({
    create: {
      width: columns * cellWidth,
      height: rows * (imageHeight + labelHeight),
      channels: 4,
      background: "#101a30",
    },
  })
    .composite(composites)
    .jpeg({ quality: 85 })
    .toFile(path.join(OUTPUT_DIR, "memories-contact-sheet.jpg"));
}
