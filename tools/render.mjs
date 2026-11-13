// Version C: "tied with a bow". One satin ribbon runs through the header with the name on it. Along the ribbon,
// in date order, every pull request in someone else's project sits as a knot: a tied bow once it is merged, a loose
// loop while it waits for review.
import { esc, fontFace, write, plural, clip } from './lib.mjs';

const THEMES = {
  light: {
    ground: '#FFF4F8', stitch: '#F0C3D8', ink: '#4E2443', muted: '#8A5A7C', ribbon: '#D81779', edge: '#A3105A',
    sheen: '#FF8CC4', text: '#FFF7FB', bow: '#FFE1EE', bowLine: '#A3105A', loop: '#FFF7FB', spark: '#E7A3C5',
  },
  dark: {
    ground: '#211520', stitch: '#4E2E46', ink: '#FCE6F2', muted: '#D2A9C4', ribbon: '#E0368E', edge: '#8F1352',
    sheen: '#FF9FCF', text: '#FFF7FB', bow: '#FFD6E8', bowLine: '#7E0F47', loop: '#FFF0F7', spark: '#7A4569',
  },
};

// The ribbon's centre line as cubic segments, with an arc-length table so things can be placed along it.
const SEGS = [
  [[-40, 196], [150, 128], [330, 250], [530, 184]],
  [[530, 184], [720, 120], [890, 232], [1140, 166]],
];
const PATH = `M${SEGS[0][0].join(' ')}` + SEGS.map(([, a, b, c]) => `C${a.join(' ')} ${b.join(' ')} ${c.join(' ')}`).join('');
const bez = ([p0, p1, p2, p3], t) => [0, 1].map(i => (1 - t) ** 3 * p0[i] + 3 * (1 - t) ** 2 * t * p1[i] + 3 * (1 - t) * t ** 2 * p2[i] + t ** 3 * p3[i]);
const TABLE = (() => {
  const pts = [];
  SEGS.forEach(seg => { for (let i = 0; i <= 400; i++) pts.push(bez(seg, i / 400)); });
  let len = 0;
  return pts.map((p, i) => { if (i) len += Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]); return { x: p[0], y: p[1], len }; });
})();
const TOTAL = TABLE.at(-1).len;
function at(len) {
  const i = Math.max(1, TABLE.findIndex(p => p.len >= len));
  const a = TABLE[i - 1], b = TABLE[i];
  return { x: b.x, y: b.y, deg: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI };
}

const bowShape = (t) => `<g stroke="${t.bowLine}" stroke-width="1.6" stroke-linejoin="round" fill="${t.bow}">
<path d="M-2 0C-8-12-22-12-21-2C-20 7-8 5-2 0Z"/><path d="M2 0C8-12 22-12 21-2C20 7 8 5 2 0Z"/>
<path d="M-2 2L-9 15L-4 14L-2 18L1 3M1 3L8 15L10 11L14 12L3 1" />
<ellipse rx="4" ry="4.6"/></g>`;
const loopShape = (t) => `<g fill="none" stroke="${t.loop}" stroke-width="2" stroke-linecap="round">
<path d="M0 0C-6-14 12-16 8-3C5 5-3 6 0 0Z" stroke-dasharray="3 3"/><path d="M0 0L-6 12" stroke-dasharray="3 3"/></g>`;

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

