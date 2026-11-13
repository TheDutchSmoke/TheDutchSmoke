// Version C: "tied with a bow". One satin ribbon runs through the header with the name on it. Along the ribbon,
// in date order, every pull request in someone else's project sits as a knot: a tied bow once it is merged, a loose
// loop while it waits for review.
import { esc, fontFace, write, plural, clip, PROJECTS, helpedLinks } from './lib.mjs';

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

import { MONTHS } from './lib.mjs';

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
<path transform="translate(262 70) scale(.55)" d="M0-12Q2-2 12 0Q2 2 0 12Q-2 2-12 0Q-2-2 0-12Z" fill="${t.spark}"/>
<path transform="translate(180 262) scale(.5)" d="M0-12Q2-2 12 0Q2 2 0 12Q-2 2-12 0Q-2-2 0-12Z" fill="${t.spark}"/>
</g>
</svg>`;
}

// Projects as gift tags hanging from one ribbon. Three images side by side; the ribbon strip runs edge to edge in
// each, so together they read as one ribbon. One file per tag for both themes: the tags carry their own colours.
const MOTIF = {
  map: `<path d="M32 10C25 10 20 15.5 20 22C20 31 32 44 32 44S44 31 44 22C44 15.5 39 10 32 10Z" fill="#D81779"/><circle cx="32" cy="22" r="4.6" fill="#FFF4F8"/>`,
  road: `<path d="M8 28H56" stroke="#A3105A" stroke-width="12"/><path d="M10 28H54" stroke="#FFF4F8" stroke-width="2" stroke-dasharray="4 4"/>
<rect x="14" y="8" width="12" height="12" rx="3.5" fill="#D81779"/><rect x="38" y="36" width="12" height="12" rx="3.5" fill="#F58DBF"/>`,
  sprinkles: [[16, 12, 30, '#D81779'], [30, 10, -20, '#4FA545'], [44, 14, 60, '#3F8FDB'], [16, 26, -50, '#E8961E'], [30, 25, 15, '#9467D8'], [44, 29, -35, '#D81779'], [18, 40, 70, '#3F8FDB'], [32, 39, -10, '#F58DBF'], [46, 42, 40, '#4FA545']]
    .map(([x, y, a, c]) => `<rect x="${x - 5.5}" y="${y - 2.4}" width="11" height="4.8" rx="2.4" fill="${c}" transform="rotate(${a} ${x} ${y})"/>`).join(''),
  tv: `<path d="M24 12L18 4M40 12L46 4" stroke="#A3105A" stroke-width="2.2" stroke-linecap="round"/>
<rect x="8" y="12" width="48" height="32" rx="7" fill="#F58DBF"/><rect x="13" y="17" width="38" height="22" rx="4" fill="#FFF4F8"/>
<path d="M28 23V33L37 28Z" fill="#D81779" stroke="#D81779" stroke-width="1.5" stroke-linejoin="round"/>`,
  elements: `<path d="M19 6C23 12 27 14 26 20C25.5 24 22.5 26.5 19 26.5C15 26.5 12 23.5 12.5 19.5C13 16 16 14.5 16 11C18 13 19 10 19 6Z" fill="#D81779"/>
<path d="M45 6C49 12 52 16 52 20C52 24 49 27 45 27C41 27 38 24 38 20C38 16 41 12 45 6Z" fill="#3F8FDB"/>
<ellipse cx="19" cy="40" rx="9" ry="5" transform="rotate(-38 19 40)" fill="#4FA545"/>
<path d="M36 35H48C51 35 52 32 50 30M36 41H52C55 41 56 44 54 46" fill="none" stroke="#9467D8" stroke-width="2.6" stroke-linecap="round"/>`,
  console: `<rect x="14" y="2" width="36" height="46" rx="8" fill="#F58DBF"/><rect x="19" y="7" width="26" height="17" rx="3" fill="#FFF4F8"/>
