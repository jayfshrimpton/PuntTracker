# PWA Setup Guide

This guide explains the Progressive Web App (PWA) features that have been added to Punter's Journal.

## Features Implemented

✅ **Web App Manifest** - Allows users to install the app on their home screen/desktop
✅ **Service Worker** - Enables offline functionality and caching
✅ **Offline Data Access** - Historical bets and statistics are cached for offline viewing
✅ **App Icons** - Custom icons for installed app

## Installation

### For Users

Users can install the PWA in several ways:

1. **Mobile (iOS Safari)**:
   - Tap the Share button
   - Select "Add to Home Screen"

2. **Mobile (Android Chrome)**:
   - Tap the menu (three dots)
   - Select "Add to Home Screen" or "Install App"

3. **Desktop (Chrome/Edge)**:
   - Look for the install icon in the address bar
   - Click "Install" when prompted

4. **Desktop (Firefox)**:
   - Click the menu (three lines)
   - Select "Install"

## Offline Functionality

The service worker caches:

- **Static Assets**: HTML, CSS, JavaScript files
- **Dashboard Pages**: Main dashboard and bets pages (cached after first visit)
- **Same-Origin API Responses**: API routes like `/api/insights` are cached
- **Runtime Assets**: Images, fonts, and other static resources

### Important Note on Historical Data

**Supabase API requests are cross-origin** and cannot be directly intercepted by the service worker. To enable full offline access to historical bets data, you would need to:

1. Implement IndexedDB storage to cache bets data when fetched
2. Modify the data fetching logic to check IndexedDB first when offline
3. Sync data when connection is restored

The current implementation provides:
- ✅ Offline page navigation (cached pages work offline)
- ✅ Offline viewing of static content
- ✅ App installation capability
- ⚠️ Historical bets data requires an internet connection (unless you implement IndexedDB caching)

### Future Enhancement

For full offline data access, consider implementing:
- IndexedDB for bets data storage
- Background sync for offline bet submissions
- Data synchronization when connection is restored

When offline, users can:
- ✅ View cached pages and static content
- ✅ Navigate between previously visited pages
- ✅ Use the app interface (UI is cached)
- ❌ View historical bets data (requires IndexedDB implementation)
- ❌ Add new bets (requires internet connection)
- ❌ Sync new data (requires internet connection)

## Icon Setup

### Option 1: Use the Icon Generator (Recommended)

1. Open `public/icon-generator.html` in your browser
2. Click "Generate" buttons for both sizes
3. Right-click each canvas and save as:
   - `public/icon-192x192.png`
   - `public/icon-512x512.png`

### Option 2: Use Online Tool

1. Visit [RealFaviconGenerator](https://realfavicongenerator.net/)
2. Upload your app logo/icon
3. Generate and download the icons
4. Place `icon-192x192.png` and `icon-512x512.png` in the `public` folder

### Option 3: Use Node.js Script

1. Install sharp: `npm install --save-dev sharp`
2. Run: `node scripts/generate-icons.js`
3. Icons will be generated in the `public` folder

### Option 4: Convert SVG to PNG

An SVG icon is provided at `public/icon.svg`. You can convert it to PNG using:

1. **Online converter**: Upload `public/icon.svg` to [CloudConvert](https://cloudconvert.com/svg-to-png) or similar
2. **Image editor**: Open in GIMP, Photoshop, or similar and export as PNG
3. **Command line**: Use ImageMagick or similar tool

Create PNG images:
- `public/icon-192x192.png` (192x192 pixels)
- `public/icon-512x512.png` (512x512 pixels)

Recommended design:
- Square icon with rounded corners (handled by browser)
- Simple, recognizable design
- High contrast for visibility
- Represents horse racing/betting theme

**Note**: The app will work without icons, but they're required for a polished PWA experience.

## Service Worker Details

The service worker (`public/sw.js`) implements:

1. **Cache Strategy**:
   - Static assets: Cache first, network fallback
   - API data: Network first, cache fallback
   - Navigation: Network first, cache fallback

2. **Cache Names**:
   - `punters-journal-v1`: Static assets
   - `punters-journal-runtime-v1`: Runtime assets
   - `punters-journal-data-v1`: API responses

3. **Update Strategy**:
   - Service worker updates automatically
   - Old caches are cleaned up on activation
   - Users are prompted to reload when updates are available

## Testing

### Test Installation

1. Build the app: `npm run build`
2. Start the server: `npm start`
3. Open in browser and test install prompt
4. Verify app appears on home screen/desktop

### Test Offline Functionality

1. Open browser DevTools (F12)
2. Go to Application tab → Service Workers
3. Check "Offline" checkbox
4. Refresh the page
5. Verify cached content loads
6. Navigate to dashboard and verify bets data is visible

### Test Cache

1. Open DevTools → Application → Cache Storage
2. Verify caches are created:
   - `punters-journal-v1`
   - `punters-journal-runtime-v1`
   - `punters-journal-data-v1`
3. Check that bets data is cached in `punters-journal-data-v1`

## Troubleshooting

### Service Worker Not Registering

- Check browser console for errors
- Ensure HTTPS (or localhost for development)
- Verify `public/sw.js` exists and is accessible
- Check Next.js headers configuration

### Icons Not Showing

- Verify icon files exist in `public` folder
- Check file names match manifest.json exactly
- Ensure icons are PNG format
- Clear browser cache and reinstall

### Offline Data Not Loading

- Verify service worker is active (DevTools → Application)
- Check cache storage has data
- Ensure bets were loaded while online first
- Check network tab for failed requests

### App Not Installable

- Verify manifest.json is accessible
- Check all required manifest fields are present
- Ensure HTTPS (required for installable PWAs)
- Check browser support (Chrome, Edge, Safari iOS)

## Future Enhancements

Potential improvements:

- [ ] Background sync for offline bet submissions
- [ ] Push notifications for bet reminders
- [ ] Periodic background sync
- [ ] IndexedDB for better offline storage
- [ ] Offline-first architecture
- [ ] Custom install prompt UI

## Browser Support

- ✅ Chrome/Edge (Desktop & Android)
- ✅ Safari iOS (14.3+)
- ✅ Firefox (Desktop)
- ⚠️ Safari Desktop (limited PWA support)
- ⚠️ Samsung Internet

## Security Notes

- Service workers only work over HTTPS (or localhost)
- Cached data is stored locally on user's device
- No sensitive data should be cached without encryption
- API responses are cached but authentication is still required

## Files Created/Modified

- `public/manifest.json` - Web app manifest
- `public/sw.js` - Service worker
- `components/PWARegister.tsx` - Service worker registration
- `app/layout.tsx` - Updated with manifest and PWA component
- `next.config.js` - Updated with PWA headers
- `scripts/generate-icons.js` - Icon generation script
- `public/icon-generator.html` - Browser-based icon generator







