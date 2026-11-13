// Version B: "pocket pal". A little cloud-shaped virtual pet. Its pet, puff, is fed by public GitHub activity:
// the mood follows the days since the last contribution, the heart meter follows this week's contributions.
import { esc, fontFace, write, plural, clip } from './lib.mjs';

const THEMES = {
  light: {
    back: '#F4ECFF', dot: '#E7DAFB', ink: '#4B2747', muted: '#7E5A78', accent: '#D81779',
    shell: '#FFB3D5', shellDeep: '#F28DBE', shellHi: '#FFE1EF', face: '#FFD3E7', bezel: '#6A3A61',
    bubble: '#FFFFFF', bubbleLine: '#E9D3F2', b1: '#D81779', b2: '#B48CE6', b3: '#D81779',
  },
  dark: {
    back: '#221A30', dot: '#2C2240', ink: '#FCE8F4', muted: '#CDB2C9', accent: '#FF8DC4',
    shell: '#C55C95', shellDeep: '#A8467C', shellHi: '#E28AB9', face: '#B24F86', bezel: '#2A1528',
    bubble: '#33264A', bubbleLine: '#4A3863', b1: '#FF8DC4', b2: '#B99BEB', b3: '#FF8DC4',
  },
};
const LCD = { ground: '#D9E5C5', ink: '#35422F', mid: '#93A57F', glare: '#ECF3E0' };

// ---------- pixel art ----------
// '#' = LCD ink, 'o' = the lighter LCD shade. Rows are drawn as merged runs to keep the files small.
function pixels(rows, px, x0, y0, colors) {
  const out = [];
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const c = row[x];
      if (!colors[c]) { x++; continue; }
      let w = 1;
      while (row[x + w] === c) w++;
      out.push(`<rect x="${x0 + x * px}" y="${y0 + y * px}" width="${w * px}" height="${px}" fill="${colors[c]}"/>`);
      x += w;
    }
  });
  return out.join('');
}

const PUFF = {
  body: [
    '...........##.##',
    '...........#####',
    '.....######.#.##',
    '...##......##...',
    '..#..........#..',
    '.#............#.',
    '.#............#.',
    '#..............#',
    '#..............#',
    '#..............#',
    '.#............#.',
    '..##........##..',
    '....########....',
  ],
  eyesOpen: ['....##....##....', '....##....##....'],
  eyesShut: ['................', '....##....##....'],
  cheeks: ['..oo........oo..'],
  smile: ['......#..#......', '.......##.......'],
};

function puffSprite(mood, px, x0, y0, c) {
  const col = { '#': c.ink, o: c.mid };
  const eyes = mood === 'sleepy' ? PUFF.eyesShut : PUFF.eyesOpen;
  return pixels(PUFF.body, px, x0, y0, col)
    + `<g class="${mood === 'sleepy' ? '' : 'blink'}">${pixels(eyes, px, x0, y0 + 5 * px, col)}</g>`
    + pixels(PUFF.cheeks, px, x0, y0 + 8 * px, col)
    + (mood === 'sleepy' ? pixels(['.......##.......'], px, x0, y0 + 9 * px, col) : pixels(PUFF.smile, px, x0, y0 + 8 * px, col));
}

const HEART5 = ['.#.#.', '#####', '#####', '.###.', '..#..'];
const HEART5_OPEN = ['.#.#.', '#.#.#', '#...#', '.#.#.', '..#..'];
const ZED = ['###', '..#', '.#.', '#..', '###'];

const GLYPHS = {
  A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'], E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
  F: ['#####', '#....', '#....', '####.', '#....', '#....', '#....'], L: ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
  M: ['#...#', '##.##', '#.#.#', '#.#.#', '#...#', '#...#', '#...#'], S: ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'],
  T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'], U: ['#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  Y: ['#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..'], ' ': ['...', '...', '...', '...', '...', '...', '...'],
  '>': ['#....', '##...', '###..', '####.', '###..', '##...', '#....'],
};
function pixelText(text, px, x0, y0, color) {
  let x = x0, out = '';
  for (const ch of text) {
    const g = GLYPHS[ch];
    out += pixels(g, px, x, y0, { '#': color });
    x += (g[0].length + 1) * px;
  }
  return { svg: out, width: x - x0 - px };
}

