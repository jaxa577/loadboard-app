const sharp = require('sharp');
const fs = require('fs');

async function convert() {
  const svgBuffer = fs.readFileSync('assets/LB.svg');

  // Convert to icon (1024x1024)
  await sharp(svgBuffer)
    .resize(1024, 1024, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile('assets/LB-icon.png');

  // Convert to splash (2048x2048)
  await sharp(svgBuffer)
    .resize(2048, 2048, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile('assets/LB-splash.png');

  console.log('Successfully converted files');
}

convert().catch(err => {
  console.error(err);
  process.exit(1);
});
