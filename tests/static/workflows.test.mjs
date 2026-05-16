/**
 * Static validation script for .github/workflows/deploy.yml
 * Not a Playwright test — run directly with Node.js via `npm run check:workflow`
 */

import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORKFLOW_PATH = path.resolve(__dirname, '../../.github/workflows/deploy.yml');

let passed = 0;
let failed = 0;

function assert(name, condition, detail = '') {
  if (condition) {
    console.log(`  ok  [${name}]${detail ? ' — ' + detail : ''}`);
    passed++;
  } else {
    console.error(`  FAIL [${name}]${detail ? ' — ' + detail : ''}`);
    failed++;
  }
}

// ── Load file ─────────────────────────────────────────────────────────────────
if (!fs.existsSync(WORKFLOW_PATH)) {
  console.error(`FAIL: file not found: ${WORKFLOW_PATH}`);
  process.exit(1);
}

const raw = fs.readFileSync(WORKFLOW_PATH, 'utf8');
const doc = yaml.load(raw);

console.log(`\nChecking: ${WORKFLOW_PATH}\n`);

// ── Check 1: on.push.branches contains 'main' ─────────────────────────────────
const branches = doc?.on?.push?.branches ?? [];
assert(
  '1. on.push.branches contains main',
  Array.isArray(branches) && branches.includes('main'),
  `branches: ${JSON.stringify(branches)}`
);

// ── Check 2: jobs has at least one job ────────────────────────────────────────
const jobs = doc?.jobs ?? {};
const jobNames = Object.keys(jobs);
assert(
  '2. jobs has at least one entry',
  jobNames.length >= 1,
  `jobs found: ${jobNames.join(', ') || '(none)'}`
);

// ── Flatten all steps across all jobs ────────────────────────────────────────
const allSteps = jobNames.flatMap((name) => jobs[name]?.steps ?? []);

// ── Check 3: at least one step uses cloudflare/wrangler-action ───────────────
const usesWrangler = allSteps.some(
  (s) => typeof s?.uses === 'string' && s.uses.startsWith('cloudflare/wrangler-action')
);
assert(
  '3. step uses cloudflare/wrangler-action',
  usesWrangler,
  usesWrangler ? 'found' : 'not found in any step'
);

// ── Check 4: at least one step runs npm run build ────────────────────────────
const runsBuild = allSteps.some(
  (s) => typeof s?.run === 'string' && s.run.includes('npm run build')
);
assert(
  '4. step runs npm run build',
  runsBuild,
  runsBuild ? 'found' : 'not found in any step'
);

// ── Check 5: at least one step runs npm run test:e2e (E2E gate) ──────────────
const runsE2E = allSteps.some(
  (s) => typeof s?.run === 'string' && s.run.includes('npm run test:e2e')
);
assert(
  '5. step runs npm run test:e2e (E2E gate before deploy)',
  runsE2E,
  runsE2E ? 'found' : 'not found — deploy may proceed without E2E validation'
);

// ── Check 6: secrets referenced for CLOUDFLARE_API_TOKEN and ACCOUNT_ID ──────
const hasApiToken = raw.includes('secrets.CLOUDFLARE_API_TOKEN');
const hasAccountId = raw.includes('secrets.CLOUDFLARE_ACCOUNT_ID');
assert(
  '6a. references secrets.CLOUDFLARE_API_TOKEN',
  hasApiToken,
  hasApiToken ? 'found' : 'missing'
);
assert(
  '6b. references secrets.CLOUDFLARE_ACCOUNT_ID',
  hasAccountId,
  hasAccountId ? 'found' : 'missing'
);

// ── Summary ───────────────────────────────────────────────────────────────────
console.log(`\n${passed + failed} checks total — ${passed} passed, ${failed} failed\n`);

if (failed > 0) {
  process.exit(1);
}
