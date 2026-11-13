// Version A: "my little corner". The pink browser window with the heart-faced computer, refined, plus a desk plant
// whose blossoms follow the number of active days in the last 30 days, a row of pots for the last 12 weeks and a jam
// jar of what my pull requests are made of.
import { esc, fontFace, write, plural, clip, PROJECTS, helpedLinks, MONTHS } from './lib.mjs';

const THEMES = {
  light: {
    paper: '#FFF5F8', pen: '#4B2843', chrome: '#FFE2EE', line: '#EDBDD7', accent: '#D81779', soft: '#F5ADCF',
    ink: '#502A49', muted: '#865B7C', face: '#FFFBFE', screen: '#FCE6F3', shade: '#E7B5D2',
    leaf: '#8DBE98', leafDeep: '#5E9470', pot: '#CDBDF2', potRim: '#B9A5EC', soil: '#8B6A7E', bud: '#F7C6DD',
  },
  dark: {
    paper: '#2A1F2D', pen: '#F5DCE9', chrome: '#3B2738', line: '#704664', accent: '#FF8DC4', soft: '#B96191',
    ink: '#FFE9F5', muted: '#D7AFC8', face: '#46314C', screen: '#34283F', shade: '#19151F',
    leaf: '#78AE86', leafDeep: '#4F8461', pot: '#5E4A7C', potRim: '#6F5A90', soil: '#2A1F2C', bud: '#8E4D72',
  },
};

const PHRASES = ['welcome to my little corner ♡', 'self-hosting little things', 'making small tools', 'playing the occasional game'];

// The hand-made look, shared by every picture: lines get a slight wobble like a fine ink pen ("rough"), the paper a
// soft speckle ("grain"). No gradients, glows or sparkles: those read as machine-made.
const FONT = 'Yusei Magic';
const font = root => fontFace(root, FONT, 'yusei-magic.woff2', 400);
const rgb = h => [1, 3, 5].map(i => (parseInt(h.slice(i, i + 2), 16) / 255).toFixed(3));
function inkDefs(t, wobble = 3.5) {
  const [r, g, b] = rgb(t.pen);
  return `<filter id="rough" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".03" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="${wobble}" xChannelSelector="R" yChannelSelector="G"/></filter>
<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="2" seed="9" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 ${r} 0 0 0 0 ${g} 0 0 0 0 ${b} .7 0 0 0 -.42"/></filter>`;
}
const grain = (w, h) => `<rect width="${w}" height="${h}" filter="url(#grain)"/>`;
const EASE = 'cubic-bezier(.22,1,.36,1)';

const DARK_INK = '#4B2843';
const HEART = 'M0 9C-3 6-12 0-12-6C-12-14-3-16 0-8C3-16 12-14 12-6C12 0 3 6 0 9Z';
const heart = (fill, extra = '') => `<path ${extra} d="${HEART}" fill="${fill}"/>`;
// a little heart drawn with the pen, filled or open
const doodleHeart = (x, y, s, t, fill = 'none', rot = 0) =>
  `<path transform="translate(${x} ${y}) rotate(${rot}) scale(${s})" d="${HEART}" fill="${fill}" stroke="${t.pen}" stroke-width="${(2.2 / s).toFixed(2)}" stroke-linejoin="round"/>`;
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
    ? `<g transform="translate(${x} ${y})"><g class="bloom" style="animation-delay:${(0.35 + i * 0.22).toFixed(2)}s" fill="${t.soft}" stroke="${t.pen}" stroke-width="1.1">${blossom(t, r)}</g></g>`
    : `<g transform="translate(${x} ${y})" stroke="${t.pen}" stroke-width="1.4"><ellipse rx="${(r * 0.42).toFixed(1)}" ry="${(r * 0.62).toFixed(1)}" fill="${t.bud}"/><path d="M${-r * 0.42} ${r * 0.2}Q0 ${r * 0.75} ${r * 0.42} ${r * 0.2}" fill="${t.leaf}"/></g>`);
  return `<g class="sway">
${stems.map(d => `<path d="${d}" fill="none" stroke="${t.leafDeep}" stroke-width="3" stroke-linecap="round"/>`).join('\n')}
${leaves.map(([x, y, a, s]) => `<ellipse cx="${x}" cy="${y}" rx="${s}" ry="${s * 0.45}" transform="rotate(${a} ${x} ${y})" fill="${t.leaf}" stroke="${t.pen}" stroke-width="1.4"/>`).join('\n')}
${parts.join('\n')}
</g>
<g stroke="${t.pen}" stroke-width="2.6" stroke-linejoin="round">
<path d="M941 222H1029L1018 278H952Z" fill="${t.pot}"/>
<rect x="936" y="212" width="98" height="16" rx="8" fill="${t.potRim}"/>
</g>
${doodleHeart(985, 252, 0.6, t, t.face)}`;
}

