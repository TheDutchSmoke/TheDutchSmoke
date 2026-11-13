// Shared helpers for the live profile: fetch public GitHub data, small SVG helpers, README blocks.
// No dependencies: runs on the Node that ships with GitHub's ubuntu runners.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

export const LOGIN = 'TheDutchSmoke';

// The things on the profile, in order. `short` goes under icons and tags, `long` in sentences.
export const PROJECTS = [
  { key: 'map', name: 'Incidentenkaart', url: 'https://incidentenkaart.nl', short: 'incident map', long: 'incident reports in the Netherlands on one map, with traceable sources' },
  { key: 'road', name: 'Crossy Rivals', url: 'https://crossyrivals.com', short: 'browser game', long: 'a Crossy Road-style browser game for up to 20 players' },
  { key: 'sprinkles', name: 'SprinkleGrid', url: 'https://sprinklegrid.nl', short: 'colour gallery', long: 'a colourful gallery with seasonal themes' },
  { key: 'tv', name: 'SofaStream', url: 'https://github.com/TheDutchSmoke/sofastream', short: 'Twitch on TV', long: 'Twitch on the Apple TV, started from a macOS terminal' },
  { key: 'console', name: 'myselfhosted.eu', url: 'https://myselfhosted.eu', short: 'pocket card', long: 'my pocket business card: a tiny handheld that boots into my accounts' },
];

export const INTRO = 'I like having my own little corner of the internet and making it feel like mine. I run a couple of small servers, build tools and games for fun, and now and then translate an app I love into Dutch.';

// Pull requests come from search: only public repos, never the account's own repos or forks.
const QUERY = `query($login: String!, $q: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar { totalContributions weeks { contributionDays { date contributionCount } } }
    }
  }
  search(query: $q, type: ISSUE, first: 100) {
    nodes {
      ... on PullRequest {
        title url number state merged mergedAt createdAt
        repository { nameWithOwner isPrivate owner { login } }
        files(first: 100) { nodes { path additions deletions } }
      }
    }
  }
}`;

export async function fetchData(token) {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json', 'User-Agent': 'profile-live' },
    body: JSON.stringify({
      query: QUERY,
      variables: { login: LOGIN, q: `is:pr is:public author:${LOGIN} -user:${LOGIN} sort:created-desc` },
    }),
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return { ...json.data.user, pullRequests: { nodes: json.data.search.nodes.filter(n => n && n.url) } };
}

// Projects that stay off the profile: owner/repo, separated by commas or spaces. They come from the repository secret
// PROFILE_HIDE, so the names stay out of this public file and the workflow logs.
function hiddenRepos() {
  return new Set((process.env.PROFILE_HIDE ?? '').split(/[\s,]+/).filter(Boolean).map(r => r.toLowerCase()));
}

// What a changed file is written in. Translation files only count when their path says Dutch (the translating I do);
// other strings, docs, data and lock files are left out.
const CODE = {
  swift: 'Swift', rs: 'Rust', ts: 'TypeScript', tsx: 'TypeScript', js: 'JavaScript', jsx: 'JavaScript', mjs: 'JavaScript',
  cjs: 'JavaScript', py: 'Python', kt: 'Kotlin', kts: 'Kotlin', go: 'Go', m: 'Objective-C', mm: 'Objective-C', c: 'C',
  h: 'C', cc: 'C++', cpp: 'C++', hpp: 'C++', cs: 'C#', java: 'Java', rb: 'Ruby', php: 'PHP', lua: 'Lua', dart: 'Dart',
  zig: 'Zig', sh: 'Shell', bash: 'Shell', zsh: 'Shell', html: 'HTML', css: 'CSS', scss: 'CSS', vue: 'Vue',
  svelte: 'Svelte', astro: 'Astro',
};
const STRINGS = new Set(['po', 'json', 'xcstrings', 'strings', 'stringsdict', 'yml', 'yaml', 'ftl', 'arb', 'xliff', 'xlf', 'properties', 'resx']);
const DUTCH = /(^|[/._-])(nl|nl[-_](nl|be)|dutch|nederlands)([/._-]|$)/i;
export function languageOf(path) {
  const file = path.split('/').pop();
  const dot = file.lastIndexOf('.');
  if (dot <= 0) return null;
  const ext = file.slice(dot + 1).toLowerCase();
  if (STRINGS.has(ext)) return DUTCH.test(path) ? 'Dutch' : null;
  return CODE[ext] ?? null;
}

// Lines changed per language over the given pull requests, biggest first.
function madeOf(nodes) {
  const lines = new Map();
  for (const p of nodes) for (const f of p.files?.nodes ?? []) {
    const lang = languageOf(f.path);
    if (lang) lines.set(lang, (lines.get(lang) ?? 0) + f.additions + f.deletions);
  }
  const total = [...lines.values()].reduce((a, b) => a + b, 0);
  return [...lines].filter(([, n]) => n > 0).map(([name, n]) => ({ name, lines: n, share: n / total }))
    .sort((a, b) => b.lines - a.lines);
}

