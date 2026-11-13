// Version A: "my little corner". The pink browser window with the heart-faced computer, refined, plus a desk plant
// whose blossoms follow the number of active days in the last 30 days.
import { esc, fontFace, write, plural, clip } from './lib.mjs';

const THEMES = {
  light: {
    bg1: '#FFF3F9', bg2: '#F1E9FF', chrome: '#FFE0EF', line: '#EDBDD7', accent: '#D81779', soft: '#F5ADCF',
    ink: '#502A49', muted: '#865B7C', face: '#FFFBFE', screen: '#FCE6F3', shade: '#E7B5D2',
    leaf: '#8DBE98', leafDeep: '#5E9470', pot: '#CDBDF2', potRim: '#B9A5EC', soil: '#8B6A7E', bud: '#F7C6DD',
  },
  dark: {
    bg1: '#291E31', bg2: '#33244A', chrome: '#392338', line: '#704664', accent: '#FF8DC4', soft: '#B96191',
    ink: '#FFE9F5', muted: '#D7AFC8', face: '#46314C', screen: '#34283F', shade: '#19151F',
    leaf: '#78AE86', leafDeep: '#4F8461', pot: '#5E4A7C', potRim: '#6F5A90', soil: '#2A1F2C', bud: '#8E4D72',
  },
};

const PHRASES = ['welcome to my little corner ♡', 'self-hosting little things', 'making small tools', 'playing the occasional game'];

const heart = (fill, extra = '') => `<path ${extra} d="M0 9C-3 6-12 0-12-6C-12-14-3-16 0-8C3-16 12-14 12-6C12 0 3 6 0 9Z" fill="${fill}"/>`;
const star = (x, y, s, fill, cls = '') =>
  `<path class="${cls}" transform="translate(${x} ${y}) scale(${s})" d="M0-12Q2-2 12 0Q2 2 0 12Q-2 2-12 0Q-2-2 0-12Z" fill="${fill}"/>`;
const blossom = (t, r) =>
  [0, 72, 144, 216, 288].map(a => `<ellipse cx="0" cy="${-r * 0.9}" rx="${r * 0.7}" ry="${r}" transform="rotate(${a})"/>`).join('') +
  `<circle r="${r * 0.42}" fill="${t.accent}"/>`;

// The plant: three stems, leaves, and nine places where a blossom (or a closed bud) can sit.
const SLOTS = [
  [952, 118, 15], [990, 88, 16], [1030, 128, 14], // tips
  [965, 160, 11], [1003, 136, 11], [1016, 170, 10], // along the stems
  [942, 150, 9], [1043, 158, 9], [978, 122, 9], // little side shoots
];

function plant(t, blooms) {
  const stems = [
    'M985 218C980 190 962 160 952 118', 'M987 218C990 170 992 130 990 88', 'M989 218C1000 190 1022 160 1030 128',
    'M968 172C958 166 948 160 942 150', 'M1008 182C1022 176 1036 168 1043 158', 'M988 150C984 140 980 132 978 122',
  ];
  const leaves = [[968, 180, -38, 15], [1004, 196, 34, 14], [958, 140, -20, 12], [1024, 150, 30, 12], [992, 120, 8, 11], [975, 205, -60, 10]];
  const parts = SLOTS.map(([x, y, r], i) => i < blooms
    ? `<g transform="translate(${x} ${y})"><g class="bloom" style="animation-delay:${(0.35 + i * 0.22).toFixed(2)}s" fill="${t.soft}">${blossom(t, r)}</g></g>`
    : `<g transform="translate(${x} ${y})"><ellipse rx="${(r * 0.42).toFixed(1)}" ry="${(r * 0.62).toFixed(1)}" fill="${t.bud}"/><path d="M${-r * 0.42} ${r * 0.2}Q0 ${r * 0.75} ${r * 0.42} ${r * 0.2}" fill="${t.leaf}"/></g>`);
  return `<g class="sway">
${stems.map(d => `<path d="${d}" fill="none" stroke="${t.leafDeep}" stroke-width="3" stroke-linecap="round"/>`).join('\n')}
${leaves.map(([x, y, a, s]) => `<ellipse cx="${x}" cy="${y}" rx="${s}" ry="${s * 0.45}" transform="rotate(${a} ${x} ${y})" fill="${t.leaf}"/>`).join('\n')}
${parts.join('\n')}
</g>
<path d="M941 222H1029L1018 278H952Z" fill="${t.pot}"/>
<rect x="936" y="212" width="98" height="16" rx="8" fill="${t.potRim}"/>
<g transform="translate(985 252) scale(0.62)">${heart(t.face, 'opacity=".75"')}</g>`;
}

