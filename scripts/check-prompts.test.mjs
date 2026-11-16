import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, copyFileSync, writeFileSync, rmSync, chmodSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { checkHistory } from './check-prompts.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const initial = '# Project prompts\n\n## Prompt 1: First User Prompt\n\nPreserve teh typo.\n';
const next = '\n## Prompt 2: Next User Prompt\n\nAnother verbatim prompt.\n';

function fixture(t) {
  const cwd = mkdtempSync(join(tmpdir(), 'notr-prompts-'));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  const env = { ...process.env, IN_NIX_SHELL: '1' };
  const git = (...args) => execFileSync('git', args, { cwd, env, stdio: 'pipe' });
  git('init', '-b', 'main');
  git('config', 'user.name', 'Prompt Hook Test');
  git('config', 'user.email', 'test@example.invalid');
  git('config', 'commit.gpgsign', 'false');
  git('config', 'core.hooksPath', '.unused-hooks');
  writeFileSync(join(cwd, 'README.md'), '');
  git('add', 'README.md'); git('commit', '-m', 'Initial README');
  mkdirSync(join(cwd, 'scripts')); mkdirSync(join(cwd, '.husky'));
  for (const path of ['scripts/check-prompts.mjs', 'scripts/check-staged-tree.mjs', '.husky/pre-commit'])
    copyFileSync(join(root, path), join(cwd, path));
  chmodSync(join(cwd, '.husky/pre-commit'), 0o755);
  writeFileSync(join(cwd, 'package.json'), '{"type":"module"}\n');
  git('config', 'core.hooksPath', '.husky');
  git('add', '.');
  const write = value => writeFileSync(join(cwd, 'PROMPTS.md'), value);
  const commit = () => spawnSync('git', ['commit', '--allow-empty', '-m', 'Prompt work'], { cwd, env, encoding: 'utf8' });
  const seed = () => { write(initial); git('add', 'PROMPTS.md'); const result = commit(); assert.equal(result.status, 0, result.stderr); };
  return { cwd, git, write, commit, seed };
}
function rejected(result, pattern = /Prompt log check failed/) {
  assert.notEqual(result.status, 0);
  assert.match(result.stdout + result.stderr, pattern);
}

test('hook rejects missing or unstaged prompt logs; staged verbatim log succeeds', t => {
  const f = fixture(t);
  rejected(f.commit());
  f.write(initial); rejected(f.commit());
  f.git('add', 'PROMPTS.md'); assert.equal(f.commit().status, 0);
  assert.match(f.git('show', 'HEAD:PROMPTS.md').toString(), /teh typo/);
});
test('hook rejects unchanged history and accepts a new staged prompt', t => {
  const f = fixture(t); f.seed(); rejected(f.commit());
  f.write(initial + next); rejected(f.commit());
  f.git('add', 'PROMPTS.md'); assert.equal(f.commit().status, 0);
});
test('hook rejects rewriting or deleting historical prompts', t => {
  const f = fixture(t); f.seed();
  f.write(initial.replace('teh', 'the') + next); f.git('add', 'PROMPTS.md'); rejected(f.commit());
  f.git('rm', '-f', 'PROMPTS.md'); rejected(f.commit());
});
test('summaries allow 2–4 words; empty bodies, malformed headings and numbering fail', () => {
  for (const title of ['Two Words', 'Three Word Summary', 'Exactly Four Word Summary'])
    assert.match(checkHistory('', initial.replace('First User Prompt', title)), /passed/);
  for (const value of [
    initial.replace('First User Prompt', 'One'),
    initial.replace('First User Prompt', 'This Has Five Whole Words'),
    initial.replace('Preserve teh typo.', '   '),
    initial.replace('Prompt 1:', 'Prompt 2:'),
    initial.replace('Prompt 1:', 'Prompt 1'),
    initial + next.replace('Prompt 2:', 'Prompt 1:'),
    initial + next.replace('Prompt 2:', 'Prompt 3:'),
  ]) assert.throws(() => checkHistory('', value));
  assert.throws(() => checkHistory(initial, initial + '\nExtra text.\n'));
  assert.throws(() => checkHistory(initial, initial + next, 'Existing continuation\n', 'Changed continuation\n'));
});
test('hook requires all verification inputs to be staged', t => {
  const f = fixture(t); f.seed(); f.write(initial + next); f.git('add', 'PROMPTS.md');
  writeFileSync(join(f.cwd, 'untracked.txt'), 'related work');
  rejected(f.commit(), /Staged tree check failed/);
  f.git('add', 'untracked.txt'); writeFileSync(join(f.cwd, 'package.json'), '{"type":"module","changed":true}');
  rejected(f.commit(), /Staged tree check failed/);
});
test('continuations require the latest exact log hash and a unique appended step', t => {
  const f = fixture(t); f.seed();
  const digest = createHash('sha256').update(initial).digest('hex');
  const valid = `Prompt 1 | ${digest} | Complete the next logical work step\n`;
  const writeWork = text => { writeFileSync(join(f.cwd, 'PROMPT_WORK.md'), text); f.git('add', 'PROMPT_WORK.md'); };
  for (const invalid of [valid.replace(digest, 'wrong'), valid.replace('Prompt 1', 'Prompt 2'),
    `Prompt 1 | ${digest} |              \n`, `${valid.trim()} | extra field\n`]) {
    writeWork(invalid); rejected(f.commit());
  }
  writeWork(valid); assert.equal(f.commit().status, 0); rejected(f.commit());
  writeWork(valid + valid); rejected(f.commit());
  writeWork(valid.replace('Complete', 'Rewrite')); rejected(f.commit());
});

test('CI can verify the prompt log against an explicit base or validate a manual run', t => {
  const f = fixture(t); f.seed();
  const run = (...args) => spawnSync(process.execPath, ['scripts/check-prompts.mjs', ...args], { cwd: f.cwd, encoding: 'utf8' });
  assert.equal(run('--base', 'HEAD^').status, 0);
  assert.notEqual(run('--base', 'HEAD').status, 0);
  assert.equal(run('--history-only').status, 0);
  assert.notEqual(run('--base').status, 0);
  f.write(initial.replace('teh', 'the')); f.git('add', 'PROMPTS.md');
  assert.notEqual(run('--base', 'HEAD').status, 0);
});