// ---------- the device ----------
function device(t, s, mood, hearts) {
  const cx = 228, px = 6;
  const lx = cx - 84, ly = 92; // LCD origin
  const c = LCD;
  const meter = [0, 1, 2, 3].map(i => pixels(i < hearts ? HEART5 : HEART5_OPEN, 3, lx + 12 + i * 19, ly + 10, { '#': i < hearts ? c.ink : c.mid })).join('');
  const sprite = puffSprite(mood, px, cx - 8 * px, ly + 40, c);
  const extras = mood === 'happy'
    ? `<g class="rise">${pixels(HEART5, 3, lx + 132, ly + 52, { '#': c.ink })}</g><g class="rise late">${pixels(HEART5, 3, lx + 140, ly + 70, { '#': c.mid })}</g>`
    : mood === 'sleepy'
      ? `<g class="rise">${pixels(ZED, 3, lx + 134, ly + 48, { '#': c.ink })}</g><g class="rise late">${pixels(ZED, 3, lx + 146, ly + 64, { '#': c.mid })}</g>`
      : '';
  const bounce = mood === 'happy' ? 'hop' : mood === 'chill' ? 'breathe' : '';
  // A cloud-shaped shell (puff is a smoke puff): overlapping bumps around a rounded body.
  const bumps = (dy) => [
    `<rect x="${cx - 132}" y="${78 + dy}" width="264" height="206" rx="78"/>`,
    `<circle cx="${cx - 82}" cy="${98 + dy}" r="60"/>`, `<circle cx="${cx}" cy="${78 + dy}" r="66"/>`,
    `<circle cx="${cx + 84}" cy="${100 + dy}" r="58"/>`, `<circle cx="${cx - 128}" cy="${186 + dy}" r="46"/>`,
    `<circle cx="${cx + 128}" cy="${186 + dy}" r="46"/>`,
  ].join('');
  return `<g class="bob">
<g fill="${t.shellDeep}">${bumps(8)}</g>
<g fill="${t.shell}">${bumps(0)}</g>
<path d="M${cx - 124} 96C${cx - 116} 66 ${cx - 92} 46 ${cx - 64} 42" fill="none" stroke="${t.shellHi}" stroke-width="9" stroke-linecap="round" opacity=".9"/>
<path d="M${cx - 30} 22C${cx - 8} 14 ${cx + 14} 14 ${cx + 34} 22" fill="none" stroke="${t.shellHi}" stroke-width="7" stroke-linecap="round" opacity=".8"/>
<circle cx="${cx + 132}" cy="54" r="11" fill="none" stroke="${t.shellDeep}" stroke-width="5"/>
<rect x="${lx - 14}" y="${ly - 14}" width="196" height="160" rx="30" fill="${t.face}"/>
<rect x="${lx - 6}" y="${ly - 6}" width="180" height="144" rx="20" fill="${t.bezel}"/>
<rect x="${lx}" y="${ly}" width="168" height="132" rx="12" fill="${c.ground}"/>
<path d="M${lx + 8} ${ly + 8}H${lx + 60}" stroke="${c.glare}" stroke-width="4" stroke-linecap="round"/>
${meter}
<g class="${bounce}">${sprite}</g>
${extras}
<circle cx="${cx - 48}" cy="258" r="12" fill="${t.b1}"/><circle cx="${cx}" cy="266" r="12" fill="${t.b2}"/><circle cx="${cx + 48}" cy="258" r="12" fill="${t.b3}"/>
<circle cx="${cx - 51}" cy="254" r="4" fill="#fff" opacity=".45"/><circle cx="${cx - 3}" cy="262" r="4" fill="#fff" opacity=".45"/><circle cx="${cx + 45}" cy="254" r="4" fill="#fff" opacity=".45"/>
</g>`;
}

const MOODS = {
  happy: 'puff is happy & well fed ♥',
  chill: 'puff is chilling, a little peckish',
  sleepy: 'puff is napping… zzz',
};