function computer(t) {
  // The incumbent drawing, scaled into the new header.
  return `<g transform="translate(73 27) scale(0.82)"><g transform="rotate(5 885 210)">
<ellipse cx="889" cy="309" rx="112" ry="12" fill="${t.shade}" opacity=".5"/>
<path d="M869 258L860 296H915L907 258Z" fill="${t.soft}" stroke="${t.line}" stroke-width="2"/>
<rect x="833" y="291" width="110" height="13" rx="6.5" fill="${t.chrome}" stroke="${t.line}" stroke-width="2"/>
<rect x="775" y="113" width="225" height="161" rx="22" fill="${t.soft}"/>
<rect x="775" y="106" width="225" height="161" rx="22" fill="${t.face}" stroke="${t.line}" stroke-width="2"/>
<rect x="791" y="123" width="193" height="111" rx="13" fill="${t.screen}" stroke="${t.line}"/>
<g class="float">
<g transform="translate(888 174) scale(2)">${heart(t.accent)}</g>
<g class="blink"><circle cx="879" cy="170" r="2.4" fill="${t.face}"/><circle cx="897" cy="170" r="2.4" fill="${t.face}"/></g>
<path d="M883 177Q888 183 893 177" fill="none" stroke="${t.face}" stroke-width="2.2" stroke-linecap="round"/>
</g>
<circle cx="974" cy="250" r="3" fill="${t.accent}"/>
<path d="M877 249H899" stroke="${t.line}" stroke-width="3" stroke-linecap="round"/>
</g>
<g transform="translate(979 112) rotate(15)" fill="${t.chrome}" stroke="${t.accent}" stroke-width="2.5" stroke-linejoin="round">
<path d="M0 0C-17-23-43-19-36 1C-30 13-9 10 0 0ZM0 0C17-23 43-19 36 1C30 13 9 10 0 0Z"/>
<path d="M-3 2L-20 30L-6 26L-2 34L6 3M4 3L20 30L25 21L35 23L11-2"/>
<ellipse rx="7" ry="8"/>
</g></g>`;
}

