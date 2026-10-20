// Seeghra token generator. Source of truth: Carbon v11 npm packages.
// Run from the repo root: npm run build
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const colors = require('@carbon/colors');
const type = require('@carbon/type');
const layout = require('@carbon/layout');
const motion = require('@carbon/motion');

const VERS = {};
for (const p of ['themes', 'type', 'layout', 'motion', 'colors', 'styles', 'icons']) {
  try { VERS[p] = JSON.parse(fs.readFileSync(path.join(ROOT, 'node_modules/@carbon', p, 'package.json'))).version; } catch (e) {}
}

const kebab = (s) => s.replace(/([a-z])([A-Z0-9])/g, '$1-$2').replace(/([0-9])([A-Za-z])/g, '$1-$2').toLowerCase();
const json = {
  meta: { name: 'Seeghra', prefix: '--sg-', source: 'IBM Carbon v11', carbon_versions: VERS },
  font: {}, color: {}, theme: {}, layer: {}, type: {}, spacing: {}, layout: {}, radius: {}, grid: {}, motion: {}, seeghra: {}
};

/* ---------- Fonts ---------- */
const FONT = {
  'font-family-sans': "'Geist', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  'font-family-mono': "'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace",
};
FONT['font-family-sans-condensed'] = 'var(--sg-font-family-sans)';
FONT['font-family-sans-hebrew'] = 'var(--sg-font-family-sans)';
FONT['font-family-serif'] = 'var(--sg-font-family-sans)';
// Geist Pixel: Seeghra addition (Option B). Opt-in accent faces; no Carbon type token uses them.
const PIXEL = ['square', 'grid', 'circle', 'triangle', 'line'];
for (const v of PIXEL) FONT[`font-family-pixel-${v}`] = `'Geist Pixel ${v[0].toUpperCase() + v.slice(1)}', var(--sg-font-family-sans)`;
const GEIST_VER = JSON.parse(fs.readFileSync(path.join(ROOT, 'node_modules/geist/package.json'))).version;
const PIXEL_DIR = path.join(ROOT, 'node_modules/geist/dist/fonts/geist-pixel');
const PIXEL_FACES = PIXEL.map((v) => { const N = v[0].toUpperCase() + v.slice(1); const b64 = fs.readFileSync(path.join(PIXEL_DIR, `GeistPixel-${N}.woff2`)).toString('base64'); return `@font-face { font-family: 'Geist Pixel ${N}'; src: url(data:font/woff2;base64,${b64}) format('woff2'); font-weight: 400; font-style: normal; font-display: swap; }`; }).join('\n');
FONT['font-weight-light'] = '300';
FONT['font-weight-regular'] = '400';
FONT['font-weight-semibold'] = '600';
FONT['font-variant-numeric-tabular'] = 'tabular-nums';
json.font = { ...FONT };

/* ---------- Palette ---------- */
const PALETTE = {};
for (const [k, v] of Object.entries(colors)) {
  if (typeof v !== 'string' || !/^#|^rgba?\(/.test(v)) continue;
  if (k === 'colors') continue;
  PALETTE[kebab(k)] = v;
}
json.color = PALETTE;

/* ---------- Themes (compiled Carbon CSS is the reference) ---------- */
const css = fs.readFileSync(path.join(ROOT, 'node_modules/@carbon/styles/css/styles.css'), 'utf8');
function block(sel) {
  const i = css.indexOf('\n' + sel + ' {');
  const j = css.indexOf('\n}', i);
  return css.slice(i, j);
}
const EXCLUDE = /^(ai-|chat-)/;
function themeVars(sel) {
  const out = {};
  const re = /--cds-([a-z0-9-]+):\s*([^;]+);/g;
  let m; const b = block(sel);
  while ((m = re.exec(b))) {
    if (EXCLUDE.test(m[1])) continue;
    out[m[1]] = m[2].trim().replace(/var\(--cds-([a-z0-9-]+)(?:,\s*[^)]+)?\)/g, 'var(--sg-$1)');
  }
  return out;
}
const THEMES = { white: themeVars('.cds--white'), g10: themeVars('.cds--g10'), g90: themeVars('.cds--g90'), g100: themeVars('.cds--g100') };
// Fill any component token that the JS package defines but the compiled CSS omits.
{ const t = require('@carbon/themes'); const key = { white: 'whiteTheme', g10: 'g10', g90: 'g90', g100: 'g100' };
  for (const grp of ['buttonTokens', 'tagTokens', 'notificationTokens', 'statusTokens', 'contentSwitcherTokens'])
    for (const [k, v] of Object.entries(t[grp])) { const n = kebab(k); for (const th of Object.keys(THEMES)) if (!(n in THEMES[th])) { const val = v[key[th]] || v.whiteTheme; THEMES[th][n] = val; } } }
