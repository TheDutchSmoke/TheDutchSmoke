// Updates the live parts of the profile: fetches public GitHub data, redraws assets/ and fills the
// <!-- live:... --> blocks in README.md. Runs once a day via .github/workflows/live.yml.
// Locally: GITHUB_TOKEN=<token> node tools/profile.mjs
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { fetchData, summarize, fillBlocks } from './lib.mjs';
import { render } from './render.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const token = process.env.GITHUB_TOKEN;
if (!token) {
  console.error('GITHUB_TOKEN is missing');
  process.exit(1);
}
const s = summarize(await fetchData(token));
fillBlocks(root, render(root, s));
console.log(`ok: ${s.year} contributions this year, ${s.active30} active days in the last 30, ` +
  `${s.merged} merged and ${s.open} open pull requests in other projects`);