function header(root, t, s) {
  const blooms = Math.min(SLOTS.length, Math.round((s.active30 * SLOTS.length) / 15));
  const desc = `A pink browser window with a little heart-faced computer wearing a bow, and a plant in a pot next to it with ${plural(blooms, 'blossom', 'blossoms')}: one for roughly every active day this month. The line under the name cycles through: ${PHRASES.join(', ')}.`;
  return {
    blooms,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="1100" height="300" viewBox="0 0 1100 300" role="img" aria-labelledby="t d">
<title id="t">hi, i'm TheDutchSmoke.</title><desc id="d">${esc(desc)}</desc>
<defs>
<linearGradient id="bg" x2="1" y2="1"><stop stop-color="${t.bg1}"/><stop offset="1" stop-color="${t.bg2}"/></linearGradient>
<clipPath id="clip"><rect x="1" y="1" width="1098" height="298" rx="26"/></clipPath>
</defs>
<style>
${fontFace(root, 'Zen Maru Black', 'zen-maru-black.woff2', 900)}
${fontFace(root, 'Zen Maru Bold', 'zen-maru-bold.woff2', 700)}
.name{font-family:'Zen Maru Black',sans-serif;font-size:56px;letter-spacing:-1px}
.phrase{font-family:'Zen Maru Bold',sans-serif;font-size:31px;opacity:0;animation:phrase 14s infinite both}
.twinkle{animation:twinkle 7s ease-in-out infinite}.late{animation-delay:-3s}
.float{animation:float 8s ease-in-out infinite}
.blink{transform-box:fill-box;transform-origin:center;animation:blink 6s infinite}
.sway{transform-origin:985px 218px;animation:sway 9s ease-in-out infinite}
.bloom{transform-box:fill-box;transform-origin:center;animation:bloom .9s cubic-bezier(.3,1.6,.5,1) both}
@keyframes phrase{0%{opacity:0;transform:translateY(8px)}3%{opacity:1;transform:none}23%{opacity:1;transform:none}26%{opacity:0;transform:translateY(-8px)}100%{opacity:0}}
@keyframes twinkle{0%,100%{opacity:.4}50%{opacity:1}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
@keyframes blink{0%,46%,50%,100%{transform:scaleY(1)}48%{transform:scaleY(.1)}}
@keyframes sway{0%,100%{transform:rotate(-1.4deg)}50%{transform:rotate(1.4deg)}}
@keyframes bloom{from{transform:scale(0)}to{transform:scale(1)}}
@media (prefers-reduced-motion:reduce){.phrase,.twinkle,.float,.blink,.sway,.bloom{animation:none}.p0{opacity:1}}
</style>
<g clip-path="url(#clip)">
<rect width="1100" height="300" fill="url(#bg)"/>
<rect width="1100" height="44" fill="${t.chrome}"/>
<path d="M0 44H1100" stroke="${t.line}"/>
<circle cx="28" cy="22" r="5" fill="${t.accent}"/><circle cx="46" cy="22" r="5" fill="${t.soft}"/><circle cx="64" cy="22" r="5" fill="${t.line}"/>
<g transform="translate(1066 24) scale(0.62)">${heart(t.accent)}</g>
<circle cx="900" cy="214" r="150" fill="${t.chrome}" opacity=".5"/>
<text class="name" x="54" y="152" fill="${t.ink}">hi, i'm TheDutchSmoke<tspan fill="${t.accent}">.</tspan></text>
${PHRASES.map((p, i) => `<text class="phrase p${i}" x="56" y="208" fill="${i % 2 ? t.muted : t.accent}" style="animation-delay:${i * 3.5}s">${esc(p)}</text>`).join('\n')}
<path d="M690 278H1072" stroke="${t.line}" stroke-width="2" stroke-linecap="round"/>
${computer(t)}
${plant(t, blooms)}
${star(668, 104, 1.1, t.accent, 'twinkle')}
${star(1050, 232, 0.8, t.accent, 'twinkle late')}
${star(892, 78, 0.6, t.accent, 'twinkle late')}
<circle cx="640" cy="236" r="2.5" fill="${t.soft}"/><circle cx="1012" cy="64" r="2.5" fill="${t.soft}"/>
</g>
<rect x="1" y="1" width="1098" height="298" rx="26" fill="none" stroke="${t.line}" stroke-width="2"/>
</svg>`,
  };
}

// Project art on a 64x64 grid, shown as desktop icons (tile + label) under the window.
const ART = {
  map: `<path d="M14 21L25 17L39 21L50 17V44L39 48L25 44L14 48Z" fill="#F1E9FF" stroke="#C9B6EE" stroke-width="2" stroke-linejoin="round"/>
<path d="M25 17V44M39 21V48" stroke="#C9B6EE" stroke-width="2"/>
<path d="M32 15C26 15 22 19.5 22 25C22 32 32 41 32 41C32 41 42 32 42 25C42 19.5 38 15 32 15Z" fill="#D81779"/>
<circle cx="32" cy="25" r="4" fill="#FFFBFE"/>`,
  road: `<rect x="8" y="26" width="48" height="18" fill="#B8A9D9"/>
<path d="M11 35H53" stroke="#FFFBFE" stroke-width="2.5" stroke-dasharray="5 5" stroke-linecap="round"/>
<rect x="16" y="12" width="14" height="14" rx="4" fill="#FFFBFE" stroke="#D81779" stroke-width="2"/>
<circle cx="21" cy="18" r="1.6" fill="#502A49"/><circle cx="26" cy="18" r="1.6" fill="#502A49"/>
<rect x="36" y="44" width="14" height="14" rx="4" fill="#F5ADCF" stroke="#D81779" stroke-width="2"/>
<circle cx="41" cy="50" r="1.6" fill="#502A49"/><circle cx="46" cy="50" r="1.6" fill="#502A49"/>`,
  sprinkles: [
    [20, 20, 30, '#D81779'], [32, 18, -20, '#9DCB7E'], [45, 21, 60, '#8FB8F0'], [19, 33, -50, '#F7B955'], [32, 32, 15, '#B98CE8'],
    [45, 34, -35, '#D81779'], [21, 46, 70, '#8FB8F0'], [33, 45, -10, '#F5ADCF'], [45, 46, 40, '#9DCB7E'],
  ].map(([x, y, a, c]) => `<rect x="${x - 5}" y="${y - 2.2}" width="10" height="4.4" rx="2.2" fill="${c}" transform="rotate(${a} ${x} ${y})"/>`).join('\n'),
};
export const APPS = [
  { key: 'map', name: 'Incidentenkaart', url: 'https://incidentenkaart.nl', alt: 'Incidentenkaart: incident reports in the Netherlands on one map, with traceable sources' },
  { key: 'road', name: 'Crossy Rivals', url: 'https://crossyrivals.com', alt: 'Crossy Rivals: a Crossy Road-style browser game for up to 20 players at once' },
  { key: 'sprinkles', name: 'SprinkleGrid', url: 'https://sprinklegrid.nl', alt: 'SprinkleGrid: a colourful gallery experiment with seasonal themes' },
];
function appIcon(root, t, app) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150" role="img" aria-label="${esc(app.name)}">
<style>${fontFace(root, 'Zen Maru Bold', 'zen-maru-bold.woff2', 700)}.l{font-family:'Zen Maru Bold',sans-serif;font-size:18px;letter-spacing:-.3px}</style>
<ellipse cx="75" cy="106" rx="40" ry="5" fill="${t.shade}" opacity=".55"/>
<g transform="translate(27 6) scale(1.5)"><rect x="1" y="1" width="62" height="62" rx="16" fill="#FFE0EF" stroke="#EDBDD7" stroke-width="2"/>${ART[app.key]}</g>
<text class="l" x="75" y="136" text-anchor="middle" fill="${t.ink}">${esc(app.name)}</text>
</svg>`;
}

const ICONS = {
  'heart-merged': `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="-13 -13 26 26" role="img" aria-label="merged"><path d="M0 9C-3 6-12 0-12-6C-12-14-3-16 0-8C3-16 12-14 12-6C12 0 3 6 0 9Z" fill="#D81779"/></svg>`,
  'heart-open': `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="-13 -13 26 26" role="img" aria-label="open"><path d="M0 9C-3 6-12 0-12-6C-12-14-3-16 0-8C3-16 12-14 12-6C12 0 3 6 0 9Z" fill="none" stroke="#D81779" stroke-width="2.6" stroke-linejoin="round"/></svg>`,
};

function divider(t) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1100" height="36" viewBox="0 0 1100 36" aria-hidden="true">
<path d="M0 18H500M600 18H1100" stroke="${t.line}"/>
${star(524, 18, 0.32, t.accent)}<g transform="translate(550 20) scale(0.55)">${heart(t.accent)}</g>${star(576, 18, 0.32, t.accent)}
</svg>`;
}

export function render(root, s) {
  let blooms = 0;
  for (const [mode, t] of Object.entries(THEMES)) {
    const h = header(root, t, s);
    blooms = h.blooms;
    write(root, `assets/header-${mode}.svg`, h.svg);
    write(root, `assets/divider-${mode}.svg`, divider(t));
    for (const app of APPS) write(root, `assets/app-${app.key}-${mode}.svg`, appIcon(root, t, app));
  }
  for (const [name, svg] of Object.entries(ICONS)) write(root, `assets/${name}.svg`, svg);

  const stats = `<p align="center"><sub>${[
    `<b>${s.active30}</b> active days this month, so the plant has ${plural(blooms, 'blossom', 'blossoms')}`,
    `<b>${s.year}</b> contributions this year`,
  ].join(' &nbsp;·&nbsp; ')}</sub></p>`;
  const list = s.prs.slice(0, 4).map(p =>
    `<img src="assets/heart-${p.status}.svg" width="13" height="13" alt="${p.status}"> &nbsp;<a href="${p.url}"><b>${esc(p.repo)}</b> #${p.number}</a> &nbsp;${esc(clip(p.title, 60))}`,
  ).join('<br>\n');
  const lately = `<p align="center"><sub>${s.merged} pull requests merged in other people's projects so far, ${s.open} still waiting. The newest (filled heart = merged):</sub></p>\n<p align="center">\n${list}\n</p>`;
  return { stats, lately };
}