// Turn the raw API answer into the few numbers and items the page shows. Public, external work only.
export function summarize(user, today = new Date()) {
  const cal = user.contributionsCollection.contributionCalendar;
  const days = cal.weeks.flatMap(w => w.contributionDays).map(d => ({ date: d.date, n: d.contributionCount }));
  const iso = d => d.toISOString().slice(0, 10);
  const todayIso = iso(today);
  const past = days.filter(d => d.date <= todayIso);
  const lastN = n => past.slice(-n);
  const active = list => list.filter(d => d.n > 0).length;
  const lastActive = [...past].reverse().find(d => d.n > 0)?.date ?? null;
  const daysSince = lastActive ? Math.round((Date.parse(todayIso) - Date.parse(lastActive)) / 864e5) : null;

  const hide = hiddenRepos();
  const shown = user.pullRequests.nodes
    .filter(p => !p.repository.isPrivate && p.repository.owner.login.toLowerCase() !== LOGIN.toLowerCase())
    .filter(p => !hide.has(p.repository.nameWithOwner.toLowerCase()))
    .filter(p => p.merged || p.state === 'OPEN');
  const prs = shown
    .map(p => ({
      repo: p.repository.nameWithOwner, number: p.number, title: p.title.trim(), url: p.url,
      status: p.merged ? 'merged' : 'open', date: (p.merged ? p.mergedAt : p.createdAt).slice(0, 10),
    }))
    .sort((a, b) => b.date.localeCompare(a.date) || b.number - a.number);

  return {
    year: cal.totalContributions,
    activeYear: active(past),
    active30: active(lastN(30)),
    week: lastN(7).reduce((s, d) => s + d.n, 0),
    lastActive, daysSince,
    last30: lastN(30),
    weeks: cal.weeks.map(w => w.contributionDays.map(d => ({ date: d.date, n: d.contributionCount }))),
    // the last 12 calendar weeks (Sunday to Saturday), oldest first
    weekly: cal.weeks.slice(-12).map(w => ({ start: w.contributionDays[0].date, n: w.contributionDays.reduce((a, d) => a + d.contributionCount, 0) })),
    // other people's projects with a pull request of mine, most recent first
    helped: [...new Set(prs.map(p => p.repo))],
    merged: prs.filter(p => p.status === 'merged').length,
    open: prs.filter(p => p.status === 'open').length,
    repos: new Set(prs.map(p => p.repo)).size,
    prs,
    // what those pull requests are made of
    made: madeOf(shown),
  };
}

// ---------- small helpers ----------
export const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
export function clip(s, max) {
  if (s.length <= max) return s;
  const cut = s.slice(0, max - 1);
  const space = cut.lastIndexOf(' ');
  return (space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,:;(-]+$/, '') + '…';
}

const fontCache = new Map();
// @font-face rule with the subset font inlined, so the SVG renders the same everywhere (GitHub serves SVGs as images,
// which cannot load external fonts).
export function fontFace(root, family, file, weight = 400) {
  const key = family + file;
  if (!fontCache.has(key)) fontCache.set(key, readFileSync(join(root, 'assets/fonts', file)).toString('base64'));
  return `@font-face{font-family:'${family}';font-weight:${weight};src:url(data:font/woff2;base64,${fontCache.get(key)}) format('woff2');}`;
}

export function write(root, rel, content) {
  const f = join(root, rel);
  mkdirSync(dirname(f), { recursive: true });
  writeFileSync(f, content.endsWith('\n') ? content : content + '\n');
}

// Replace the text between <!-- live:NAME --> and <!-- /live:NAME --> in README.md.
export function fillBlocks(root, blocks) {
  const f = join(root, 'README.md');
  let md = readFileSync(f, 'utf8');
  for (const [name, body] of Object.entries(blocks)) {
    const re = new RegExp(`(<!-- live:${name} -->)[\\s\\S]*?(<!-- /live:${name} -->)`);
    if (!re.test(md)) throw new Error(`README.md has no live:${name} block`);
    md = md.replace(re, `$1\n${body.trim()}\n$2`);
  }
  writeFileSync(f, md);
}

// Deterministic pseudo-random numbers, so a re-run with the same data writes the same files (no empty commits).
export function rng(seed) {
  let s = 0;
  for (const ch of String(seed)) s = (s * 31 + ch.charCodeAt(0)) >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

// One line linking every project I sent a pull request to (to my pull requests there).
export function helpedLinks(s) {
  return s.helped.map(r => `<a href="https://github.com/${r}/pulls?q=is%3Apr+author%3A${LOGIN}">${esc(r.split('/')[1])}</a>`).join(' · ');
}
export const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