json.theme = THEMES;
const LAYERS = {};
for (const [n, sel] of [[1, '.cds--layer-one'], [2, '.cds--layer-two'], [3, '.cds--layer-three']]) LAYERS[n] = themeVars(sel);
json.layer = LAYERS;

/* ---------- Type ---------- */
const BP = layout.breakpoints; const BPN = ['sm', 'md', 'lg', 'xlg', 'max'];
const rem = (s) => parseFloat(s);
const TYPE = {}; const TYPE_MQ = {}; // TYPE_MQ[bp] = {var: value}
for (const [name, st] of Object.entries(type.styles)) {
  const k = kebab(name);
  const t = {};
  if (st.fontFamily) t['font-family'] = st.fontFamily.includes('Mono') ? 'var(--sg-font-family-mono)' : 'var(--sg-font-family-sans)';
  if (/^quotation|^fluid-quotation/.test(k)) t['font-family'] = 'var(--sg-font-family-serif)';
  t['font-size'] = st.fontSize;
  t['font-weight'] = String(st.fontWeight);
  t['line-height'] = String(st.lineHeight);
  t['letter-spacing'] = String(st.letterSpacing === 0 ? '0' : st.letterSpacing);
  for (const [p, v] of Object.entries(t)) TYPE[`${k}-${p}`] = v;
  if (st.breakpoints) {
    const fs_ = st.breakpoints;
    for (let i = 0; i < BPN.length; i++) {
      const bp = BPN[i];
      if (bp !== 'sm' && !fs_[bp]) continue;
      const cur = bp === 'sm' ? {} : fs_[bp];
      const min = cur.fontSize || st.fontSize;
      let next = null;
      for (let j = i + 1; j < BPN.length; j++) if (fs_[BPN[j]]) { next = BPN[j]; break; }
      const v = {};
      if (next) {
        const max = fs_[next].fontSize || st.fontSize;
        const minVw = rem(BP[bp].width), maxVw = rem(BP[next].width);
        const d = (rem(max) - rem(min)) * 16, w = (maxVw - minVw) * 16;
        v[`${k}-font-size`] = d === 0 ? min : `calc(${min} + ${+d.toFixed(4)} * ((100vw - ${BP[bp].width}) / ${w}))`;
      } else v[`${k}-font-size`] = min;
      if (cur.lineHeight !== undefined) v[`${k}-line-height`] = String(cur.lineHeight);
      if (cur.fontWeight !== undefined) v[`${k}-font-weight`] = String(cur.fontWeight);
      if (cur.letterSpacing !== undefined) v[`${k}-letter-spacing`] = String(cur.letterSpacing === 0 ? '0' : cur.letterSpacing);
      if (bp === 'sm') Object.assign(TYPE, v); else { TYPE_MQ[bp] = TYPE_MQ[bp] || {}; Object.assign(TYPE_MQ[bp], v); }
    }
  }
}
json.type = { base: TYPE, breakpoints: TYPE_MQ };

/* ---------- Spacing and layout ---------- */
const SP = {};
for (let i = 1; i <= 13; i++) SP[`spacing-${String(i).padStart(2, '0')}`] = layout[`spacing${String(i).padStart(2, '0')}`];
for (let i = 1; i <= 4; i++) SP[`fluid-spacing-${String(i).padStart(2, '0')}`] = layout[`fluidSpacing${String(i).padStart(2, '0')}`] === 0 ? '0' : layout[`fluidSpacing${String(i).padStart(2, '0')}`];
json.spacing = SP;
const LAY = {};
for (let i = 1; i <= 7; i++) LAY[`layout-${String(i).padStart(2, '0')}`] = layout[`layout${String(i).padStart(2, '0')}`];
for (let i = 1; i <= 5; i++) LAY[`container-${String(i).padStart(2, '0')}`] = layout[`container${String(i).padStart(2, '0')}`];
LAY['icon-size-01'] = layout.iconSize01; LAY['icon-size-02'] = layout.iconSize02;
for (const [k, v] of [['xs', 'sizeXSmall'], ['sm', 'sizeSmall'], ['md', 'sizeMedium'], ['lg', 'sizeLarge'], ['xl', 'sizeXLarge'], ['2xl', 'size2XLarge']]) LAY[`size-${k}`] = layout[v];
const li = css.indexOf(':root {\n  --cds-layout-size-height-xs'); const layRoot = css.slice(li, css.indexOf('\n}', li));
for (const m of layRoot.matchAll(/--cds-(layout-[a-z0-9-]+):\s*([^;]+);/g)) LAY[m[1]] = m[2].trim();
json.layout = LAY;
const RAD = {};
for (const [k, v] of Object.entries(layout.borderRadius)) RAD[k] = { carbon: v, seeghra: '0' };
json.radius = RAD;

