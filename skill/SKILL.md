---
name: seeghra
description: Build any HTML page, PDF or slide deck in the Seeghra design system (IBM Carbon v11 tokens verbatim, Geist Sans and Geist Mono, square corners, left aligned). Use whenever Seeghra is named or an output must match it.
---

# Seeghra

Seeghra is IBM Carbon v11 with one change: the typeface is Vercel's Geist instead of IBM Plex. Everything else (colour tokens, the four themes, spacing, type scale, grid, motion, icons and component specs) is Carbon v11, unchanged. Seeghra adds three house rules and one optional typeface: square corners, left alignment, no em dashes, and Geist Pixel as an opt-in accent face.

Every value lives in `tokens.css`. Your job is to use those tokens, never to invent values.

## 1. Get the files first

You need `tokens.css` before you write anything. Use the first of these that works:

1. Files the user attached, a connected folder, or the project docs (look for `tokens.css`, `tokens.json` and `reference.html`).
2. The npm package `@seeghra/tokens`: `npm install @seeghra/tokens`, then read `node_modules/@seeghra/tokens/dist/tokens.css`.
3. The CDN copy: `https://cdn.jsdelivr.net/npm/@seeghra/tokens@1/dist/tokens.css` (and `/dist/tokens.json`, `/docs/index.html`).

If none of these is reachable, stop and ask for the file. Do not rebuild tokens from memory.

