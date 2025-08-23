# Link Preview Setup Guide

This guide will help you complete the link preview setup for your poker calculator app.

## What's Already Done ✅

1. **Meta tags added** to `index.html` for:
   - Open Graph (Facebook, LinkedIn)
   - Twitter Cards
   - Basic SEO meta tags
   - Mobile app meta tags
   - Favicon references

2. **Web manifest** created (`public/site.webmanifest`)
3. **SVG favicon** created (`public/favicon.svg`)
4. **OG Image template** created (`public/og-image.html`)

## What You Need to Do 🔧

### 1. Generate the Open Graph Image

You need to create a `og-image.png` file (1200x630px) for social media previews.

**Option A: Using the HTML Template**
1. Open `public/og-image.html` in a browser
2. Take a screenshot or use browser dev tools to capture the image
3. Save as `public/og-image.png`

**Option B: Using Online Tools**
- Use [Canva](https://canva.com) to create a 1200x630px image
- Use [Figma](https://figma.com) to design the image
- Use [Pablo by Buffer](https://pablo.buffer.com) for quick social media images

**Option C: Using Command Line (if you have Node.js)**
```bash
# Install puppeteer
npm install -g puppeteer

# Create a script to generate the image
node -e "
const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({width: 1200, height: 630});
  await page.goto('file://' + __dirname + '/public/og-image.html');
  await page.screenshot({path: 'public/og-image.png'});
  await browser.close();
})();
"
```

### 2. Create Additional Icon Files

You need to create these icon files in the `public/` directory:

- `favicon-16x16.png` (16x16px)
- `favicon-32x32.png` (32x32px)
- `apple-touch-icon.png` (180x180px)
- `android-chrome-192x192.png` (192x192px)
- `android-chrome-512x512.png` (512x512px)

**Quick way to generate these:**
1. Use the SVG favicon as a base
2. Convert to different sizes using online tools like:
   - [Favicon.io](https://favicon.io)
   - [RealFaviconGenerator](https://realfavicongenerator.net)

### 3. Update URLs in index.html

Replace these placeholder URLs in `index.html`:

```html
<!-- Replace these with your actual domain -->
<meta property="og:url" content="https://your-domain.com/" />
<meta property="twitter:url" content="https://your-domain.com/" />
<meta property="og:image" content="https://your-domain.com/og-image.png" />
<meta property="twitter:image" content="https://your-domain.com/og-image.png" />
<meta property="twitter:creator" content="@yourtwitterhandle" />
```

### 4. Test Your Link Preview

**Facebook/LinkedIn:**
- Use [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- Use [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)

**Twitter:**
- Use [Twitter Card Validator](https://cards-dev.twitter.com/validator)

**General:**
- Use [OpenGraph.xyz](https://www.opengraph.xyz/) to test all platforms

## File Structure After Setup

```
public/
├── favicon.svg ✅
├── favicon-16x16.png (create this)
├── favicon-32x32.png (create this)
├── apple-touch-icon.png (create this)
├── android-chrome-192x192.png (create this)
├── android-chrome-512x512.png (create this)
├── og-image.png (create this)
├── og-image.html ✅
└── site.webmanifest ✅
```

## Benefits of This Setup

✅ **Social Media Sharing**: Your app will look great when shared on Facebook, Twitter, LinkedIn, WhatsApp, etc.

✅ **Search Engine Optimization**: Better SEO with proper meta tags

✅ **Mobile Experience**: Proper app icons and mobile meta tags

✅ **Professional Appearance**: Consistent branding across all platforms

✅ **PWA Ready**: Web manifest enables Progressive Web App features

## Troubleshooting

**Images not showing up?**
- Make sure all image files are in the `public/` directory
- Check that URLs in meta tags match your actual domain
- Clear social media cache using their debugging tools

**Favicon not showing?**
- Clear browser cache
- Make sure favicon files are in the correct location
- Check that file names match exactly

**Meta tags not working?**
- Verify the HTML is properly formatted
- Check for any syntax errors
- Use browser dev tools to inspect the meta tags