<path d="M32 19C31 18 28 16 28 14C28 12 30.5 11.5 32 13.5C33.5 11.5 36 12 36 14C36 16 33 18 32 19Z" fill="#D81779"/>
<rect x="20" y="33" width="10" height="3.6" rx="1.2" fill="#4E2443"/><rect x="23.2" y="29.8" width="3.6" height="10" rx="1.2" fill="#4E2443"/>
<circle cx="39" cy="32" r="2.8" fill="#FFF4F8"/><circle cx="44" cy="37" r="2.8" fill="#FFF4F8"/>`,
};
// Each tag hangs from its own short piece of ribbon, so the row may wrap on a phone without looking broken.
function giftTag(root, p, i) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="170" height="186" viewBox="0 0 170 186" role="img" aria-label="${esc(p.name)}: ${esc(p.short)}">
<style>${fontFace(root, 'Zen Maru Bold', 'zen-maru-bold.woff2', 700)}.n{font-family:'Zen Maru Bold',sans-serif;font-size:19px;letter-spacing:-.4px}.s{font-size:15px;letter-spacing:0}
.sway{transform-origin:85px 22px;animation:sway 6s ease-in-out infinite;animation-delay:${(-i * 1.3).toFixed(1)}s}
@keyframes sway{0%,100%{transform:rotate(-2.5deg)}50%{transform:rotate(2.5deg)}}
@media (prefers-reduced-motion:reduce){.sway{animation:none}}</style>
<path d="M14 6H156L148 14L156 22H14L22 14Z" fill="#D81779"/>
<path d="M22 11H148" stroke="#FF8CC4" stroke-width="2" opacity=".6"/>
<g class="sway">
<path d="M85 20C80 30 90 38 85 56" fill="none" stroke="#A3105A" stroke-width="1.6"/>
<path d="M34 50H136L158 70V170Q158 178 150 178H20Q12 178 12 170V70Z" fill="#FFE1EE" stroke="#D81779" stroke-width="1.8" stroke-linejoin="round"/>
<circle cx="85" cy="62" r="5.5" fill="#FFF4F8" stroke="#D81779" stroke-width="1.6"/>
<g transform="translate(62 74) scale(.72)">${MOTIF[p.key]}</g>
<text class="n" x="85" y="142" text-anchor="middle" fill="#4E2443">${esc(p.name)}</text>
<text class="n s" x="85" y="164" text-anchor="middle" fill="#8A5A7C">${esc(p.short)}</text>
</g>
</svg>`;
}

