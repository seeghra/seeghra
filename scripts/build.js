// Builds docs/index.html (the reference page) from ref.src.html and dist/tokens.css. Run from the repo root: npm run build
const fs = require('fs');
const path = require('path');
const D = path.join(__dirname, '..');
const tokensCss = fs.readFileSync(path.join(D, 'dist/tokens.css'), 'utf8');
const tokens = JSON.parse(fs.readFileSync(path.join(D, 'dist/tokens.json'), 'utf8'));
let src = fs.readFileSync(path.join(__dirname, 'ref.src.html'), 'utf8');

const ICON_DIR = path.join(D, 'node_modules/@carbon/icons/svg');
function icon(name, size = 16, extra = '') {
  let f = path.join(ICON_DIR, String(size), name + '.svg');
  if (!fs.existsSync(f)) f = path.join(ICON_DIR, '32', name + '.svg');
  if (!fs.existsSync(f)) throw new Error('icon missing ' + name);
  let svg = fs.readFileSync(f, 'utf8').trim();
  svg = svg.replace(/<\?xml[^>]*>/, '').replace(/\s(width|height)="[^"]*"/g, '').replace(/\t/g, ' ');
  return svg.replace('<svg ', `<svg class="sg-icon sg-icon--${size}${extra ? ' ' + extra : ''}" aria-hidden="true" focusable="false" `);
}

