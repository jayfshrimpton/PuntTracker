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

// Simple SVG icon for Punter's Journal (horse racing theme)
const iconSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- Background circle -->
  <circle cx="256" cy="256" r="256" fill="#0f172a"/>
  
  <!-- Horse silhouette -->
  <path d="M256 100 L280 140 L300 180 L320 220 L340 260 L360 300 L380 340 L400 380 L420 400 L400 420 L380 400 L360 380 L340 360 L320 340 L300 320 L280 300 L260 280 L240 300 L220 320 L200 340 L180 360 L160 380 L140 400 L120 420 L100 400 L120 380 L140 340 L160 300 L180 260 L200 220 L220 180 L240 140 Z" fill="#fbbf24" stroke="#f59e0b" stroke-width="4"/>
  
  <!-- Racing track lines -->
  <line x1="100" y1="400" x2="412" y2="400" stroke="#64748b" stroke-width="8" stroke-linecap="round"/>
  <line x1="120" y1="420" x2="392" y2="420" stroke="#64748b" stroke-width="4" stroke-linecap="round"/>
  
  <!-- Text -->
  <text x="256" y="480" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="#ffffff" text-anchor="middle">PJ</text>
</svg>`;

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
      console.log('2. Use the SVG above and convert it to PNG at sizes 192x192 and 512x512');
      console.log('3. Save them as public/icon-192x192.png and public/icon-512x512.png');
      return;
    }

    const publicDir = path.join(process.cwd(), 'public');
    
    // Ensure public directory exists
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // Convert SVG to PNG at different sizes
    const sizes = [192, 512];
    
    for (const size of sizes) {
      const buffer = Buffer.from(iconSVG);
      const outputPath = path.join(publicDir, `icon-${size}x${size}.png`);
      
      await sharp(buffer)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      
      console.log(`✓ Generated ${outputPath}`);
    }

    // Also create favicon
    const faviconPath = path.join(publicDir, 'favicon.ico');
    await sharp(Buffer.from(iconSVG))
      .resize(32, 32)
      .png()
      .toFile(faviconPath.replace('.ico', '.png'));
    
    console.log('✓ Icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    console.log('\nFallback: Please create icons manually:');
    console.log('1. Use an online tool like https://realfavicongenerator.net/');
    console.log('2. Or use the SVG provided in this script');
    console.log('3. Generate PNG files at 192x192 and 512x512');
    console.log('4. Save them as public/icon-192x192.png and public/icon-512x512.png');
  }
}

generateIcons();

