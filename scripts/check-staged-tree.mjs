import { execFileSync } from 'node:child_process';

try {
  const git = args => execFileSync('git', args, { encoding: 'utf8' });
  const changes = git(['diff', '--name-only']) + git(['ls-files', '--others', '--exclude-standard']);
  if (changes) throw new Error(`Stage all related files before committing:\n${changes}`);
} catch (error) {
  console.error(`Staged tree check failed: ${error.message}`);
  process.exitCode = 1;
}