const REGIONS = ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East and Africa'];
function dropdown(args) {
  const [id, ...rest] = args;
  const flags = new Set(); const words = [];
  for (const w of rest) (['open', 'hover', 'focus', 'invalid', 'disabled'].includes(w) ? flags : { add: (x) => words.push(x) }).add(w);
  const label = words.join(' ');
  const sel = REGIONS.indexOf(label);
  const cls = ['sg-dropdown', flags.has('open') && 'is-open', flags.has('hover') && 'is-hover', flags.has('focus') && 'is-focus', flags.has('invalid') && 'is-invalid', flags.has('disabled') && 'is-disabled'].filter(Boolean).join(' ');
  const items = REGIONS.map((r, i) => `<li class="sg-dropdown__item${i === sel ? ' is-selected' : ''}${flags.has('open') && i === 2 ? ' is-highlighted' : ''}" role="option" aria-selected="${i === sel}"><div class="sg-dropdown__option">${r}</div>${icon('checkmark', 16, 'sg-dropdown__check')}</li>`).join('');
  const status = flags.has('invalid') ? icon('error--filled', 16, 'sg-dropdown__status-icon sg-input-icon--error') : '';
  return `<div class="${cls}"${flags.has('open') ? ' data-static="1"' : ''}><button class="sg-dropdown__field" type="button" aria-haspopup="listbox" aria-expanded="${flags.has('open')}" aria-labelledby="${id}l ${id}v"${flags.has('disabled') ? ' disabled' : ''}${flags.has('invalid') ? ' aria-invalid="true"' : ''}><span class="sg-dropdown__label" id="${id}v">${label}</span></button>${status}${icon('chevron--down', 16, 'sg-dropdown__chevron')}<ul class="sg-dropdown__menu" role="listbox" aria-labelledby="${id}l">${items}</ul></div>`;
}
function checkbox(args) {
  const [id, ...rest] = args;
  const flags = new Set(); const words = [];
  for (const w of rest) (['checked', 'mixed', 'disabled', 'focus'].includes(w) ? flags.add(w) : words.push(w));
  return `<div class="sg-checkbox-wrap"><input class="sg-checkbox" type="checkbox" id="${id}"${flags.has('checked') ? ' checked' : ''}${flags.has('disabled') ? ' disabled' : ''}${flags.has('mixed') ? ' data-mixed="1"' : ''}><label class="sg-checkbox-label${flags.has('focus') ? ' is-focus' : ''}" for="${id}"><span class="sg-checkbox-label-text">${words.join(' ')}</span></label></div>`;
}
function toggle(args) {
  const [id, label, ...flagsA] = args;
  const f = new Set(flagsA);
  const cls = ['sg-toggle', f.has('sm') && 'sg-toggle--sm', f.has('disabled') && 'is-disabled', f.has('readonly') && 'is-readonly'].filter(Boolean).join(' ');
  return `<span class="state-label">${label.replace(/_/g, ' ')}</span><div class="${cls}"><span class="sg-toggle__label-text" id="${id}l">Email alerts</span><button class="sg-toggle__button${f.has('focus') ? ' is-focus' : ''}" type="button" role="switch" aria-checked="${f.has('on')}" aria-labelledby="${id}l"${f.has('disabled') ? ' disabled' : ''}${f.has('readonly') ? ' aria-readonly="true"' : ''}><span class="sg-toggle__switch">${f.has('sm') ? icon('checkmark', 16, 'sg-toggle__check') : ''}</span><span class="sg-toggle__text">${f.has('on') ? 'On' : 'Off'}</span></button></div>`;
}
const KIND_ICON = { error: 'error--filled', success: 'checkmark--filled', info: 'information--filled', warning: 'warning--filled' };
function notif(args) {
  const kind = args[0]; let rest = args.slice(1); const low = rest[0] === 'low'; if (low) rest = rest.slice(1); const action = rest[0] === 'action'; if (action) rest = rest.slice(1);
  const text = rest.join(' '); const cut = text.indexOf('. ');
  const title = text.slice(0, cut + 1), sub = text.slice(cut + 2);
  const role = kind === 'error' ? 'alert' : 'status';
  const act = action ? `<button class="sg-btn sg-btn--ghost sg-btn--sm sg-notif__action" type="button">${kind === 'error' ? 'Retry sync' : 'Add seats'}</button>` : '';
  return `<div class="sg-notif sg-notif--${kind}${low ? ' sg-notif--low' : ''}" role="${role}"><div class="sg-notif__details">${icon(KIND_ICON[kind], 20, 'sg-notif__icon')}<div class="sg-notif__text"><p class="sg-notif__title">${title}</p><p class="sg-notif__subtitle">${sub}</p></div></div>${act}<button class="sg-notif__close" type="button" aria-label="Close notification">${icon('close', 20)}</button></div>`;
}
const TOAST_SUB = { error: 'The audit export stopped at 62 percent.', success: 'Your audit export is ready to download.', info: 'The access report runs every Monday at 08:00.', warning: 'Log storage is 91 percent full.' };
function toast(args) {
  const kind = args[0]; let rest = args.slice(1); const low = rest[0] === 'low'; if (low) rest = rest.slice(1);
  return `<div class="sg-toast sg-notif--${kind}${low ? ' sg-notif--low' : ''}" role="${kind === 'error' ? 'alert' : 'status'}">${icon(KIND_ICON[kind], 20, 'sg-notif__icon')}<div class="sg-toast__details"><p class="sg-toast__title">${rest.join(' ')}</p><p class="sg-toast__subtitle">${TOAST_SUB[kind]}</p><p class="sg-toast__caption">Today, 10:42</p></div><button class="sg-notif__close" type="button" aria-label="Close notification">${icon('close', 20)}</button></div>`;
}
const GRID_ICONS = ['add', 'close', 'chevron--down', 'checkmark', 'search', 'filter', 'settings', 'download', 'edit', 'trash-can', 'overflow-menu--vertical', 'arrows--vertical', 'information--filled', 'checkmark--filled', 'warning--alt--filled', 'error--filled'];
const iconGrid = GRID_ICONS.map((n) => `<div class="icon-cell"><div class="row">${[16, 20, 24, 32].map((s) => icon(n, s)).join('')}</div><span class="mono">${n}</span></div>`).join('');

const V11_TYPE = ['label-01', 'label-02', 'helper-text-01', 'helper-text-02', 'legal-01', 'legal-02', 'code-01', 'code-02', 'body-compact-01', 'body-compact-02', 'body-01', 'body-02',
  'heading-compact-01', 'heading-compact-02', 'heading-01', 'heading-02', 'heading-03', 'heading-04', 'heading-05', 'heading-06', 'heading-07',
  'fluid-heading-03', 'fluid-heading-04', 'fluid-heading-05', 'fluid-heading-06', 'fluid-paragraph-01', 'fluid-quotation-01', 'fluid-quotation-02', 'fluid-display-01', 'fluid-display-02', 'fluid-display-03', 'fluid-display-04'];