function header(root, t, s) {
  const mood = s.daysSince === null || s.daysSince > 6 ? 'sleepy' : s.daysSince <= 1 ? 'happy' : 'chill';
  const hearts = s.week === 0 ? 0 : s.week <= 2 ? 1 : s.week <= 5 ? 2 : s.week <= 9 ? 3 : 4;
  const desc = `A pastel cloud-shaped pocket pet. On its little screen lives puff, a smoke-puff creature with a bow. ${MOODS[mood].replace(' ♥', '')}. The heart meter shows ${hearts} of 4 hearts: ${plural(s.week, 'contribution', 'contributions')} in the last 7 days.`;
  const dots = [];
  for (let y = 14; y < 300; y += 28) for (let x = (y / 28) % 2 ? 14 : 28; x < 1100; x += 28) dots.push(`<circle cx="${x}" cy="${y}" r="2.6"/>`);
  return {
    mood, hearts,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="1100" height="300" viewBox="0 0 1100 300" role="img" aria-labelledby="t d">
<title id="t">TheDutchSmoke's pocket pal</title><desc id="d">${esc(desc)}</desc>
<defs><clipPath id="clip"><rect width="1100" height="300" rx="26"/></clipPath></defs>
<style>
${fontFace(root, 'Mochiy Pop One', 'mochiy-pop.woff2')}
.pop{font-family:'Mochiy Pop One',sans-serif}
.bob{animation:bob 6s ease-in-out infinite}
.hop{animation:hop 1.1s steps(1) infinite}
.breathe{animation:breathe 2.6s steps(1) infinite}
.blink{animation:blink 5s steps(1) infinite}
.rise{animation:rise 2.4s ease-out infinite}.late{animation-delay:1.2s}
@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
@keyframes hop{0%{transform:translateY(0)}50%{transform:translateY(-12px)}}
@keyframes breathe{0%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes blink{0%{opacity:1}93%{opacity:0}97%{opacity:1}}
@keyframes rise{0%{transform:translateY(8px);opacity:0}25%{opacity:1}100%{transform:translateY(-26px);opacity:0}}
@media (prefers-reduced-motion:reduce){.bob,.hop,.breathe,.blink,.rise{animation:none}}
</style>
<g clip-path="url(#clip)">
<rect width="1100" height="300" fill="${t.back}"/>
<g fill="${t.dot}">${dots.join('')}</g>
${device(t, s, mood, hearts)}
<text class="pop" x="452" y="118" font-size="54" fill="${t.ink}">TheDutchSmoke</text>
<path d="M466 150H1040Q1056 150 1056 166V214Q1056 230 1040 230H486Q470 230 470 214V196L446 186L470 176V166Q470 150 486 150Z" fill="${t.bubble}" stroke="${t.bubbleLine}" stroke-width="2"/>
<text class="pop" x="496" y="201" font-size="29" fill="${t.accent}">${esc(MOODS[mood])}</text>
<text class="pop" x="474" y="270" font-size="19" fill="${t.muted}">a pocket pet that lives on my commits &amp; pull requests</text>
</g>
</svg>`,
  };
}

// ---------- small pixel assets ----------
const tile = (rows, colors, label) => `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" role="img" aria-label="${esc(label)}" shape-rendering="crispEdges">
<rect width="64" height="64" rx="14" fill="#F4ECFF"/>
${pixels(rows, 4, 32 - rows[0].length * 2, 32 - rows.length * 2, colors)}
</svg>`;

const ICONS = {
  'icon-map': tile(['....####....', '..########..', '.##########.', '.####..####.', '.###....###.', '.####..####.', '.##########.', '..########..', '...######...', '....####....', '.....##.....'],
    { '#': '#D81779' }, 'pixel map pin'),
  'icon-road': tile(['.####.......', '.#ee#.......', '.####.......', 'oooooooooooo', '............', '##.##.##.##.', '............', 'oooooooooooo', '.......####.', '.......#ee#.', '.......####.'],
    { '#': '#D81779', e: '#FFFFFF', o: '#B48CE6' }, 'two pixel players crossing a road'),
  'icon-sprinkles': tile(['#...o...x...', '.#...o...x..', '............', '..x...#...o.', '...x...#...o', '............', 'o...x...#...', '.o...x...#..', '............', '...#...o...x', '....#...o...'],
    { '#': '#D81779', o: '#5FA8E8', x: '#7CBF6A' }, 'pixel sprinkles'),
};

function label(text) {
  const t = pixelText('> ' + text, 3, 0, 0, '#D81779');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${t.width}" height="21" viewBox="0 0 ${t.width} 21" role="img" aria-label="${esc(text.toLowerCase())}" shape-rendering="crispEdges">${t.svg}</svg>`;
}

const heartIcon = (open) => `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 5 5" role="img" aria-label="${open ? 'open' : 'merged'}" shape-rendering="crispEdges">${pixels(open ? HEART5_OPEN : HEART5, 1, 0, 0, { '#': '#D81779' })}</svg>`;

function divider(t) {
  const dots = [];
  for (let x = 0; x < 1100; x += 12) if (x < 520 || x > 580) dots.push(`<rect x="${x}" y="16" width="5" height="5"/>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1100" height="40" viewBox="0 0 1100 40" aria-hidden="true" shape-rendering="crispEdges">
<g fill="${t.dot}">${dots.join('')}</g>
${pixels(PUFF.body.slice(2), 2, 534, 6, { '#': t.accent })}${pixels(PUFF.eyesOpen, 2, 534, 16, { '#': t.accent })}
</svg>`;
}

export function render(root, s) {
  let mood = 'chill';
  for (const [mode, t] of Object.entries(THEMES)) {
    const h = header(root, t, s);
    mood = h.mood;
    write(root, `assets/header-${mode}.svg`, h.svg);
    write(root, `assets/divider-${mode}.svg`, divider(t));
  }
  for (const [name, svg] of Object.entries(ICONS)) write(root, `assets/${name}.svg`, svg);
  write(root, 'assets/label-stuff.svg', label('MY STUFF'));
  write(root, 'assets/label-lately.svg', label('LATELY'));
  write(root, 'assets/heart-merged.svg', heartIcon(false));
  write(root, 'assets/heart-open.svg', heartIcon(true));

  const stats = `<p align="center"><sub>puff's food log: ${[
    `<b>${s.week}</b> contributions this week`,
    `<b>${s.year}</b> this year`,
    `<b>${s.merged}</b> pull requests merged elsewhere`,
  ].join(' &nbsp;·&nbsp; ')}</sub></p>`;
  const lately = s.prs.slice(0, 5).map(p =>
    `<img src="assets/heart-${p.status}.svg" width="13" height="13" alt="${p.status}"> &nbsp;<a href="${p.url}"><b>${esc(p.repo)}</b> #${p.number}</a> &nbsp;${esc(clip(p.title, 64))}`,
  ).join('<br>\n');
  const tally = `<sub>${s.merged} merged and ${s.open} waiting for review, across ${s.repos} projects &nbsp;·&nbsp; full heart = merged</sub>`;
  return { stats, lately: `<p>\n${lately}\n</p>\n<p>${tally}</p>` };
}