function header(root, t, s) {
  const knots = [...s.prs].reverse().slice(-14); // oldest left, newest right
  const from = 520, to = TOTAL - 70;
  const step = knots.length > 1 ? (to - from) / (knots.length - 1) : 0;
  let lastMonth = '', lastX = -999;
  const placed = knots.map((p, i) => {
    const pos = at(from + i * step);
    const month = MONTHS[Number(p.date.slice(5, 7)) - 1];
    // A month name under the first knot of each month, skipped when it would crowd the previous one.
    const show = month !== lastMonth && pos.x - lastX > 56;
    const label = show ? `<text class="small" x="${pos.x.toFixed(1)}" y="${(pos.y + 58).toFixed(1)}" text-anchor="middle" fill="${t.muted}">${month}</text>` : '';
    if (show) lastX = pos.x;
    lastMonth = month;
    return `<g transform="translate(${pos.x.toFixed(1)} ${pos.y.toFixed(1)}) rotate(${pos.deg.toFixed(1)})"><g class="${p.status === 'merged' ? 'wiggle' : ''}" style="animation-delay:${(i * 0.37).toFixed(2)}s">${p.status === 'merged' ? bowShape(t) : loopShape(t)}</g></g>${label}`;
  });
  const merged = knots.filter(k => k.status === 'merged').length;
  const desc = `A pink satin ribbon with TheDutchSmoke written on it. Further along, every pull request in someone else's project sits on the ribbon in date order: ${plural(merged, 'tied bow', 'tied bows')} for merged ones and ${plural(knots.length - merged, 'loose loop', 'loose loops')} for those still waiting for review.`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1100" height="300" viewBox="0 0 1100 300" role="img" aria-labelledby="t d">
<title id="t">hi, i'm TheDutchSmoke</title><desc id="d">${esc(desc)}</desc>
<defs><clipPath id="clip"><rect width="1100" height="300" rx="26"/></clipPath><path id="rib" d="${PATH}"/></defs>
<style>
${fontFace(root, 'Kaisei Name', 'kaisei-decol-name.woff2', 700)}
${fontFace(root, 'Kaisei Text', 'kaisei-decol-text.woff2', 500)}
.name{font-family:'Kaisei Name',serif;font-size:42px;letter-spacing:.5px}
.small{font-family:'Kaisei Text',serif;font-size:17px}
.hi{font-family:'Kaisei Text',serif;font-size:34px}
.glint{stroke-dasharray:140 1400;animation:glint 7s ease-in-out infinite}
.wiggle{animation:wiggle 5s ease-in-out infinite}
@keyframes glint{0%{stroke-dashoffset:200}55%,100%{stroke-dashoffset:-1360}}
@keyframes wiggle{0%,100%{transform:rotate(0)}50%{transform:rotate(7deg)}}
@media (prefers-reduced-motion:reduce){.glint{animation:none;stroke-dashoffset:200}.wiggle{animation:none}}
</style>
<g clip-path="url(#clip)">
<rect width="1100" height="300" fill="${t.ground}"/>
<rect x="12" y="12" width="1076" height="276" rx="18" fill="none" stroke="${t.stitch}" stroke-width="2" stroke-dasharray="7 6"/>
<text class="hi" x="56" y="96" fill="${t.ink}">hi, i’m</text>
<use href="#rib" fill="none" stroke="${t.edge}" stroke-width="70"/>
<use href="#rib" fill="none" stroke="${t.ribbon}" stroke-width="64"/>
<use href="#rib" fill="none" stroke="${t.sheen}" stroke-width="10" opacity=".35"/>
<use href="#rib" class="glint" fill="none" stroke="#FFFFFF" stroke-width="22" stroke-linecap="round" opacity=".22"/>
<use href="#rib" fill="none" stroke="${t.text}" stroke-width="1.4" stroke-dasharray="5 5" opacity=".55" transform="translate(0 -25)"/>
<use href="#rib" fill="none" stroke="${t.text}" stroke-width="1.4" stroke-dasharray="5 5" opacity=".55" transform="translate(0 25)"/>
<text class="name" fill="${t.text}" dy="14"><textPath href="#rib" startOffset="96">TheDutchSmoke</textPath></text>
${placed.join('\n')}
<text class="small" x="1044" y="84" text-anchor="end" fill="${t.muted}">every bow is a pull request merged in someone else’s project</text>
<path transform="translate(1062 60) scale(.7)" d="M0-12Q2-2 12 0Q2 2 0 12Q-2 2-12 0Q-2-2 0-12Z" fill="${t.spark}"/>
<path transform="translate(560 72) scale(.55)" d="M0-12Q2-2 12 0Q2 2 0 12Q-2 2-12 0Q-2-2 0-12Z" fill="${t.spark}"/>
<path transform="translate(180 262) scale(.5)" d="M0-12Q2-2 12 0Q2 2 0 12Q-2 2-12 0Q-2-2 0-12Z" fill="${t.spark}"/>
</g>
</svg>`;
}

// 64x64 gift-tag icons, one file for both themes.
const tag = (inner, label) => `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" role="img" aria-label="${esc(label)}">
<path d="M6 8C3 8 10 2 16 6" fill="none" stroke="#D81779" stroke-width="2" stroke-linecap="round"/>
<path d="M12 10H52Q58 10 58 16V52Q58 58 52 58H12Q6 58 6 52V22Z" fill="#FFE1EE" stroke="#D81779" stroke-width="2" stroke-linejoin="round"/>
<circle cx="15" cy="19" r="3" fill="#FFF4F8" stroke="#D81779" stroke-width="1.6"/>
${inner}
</svg>`;
const ICONS = {
  'icon-map': tag(`<path d="M34 22C28.5 22 25 26 25 31C25 37.5 34 46 34 46S43 37.5 43 31C43 26 39.5 22 34 22Z" fill="#D81779"/><circle cx="34" cy="31" r="3.6" fill="#FFF4F8"/>`, 'a map pin on a gift tag'),
  'icon-road': tag(`<path d="M18 36H52" stroke="#A3105A" stroke-width="10"/><path d="M19 36H51" stroke="#FFF4F8" stroke-width="2" stroke-dasharray="4 4"/>
<rect x="22" y="20" width="10" height="10" rx="3" fill="#D81779"/><rect x="38" y="43" width="10" height="10" rx="3" fill="#F58DBF"/>`, 'two little players crossing a road on a gift tag'),
  'icon-sprinkles': tag([[24, 24, 30, '#D81779'], [36, 22, -20, '#7CBF6A'], [46, 27, 60, '#5FA8E8'], [24, 37, -50, '#F2A93B'], [36, 35, 15, '#A57BE0'], [46, 40, -35, '#D81779'], [26, 49, 70, '#5FA8E8'], [38, 48, -10, '#F58DBF']]
    .map(([x, y, a, c]) => `<rect x="${x - 4.5}" y="${y - 2}" width="9" height="4" rx="2" fill="${c}" transform="rotate(${a} ${x} ${y})"/>`).join(''), 'sprinkles on a gift tag'),
  'knot-merged': `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="16" viewBox="-23 -13 46 34" role="img" aria-label="merged">${bowShape({ bow: '#FFE1EE', bowLine: '#D81779' })}</svg>`,
  'knot-open': `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="-10 -16 26 30" role="img" aria-label="open">${loopShape({ loop: '#D81779' })}</svg>`,
};

function divider(t) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1100" height="40" viewBox="0 0 1100 40" aria-hidden="true">
<path d="M0 20H1100" stroke="${t.ribbon}" stroke-width="5"/><path d="M0 20H1100" stroke="${t.sheen}" stroke-width="1.2" opacity=".5"/>
<g transform="translate(550 19)">${bowShape(t)}</g>
</svg>`;
}

