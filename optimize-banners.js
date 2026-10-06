import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const files = [
  'banner 1.png', 'banner 2.png', 'banner 3.png',
  'mobile-banner 1.png', 'mobile-banner 2.png', 'mobile-banner 3.png',
  'tab-banner 1.png', 'tab-banner 2.png', 'tab-banner 3.png'
];

async function run() {
  console.log('Starting banner optimization...');
  for (const file of files) {
    const inputPath = path.join('public', file);
    const outputPath = path.join('public', file.replace('.png', '.webp'));
    if (fs.existsSync(inputPath)) {
      console.log(`Processing ${inputPath} -> ${outputPath}`);
      await sharp(inputPath)
        .webp({ quality: 80 })
        .toFile(outputPath);
      console.log(`Done: ${outputPath}`);
    } else {
      console.warn(`File not found: ${inputPath}`);
    }
  }
  console.log('All banners processed successfully!');
}

run().catch(console.error);