// The last 12 weeks in cross-stitch inside an embroidery hoop: one stitch per day, darker on busier days.
function hoop(root, s) {
  const weeks = s.weeks.slice(-12), cell = 17, gx = 260 - (weeks.length * cell) / 2, gy = 108;
  const shade = n => (n <= 2 ? '#F5ADCF' : n <= 5 ? '#E86AA8' : '#D81779');
  let k = 0;
  const stitches = weeks.flatMap((wk, i) => wk.map((d, j) => {
    const cx = gx + i * cell + cell / 2, cy = gy + j * cell + cell / 2;
    if (!d.n) return `<circle cx="${cx}" cy="${cy}" r="1.3" fill="#EBCFDD"/>`;
    return `<g class="st" style="animation-delay:${(0.2 + k++ * 0.06).toFixed(2)}s" stroke="${shade(d.n)}"><path d="M${cx - 5} ${cy - 5}L${cx + 5} ${cy + 5}M${cx + 5} ${cy - 5}L${cx - 5} ${cy + 5}"/></g>`;
  }));
  let lastMonth = '';
  const labels = weeks.map((wk, i) => {
    const m = MONTHS[Number(wk[0].date.slice(5, 7)) - 1];
    const out = m !== lastMonth ? `<text class="m" x="${gx + i * cell + cell / 2}" y="${gy + 7 * cell + 18}" text-anchor="middle">${m}</text>` : '';
    lastMonth = m;
    return out;
  }).join('');
  const total = weeks.flat().reduce((a, d) => a + d.n, 0);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="560" height="330" viewBox="0 0 560 330" role="img" aria-label="${esc(`My last 12 weeks in cross-stitch inside an embroidery hoop: one stitch per active day, darker on busier days (${total} contributions).`)}">
<defs><pattern id="aida" width="8.5" height="8.5" patternUnits="userSpaceOnUse"><circle cx="4.25" cy="4.25" r=".9" fill="#F0DCE6"/></pattern></defs>
<style>${fontFace(root, 'Zen Maru Bold', 'zen-maru-bold.woff2', 700)}.m{font-family:'Zen Maru Bold',sans-serif;font-size:14px;fill:#8A5A7C}
.st{stroke-width:3.2;stroke-linecap:round;fill:none;transform-box:fill-box;transform-origin:center;animation:st .5s ease-out both}
.needle{transform-origin:430px 236px;animation:needle 5s ease-in-out infinite}
@keyframes st{from{opacity:0;transform:scale(.4)}to{opacity:1;transform:none}}
@keyframes needle{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(5deg)}}
@media (prefers-reduced-motion:reduce){.st,.needle{animation:none}}</style>
<circle cx="260" cy="172" r="146" fill="#C99566"/>
<circle cx="260" cy="168" r="146" fill="#E9C59A"/>
<circle cx="260" cy="168" r="128" fill="#FFF8FB"/>
<circle cx="260" cy="168" r="128" fill="url(#aida)"/>
<circle cx="260" cy="168" r="128" fill="none" stroke="#D9B183" stroke-width="3"/>
<rect x="240" y="10" width="40" height="22" rx="5" fill="#C99566"/><rect x="236" y="14" width="48" height="10" rx="5" fill="#B9845A"/><circle cx="260" cy="12" r="7" fill="#D6A877"/>
<g class="sts">${stitches.join('')}</g>
${labels}
<g class="needle"><path d="M396 228C430 236 440 268 470 280S520 300 534 318" fill="none" stroke="#D81779" stroke-width="2.4" stroke-linecap="round"/>
<path d="M534 318L552 296" stroke="#9AA3AE" stroke-width="3.4" stroke-linecap="round"/><ellipse cx="549" cy="299" rx="1.2" ry="3" transform="rotate(40 549 299)" fill="#FFF"/></g>
</svg>`;
}

const ICONS = {
  'knot-merged': `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="16" viewBox="-23 -13 46 34" role="img" aria-label="merged">${bowShape({ bow: '#FFE1EE', bowLine: '#D81779' })}</svg>`,
  'knot-open': `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="-10 -16 26 30" role="img" aria-label="open">${loopShape({ loop: '#D81779' })}</svg>`,
};

export function render(root, s) {
  for (const [mode, t] of Object.entries(THEMES)) write(root, `assets/header-${mode}.svg`, header(root, t, s));
  PROJECTS.forEach((p, i) => write(root, `assets/tag-${p.key}.svg`, giftTag(root, p, i)));
  write(root, 'assets/hoop.svg', hoop(root, s));
  for (const [name, svg] of Object.entries(ICONS)) write(root, `assets/${name}.svg`, svg);

  const list = s.prs.slice(0, 5).map(p =>
    `<img src="assets/knot-${p.status}.svg" height="14" alt="${p.status}"> &nbsp;<a href="${p.url}"><b>${esc(p.repo)}</b> #${p.number}</a> &nbsp;${esc(clip(p.title, 58))}`,
  ).join('<br>\n');
  const lately = `<p><sub>${s.merged} bows and ${s.open} loose loops so far, across ${s.repos} projects. The newest knots:</sub><br>\n${list}</p>\n<p>I like helping out in other people's projects: ${helpedLinks(s)}.</p>`;
  const tags = `<p align="center">${PROJECTS.map(p => `<a href="${p.url}"><img src="assets/tag-${p.key}.svg" width="130" alt="${esc(p.name)}: ${esc(p.long)}"></a>`).join('&nbsp;')}</p>`;
  return { lately, tags };
}