export function render(root, s) {
  for (const [mode, t] of Object.entries(THEMES)) {
    write(root, `assets/header-${mode}.svg`, header(root, t, s));
    write(root, `assets/divider-${mode}.svg`, divider(t));
  }
  for (const [name, svg] of Object.entries(ICONS)) write(root, `assets/${name}.svg`, svg);

  const stats = `<p align="center"><sub>${[
    `<b>${s.merged}</b> bows tied: pull requests merged elsewhere`,
    `<b>${s.open}</b> still loose`,
    `<b>${s.year}</b> contributions this year`,
  ].join(' &nbsp;·&nbsp; ')}</sub></p>`;
  const lately = s.prs.slice(0, 5).map(p =>
    `<img src="assets/knot-${p.status}.svg" height="14" alt="${p.status}"> &nbsp;<a href="${p.url}"><b>${esc(p.repo)}</b> #${p.number}</a> &nbsp;${esc(clip(p.title, 64))}`,
  ).join('<br>\n');
  const tally = `<sub>${s.merged} merged and ${s.open} waiting for review, across ${s.repos} projects &nbsp;·&nbsp; bow = merged, loose loop = waiting</sub>`;
  return { stats, lately: `<p>\n${lately}\n</p>\n<p>${tally}</p>` };
}