`reference.html` (published as `docs/index.html`, live at https://seeghra.github.io/seeghra/) is the source of truth for component markup and CSS. Before you build a component, copy its CSS block from it (each component has a `/* ---------- Name ---------- */` section and uses `.sg-` classes) rather than writing it again.

## 2. The rules

1. **Carbon verbatim.** Use Carbon v11 token names and component specs as they are. Never adjust a colour, size or spacing value to taste.
2. **Typeface.** Geist Sans for all text, Geist Mono for code and data. Carbon type sizes, weights, line heights and letter spacing are unchanged.
3. **Zero radius.** `border-radius: var(--sg-radius)` (0) on everything. No pills, no rounded cards, no circular buttons. Tags, toggles and checkboxes are square too.
4. **Left aligned.** Text, headings, buttons, table cells (numbers too), modal footers and page containers all align to the start. Never `text-align: center`, never `margin: 0 auto` on a layout container. The one exception: an icon inside a square control (icon-only button, close button, toolbar action) sits in the middle of that square.
5. **No em dashes** in any text you write, including headings, labels, alt text and comments. Use a full stop, comma, colon or parentheses instead.
6. **No hardcoded values.** Outside tokens.css, no hex, rgb, px, rem, em or ms values. Write `var(--sg-...)` every time.

Allowed literals, and only these:
- `0`, percentages, `fr`, `auto`, `100vh`/`100vw`, unitless multipliers inside `calc()`.
- Breakpoints inside `@media` conditions, because CSS variables do not work there. Use Carbon's: `42rem` (md), `66rem` (lg), `82rem` (xlg), `99rem` (max).
- `1em` as a converter when you turn a unitless line height into a length: `calc(var(--sg-body-compact-01-line-height) * 1em)`.
- `@page` size and margin in PDFs, which cannot read variables.
- Angles in transforms (`rotate(180deg)`), `0s`, and `0px` as the fallback inside `env()`.

If you need a size that has no token, add it to the Seeghra structural section of tokens.css with a name, and tell the user you did.

## 3. Setup by output

### HTML page or artifact

Inline the whole of tokens.css as the first `<style>` block (or link it as `tokens.css` when the page ships beside it). Then:

```css
body { background: var(--sg-background); color: var(--sg-text-primary); font-family: var(--sg-font-family-sans); }
```

Theme: the default is White, and it follows the OS dark setting with g100. To fix a theme, set `data-sg-theme="white|g10|g90|g100"` on any element; that subtree switches. On a claude.ai artifact, put `data-sg-theme` on a wrapper, never on `<html>`, so the viewer's own `data-theme` keeps working.

Layering: inside a container, set `data-sg-layer="1"`, `"2"` or `"3"` and use the contextual tokens `--sg-layer`, `--sg-field`, `--sg-border-subtle`, `--sg-border-strong`, `--sg-layer-hover`. They resolve to the right step.

Side gutter on artifacts: `padding-left: max(var(--sg-spacing-05), env(safe-area-inset-left, 0px))`, same on the right.

### PDF

Build the page as HTML with tokens.css inlined and print it in Chromium (Playwright `page.pdf`, `printBackground: true`). Geist Pixel is embedded in tokens.css already. Geist Sans and Mono load from Google Fonts. If the print machine has no network, embed them as `@font-face` data URIs from the `geist` npm package before printing.

- Use `data-sg-theme="white"` on the body wrapper for print unless the user asks for a dark document.
- Page: `@page { size: A4; margin: 0; }` and put padding on a page wrapper using spacing tokens (`--sg-spacing-09` to `--sg-spacing-10` is typical).
- Body copy: `body-01` or `body-02`. Section titles: `heading-04` or `heading-05`. Cover title: `fluid-display-01` values taken at the `lg` step (set the font-size to the `lg` value from tokens.json, because print has no viewport).
- Keep a 16 column grid using `--sg-grid-gutter`. Text blocks no wider than `--sg-reference-measure` (65ch).

### Slides

Build each slide as a 1920 by 1080 frame in HTML, or use the Slides artifact type when the session offers one and put Seeghra tokens in its theme.

- Background `--sg-background`. Pick one theme for the whole deck: White or g100.
- Title: `fluid-display-02` or `heading-07`. Subtitle: `heading-04`. Body: `body-02`, maximum six lines per slide. Labels and sources: `label-02`.
- Margins: `--sg-spacing-10` (64 px) on all sides at 1920 wide. Content starts at the top left, never vertically centred.
- Charts use the theme's support and tag tokens for series colour, Geist Mono with tabular figures for axis numbers.

## 4. Token names

Colour (theme aware, change with `data-sg-theme`):

| Use | Token |
|---|---|
| Page background | `--sg-background` |
| Cards, panels, table body | `--sg-layer-01` (or `--sg-layer` with layering) |
| Inputs | `--sg-field-01` (or `--sg-field`) |
| Text | `--sg-text-primary`, `--sg-text-secondary`, `--sg-text-helper`, `--sg-text-placeholder`, `--sg-text-disabled`, `--sg-text-on-color`, `--sg-text-inverse`, `--sg-text-error` |
| Links | `--sg-link-primary`, `--sg-link-primary-hover`, `--sg-link-visited` |
| Icons | `--sg-icon-primary`, `--sg-icon-secondary`, `--sg-icon-on-color`, `--sg-icon-disabled` |
| Borders | `--sg-border-subtle-00` to `-03`, `--sg-border-strong-01` to `-03`, `--sg-border-interactive` |
| Brand and focus | `--sg-interactive`, `--sg-background-brand`, `--sg-focus`, `--sg-focus-inset` |
| Status | `--sg-support-error`, `--sg-support-success`, `--sg-support-warning`, `--sg-support-info` (plus `-inverse`) |
| Buttons | `--sg-button-primary`, `-hover`, `-active`, `--sg-button-secondary`, `--sg-button-tertiary`, `--sg-button-danger-primary`, `--sg-button-disabled` |
| Tags | `--sg-tag-background-{colour}`, `--sg-tag-color-{colour}`, `--sg-tag-hover-{colour}` |
| Palette (fixed) | `--sg-blue-60`, `--sg-gray-100`, `--sg-red-50` and so on, 10 to 100. Use theme tokens first. |

Type: each Carbon style has four tokens, `--sg-{style}-font-size`, `-font-weight`, `-line-height`, `-letter-spacing`. Code styles also have `-font-family`. Always set all four:

```css
.title { font-size: var(--sg-heading-04-font-size); font-weight: var(--sg-heading-04-font-weight); line-height: var(--sg-heading-04-line-height); letter-spacing: var(--sg-heading-04-letter-spacing); }
```

Current v11 styles: `label-01/02`, `helper-text-01/02`, `legal-01/02`, `code-01/02`, `body-compact-01/02`, `body-01/02`, `heading-compact-01/02`, `heading-01` to `07`, `fluid-heading-03` to `06`, `fluid-paragraph-01`, `fluid-quotation-01/02`, `fluid-display-01` to `04`. Older aliases (`body-short-01`, `productive-heading-03`, `display-01` and so on) exist too. Prefer the current names.

Families and weights: `--sg-font-family-sans`, `--sg-font-family-mono`, `--sg-font-weight-light` (300), `-regular` (400), `-semibold` (600). Numbers in tables, KPIs and code: add `font-variant-numeric: var(--sg-font-variant-numeric-tabular)`. Geist figures are proportional by default, unlike Plex.

Spacing: `--sg-spacing-01` (2 px) to `--sg-spacing-13` (160 px): 2, 4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96, 160.

Sizes: `--sg-size-xs` 24, `-sm` 32, `-md` 40, `-lg` 48, `-xl` 64, `-2xl` 80. Icons: `--sg-icon-size-01` 16, `-02` 20.

Grid: `--sg-grid-columns` (4, 8, 16 by breakpoint), `--sg-grid-gutter` 32 px, `--sg-grid-gutter-narrow-hang`, `--sg-grid-gutter-condensed`, `--sg-grid-margin`, `--sg-grid-max-width`.

Motion: `--sg-duration-fast-01` (70ms) to `--sg-duration-slow-02` (700ms); `--sg-easing-{standard|entrance|exit}-{productive|expressive}`. Productive for small UI changes, expressive for modals and large moves. Respect `prefers-reduced-motion`.

Seeghra structural tokens (additions): `--sg-radius` (0), `--sg-border-width-01/02/03`, `--sg-focus-width`, `--sg-focus-offset-inset`, `--sg-z-index-*`, `--sg-shadow-menu`, `--sg-shadow-toast`, and component metrics such as `--sg-toggle-track-width`, `--sg-tag-height-md`, `--sg-modal-width-md`, `--sg-notification-max-width`.

## 5. Geist Pixel (opt-in accent)

Five faces: `--sg-font-family-pixel-square`, `-grid`, `-circle`, `-triangle`, `-line`. No Carbon token uses them. Reach for one only on purpose.

- Use for large figures, banner headlines, covers and section openers.
- 28 px (`heading-04`) or larger. Take size and line height from a Carbon type token.
- Weight 400 only, and set `font-synthesis: none`.
- Never for body text, labels, form fields, buttons or table cells.
- One pixel variant per page is usually enough. Two at most.

## 6. Components

Copy from reference.html. Key facts to keep if you have to write one:

- **Button**: heights 32/40/48/64/80, default 48. Label at the start, 16 px icon at the end. Padding 15 px start, 63 px end (ghost 15 px). Kinds: primary, secondary, tertiary, ghost, danger, danger tertiary, danger ghost. Focus: `border-color: var(--sg-focus); box-shadow: inset 0 0 0 var(--sg-border-width-01) var(--sg-focus), inset 0 0 0 var(--sg-border-width-02) var(--sg-background)`.
- **Text input / dropdown**: 40 px, `--sg-field` fill, 1 px `--sg-border-strong` bottom border, label `label-01` above with 8 px gap, helper `helper-text-01` below with 4 px gap. Focus and invalid use a 2 px inset outline.
- **Checkbox**: 16 px square box, 1 px `--sg-icon-primary` border, checked fill `--sg-icon-primary`.
- **Toggle**: 48 by 24 square track, 18 px square handle, off `--sg-toggle-off`, on `--sg-support-success`.
- **Tag**: 18/24/32 high, 8 px side padding, `label-01`, square, label at the start.
- **Notification**: 3 px start border in the support colour; high contrast on `--sg-background-inverse`, low contrast on `--sg-notification-background-*`.
- **Tabs**: line 40 px with 2 px bottom border; contained 48 px on `--sg-layer-accent`. Selected uses `heading-compact-01`.
- **Data table**: rows 24/32/40/48/64, default 48. Header `--sg-layer-accent` with `heading-compact-01`; body `--sg-layer` with `body-compact-01`. All columns start aligned.
- **Modal**: `--sg-layer` panel, `heading-03` title, 48 px close button, 64 px footer with buttons splitting the width.

## 7. Do and don't

Do:
```css
.card { background: var(--sg-layer-01); padding: var(--sg-spacing-05); border-radius: var(--sg-radius); }
.kpi { font-family: var(--sg-font-family-pixel-grid); font-size: var(--sg-heading-05-font-size); line-height: var(--sg-heading-05-line-height); font-synthesis: none; font-variant-numeric: var(--sg-font-variant-numeric-tabular); }
.page { padding-inline: var(--sg-spacing-07); max-inline-size: var(--sg-grid-max-width); }
```

Don't:
```css
.card { background: #f4f4f4; padding: 16px; border-radius: 8px; }   /* literal values, rounded */
.hero { text-align: center; margin: 0 auto; }                        /* centred */
.tag { border-radius: 999px; }                                       /* pill */
.label { font-family: 'IBM Plex Sans'; }                             /* wrong typeface */
.title { font-size: var(--sg-heading-04-font-size); }                /* other three type tokens missing */
.body { font-family: var(--sg-font-family-pixel-line); }             /* pixel face on body text */
```

Copy: write "Sync failed. Retry in a minute." Never join the two clauses with an em dash.

## 8. Check before you deliver

Run these on every file you produced (exclude tokens.css itself):

```bash
grep -nE '#[0-9a-fA-F]{3,8}\b|rgba?\(|[0-9.]+(px|rem|ms)\b' page.html | grep -v '@media'   # should print nothing outside allowed literals
grep -n 'border-radius' page.html | grep -v 'var(--sg-radius)'                         # should print nothing
grep -nE 'text-align:\s*center|margin:\s*0 auto|margin-inline:\s*auto' page.html       # should print nothing
grep -nP '\x{2014}' page.html                                                          # em dashes: should print nothing
```

Then render it once in Chromium in a light theme and a dark theme (`color_scheme` light and dark) and look at it. Fix what you see, then deliver.
