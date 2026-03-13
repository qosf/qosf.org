# Favicon Setup Instructions

This file provides instructions for creating and placing the favicon files for the qosf.org website.

## Source Logo
The favicon should be created from the existing logo:
- **Source**: `qosf.org/assets/img/logos/qosf_colour_logo.svg`

## Required Favicon Files

### 1. favicon.ico (Primary)
- **Location**: `qosf.org/favicon.ico` (site root)
- **Format**: ICO file containing multiple sizes (at minimum 32x32 pixels)
- **Purpose**: Primary favicon for all browsers, especially legacy support

### 2. favicon-32x32.png
- **Location**: `qosf.org/assets/img/logos/favicon-32x32.png`
- **Format**: PNG, 32x32 pixels
- **Purpose**: Modern browser support with better quality

### 3. favicon-16x16.png (Optional but recommended)
- **Location**: `qosf.org/assets/img/logos/favicon-16x16.png`
- **Format**: PNG, 16x16 pixels
- **Purpose**: Small size variant for high-DPI displays

## How to Create Favicon Files

### Option 1: Online Favicon Generator
1. Visit an online favicon generator (e.g., https://favicon.io, https://realfavicongenerator.net)
2. Upload `qosf.org/assets/img/logos/qosf_colour_logo.svg`
3. Download the generated favicon files
4. Place them in the locations specified above

### Option 2: Image Editor (e.g., Photoshop, GIMP, ImageMagick)
1. Open `qosf.org/assets/img/logos/qosf_colour_logo.svg` in your image editor
2. Create a square version (crop to square if needed, maintaining aspect ratio)
3. Export as:
   - `favicon.ico` (32x32 minimum) → place at `qosf.org/favicon.ico`
   - `favicon-32x32.png` (32x32) → place at `qosf.org/assets/img/logos/favicon-32x32.png`
   - `favicon-16x16.png` (16x16) → place at `qosf.org/assets/img/logos/favicon-16x16.png`

### Option 3: Command Line (ImageMagick)
```bash
# Convert SVG to PNG (32x32)
convert qosf.org/assets/img/logos/qosf_colour_logo.svg -resize 32x32 qosf.org/assets/img/logos/favicon-32x32.png

# Convert SVG to PNG (16x16)
convert qosf.org/assets/img/logos/qosf_colour_logo.svg -resize 16x16 qosf.org/assets/img/logos/favicon-16x16.png

# Create ICO file (contains multiple sizes)
convert qosf.org/assets/img/logos/qosf_colour_logo.svg -resize 32x32 qosf.org/favicon.ico
```

## HTML Configuration
The favicon links have already been added to `doks-theme/_includes/site-head.html`. Once you place the files in the correct locations, the favicon will automatically appear on all pages.

## Testing
After placing the favicon files:
1. Run `bundle exec jekyll serve` to start the local server
2. Open the site in your browser
3. Check that the favicon appears in the browser tab
4. Verify the HTML source contains the favicon link tags

## Notes
- The logo SVG has a viewBox of "0 0 450 280" (rectangular), so you may need to crop or center it to create a square favicon
- Consider simplifying the logo for small sizes (16x16) - complex details may not be visible
- The existing `designs/favicon.psd` file may contain a design that can be exported as the favicon

