/**
 * Icon Generator Script for PWA
 * 
 * This script generates PWA icons from an SVG source.
 * Run: node scripts/generate-icons.js
 * 
 * Note: This requires sharp package. Install with: npm install --save-dev sharp
 */

const fs = require('fs');
const path = require('path');

async function generateIcons() {
  try {
    // Check if sharp is available
    let sharp;
    try {
      sharp = require('sharp');
    } catch (e) {
      console.error('Error: sharp package not found.');
      console.log('Please install sharp: npm install --save-dev sharp');
      console.log('\nAlternatively, you can:');
      console.log('1. Create icons manually using an online tool like https://realfavicongenerator.net/');
      console.log('2. Use the SVG file at public/icon.svg and convert it to PNG at sizes 192x192 and 512x512');
      console.log('3. Save them as public/icon-192x192.png and public/icon-512x512.png');
      return;
    }

    const publicDir = path.join(process.cwd(), 'public');
    const svgPath = path.join(publicDir, 'icon.svg');
    
    // Ensure public directory exists
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // Read SVG file
    if (!fs.existsSync(svgPath)) {
      console.error(`Error: SVG file not found at ${svgPath}`);
      console.log('Please ensure public/icon.svg exists');
      return;
    }

    const iconSVG = fs.readFileSync(svgPath, 'utf8');

    // Convert SVG to PNG at different sizes
    const sizes = [192, 512];
    
    for (const size of sizes) {
      const outputPath = path.join(publicDir, `icon-${size}x${size}.png`);
      
      await sharp(Buffer.from(iconSVG))
        .resize(size, size)
        .png()
        .toFile(outputPath);
      
      console.log(`✓ Generated ${outputPath}`);
    }

    // Also create favicon
    const faviconPath = path.join(publicDir, 'favicon.png');
    await sharp(Buffer.from(iconSVG))
      .resize(32, 32)
      .png()
      .toFile(faviconPath);
    
    console.log(`✓ Generated ${faviconPath}`);
    console.log('✓ Icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    console.log('\nFallback: Please create icons manually:');
    console.log('1. Use an online tool like https://realfavicongenerator.net/');
    console.log('2. Use the SVG file at public/icon.svg');
    console.log('3. Generate PNG files at 192x192 and 512x512');
    console.log('4. Save them as public/icon-192x192.png and public/icon-512x512.png');
  }
}

generateIcons();




