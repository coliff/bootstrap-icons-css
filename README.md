# Bootstrap Icons in CSS

[![npm version](https://img.shields.io/npm/v/bootstrap-icons-css.svg)](https://www.npmjs.com/package/bootstrap-icons-css)
[![npm downloads](https://img.shields.io/npm/dm/bootstrap-icons-css.svg)](https://www.npmjs.com/package/bootstrap-icons-css)
[![LICENSE: MIT](https://img.shields.io/badge/license-MIT-lightgrey.svg)](https://github.com/coliff/bootstrap-icons-css/blob/main/LICENSE)

A 100% pure CSS icon implementation of [Bootstrap Icons](https://icons.getbootstrap.com/) using CSS custom properties and SVG masks.

**Docs and icon gallery:** [https://coliff.github.io/bootstrap-icons-css/docs/](https://coliff.github.io/bootstrap-icons-css/docs/)

- No JavaScript, dependencies, SVGs or webfonts needed!
- 100% accessible, fast and easy-to-use
- Includes all 2078 icons
- Icons can be colored any color by setting `color` or `background-color`
- Icon size can be set with `width` and `height` (icons scale to fit with `mask-size: contain`)

By using CSS custom properties the icons can also be used as background-images instead of masks if needed.

## Advantages of using CSS variables

- **Theme-aware** — Use a single stylesheet and change icon color via `color` or CSS variables; no need for separate icon assets per theme.
- **One request** — All icons live in one CSS file instead of hundreds of SVGs or a webfont, reducing HTTP requests.
- **Override locally** — Set `--bi-*` or `background-color` on any element (or a parent) to style icons without extra classes.
- **Smaller payload** — Icons are defined once as data URIs in variables; repeated use doesn’t duplicate the SVG data in the DOM.
- **No JS** — No runtime, no icon components, no tree-shaking step; works with plain HTML/CSS and any framework.
- **Cascade-friendly** — Icons inherit `currentColor` and variables from the cascade, so they fit naturally into your design system.

## Usage

Include the stylesheet:

```html
<link rel="stylesheet" href="bootstrap-icons.min.css" />
```

Each icon is exposed as a CSS variable `--bi-<name>` whose value is a `url("data:image/svg+xml;utf8,...")` data URI.

### CSS classes (webfont-style)

Use the same class names as [Bootstrap Icons](https://icons.getbootstrap.com/): add the base class `bi` plus the icon class `bi-<name>`.

```html
<i class="bi bi-0-circle"></i>
<i class="bi bi-heart"></i>
<i class="bi bi-star-fill" style="color: #ffd700"></i>
<i class="bi bi-cpu" style="height: 2rem; width: 2rem"></i>
```

Icons inherit `color` and default to 1rem. Resize with `width` and `height`.

### As CSS variables (mask or background)

Use the variables anywhere—e.g. a repeating mask with custom color and size:

```css
.my-banner {
  background-color: hotpink;
  display: inline-block;
  height: 3rem;
  mask-image: var(--bi-heart);
  mask-repeat: repeat;
  mask-size: 32px 32px;
  width: 640px;
}
```

Or as a background image with `background-image: var(--bi-heart);`, `background-size: contain`, etc.

## Browser compatibility

`mask-image` is supported unprefixed in all modern browsers (Chrome 120, Safari 15.4, Firefox 53 — [caniuse](https://caniuse.com/?search=mask-image)). To widen support (e.g. older Safari), use [Autoprefixer](https://github.com/postcss/autoprefixer) to add `-webkit-mask-image` alongside `mask-image`. Because this uses CSS variables, the same variables are referenced from `:root` without increasing filesize. Neat!

## File size

The stylesheet is approx 1.3 MB (~230 KB gzipped) and includes all 2078 icons. **I recommend only including the CSS (or variables) for the icons you need to reduce file size and improve performance.**

## License

[MIT](LICENSE)
