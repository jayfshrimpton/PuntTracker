# Logo Setup Instructions

## Overview
The site now uses `/logo.png` as the main logo file. This logo appears:
- Next to "Punter's Journal" title in navigation (LandingNav and DashboardNav)
- As the favicon in browser tabs
- As PWA icons for mobile app installation

## Required Logo File

Place your logo file at: `public/logo.png`

## Recommended Logo Specifications

For best results, your logo should be:
- **Format**: PNG with transparency (or SVG if you prefer)
- **Size**: At least 512x512 pixels (square)
- **Aspect Ratio**: 1:1 (square) works best
- **Background**: Transparent or matches your brand colors

## Icon Sizes Needed

While the code references `/logo.png` for all sizes, browsers and PWA systems will automatically resize it. However, for optimal quality, you can create specific sizes:

1. **Favicon**: 32x32px (or 16x16px) - `favicon.png` (optional, will use logo.png if not present)
2. **PWA Icon Small**: 192x192px - Used for app icons on mobile devices
3. **PWA Icon Large**: 512x512px - Used for splash screens and high-res displays

## Quick Setup

1. **Save your logo** as `public/logo.png`
   - Make sure it's at least 512x512 pixels for best quality
   - Square aspect ratio recommended

2. **Optional: Create optimized icon sizes**
   - If you want to optimize file sizes, you can create:
     - `public/favicon.png` (32x32px) - Will override logo.png for favicon
     - `public/icon-192x192.png` (192x192px) - Will override logo.png for PWA small icon
     - `public/icon-512x512.png` (512x512px) - Will override logo.png for PWA large icon

3. **Test the logo**
   - Check the navigation bars (landing page and dashboard)
   - Check browser tab favicon
   - Test PWA installation on mobile device

## Current Implementation

The logo is used in:
- `components/LandingNav.tsx` - Landing page navigation (40x40px display)
- `components/DashboardNav.tsx` - Dashboard navigation (32x32px display on mobile, 32x32px on desktop)
- `app/layout.tsx` - Favicon and PWA icon metadata
- `public/manifest.json` - PWA manifest icons

## Notes

- The logo uses Next.js Image component for optimization
- Logo is set to `object-contain` to maintain aspect ratio
- Logo has hover effects (scale on hover in landing nav)
- Logo container has rounded corners and shadow effects

