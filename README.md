# Seeghra

Seeghra is a design system built on IBM Carbon v11, set in Vercel's Geist instead of IBM Plex.

Every Carbon token is included unchanged: colour, the four themes, spacing, type scale, grid and motion. On top of Carbon, Seeghra applies three rules: square corners everywhere, everything aligned to the start, and no em dashes in copy. Geist Pixel is available as an optional display face.

**[See the reference page](https://seeghra.github.io/seeghra/)** for every foundation and component in all four themes.

## Install

```bash
npm install @seeghra/tokens
```

```css
@import "@seeghra/tokens";            /* or "@seeghra/tokens/tokens.css" */
```

Or link it straight from a CDN, with no install:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@seeghra/tokens@1/dist/tokens.css">
```

## Use

```css
body {
  background: var(--sg-background);
  color: var(--sg-text-primary);
  font-family: var(--sg-font-family-sans);
}

.card {
  background: var(--sg-layer-01);
  padding: var(--sg-spacing-05);
  border-radius: var(--sg-radius);  /* always 0 */
}

.title {
  font-size: var(--sg-heading-04-font-size);
  font-weight: var(--sg-heading-04-font-weight);
  line-height: var(--sg-heading-04-line-height);
  letter-spacing: var(--sg-heading-04-letter-spacing);
}
```

Pages are light by default and switch to dark when the system is in dark mode. To set a theme on the whole page or one section, add an attribute:

```html
<section data-sg-theme="g90">...</section>
```

| Theme | Look | Attribute |
|---|---|---|
| White | Light | `data-sg-theme="white"` (default) |
| g10 | Light grey | `data-sg-theme="g10"` |
| g90 | Dark grey | `data-sg-theme="g90"` |
| g100 | Near black | `data-sg-theme="g100"` (automatic in dark mode) |

For nested surfaces, set `data-sg-layer="1"`, `"2"` or `"3"` on a container and use `--sg-layer`, `--sg-field` and `--sg-border-subtle`. They pick the right step for the depth.

## What is in the package

| Path | Contents |
|---|---|
| `dist/tokens.css` | Every token as a CSS custom property prefixed `--sg-`, all four themes, Geist Pixel embedded |
| `dist/tokens.json` | The same tokens as JSON, grouped by kind, with the Carbon versions they came from |
| `docs/index.html` | The reference page: colour, type, spacing, grid, motion, icons, and ten components in every state |
| `skill/SKILL.md` | A Claude skill that teaches a model to build HTML, PDF and slides in Seeghra |
| `fonts/OFL-Geist.txt` | The Geist font licence |

## Token families

| Family | Example |
|---|---|
| Theme colour | `--sg-background`, `--sg-layer-01`, `--sg-text-primary`, `--sg-support-error`, `--sg-button-primary` |
| Palette | `--sg-blue-60`, `--sg-gray-100` |
| Type | `--sg-{style}-font-size`, `-font-weight`, `-line-height`, `-letter-spacing` for every Carbon style |
| Font | `--sg-font-family-sans`, `--sg-font-family-mono`, `--sg-font-family-pixel-square` and four more |
| Spacing | `--sg-spacing-01` (2px) to `--sg-spacing-13` (160px) |
| Size | `--sg-size-xs` (24px) to `--sg-size-2xl` (80px) |
| Grid | `--sg-grid-columns`, `--sg-grid-gutter`, `--sg-grid-margin` |
| Motion | `--sg-duration-fast-01` to `--sg-duration-slow-02`, `--sg-easing-standard-productive` and five more |
| Seeghra | `--sg-radius`, `--sg-border-width-01`, `--sg-focus-width`, component metrics |

## Differences from Carbon

| Area | Carbon | Seeghra |
|---|---|---|
| Typeface | IBM Plex Sans and Plex Mono | Geist Sans and Geist Mono |
| Serif, condensed and Hebrew faces | Plex variants | Geist Sans (Geist has none of these) |
| Figures | Tabular by default in Plex | `--sg-font-variant-numeric-tabular` for tables and data, because Geist figures are proportional |
| Type sizes, weights, line heights, tracking | Carbon values | Unchanged. Geist's line box matches Plex, and text runs about 2 percent wider |
| Radius | Rounded tags, toggle and checkbox, plus radius tokens | 0 everywhere |
| Alignment | Centred tag labels and grid container | Start aligned |
| AI and chat tokens | Included | Not included |
| Prefix | `--cds-` | `--sg-` |
| Geist Pixel | Not in Carbon | Five opt-in font tokens for large display text |

## Fonts

Geist Sans and Geist Mono load from Google Fonts, with system fonts as a fallback. Geist Pixel is embedded in `tokens.css`, so it works offline and in PDFs. Use it at 28px or larger, at weight 400, with `font-synthesis: none`.

## Using Seeghra with Claude

Add `skill/SKILL.md` to Claude as a skill. Claude then follows Seeghra's rules and tokens whenever you ask for a Seeghra page, PDF or deck.

## Build from source

```bash
npm install
npm run build
```

`scripts/gen.js` reads IBM's published Carbon packages and writes `dist/`. `scripts/build.js` builds the reference page into `docs/`. No value is typed in by hand. To update Carbon, bump the `@carbon/*` versions in `package.json` and rebuild.

## Licence

Seeghra is released under the [Apache License 2.0](LICENSE). It is derived from the [IBM Carbon Design System](https://github.com/carbon-design-system/carbon), also Apache 2.0. The Geist fonts are © Vercel under the [SIL Open Font License 1.1](fonts/OFL-Geist.txt). See [NOTICE](NOTICE) for attribution and the list of changes.

Seeghra is an independent project. It is not affiliated with or endorsed by IBM or Vercel.
