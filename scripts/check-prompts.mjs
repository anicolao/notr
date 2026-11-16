import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

export function checkHistory(previous, staged, oldWork = '', work = '') {
  if (!staged.startsWith(previous)) throw new Error('Existing prompt history is immutable; append new entries.');
  if (!work.startsWith(oldWork)) throw new Error('Continuation history is append-only.');
  const headings = [...staged.matchAll(/^## Prompt ([1-9][0-9]*): ([^\n]+)\n\n/gm)];
  if (!headings.length) throw new Error('Record the verbatim user prompts in PROMPTS.md.');
  const headingLines = staged.match(/^## Prompt.*$/gm) ?? [];
  if (headingLines.length !== headings.length) throw new Error('Use "## Prompt N: Summary" followed by a blank line.');
  for (let i = 0; i < headings.length; i++) {
    const entry = headings[i];
    const words = entry[2].trim().split(/\s+/).length;
    if (Number(entry[1]) !== i + 1) throw new Error('Prompt numbers must be consecutive, starting at 1.');
    if (words < 2 || words > 4) throw new Error('Prompt summaries must contain 2–4 words.');
    const body = staged.slice(entry.index + entry[0].length, headings[i + 1]?.index ?? staged.length);
    if (!body.trim()) throw new Error('Prompt bodies must be nonempty and verbatim.');
  }
  const added = staged.slice(previous.length);
  if (added) {
    if (previous && !/^\n+## Prompt /.test(added)) throw new Error('Append a new prompt entry, not text to an old prompt.');
    return 'Prompt log check passed.';
  }
  const line = work.slice(oldWork.length).trim();
  const [number, hash, description, extra] = line.split(' | ');
  const digest = createHash('sha256').update(staged).digest('hex');
  if (extra !== undefined || number !== `Prompt ${headings.length}` || hash !== digest
      || !description || description.trim() !== description || !/^[^\n|]{10,200}$/.test(description)
      || oldWork.split('\n').includes(line)) {
    throw new Error('Stage a new prompt, or append a unique continuation for the latest prompt and exact log SHA-256 to PROMPT_WORK.md.');
  }
  return 'Prompt continuation check passed.';
}

const git = args => execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
function read(ref, file) {
  const paths = git(ref === ':' ? ['ls-files', '--', file] : ['ls-tree', '--name-only', ref, '--', file]);
  return paths.trim() ? git(['show', `${ref === ':' ? ':' : ref + ':'}${file}`]) : '';
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const baseIndex = process.argv.indexOf('--base');
    const base = baseIndex >= 0 ? process.argv[baseIndex + 1] : 'HEAD';
    if (!base) throw new Error('--base requires a Git ref.');
    const entry = git(['ls-files', '--stage', '--', 'PROMPTS.md']);
    if (!/^100644 [0-9a-f]+ 0\tPROMPTS\.md\n$/.test(entry)) throw new Error('Stage PROMPTS.md as a regular file.');
    console.log(checkHistory(process.argv.includes('--history-only') ? '' : read(base, 'PROMPTS.md'), read(':', 'PROMPTS.md'),
      read(base, 'PROMPT_WORK.md'), read(':', 'PROMPT_WORK.md')));
  } catch (error) {
    console.error(`Prompt log check failed: ${error.message}`);
    process.exitCode = 1;
  }
}
