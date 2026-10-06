import sharp from 'sharp';
import path from 'path';

async function check() {
  const images = [
    'public/banner 1.png',
    'public/tab-banner 1.png',
    'public/mobile-banner 1.png'
  ];

  for (const img of images) {
    try {
      const metadata = await sharp(img).metadata();
      console.log(`${img}: ${metadata.width} x ${metadata.height} (Aspect: ${(metadata.width / metadata.height).toFixed(3)})`);
    } catch (err) {
      console.error(`Error reading ${img}:`, err.message);
    }
  }
}
check();