/* ---------- Grid ---------- */
const GRID = { 'grid-gutter': '2rem', 'grid-gutter-condensed': '1px', 'grid-gutter-narrow-hang': '1rem', 'grid-columns': '4', 'grid-margin': '0', 'grid-max-width': '99rem' };
for (const b of BPN) { GRID[`breakpoint-${b}`] = BP[b].width; GRID[`breakpoint-${b}-columns`] = String(BP[b].columns); GRID[`breakpoint-${b}-margin`] = BP[b].margin === '0' ? '0' : BP[b].margin; }
const GRID_MQ = { md: { 'grid-columns': '8', 'grid-margin': '1rem' }, lg: { 'grid-columns': '16' }, max: { 'grid-margin': '1.5rem' } };
json.grid = { base: GRID, breakpoints: GRID_MQ };

/* ---------- Motion ---------- */
const MO = {};
for (const k of ['fast01', 'fast02', 'moderate01', 'moderate02', 'slow01', 'slow02']) MO[`duration-${kebab(k)}`] = motion[k];
for (const [k, v] of Object.entries(motion.easings)) for (const [m2, c] of Object.entries(v)) MO[`easing-${k}-${m2}`] = c;
json.motion = MO;

/* ---------- Seeghra structural additions (not Carbon tokens; values read from Carbon component CSS) ---------- */
const SK = {
  'radius': '0',
  'border-width-01': '1px', 'border-width-02': '2px', 'border-width-03': '3px', 'border-width-checkmark': '1.5px',
  'focus-width': '2px', 'focus-offset-inset': '-2px',
  'z-index-dropdown': '9100', 'z-index-modal': '9000', 'z-index-toast': '9000', 'z-index-sticky': '1',
  'shadow-menu': '0 2px 6px var(--sg-shadow)',
  'shadow-toast': '0 2px 6px 0 var(--sg-shadow-toast-color)',
  'shadow-toast-color': 'rgba(0, 0, 0, 0.2)',
  'shadow-toggle-focus': '0 0 0 1px var(--sg-focus-inset), 0 0 0 3px var(--sg-focus)',
  'opacity-disabled': '0.5',
  // component metrics
  'button-max-width': '20rem', 'button-icon-only-icon': '1rem',
  'button-padding-end-extra': '3rem',
  'checkbox-size': '1rem', 'checkbox-label-indent': '1.25rem', 'checkbox-label-min-height': '1.25rem',
  'checkbox-check-width': '0.5625rem', 'checkbox-check-height': '0.3125rem', 'checkbox-indeterminate-width': '0.5rem',
  'toggle-track-width': '3rem', 'toggle-track-height': '1.5rem', 'toggle-handle': '1.125rem', 'toggle-handle-inset': '0.1875rem', 'toggle-travel': '1.5rem',
  'toggle-sm-track-width': '2rem', 'toggle-sm-track-height': '1rem', 'toggle-sm-handle': '0.625rem', 'toggle-sm-travel': '1rem',
  'tag-height-sm': '1.125rem', 'tag-height-md': '1.5rem', 'tag-height-lg': '2rem', 'tag-max-width': '13rem', 'tag-min-width': '2rem',
  'notification-min-width': '18rem', 'notification-max-width': '52rem', 'notification-border-start': '3px',
  'notification-details-margin': '0.8125rem', 'notification-text-padding-block': '0.9375rem', 'notification-icon-offset': '0.875rem',
  'toast-width': '22rem',
  'modal-width-xs': '24%', 'modal-width-sm': '36%', 'modal-width-md': '48%', 'modal-width-lg': '72%',
  'modal-max-height-xs': '48%', 'modal-max-height-sm': '72%', 'modal-max-height-md': '84%', 'modal-max-height-lg': '96%',
  'modal-footer-height': '4rem', 'modal-heading-inset': '20%', 'modal-preview-height': '28rem',
  'dropdown-menu-max-height': '22rem', 'dropdown-chevron-box': '1.5rem',
  'input-icon-offset': '1rem', 'input-max-width': '20rem',
  'tabs-contained-item-min-width': '10rem', 'tabs-line-item-min-width': '6rem',
  'table-cell-min-width': '6rem', 'table-select-column': '3rem',
  'swatch-size': '3rem',
  // reference page layout only
  'reference-measure': '65ch', 'reference-nav-width': '15rem', 'reference-swatch-col': '17rem', 'reference-specimen-col': '20rem',
  'reference-palette-chip': '4rem', 'reference-motion-track': '18rem', 'reference-modal-frame': '30rem', 'reference-type-meta': '14rem',
};
json.seeghra = SK;

