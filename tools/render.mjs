// Version B: "pocket pal". A little cloud-shaped virtual pet next to the text. Its pet, puff, is fed by public GitHub
// activity: the mood follows the days since the last contribution, the heart meter this week's contributions.
import { esc, write, plural, clip, PROJECTS, helpedLinks } from './lib.mjs';

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

const MOOD_TEXT = { happy: 'puff is happy & well fed', chill: 'puff is chilling, a little peckish', sleepy: 'puff is napping' };
function state(s) {
  const mood = s.daysSince === null || s.daysSince > 6 ? 'sleepy' : s.daysSince <= 1 ? 'happy' : 'chill';
  const hearts = s.week === 0 ? 0 : s.week <= 2 ? 1 : s.week <= 5 ? 2 : s.week <= 9 ? 3 : 4;
  return { mood, hearts };
}

// The device on its own, cropped tight, for the layout where the text sits next to it.
function pet(t, s) {
  const { mood, hearts } = state(s);
  const desc = `A pastel cloud-shaped pocket pet. On its little screen lives puff, a smoke-puff creature with a bow. ${MOOD_TEXT[mood]}. The heart meter shows ${hearts} of 4 hearts: ${plural(s.week, 'contribution', 'contributions')} in the last 7 days.`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="388" height="310" viewBox="34 0 388 310" role="img" aria-labelledby="t d">
<title id="t">puff, TheDutchSmoke's pocket pet</title><desc id="d">${esc(desc)}</desc>
<style>
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
<ellipse cx="228" cy="300" rx="140" ry="8" fill="${t.dot}" opacity=".9"/>
${device(t, s, mood, hearts)}
</svg>`;
}

// ---------- small pixel assets ----------
const heartIcon = (open) => `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 5 5" role="img" aria-label="${open ? 'open' : 'merged'}" shape-rendering="crispEdges">${pixels(open ? HEART5_OPEN : HEART5, 1, 0, 0, { '#': '#D81779' })}</svg>`;

function divider(t) {
  const dots = [];
  for (let x = 0; x < 1100; x += 12) if (x < 520 || x > 580) dots.push(`<rect x="${x}" y="16" width="5" height="5"/>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1100" height="40" viewBox="0 0 1100 40" aria-hidden="true" shape-rendering="crispEdges">
<g fill="${t.dot}">${dots.join('')}</g>
${pixels(PUFF.body.slice(2), 2, 534, 6, { '#': t.accent })}${pixels(PUFF.eyesOpen, 2, 534, 16, { '#': t.accent })}
</svg>`;
}

const SPRITES = {
  'px-map': [['....####....', '..########..', '.##########.', '.####..####.', '.###....###.', '.####..####.', '.##########.', '..########..', '...######...', '....####....', '.....##.....'], { '#': '#D81779' }],
  'px-road': [['.####.......', '.#ee#.......', '.####.......', 'oooooooooooo', '............', '##.##.##.##.', '............', 'oooooooooooo', '.......####.', '.......#ee#.', '.......####.'], { '#': '#D81779', e: '#FFFFFF', o: '#9E7BD6' }],
  'px-sprinkles': [['#...o...x...', '.#...o...x..', '............', '..x...#...o.', '...x...#...o', '............', 'o...x...#...', '.o...x...#..', '............', '...#...o...x', '....#...o...'], { '#': '#D81779', o: '#3F8FDB', x: '#4FA545' }],
  'px-tv': [['..#......#..', '...#....#...', '############', '#..........#', '#...#......#', '#...##.....#', '#...###....#', '#...##.....#', '#...#......#', '#..........#', '############', '.##......##.'], { '#': '#D81779' }],
  'px-elements': [['..#.......o.', '..##......o.', '.###.....ooo', '.####....ooo', '#####...oooo', '#####...oooo', '.###.....oo.', '............', '.xx....w.w.w', 'xxx.....w.w.', 'xx.....w.w.w'], { '#': '#D81779', o: '#3F8FDB', x: '#4FA545', w: '#9467D8' }],
  'px-console': [['.##########.', '#..........#', '#.########.#', '#.#......#.#', '#.#..##..#.#', '#.#......#.#', '#.########.#', '#..........#', '#..#....##.#', '#.###......#', '#..#...##..#', '.##########.'], { '#': '#D81779' }],
};

// puff's diary: the last 12 weeks as pixel bars on a long LCD strip, with puff sitting on the busiest week.
function diary(s) {
  const c = LCD, px = 8, w = s.weekly;
  const max = Math.max(1, ...w.map(x => x.n));
  const busiest = w.findIndex(x => x.n === max);
  const bar = 6, gap = 2, base = 134, x0 = Math.round((1100 - (w.length * (bar + gap) - gap) * px) / 2);
  const bars = w.map((wk, i) => {
    const h = wk.n ? Math.max(1, Math.round(9 * Math.log2(1 + wk.n) / Math.log2(1 + max))) : 0;
    const x = x0 + i * (bar + gap) * px;
    const cells = [];
    for (let r = 0; r < h; r++) cells.push(`<rect x="${x}" y="${base - (r + 1) * px}" width="${bar * px - 2}" height="${px - 2}" fill="${c.ink}"/>`);
    if (!h) cells.push(`<rect x="${x}" y="${base - 3}" width="${bar * px - 2}" height="2" fill="${c.mid}"/>`);
    return cells.join('');
  });
  const bx = x0 + busiest * (bar + gap) * px + (bar * px) / 2;
  const bh = w[busiest].n ? Math.max(1, Math.round(9 * Math.log2(1 + max) / Math.log2(1 + max))) : 0;
  const puff = puffSprite('happy', 4, bx - 32, base - bh * px - 56, c);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1100" height="170" viewBox="0 0 1100 170" role="img" aria-label="${esc(`puff's diary: my last 12 weeks as bars, one per week (${w.map(x => x.n).join(', ')} contributions). puff sits on the busiest week.`)}" shape-rendering="crispEdges">
<style>.hop{animation:hop 1.1s steps(1) infinite}.blink{animation:blink 5s steps(1) infinite}
@keyframes hop{0%{transform:translateY(0)}50%{transform:translateY(-6px)}}@keyframes blink{0%{opacity:1}93%{opacity:0}97%{opacity:1}}
@media (prefers-reduced-motion:reduce){.hop,.blink{animation:none}}</style>
<rect x="40" y="4" width="1020" height="162" rx="26" fill="#6A3A61"/>
<rect x="56" y="18" width="988" height="134" rx="14" fill="${c.ground}"/>
<path d="M72 34H220" stroke="${c.glare}" stroke-width="5" stroke-linecap="round"/>
${bars.join('\n')}
<g class="hop">${puff}</g>
</svg>`;
}
const sprite = (rows, colors) => `<svg xmlns="http://www.w3.org/2000/svg" width="${rows[0].length * 2}" height="${rows.length * 2}" viewBox="0 0 ${rows[0].length} ${rows.length}" aria-hidden="true" shape-rendering="crispEdges">${pixels(rows, 1, 0, 0, colors)}</svg>`;

export function render(root, s) {
  const { mood } = state(s);
  for (const [mode, t] of Object.entries(THEMES)) {
    write(root, `assets/pet-${mode}.svg`, pet(t, s));
    write(root, `assets/divider-${mode}.svg`, divider(t));
  }
  write(root, 'assets/diary.svg', diary(s));
  for (const [name, [rows, colors]] of Object.entries(SPRITES)) write(root, `assets/${name}.svg`, sprite(rows, colors));
  write(root, 'assets/heart-merged.svg', heartIcon(false));
  write(root, 'assets/heart-open.svg', heartIcon(true));

  const feel = { happy: '<b>happy & well fed</b>', chill: '<b>chilling</b>, and a little peckish', sleepy: '<b>napping</b>: nothing new for a week' }[mood];
  const moodBlock = `<p>This is <b>puff</b>, a little smoke puff that lives on my commits and pull requests. Today puff is ${feel}: ${plural(s.week, 'contribution', 'contributions')} this week, ${s.year} this year, and ${s.merged} pull requests merged in other people's projects so far.</p>`;
  const list = s.prs.slice(0, 3).map(p =>
    `<img src="assets/heart-${p.status}.svg" width="13" height="13" alt="${p.status}"> <a href="${p.url}"><b>${esc(p.repo.split('/')[1])}</b> #${p.number}</a> ${esc(clip(p.title, 40))}`,
  ).join('<br>\n');
  const lately = `<p><sub>puff's food log, my newest pull requests in other people's projects (full heart = merged):</sub><br>\n${list}</p>`;
  const projects = `<p>${PROJECTS.map(p =>
    `<img src="assets/px-${p.key}.svg" height="20" alt=""> &nbsp;<a href="${p.url}"><b>${esc(p.name)}</b></a>, ${esc(p.long)}`).join('<br>\n')}</p>`;
  const helped = `<p>Projects I've helped out in: ${helpedLinks(s)}.</p>`;
  return { mood: moodBlock, lately, projects, helped };
}