function computer(t, heartScale = 2) {
  // The incumbent drawing, now with pen outlines.
  return `<g transform="translate(73 27) scale(0.82)"><g transform="rotate(5 885 210)" stroke-linejoin="round">
<ellipse cx="889" cy="309" rx="104" ry="10" fill="${t.shade}" opacity=".5"/>
<path d="M869 258L860 296H915L907 258Z" fill="${t.soft}" stroke="${t.pen}" stroke-width="3"/>
<rect x="833" y="291" width="110" height="13" rx="6.5" fill="${t.chrome}" stroke="${t.pen}" stroke-width="3"/>
<rect x="778" y="113" width="225" height="161" rx="22" fill="${t.soft}" stroke="${t.pen}" stroke-width="3"/>
<rect x="775" y="106" width="225" height="161" rx="22" fill="${t.face}" stroke="${t.pen}" stroke-width="3"/>
<rect x="791" y="123" width="193" height="111" rx="13" fill="${t.screen}" stroke="${t.pen}" stroke-width="2.4"/>
<g class="float">
<g transform="translate(888 ${heartScale > 2 ? 177 : 174}) scale(${heartScale})">${heart(t.accent, `stroke="${t.pen}" stroke-width="${(2.4 / heartScale).toFixed(2)}"`)}</g>
<g class="blink"><circle cx="879" cy="170" r="2.4" fill="${t.face}"/><circle cx="897" cy="170" r="2.4" fill="${t.face}"/></g>
<path d="M883 177Q888 183 893 177" fill="none" stroke="${t.face}" stroke-width="2.2" stroke-linecap="round"/>
</g>
<circle cx="974" cy="250" r="3.4" fill="${t.accent}" stroke="${t.pen}" stroke-width="1.6"/>
<path d="M877 249H899" stroke="${t.pen}" stroke-width="3" stroke-linecap="round"/>
</g>
<g transform="translate(979 112) rotate(15)" fill="${t.soft}" stroke="${t.pen}" stroke-width="2.6" stroke-linejoin="round">
<path d="M0 0C-17-23-43-19-36 1C-30 13-9 10 0 0ZM0 0C17-23 43-19 36 1C30 13 9 10 0 0Z"/>
<path d="M-3 2L-20 30L-6 26L-2 34L6 3M4 3L20 30L25 21L35 23L11-2"/>
<ellipse rx="7" ry="8"/>
</g></g>`;
}

// The three little circles in a window bar, drawn with the pen; the first one coloured in.
const winDots = t => `<g stroke="${t.pen}" stroke-width="2.2"><circle cx="28" cy="24" r="6" fill="${t.accent}"/><circle cx="48" cy="24" r="6" fill="none"/><circle cx="68" cy="24" r="6" fill="none"/></g>`;