/* ---------- Emit CSS ---------- */
const decl = (obj, ind = '  ') => Object.entries(obj).map(([k, v]) => `${ind}--sg-${k}: ${v};`).join('\n');
const themeDecl = (t) => decl(t) + `\n  color-scheme: var(--sg-color-scheme);`;
const mq = (bp, body) => `@media (min-width: ${BP[bp].width}) {\n  :root {\n${body}\n  }\n}`;
let out = `/*
 * Seeghra tokens
 * IBM Carbon v11 tokens, verbatim, prefixed --sg-. Typeface: Geist Sans and Geist Mono.
 * Generated from @carbon/themes ${VERS.themes}, @carbon/styles ${VERS.styles}, @carbon/type ${VERS.type},
 * @carbon/layout ${VERS.layout}, @carbon/motion ${VERS.motion}, @carbon/colors ${VERS.colors}.
 * Seeghra changes: typeface, all radius tokens set to 0, AI and chat tokens left out.
 * This file is the only place a colour, size or spacing value may be written.
 */
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;600&family=Geist+Mono:wght@400;600&display=swap');

/* Geist Pixel (SIL Open Font License, Vercel, geist npm ${GEIST_VER}), embedded so it works offline and in PDFs. One weight: 400. */
${PIXEL_FACES}

/* ===== Fonts ===== */
:root {
${decl(FONT)}
}

/* ===== Colour palette ===== */
:root {
${decl(PALETTE)}
}

/* ===== Type ===== */
:root {
${decl(TYPE)}
}
${BPN.filter((b) => TYPE_MQ[b]).map((b) => mq(b, decl(TYPE_MQ[b], '    '))).join('\n')}

/* ===== Spacing ===== */
:root {
${decl(SP)}
}

/* ===== Layout ===== */
:root {
${decl(LAY)}
}

/* ===== Radius: Carbon values replaced with 0 ===== */
:root {
${Object.entries(RAD).map(([k, v]) => `  --sg-${k}: 0; /* Carbon: ${v.carbon} */`).join('\n')}
}

/* ===== Grid ===== */
:root {
${decl(GRID)}
}
${Object.entries(GRID_MQ).map(([b, v]) => mq(b, decl(v, '    '))).join('\n')}

/* ===== Motion ===== */
:root {
${decl(MO)}
}

/* ===== Seeghra structural tokens (additions, read from Carbon component CSS) ===== */
:root {
${decl(SK)}
}

/* ===== Themes =====
 * Default: White. Follows the OS dark setting with g100 unless a theme is set.
 * Set data-sg-theme="white|g10|g90|g100" on any element to theme that subtree.
 */
:root,
[data-sg-theme="white"],
:root[data-theme="light"] {
${themeDecl(THEMES.white)}
}
[data-sg-theme="g10"] {
${themeDecl(THEMES.g10)}
}
[data-sg-theme="g90"] {
${themeDecl(THEMES.g90)}
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme]):not([data-sg-theme]) {
${themeDecl(THEMES.g100).replace(/^/gm, '  ')}
  }
}
[data-sg-theme="g100"],
:root[data-theme="dark"] {
${themeDecl(THEMES.g100)}
}

/* ===== Layering: set data-sg-layer="1|2|3" on a container ===== */
${[1, 2, 3].map((n) => `[data-sg-layer="${n}"] {\n${decl(LAYERS[n])}\n}`).join('\n')}
`;
fs.mkdirSync(path.join(ROOT, 'dist'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dist/tokens.css'), out);
fs.writeFileSync(path.join(ROOT, 'dist/tokens.json'), JSON.stringify(json, null, 2));
const count = out.match(/^\s*--sg-[a-z0-9-]+:/gm).length;
console.log('declarations', count, 'unique', new Set(out.match(/--sg-[a-z0-9-]+(?=:)/g)).size, 'theme tokens', Object.keys(THEMES.white).length, VERS);
