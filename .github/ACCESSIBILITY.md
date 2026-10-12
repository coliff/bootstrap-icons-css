# Accessibility

We want Bootstrap Icons CSS and its [documentation site](https://coliff.github.io/bootstrap-icons-css/docs/) to be usable by everyone, and we aim to conform to [WCAG 2.2](https://www.w3.org/TR/WCAG22/) Level AA.

## Using the icons accessibly

The icons are rendered with CSS `mask-image`, so they carry no text alternative of their own. When you use them:

- Add `aria-hidden="true"` to decorative icons, for example an icon next to a visible text label.
- Give icon-only controls an accessible name, such as `aria-label` on the `<button>` or `<a>`, or visually hidden text.
- Icons inherit `currentColor`, so make sure the text color meets [contrast requirements](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) against its background, including in Windows High Contrast / forced colors mode.

## Testing

The documentation site is checked with [HTMLHint](https://htmlhint.com/) on every pull request (`npm run lint-html`) and can be audited with [Pa11y](https://pa11y.org/) (`npm run pa11y`).

## Reporting an issue

If you find an accessibility barrier in the CSS or the documentation site, please [open an issue](https://github.com/coliff/bootstrap-icons-css/issues/new) describing:

- the page or code affected,
- what you expected to happen and what happened instead,
- the browser, operating system and any assistive technology you were using.

Pull requests that improve accessibility are always welcome.
