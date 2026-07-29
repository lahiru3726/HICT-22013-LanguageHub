# Language Section Component

A responsive, animated language selection component with smooth transitions for the Lan hub platform.

## Files Included

1. **language-section.html** - HTML structure
2. **language-section.css** - Styling and animations
3. **language-section.js** - Functionality and language switching logic
4. **README.md** - This file

## Features

✅ Smooth fade-in/fade-out transitions between languages  
✅ Color-coded themes for each language (IELTS, Japanese, Korean, Italy)  
✅ Responsive design (desktop, tablet, mobile)  
✅ Dropdown language selector  
✅ Keyboard shortcuts (Alt+1, Alt+2, Alt+3, Alt+4)  
✅ Easy to customize colors and transitions  

## Quick Start

1. Create a project folder
2. Copy all three files (HTML, CSS, JS)
3. Replace SVG placeholders with your actual SVG files
4. Open `language-section.html` in your browser

## How to Add Your SVG Files

In the HTML file, locate the SVG sections and replace the placeholder rectangles with your actual SVG content:

```html
<!-- For IELTS (replace everything inside <svg>...</svg>) -->
<svg class="illustration-svg" viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg">
    <!-- Replace with your IELTS SVG content -->
    <rect width="400" height="500" fill="#FFF5F0"/>
</svg>
```

You have two options:

### Option A: Inline SVG (Recommended)
Copy the SVG code directly from your files:

```html
<svg class="illustration-svg" viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg">
    <!-- Your actual SVG paths and elements -->
    <g>...</g>
    <!-- ... more SVG content ... -->
</svg>
```

### Option B: External SVG
Use the `<image>` tag inside SVG:

```html
<svg class="illustration-svg" viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg">
    <image href="path/to/your/ielts.svg" width="400" height="500"/>
</svg>
```

### Option C: Direct Image Tag
Replace the entire SVG tag with an image tag:

```html
<div class="language-illustration">
    <img src="path/to/your/ielts.svg" alt="IELTS" class="illustration-svg">
</div>
```

## Color Customization

Edit the CSS variables in `language-section.css` to change theme colors:

```css
:root {
    /* IELTS Theme Colors */
    --color-ielts-primary: #E0357E;      /* Change title color */
    --color-ielts-accent: #FFF5F0;       /* Change background color */
    --color-ielts-text: #666666;         /* Change text color */

    /* Japanese Theme Colors */
    --color-japanese-primary: #DC143C;
    --color-japanese-accent: #FFE8E8;
    --color-japanese-text: #666666;

    /* Korean Theme Colors */
    --color-korean-primary: #2D7A5C;
    --color-korean-accent: #E8F5F0;
    --color-korean-text: #8B6F47;

    /* Italy Theme Colors */
    --color-italy-primary: #2BA898;
    --color-italy-accent: #E0F4FF;
    --color-italy-text: #4A7A8C;
}
```

## Transition Speed Customization

Modify the transition duration in the CSS:

```css
:root {
    --transition-duration: 0.6s;        /* Change this value */
    --transition-timing: cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Common Transition Timings:

- `ease-in-out` - Smooth, slow start and end
- `ease-in` - Slow start, fast end
- `ease-out` - Fast start, slow end
- `ease` - Default ease
- `linear` - Constant speed
- `cubic-bezier(0.4, 0, 0.2, 1)` - Material Design standard

## Usage Examples

### Programmatic Language Switching

```javascript
// Switch to a specific language
window.setLanguage('japanese');

// Get current language
const currentLanguage = window.getCurrentLanguage();
console.log(currentLanguage); // Output: 'japanese'
```

### Custom Keyboard Shortcuts

The component includes default keyboard shortcuts:

- **Alt + 1** → Switch to IELTS
- **Alt + 2** → Switch to Japanese
- **Alt + 3** → Switch to Korean
- **Alt + 4** → Switch to Italy
- **Esc** → Close dropdown

### Listen to Language Changes

```javascript
document.addEventListener('languageChange', function(e) {
    if (e.language) {
        console.log(`Language changed to: ${e.language}`);
        // Your custom logic here
    }
});
```

## Component Structure

```
Language Section Container
├── Header (Navigation & Dropdown)
│   └── Language Dropdown Menu
├── Language Section (Absolute positioned, overlapping)
│   ├── Illustration Side (35% width)
│   │   └── SVG Illustration
│   └── Content Side (65% width)
│       ├── Language Title
│       ├── Description Paragraphs
│       └── CTA Button
```

## Responsive Breakpoints

- **Desktop** (1024px+): Side-by-side layout
- **Tablet** (768px - 1023px): Stacked layout with adjusted spacing
- **Mobile** (480px - 767px): Full-width with reduced padding
- **Extra Small** (< 480px): Minimal padding, optimized for small screens

## Browser Support

- Chrome/Edge (Latest)
- Firefox (Latest)
- Safari (Latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Accessibility Features

- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- High contrast color ratios
- Focus states on interactive elements

## Performance Tips

1. **Optimize SVG files**: Use tools like SVGO to reduce file size
2. **Lazy loading**: Uncomment the lazy loading code in `language-section.js`
3. **Image optimization**: Compress SVG files before using
4. **Hardware acceleration**: CSS transitions use GPU acceleration automatically

## Customization Examples

### Change Button Color

In CSS:
```css
.cta-button {
    background: #Your-Color-Here;
}
```

### Change Font Family

```css
body {
    font-family: 'Your-Font-Family', sans-serif;
}
```

### Adjust Spacing

```css
.language-content {
    padding: 60px 60px;  /* Change these values */
}
```

### Add Custom Animation

```css
@keyframes customAnimation {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
}

.language-section[data-active="true"] {
    animation: customAnimation 0.6s ease-out;
}
```

## Troubleshooting

### SVG not showing?
- Check the viewBox dimensions match your SVG
- Ensure SVG paths use correct coordinates
- Verify SVG file is in the correct location (for external SVGs)

### Transitions not smooth?
- Check `--transition-duration` value (increase for slower transitions)
- Verify CSS is linked correctly in HTML
- Check browser developer tools for CSS errors

### Colors not changing?
- Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
- Verify color hex codes are valid
- Check for CSS specificity issues

### Dropdown not working?
- Ensure JavaScript file is linked and loaded
- Check browser console for errors (F12)
- Verify data-language attributes match in HTML and JS

## Advanced Features

### Lazy Load SVGs
Uncomment the Intersection Observer code in `language-section.js` to load SVGs only when visible.

### Custom Events
Trigger language changes from other parts of your application:

```javascript
const languageChangeEvent = new Event('languageChange');
languageChangeEvent.language = 'korean';
document.dispatchEvent(languageChangeEvent);
```

## File Size

- HTML: ~8 KB
- CSS: ~15 KB
- JS: ~5 KB
- **Total: ~28 KB** (excluding SVG assets)

## License

This component is part of the Lan hub project.

## Support

For issues or questions, refer to the inline comments in each file or check the configuration options in the CSS variables section.

---

**Last Updated:** July 2026  
**Version:** 1.0
