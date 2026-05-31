import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const RAW_DIR = './src/assets/raw-images';
const OUT_DIR = './src/assets/images';

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function applyWatermark(file) {
  const inputPath = path.join(RAW_DIR, file);
  const outputPath = path.join(OUT_DIR, file);
  
  const ext = path.extname(file).toLowerCase();
  if (!['.jpg', '.jpeg', '.png', '.webp', '.avif'].includes(ext)) {
    // Non-image files, just copy them
    fs.copyFileSync(inputPath, outputPath);
    return;
  }
  
  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    const width = metadata.width;
    const height = metadata.height;
    
    // Watermark dimensions: ~22% of image width (minimum 120px)
    const watermarkWidth = Math.max(120, Math.round(width * 0.22));
    const watermarkHeight = Math.round(watermarkWidth * 0.16);
    
    // Dynamic font size
    const fontSize = Math.round(watermarkHeight * 0.45);
    
    // Draw SVG watermark with slight drop shadow and white text
    const svg = `
      <svg width="${watermarkWidth}" height="${watermarkHeight}" viewBox="0 0 ${watermarkWidth} ${watermarkHeight}" xmlns="http://www.w3.org/2000/svg">
        <style>
          .wm-text {
            font-family: 'Outfit', 'Inter', system-ui, sans-serif;
            font-weight: 700;
            fill: #ffffff;
            opacity: 0.40;
            letter-spacing: 1px;
          }
          .wm-shadow {
            font-family: 'Outfit', 'Inter', system-ui, sans-serif;
            font-weight: 700;
            fill: #000000;
            opacity: 0.20;
            letter-spacing: 1px;
          }
        </style>
        <!-- Text shadow for readability on light backgrounds -->
        <text x="51%" y="52%" font-size="${fontSize}" class="wm-shadow" text-anchor="middle" dominant-baseline="middle">
          © nangoku workspace
        </text>
        <!-- Main white text -->
        <text x="50%" y="50%" font-size="${fontSize}" class="wm-text" text-anchor="middle" dominant-baseline="middle">
          © nangoku workspace
        </text>
      </svg>
    `;
    
    // Margin of 3% from the borders
    const marginX = Math.round(width * 0.03);
    const marginY = Math.round(height * 0.03);
    
    const left = width - watermarkWidth - marginX;
    const top = height - watermarkHeight - marginY;
    
    await image
      .composite([{
        input: Buffer.from(svg),
        top: top,
        left: left,
      }])
      .toFile(outputPath);
      
    console.log(`✓ Watermarked: ${file}`);
  } catch (err) {
    console.error(`✗ Error processing ${file}:`, err);
  }
}

async function main() {
  console.log('--- Generating Watermarks ---');
  if (!fs.existsSync(RAW_DIR)) {
    console.error(`Source directory ${RAW_DIR} does not exist.`);
    return;
  }
  
  const files = fs.readdirSync(RAW_DIR);
  for (const file of files) {
    const fullPath = path.join(RAW_DIR, file);
    if (fs.statSync(fullPath).isFile()) {
      await applyWatermark(file);
    }
  }
  console.log('-----------------------------');
}

main();
