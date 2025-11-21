# Converting Simple RubriQ Logo to PNG

Since we're in a Node.js environment without native image rendering, here are the best methods to convert the SVG logos to PNG:

## Method 1: Online Converter (Fastest)
1. Open the SVG files:
   - `public/assets/logo-simple-rubriq.svg` (full lockup)
   - `public/assets/logo-simple-rubriq-icon.svg` (icon only)
2. Go to https://svgtopng.com/ or https://cloudconvert.com/svg-to-png
3. Upload the SVG file
4. Set desired size:
   - Icon: 512x512px (for favicon/app icons)
   - Full logo: 1200x320px (for headers/marketing)
5. Download the PNG

## Method 2: Using Inkscape (Command Line)
If you have Inkscape installed:
```powershell
# Icon (512x512)
inkscape public/assets/logo-simple-rubriq-icon.svg --export-type=png --export-filename=public/assets/logo-simple-rubriq-icon-512.png --export-width=512 --export-height=512

# Full logo (1200px wide)
inkscape public/assets/logo-simple-rubriq.svg --export-type=png --export-filename=public/assets/logo-simple-rubriq-1200.png --export-width=1200
```

## Method 3: Using VS Code SVG Extension
1. Install "svg" extension by jock.svg in VS Code
2. Right-click the SVG file
3. Select "SVG: Export PNG"
4. Choose size

## Method 4: Using ImageMagick
```powershell
# Icon
magick convert -background none -density 300 public/assets/logo-simple-rubriq-icon.svg -resize 512x512 public/assets/logo-simple-rubriq-icon-512.png

# Full logo
magick convert -background none -density 300 public/assets/logo-simple-rubriq.svg -resize 1200x public/assets/logo-simple-rubriq-1200.png
```

## Recommended PNG Sizes
- **Icon**: 16x16, 32x32, 64x64, 128x128, 256x256, 512x512 (for favicons/app icons)
- **Full Logo**: 400px, 800px, 1200px wide (for web use)
- **High-res**: 2400px wide (for print)

## Using the PNG in Your App
Once you have the PNG files, update references:

```tsx
// In Navbar.tsx or other components
<img src="/assets/logo-simple-rubriq-1200.png" alt="Simple RubriQ" className="h-8" />
```

For favicon, add to `index.html`:
```html
<link rel="icon" type="image/png" sizes="32x32" href="/assets/logo-simple-rubriq-icon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/assets/logo-simple-rubriq-icon-16.png">
```