for (const t of V11_TYPE) if (!(`${t}-font-size` in tokens.type.base)) throw new Error('type token missing ' + t);
const AUDIT = [
  { name: 'Button', states: 5, changes: 0, note: 'Matches Carbon. Label at the start, icon at the end. Icon-only buttons centre the icon inside their square.' },
  { name: 'Text input', states: 7, changes: 0, note: 'Matches Carbon. Default, hover, focus, invalid, warning, disabled and read only.' },
  { name: 'Dropdown', states: 6, changes: 0, note: 'Matches Carbon. Menu dividers, selected check and highlighted outline as specified.' },
  { name: 'Checkbox', states: 8, changes: 1, note: 'Box corner radius 2px becomes 0.' },
  { name: 'Toggle', states: 8, changes: 2, note: 'Pill track becomes a square track. Round handle becomes a square handle. Size and travel unchanged.' },
  { name: 'Tag', states: 6, changes: 2, note: 'Pill shape becomes square, close button circle becomes square, label aligns to the start instead of the centre.' },
  { name: 'Notification', states: 4, changes: 0, note: 'Matches Carbon. Inline, actionable and toast in high and low contrast.' },
  { name: 'Tabs', states: 5, changes: 0, note: 'Matches Carbon. Line and contained.' },
  { name: 'Data table', states: 6, changes: 1, note: 'Numeric columns align to the start with tabular figures, where Carbon guidance aligns them to the end.' },
  { name: 'Modal', states: 3, changes: 0, note: 'Matches Carbon. Footer buttons split the width in half.' },
];
const DATA = {
  theme: Object.keys(tokens.theme.white).filter((n) => n !== 'color-scheme' && !/^(layer|layer-active|layer-background|layer-hover|layer-selected|layer-selected-hover|layer-accent|layer-accent-hover|layer-accent-active|field|field-hover|border-subtle|border-subtle-selected|border-strong|border-tile)$/.test(n)),
  families: ['red', 'magenta', 'purple', 'blue', 'cyan', 'teal', 'green', 'cool-gray', 'gray', 'warm-gray', 'yellow', 'orange'],
  type: V11_TYPE,
  audit: AUDIT,
  icons: { add: icon('add', 16, 'sg-btn__icon'), chev: icon('chevron--down', 16) },
};

src = src
  .replace(/\{\{icon ([\w-]+) (\d+)((?: [\w-]+)*)\}\}/g, (_, n, s, x) => icon(n, +s, x.trim()))
  .replace(/\{\{DD ([^}]+)\}\}/g, (_, a) => dropdown(a.split(' ')))
  .replace(/\{\{CB ([^}]+)\}\}/g, (_, a) => checkbox(a.split(' ')))
  .replace(/\{\{TG ([^}]+)\}\}/g, (_, a) => toggle(a.split(' ')))
  .replace(/\{\{NT ([^}]+)\}\}/g, (_, a) => notif(a.split(' ')))
  .replace(/\{\{TS ([^}]+)\}\}/g, (_, a) => toast(a.split(' ')))
  .replace('{{ICON_GRID}}', iconGrid)
  .replace('{{THEME_COUNT}}', String(DATA.theme.length))
  .replace('{{V_THEMES}}', tokens.meta.carbon_versions.themes)
  .replace('{{V_COLORS}}', tokens.meta.carbon_versions.colors)
  .replace('{{V_ICONS}}', tokens.meta.carbon_versions.icons)
  .replace('{{DATA}}', JSON.stringify(DATA));
if (/\{\{/.test(src)) throw new Error('unresolved template: ' + src.match(/\{\{[^}]*\}\}/)[0]);

const head = `<title>Seeghra Reference</title>\n<meta name="description" content="Seeghra design system reference: IBM Carbon v11 with Geist.">\n`;
fs.mkdirSync(path.join(D, 'docs'), { recursive: true });
fs.copyFileSync(path.join(D, 'dist/tokens.css'), path.join(D, 'docs/tokens.css'));
fs.writeFileSync(path.join(D, 'docs/index.html'), `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n${head}<link rel="stylesheet" href="tokens.css">\n</head>\n<body>\n${src}\n</body>\n</html>\n`);
console.log('built docs/index.html');