function header(root, t, s) {
  const blooms = Math.min(SLOTS.length, Math.round((s.active30 * SLOTS.length) / 15));
  const desc = `A hand-drawn pink window with a little heart-faced computer wearing a bow, and a plant in a pot next to it with ${plural(blooms, 'blossom', 'blossoms')}: the more days I was active in the last month, the more it blooms. The line under the name cycles through: ${PHRASES.join(', ')}.`;
  return {
    blooms,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="1100" height="300" viewBox="0 0 1100 300" role="img" aria-labelledby="t d">
<title id="t">hi, i'm TheDutchSmoke.</title><desc id="d">${esc(desc)}</desc>
<defs>
${inkDefs(t)}
<clipPath id="clip"><rect x="2" y="2" width="1096" height="296" rx="26"/></clipPath>
</defs>
<style>
${font(root)}
.name{font-family:'${FONT}',sans-serif;font-size:54px}
.phrase{font-family:'${FONT}',sans-serif;font-size:33px;opacity:0;animation:phrase 14s infinite both}
.float{animation:float 8s ease-in-out infinite}
.blink{transform-box:fill-box;transform-origin:center;animation:blink 6s infinite}
.sway{transform-origin:985px 218px;animation:sway 9s ease-in-out infinite}
.bloom{transform-box:fill-box;transform-origin:center;animation:bloom 1s ${EASE} both}
@keyframes phrase{0%{opacity:0;transform:translateY(8px)}3%{opacity:1;transform:none}23%{opacity:1;transform:none}26%{opacity:0;transform:translateY(-8px)}100%{opacity:0}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
@keyframes blink{0%,46%,50%,100%{transform:scaleY(1)}48%{transform:scaleY(.1)}}
@keyframes sway{0%,100%{transform:rotate(-1.4deg)}50%{transform:rotate(1.4deg)}}
@keyframes bloom{from{transform:scale(0)}to{transform:scale(1)}}
@media (prefers-reduced-motion:reduce){.phrase,.float,.blink,.sway,.bloom{animation:none}.p0{opacity:1}}
</style>
<g clip-path="url(#clip)">
<rect width="1100" height="300" fill="${t.paper}"/>
<rect width="1100" height="48" fill="${t.chrome}"/>
${grain(1100, 300)}
</g>
<g filter="url(#rough)">
<g fill="none" stroke="${t.pen}" stroke-width="2.6" stroke-linecap="round">
<rect x="2" y="2" width="1096" height="296" rx="26"/>
<path d="M2 48H1098"/>
<path d="M690 280H1072"/>
</g>
${winDots(t)}
${doodleHeart(1066, 25, 0.62, t, t.accent)}
${computer(t)}
${plant(t, blooms)}
${doodleHeart(668, 92, 0.62, t, 'none', -12)}
${doodleHeart(1052, 236, 0.5, t, 'none', 14)}
<circle cx="640" cy="236" r="3" fill="${t.pen}"/><circle cx="896" cy="80" r="2.6" fill="${t.pen}"/><circle cx="1012" cy="66" r="2.4" fill="${t.pen}"/>
</g>
<text class="name" x="54" y="154" fill="${t.pen}">hi, i'm TheDutchSmoke<tspan fill="${t.accent}">.</tspan></text>
${PHRASES.map((p, i) => `<text class="phrase p${i}" x="56" y="212" fill="${i % 2 ? t.muted : t.accent}" style="animation-delay:${i * 3.5}s">${esc(p)}</text>`).join('\n')}
</svg>`,
  };
}

// Project art on a 64x64 grid, shown as desktop icons (tile + label) under the window.
const ART = {
  map: `<path d="M14 21L25 17L39 21L50 17V44L39 48L25 44L14 48Z" fill="#F1E9FF" stroke="${DARK_INK}" stroke-width="2" stroke-linejoin="round"/>
<path d="M25 17V44M39 21V48" stroke="${DARK_INK}" stroke-width="2"/>
<path d="M32 15C26 15 22 19.5 22 25C22 32 32 41 32 41C32 41 42 32 42 25C42 19.5 38 15 32 15Z" fill="#D81779"/>
<circle cx="32" cy="25" r="4" fill="#FFFBFE"/>`,
  road: `<rect x="8" y="26" width="48" height="18" fill="#B8A9D9"/>
<path d="M11 35H53" stroke="#FFFBFE" stroke-width="2.5" stroke-dasharray="5 5" stroke-linecap="round"/>
<rect x="16" y="12" width="14" height="14" rx="4" fill="#FFFBFE" stroke="${DARK_INK}" stroke-width="2"/>
<circle cx="21" cy="18" r="1.6" fill="#502A49"/><circle cx="26" cy="18" r="1.6" fill="#502A49"/>
<rect x="36" y="44" width="14" height="14" rx="4" fill="#F5ADCF" stroke="${DARK_INK}" stroke-width="2"/>
<circle cx="41" cy="50" r="1.6" fill="#502A49"/><circle cx="46" cy="50" r="1.6" fill="#502A49"/>`,
  sprinkles: [
    [20, 20, 30, '#D81779'], [32, 18, -20, '#9DCB7E'], [45, 21, 60, '#8FB8F0'], [19, 33, -50, '#F7B955'], [32, 32, 15, '#B98CE8'],
    [45, 34, -35, '#D81779'], [21, 46, 70, '#8FB8F0'], [33, 45, -10, '#F5ADCF'], [45, 46, 40, '#9DCB7E'],
  ].map(([x, y, a, c]) => `<rect x="${x - 5}" y="${y - 2.2}" width="10" height="4.4" rx="2.2" fill="${c}" transform="rotate(${a} ${x} ${y})"/>`).join('\n'),
  tv: `<path d="M26 17L20 9M38 17L44 9" stroke="${DARK_INK}" stroke-width="2" stroke-linecap="round"/><circle cx="20" cy="9" r="2.4" fill="#D81779"/><circle cx="44" cy="9" r="2.4" fill="#D81779"/>
<rect x="10" y="17" width="44" height="31" rx="7" fill="#F1E9FF" stroke="${DARK_INK}" stroke-width="2"/>
<rect x="15" y="22" width="34" height="21" rx="4" fill="#FFFBFE"/>
<path d="M29 27.5V37.5L37.5 32.5Z" fill="#D81779" stroke="#D81779" stroke-width="1.5" stroke-linejoin="round"/>
<path d="M18 48L15 54M46 48L49 54" stroke="${DARK_INK}" stroke-width="2.4" stroke-linecap="round"/>`,
  console: `<rect x="15" y="9" width="34" height="47" rx="8" fill="#F5ADCF" stroke="${DARK_INK}" stroke-width="2"/>
<rect x="20" y="14" width="24" height="18" rx="3" fill="#FFFBFE"/>
<path d="M32 26C31 25 28 23 28 21C28 19 30.5 18.5 32 20.5C33.5 18.5 36 19 36 21C36 23 33 25 32 26Z" fill="#D81779"/>
<rect x="21" y="41" width="10" height="3.6" rx="1.2" fill="#502A49"/><rect x="24.2" y="37.8" width="3.6" height="10" rx="1.2" fill="#502A49"/>
<circle cx="39" cy="40" r="2.8" fill="#FFFBFE"/><circle cx="44" cy="45" r="2.8" fill="#FFFBFE"/>`,
};
function appIcon(root, t, p) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="172" viewBox="0 0 150 172" role="img" aria-label="${esc(p.name)}: ${esc(p.short)}">
<defs>${inkDefs(t, 2.5)}</defs>
<style>${font(root)}.l{font-family:'${FONT}',sans-serif;font-size:19px}.s{font-size:15px}</style>
<ellipse cx="75" cy="106" rx="38" ry="4.5" fill="${t.shade}" opacity=".55"/>
<g filter="url(#rough)"><g transform="translate(27 6) scale(1.5)"><rect x="1" y="1" width="62" height="62" rx="16" fill="#FFE0EF" stroke="${DARK_INK}" stroke-width="1.8"/>${ART[p.key]}</g></g>
<text class="l" x="75" y="136" text-anchor="middle" fill="${t.pen}">${esc(p.name)}</text>
<text class="l s" x="75" y="158" text-anchor="middle" fill="${t.muted}">${esc(p.short)}</text>
</svg>`;
}

// A small window in the header's style (flat paper, pen outline with a slight wobble, three little circles), so the parts
// below the header read as windows on the same little desktop.
const WINDOW_CSS = `.wt{font-family:'${FONT}',sans-serif;font-size:23px}.ws{font-family:'${FONT}',sans-serif;font-size:17px}`;
function frame(t, w, h, rx, title, sub, body) {
  return `<defs>${inkDefs(t)}<clipPath id="wclip"><rect x="2" y="2" width="${w - 4}" height="${h - 4}" rx="${rx}"/></clipPath></defs>
<g clip-path="url(#wclip)">
<rect width="${w}" height="${h}" fill="${t.paper}"/>
<rect width="${w}" height="48" fill="${t.chrome}"/>
${body}
${grain(w, h)}
</g>
<g filter="url(#rough)">
<g fill="none" stroke="${t.pen}" stroke-width="2.6"><rect x="2" y="2" width="${w - 4}" height="${h - 4}" rx="${rx}"/><path d="M2 48H${w - 2}"/></g>
${winDots(t)}
</g>
<text class="wt" x="90" y="33" fill="${t.pen}">${esc(title)}</text>
${sub ? `<text class="ws" x="${w - 28}" y="32" text-anchor="end" fill="${t.muted}">${esc(sub)}</text>` : ''}`;
}

// The last 12 weeks as a row of little pots on a shelf: the busier the week, the taller the plant and the more it blooms.
function pots(root, t, s) {
  const w = s.weekly, n = w.length, x0 = 110, step = (1100 - 2 * x0) / (n - 1);
  // heights and blossoms are relative to the busiest of these weeks, so the row keeps its shape at any volume
  const max = Math.max(1, ...w.map(x => x.n));
  let lastMonth = '';
  const labels = [];
  const items = w.map((wk, i) => {
    const x = x0 + i * step, h = wk.n ? 16 + 62 * Math.sqrt(wk.n / max) : 0;
    const blooms = wk.n === 0 ? 0 : wk.n < max / 3 ? 1 : wk.n < (2 * max) / 3 ? 2 : 3;
    const month = MONTHS[Number(wk.start.slice(5, 7)) - 1];
    if (month !== lastMonth) labels.push(`<text class="m" x="${x.toFixed(1)}" y="198" text-anchor="middle" fill="${t.muted}">${month}</text>`);
    lastMonth = month;
    const top = 150 - h;
    const flowers = [[0, top, 9], [-11, top + h * 0.35, 7], [11, top + h * 0.55, 6]].slice(0, blooms)
      .map(([dx, y, r], k) => `<g transform="translate(${(x + dx).toFixed(1)} ${y.toFixed(1)})"><g class="bloom" style="animation-delay:${(0.5 + i * 0.12 + k * 0.15).toFixed(2)}s" fill="${t.soft}" stroke="${t.pen}" stroke-width="1">${blossom(t, r)}</g></g>`).join('');
    const plant = h ? `<g class="grow" style="animation-delay:${(i * 0.12).toFixed(2)}s;transform-origin:${x.toFixed(1)}px 150px">
<path d="M${x.toFixed(1)} 150V${top.toFixed(1)}" stroke="${t.leafDeep}" stroke-width="2.6" stroke-linecap="round"/>
<ellipse cx="${(x - 7).toFixed(1)}" cy="${(150 - h * 0.45).toFixed(1)}" rx="8" ry="3.6" transform="rotate(-30 ${(x - 7).toFixed(1)} ${(150 - h * 0.45).toFixed(1)})" fill="${t.leaf}" stroke="${t.pen}" stroke-width="1"/>
<ellipse cx="${(x + 7).toFixed(1)}" cy="${(150 - h * 0.7).toFixed(1)}" rx="8" ry="3.6" transform="rotate(30 ${(x + 7).toFixed(1)} ${(150 - h * 0.7).toFixed(1)})" fill="${t.leaf}" stroke="${t.pen}" stroke-width="1"/>
${flowers}</g>` : `<circle cx="${(x - 4).toFixed(1)}" cy="148" r="1.6" fill="${t.leafDeep}"/><circle cx="${(x + 3).toFixed(1)}" cy="147" r="1.4" fill="${t.leafDeep}"/>`;
    return `${plant}
<g stroke="${t.pen}" stroke-width="2" stroke-linejoin="round"><path d="M${(x - 20).toFixed(1)} 152H${(x + 20).toFixed(1)}L${(x + 15).toFixed(1)} 176H${(x - 15).toFixed(1)}Z" fill="${i % 2 ? t.pot : t.soft}"/>
<rect x="${(x - 23).toFixed(1)}" y="146" width="46" height="9" rx="4.5" fill="${i % 2 ? t.potRim : t.line}"/></g>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1100" height="272" viewBox="0 0 1100 272" role="img" aria-label="${esc(`My last 12 weeks as a row of pots, one per week, the busier the week the taller the plant: ${w.map(x => x.n).join(', ')} contributions.`)}">
<style>${font(root)}.m{font-family:'${FONT}',sans-serif;font-size:19px}${WINDOW_CSS}
.grow{animation:grow 1.2s ${EASE} both}
.bloom{transform-box:fill-box;transform-origin:center;animation:bloom 1s ${EASE} both}
@keyframes grow{from{transform:scaleY(0)}to{transform:scaleY(1)}}
@keyframes bloom{from{transform:scale(0)}to{transform:scale(1)}}
@media (prefers-reduced-motion:reduce){.grow,.bloom{animation:none}}</style>
${frame(t, 1100, 272, 26, 'my last 12 weeks', 'one pot per week: the busier the week, the taller the plant', `<g transform="translate(0 44)">
<g filter="url(#rough)">
<path d="M60 177C300 175 700 179 1040 176" fill="none" stroke="${t.pen}" stroke-width="2.4" stroke-linecap="round"/>
${items.join('\n')}
</g>
${labels.join('')}
</g>`)}
</svg>`;
}

// What my pull requests in other people's projects are made of: a jam jar with one layer per language, biggest on top,
// so the whole jar is 100%. Languages too small for a layer lie on top as sprinkles. Layer colours follow the language
// (checked for colour-blind separation per theme); a fourth, unknown language gets the spare colour.
const LAYER = {
  light: { Swift: '#D9478F', Dutch: '#E9892B', Rust: '#7F63D8', other: '#2B9ABF' },
  dark: { Swift: '#D0488E', Dutch: '#D27D2B', Rust: '#8566D6', other: '#2F95C0' },
};
const NOTE = { Dutch: 'my translations' };
const SPRINKLES = ['#9DCB7E', '#8FB8F0', '#F7B955', '#B98CE8', '#FFFBFE', '#F5ADCF'];
const JAR = 'M126 86V96C126 112 82 112 82 140V268Q82 300 114 300H226Q258 300 258 268V140C258 112 214 112 214 96V86Z';
const pct = share => `${Math.max(1, Math.round(share * 100))}%`;
const listNames = names => names.length < 2 ? names.join('') : `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`;

export function jarParts(s) {
  const layers = [];
  let spare = true;
  for (const m of s.made) {
    if (m.share < 0.03 || layers.length === 4) continue;
    if (LAYER.light[m.name]) layers.push(m);
    else if (spare) { spare = false; layers.push({ ...m, spare: true }); }
  }
  const rest = s.made.filter(m => !layers.some(l => l.name === m.name) && m.lines >= 25).map(m => m.name);
  const pinch = rest.length > 2 ? [...rest.slice(0, 2), 'more'] : rest;
  return { layers, pinch };
}

function jar(root, t, mode, s) {
  const { layers, pinch } = jarParts(s);
  const glass = mode === 'light' ? '#FFF7FB' : '#231A2B';
  const top = 152, bottom = 300, total = layers.reduce((a, l) => a + l.share, 0);
  const wave = (y, k) => {
    let d = `M60 ${y.toFixed(1)}`;
    for (let x = 60, i = k; x < 280; x += 22, i++) d += `Q${x + 11} ${(y + (i % 2 ? 3 : -3)).toFixed(1)} ${x + 22} ${y.toFixed(1)}`;
    return `${d}V310H60Z`;
  };
  let y = top;
  const bands = layers.map((l, i) => {
    const h = ((bottom - top) * l.share) / total, b = { ...l, y0: y, mid: y + h / 2, color: LAYER[mode][l.spare ? 'other' : l.name], i };
    y += h;
    return b;
  });
  // painted top layer first, each reaching down to the bottom, so every lower layer covers the one above it
  const fills = bands.map(b => `<path class="pour" style="animation-delay:${(0.25 + (bands.length - 1 - b.i) * 0.55).toFixed(2)}s" d="${wave(b.y0, b.i)}" fill="${b.color}" stroke="${b.i ? glass : '#FFFFFF'}" stroke-opacity="${b.i ? 1 : 0.55}" stroke-width="2.5"/>`).join('\n');
  const after = 0.25 + bands.length * 0.55;
  const sprinkles = pinch.length ? [[108, 146, 30], [124, 150, -40], [141, 145, 70], [158, 150, 10], [176, 146, -60], [192, 151, 45], [209, 146, -20], [226, 150, 80]]
    .map(([x, yy, a], i) => `<g transform="translate(${x} ${yy}) rotate(${a})"><rect class="pop" style="animation-delay:${(after + i * 0.07).toFixed(2)}s" x="-4.5" y="-1.8" width="9" height="3.6" rx="1.8" fill="${SPRINKLES[i % SPRINKLES.length]}"/></g>`).join('') : '';

  // labels to the right, nudged apart when layers are thin; the pinch line sits above the top layer
  const items = [
    ...(pinch.length ? [{ want: 124, h: 46, pinch: true }] : []),
    ...bands.map(b => ({ want: b.mid, h: NOTE[b.name] ? 50 : 30, b })),
  ];
  let floor = 44;
  for (const it of items) { it.y = Math.max(it.want - it.h / 2, floor); floor = it.y + it.h + 6; }
  const over = floor - 6 - 316;
  if (over > 0) for (const it of items) it.y -= over;
  const marks = [], labels = [];
  for (const it of items) {
    const cy = it.y + (it.pinch ? 12 : 15);
    if (it.pinch) {
      marks.push(`<path d="M240 147Q262 ${cy} 284 ${cy.toFixed(1)}" fill="none" stroke="${t.pen}" stroke-width="1.8" stroke-linecap="round" opacity=".7"/>`);
      labels.push(`<text class="note" x="294" y="${(cy + 6.5).toFixed(1)}" fill="${t.muted}">+ a pinch of</text>
<text class="note" x="294" y="${(cy + 29.5).toFixed(1)}" fill="${t.muted}">${esc(listNames(pinch))}</text>`);
      continue;
    }
    const b = it.b;
    marks.push(`<circle cx="266" cy="${b.mid.toFixed(1)}" r="3" fill="${t.pen}"/><path d="M266 ${b.mid.toFixed(1)}L280 ${cy.toFixed(1)}H286" fill="none" stroke="${t.pen}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" opacity=".7"/>`);
    labels.push(`<text class="lab" x="294" y="${(cy + 9).toFixed(1)}" fill="${t.pen}">${esc(b.name)}<tspan dx="10" fill="${t.muted}">${pct(b.share)}</tspan></text>${NOTE[b.name] ? `
<text class="note" x="294" y="${(cy + 33).toFixed(1)}" fill="${t.muted}">${esc(NOTE[b.name])}</text>` : ''}`);
  }
  if (!bands.length) labels.push(`<text class="lab" x="294" y="230" fill="${t.muted}">still empty ♡</text>`);

  const scallops = Array.from({ length: 12 }, (_, i) => `Q${236 - i * 11 - 5.5} 95 ${236 - (i + 1) * 11} 87`).join('');
  const said = bands.map(b => `${b.name}${NOTE[b.name] ? ` (${NOTE[b.name]})` : ''} ${pct(b.share)}`).join(', ');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="540" height="362" viewBox="0 0 540 362" role="img" aria-labelledby="t d">
<title id="t">what my pull requests are made of</title><desc id="d">${esc(`A jam jar in layers, one per language, by lines changed: ${said || 'nothing yet'}${pinch.length ? `, with a pinch of ${listNames(pinch)} on top` : ''}.`)}</desc>
<defs>
<clipPath id="in"><path d="${JAR}"/></clipPath>
<pattern id="cloth" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="${t.chrome}"/><rect width="6" height="12" fill="${t.soft}" opacity=".5"/><rect width="12" height="6" fill="${t.soft}" opacity=".5"/></pattern>
</defs>
<style>
${font(root)}
.lab{font-family:'${FONT}',sans-serif;font-size:28px}
.note{font-family:'${FONT}',sans-serif;font-size:20px}${WINDOW_CSS}
.pour{transform-origin:170px 300px;animation:pour 1.2s ${EASE} both}
.pop{transform-box:fill-box;transform-origin:center;animation:pop .6s ${EASE} both}
.tag{transform-origin:170px 90px;animation:swing 7s ease-in-out infinite}
@keyframes pour{from{transform:scaleY(0)}to{transform:scaleY(1)}}
@keyframes pop{from{transform:scale(0)}to{transform:scale(1)}}
@keyframes swing{0%,100%{transform:rotate(-2.5deg)}50%{transform:rotate(2.5deg)}}
@media (prefers-reduced-motion:reduce){.pour,.pop,.tag{animation:none}}
</style>
${frame(t, 540, 362, 22, 'what my PRs are made of', 'by lines changed', `<g transform="translate(-30 22)">
<g filter="url(#rough)">
<ellipse cx="170" cy="304" rx="94" ry="6" fill="${t.shade}" opacity=".5"/>
<path d="${JAR}" fill="${glass}"/>
<g clip-path="url(#in)">
${fills}
<path d="M99 134V244" stroke="#FFFFFF" stroke-width="7" stroke-linecap="round" opacity="${mode === 'light' ? 0.6 : 0.16}"/>
<circle cx="99" cy="262" r="3.6" fill="#FFFFFF" opacity="${mode === 'light' ? 0.6 : 0.16}"/>
</g>
${sprinkles}
<path d="${JAR}" fill="none" stroke="${t.pen}" stroke-width="3" stroke-linejoin="round"/>
<path d="M104 87C104 47 236 47 236 87${scallops}Z" fill="url(#cloth)" stroke="${t.pen}" stroke-width="2.4" stroke-linejoin="round"/>
<rect x="122" y="84" width="96" height="9" rx="3" fill="${t.accent}" stroke="${t.pen}" stroke-width="1.8"/>
<g class="tag">
<path d="M170 90C150 104 126 106 112 118" fill="none" stroke="${t.pen}" stroke-width="1.4"/>
<g transform="translate(96 136) rotate(-12)"><path d="M-30 -14H22L32 0L22 14H-30Q-34 14-34 10V-10Q-34 -14-30 -14Z" fill="${t.face}" stroke="${t.pen}" stroke-width="2.2" stroke-linejoin="round"/><circle cx="23" cy="0" r="2.6" fill="${t.pen}"/>
<g transform="translate(-6 0) scale(0.62)">${heart(t.accent)}</g></g>
</g>
<g transform="translate(170 89) scale(0.62)" fill="${t.soft}" stroke="${t.pen}" stroke-width="3.6" stroke-linejoin="round">
<path d="M0 0C-17-23-43-19-36 1C-30 13-9 10 0 0ZM0 0C17-23 43-19 36 1C30 13 9 10 0 0Z"/>
<path d="M-3 2L-20 30L-6 26L-2 34L6 3M4 3L20 30L25 21L35 23L11-2"/>
<ellipse rx="7" ry="8"/>
</g>
${marks.join('\n')}
</g>
${labels.join('\n')}
</g>`)}
</svg>`;
}

const ICONS = {
  'heart-merged': `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="-13 -13 26 26" role="img" aria-label="merged"><path d="M0 9C-3 6-12 0-12-6C-12-14-3-16 0-8C3-16 12-14 12-6C12 0 3 6 0 9Z" fill="#D81779"/></svg>`,
  'heart-open': `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="-13 -13 26 26" role="img" aria-label="open"><path d="M0 9C-3 6-12 0-12-6C-12-14-3-16 0-8C3-16 12-14 12-6C12 0 3 6 0 9Z" fill="none" stroke="#D81779" stroke-width="2.6" stroke-linejoin="round"/></svg>`,
};

function divider(t) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1100" height="36" viewBox="0 0 1100 36" aria-hidden="true">
<defs>${inkDefs(t, 2.5)}</defs>
<g filter="url(#rough)">
<path d="M4 18C150 15 330 21 500 18M600 18C770 15 950 21 1096 18" fill="none" stroke="${t.pen}" stroke-width="1.6" stroke-linecap="round" opacity=".55"/>
<circle cx="524" cy="18" r="2.6" fill="${t.pen}"/>${doodleHeart(550, 19, 0.55, t, t.accent)}<circle cx="576" cy="18" r="2.6" fill="${t.pen}"/>
</g>
</svg>`;
}

export function render(root, s) {
  let blooms = 0;
  for (const [mode, t] of Object.entries(THEMES)) {
    const h = header(root, t, s);
    blooms = h.blooms;
    write(root, `assets/header-${mode}.svg`, h.svg);
    write(root, `assets/divider-${mode}.svg`, divider(t));
    write(root, `assets/pots-${mode}.svg`, pots(root, t, s));
    write(root, `assets/jar-${mode}.svg`, jar(root, t, mode, s));
    for (const p of PROJECTS) write(root, `assets/app-${p.key}-${mode}.svg`, appIcon(root, t, p));
  }
  for (const [name, svg] of Object.entries(ICONS)) write(root, `assets/${name}.svg`, svg);

  // two deliberate lines, so the long pull request part never wraps somewhere random
  const stats = `<p align="center"><sub>${[
    `<b>${s.active30}</b> active days in the last month, so the plant has ${plural(blooms, 'blossom', 'blossoms')}`,
    `<b>${s.year.toLocaleString('en-US')}</b> contributions in the last year`,
  ].join(' &nbsp;·&nbsp; ')}<br>\n<b>${s.merged}</b> ${s.merged === 1 ? 'pull request' : 'pull requests'} merged${s.open ? ` and <b>${s.open}</b> still waiting` : ''} in other people's projects</sub></p>`;
  const apps = `<p align="center">${PROJECTS.map(p =>
    `<a href="${p.url}"><picture><source media="(prefers-color-scheme: dark)" srcset="assets/app-${p.key}-dark.svg"><img src="assets/app-${p.key}-light.svg" width="120" alt="${esc(p.name)}: ${esc(p.long)}"></picture></a>`).join('&nbsp;')}</p>`;
  const list = s.prs.slice(0, 4).map(p =>
    `<img src="assets/heart-${p.status}.svg" width="13" height="13" alt="${p.status}"> &nbsp;<a href="${p.url}"><b>${esc(p.repo.split('/')[1])}</b> #${p.number}</a> &nbsp;${esc(clip(p.title, 60))}`,
  ).join('<br>\n');
  const { layers, pinch } = jarParts(s);
  const jarAlt = `A jam jar in layers showing what my pull requests are made of, by lines changed: ${layers.map(l => `${l.name}${NOTE[l.name] ? ` (${NOTE[l.name]})` : ''} ${pct(l.share)}`).join(', ') || 'still empty'}${pinch.length ? `, with a pinch of ${listNames(pinch)} on top` : ''}.`;
  // the jar window floats right of the text about my pull requests, like the picture in the header sits right of the name
  const lately = [
    `<p><picture><source media="(prefers-color-scheme: dark)" srcset="assets/jar-dark.svg"><img align="right" src="assets/jar-light.svg" width="400" alt="${esc(jarAlt)}"></picture>I also like helping out in other people's projects: ${helpedLinks(s)}.</p>`,
    `<p><sub>the newest (filled heart = merged, outline = still waiting)</sub><br>\n${list}\n</p>`,
    `<br clear="right">`,
  ].join('\n\n');
  return { stats, apps, lately };
}

// The profile picture in the same hand-drawn style: the heart-faced computer on paper. Not part of the daily redraw:
// GitHub has no API for profile pictures, so Tristan uploads the PNG made from this once.
export function avatar(root) {
  const t = THEMES.light;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500" role="img" aria-label="A hand-drawn little computer with a heart face and a bow">
<defs>${inkDefs(t, 4)}</defs>
<rect width="500" height="500" fill="${t.paper}"/>
${grain(500, 500)}
<g filter="url(#rough)">
<g transform="translate(-1110 -58) scale(1.68)">${computer(t, 3)}</g>
${doodleHeart(70, 112, 1, t, 'none', -14)}
${doodleHeart(408, 348, 0.8, t, t.soft, 12)}
<circle cx="124" cy="352" r="4.5" fill="${t.pen}"/><circle cx="392" cy="112" r="4" fill="${t.pen}"/><circle cx="74" cy="260" r="3" fill="${t.pen}"/>
</g>
</svg>`;
}
