/**
 * Script to generate PWA icons from SVG logo
 * Run: node scripts/generate-pwa-icons.js
 */

const fs = require('fs');
const path = require('path');

// Read the SVG logo
const logoPath = path.join(__dirname, '..', 'public', 'krishimitra-logo.svg');
const publicPath = path.join(__dirname, '..', 'public');

console.log('📱 Generating PWA icons...');

// For now, create placeholder data URLs since we need image processing libs
// In production, use sharp or jimp to convert SVG → PNG at different sizes

const placeholderIcon192 = `<svg width="192" height="192" xmlns="http://www.w3.org/2000/svg">
  <rect width="192" height="192" fill="#16a34a"/>
  <text x="96" y="96" font-size="80" text-anchor="middle" dominant-baseline="middle" fill="white">🌾</text>
</svg>`;

const placeholderIcon512 = `<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#16a34a"/>
  <text x="256" y="256" font-size="220" text-anchor="middle" dominant-baseline="middle" fill="white">🌾</text>
</svg>`;

// Save as SVG (browsers accept SVG in manifest)
fs.writeFileSync(path.join(publicPath, 'icon-192x192.svg'), placeholderIcon192);
fs.writeFileSync(path.join(publicPath, 'icon-512x512.svg'), placeholderIcon512);

console.log('✅ Created icon-192x192.svg');
console.log('✅ Created icon-512x512.svg');
console.log('✅ PWA icons generated!');
console.log('\n💡 For production, use sharp or jimp to convert SVG → PNG');
