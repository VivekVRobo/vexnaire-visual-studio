# Website Integration

1. Copy the contents of `assets/` into your website assets folder.
2. Include `brand-tokens.css` after the site's base reset.
3. Point the site favicon to `assets/favicon.svg` and keep `favicon.ico` as a fallback.
4. Use `assets/vexnaire-symbol.svg` in the navigation instead of recreating the mark with CSS/text.
5. Use `assets/vexnaire-hero.jpg` only where a cinematic branded header is appropriate; portfolio artwork should remain the hero when showcasing client-facing work.
6. Link `site.webmanifest` from the page `<head>` if you want installable/PWA metadata.

Recommended HTML:

```html
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/assets/favicon.ico" sizes="any">
<link rel="manifest" href="/site.webmanifest">
<link rel="stylesheet" href="/brand-tokens.css">
```
