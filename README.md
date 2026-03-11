# Bootstrap Icons in CSS

A 100% pure CSS icon implementation of [Bootstrap Icons](https://icons.getbootstrap.com/) using CSS custom properties and SVG masks

- No JavaScript, dependencies, SVGs or webfonts needed!
- 100% accessible, fast and easy-to-use
- Includes all 2078 icons
- Icons can be colored any color by setting a `background-color:`
- Icon can be sized any size by setting height and width of the div (the icon scales to fit using mask-size: contain;)

By using CSS custom properties the icons can also be used as background-images instead of masks if needed.

## Advantages of using CSS variables

- **Theme-aware** — Use a single stylesheet and change icon color via `color` or CSS variables; no need for separate icon assets per theme.
- **One request** — All icons live in one CSS file instead of hundreds of SVGs or a webfont, reducing HTTP requests.
- **Override locally** — Set `--bi-*` or `background-color` on any element (or a parent) to style icons without extra classes.
- **Smaller payload** — Icons are defined once as data URIs in variables; repeated use doesn’t duplicate the SVG data in the DOM.
- **No JS** — No runtime, no icon components, no tree-shaking step; works with plain HTML/CSS and any framework.
- **Cascade-friendly** — Icons inherit `currentColor` and variables from the cascade, so they fit naturally into your design system.

## Usage

```html
<link rel="stylesheet" href="bootstrap-icons.min.css" />
```

**CSS classes (webfont-style):**

Use the same class names as [Bootstrap Icons](https://icons.getbootstrap.com/): add the base class <code>bi</code> plus the icon class <code>bi-&lt;name&gt;</code>.

```html
<i class="bi bi-0-circle"></i>
<i class="bi bi-heart"></i>
<i class="bi bi-star-fill"></i>
```

Icons inherit color from text (<code>currentColor</code>) and default to 1rem. Resize with <code>width</code> and <code>height</code>.

**Or use CSS variables directly:**

```css
.my-icon {
  width: 32px;
  height: 32px;
  background-color: currentColor;
  mask-image: var(--bi-heart);
  mask-size: contain;
}
```

The stylesheet is approx 1.3 MB (229 KB gzipped) and includes all 2078 icons. **I highly recommend only using CSS for the icons you need to reduce the file size and improve performance.**

## License

[MIT](LICENSE)
