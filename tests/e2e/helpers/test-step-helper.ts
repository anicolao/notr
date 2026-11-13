import { type Page, type TestInfo, expect, test } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

type Verification = { spec: string; check: () => Promise<unknown> };
type StepOptions = { description: string; verifications: Verification[] };

// Adapted from ../../food's unified TestStepHelper; all waits here are <=2000 ms.
export class TestStepHelper {
  private count = 0;
  private title = '';
  private description = '';
  private steps: { description: string; image: string; specs: string[] }[] = [];
  constructor(private page: Page, private info: TestInfo) {}
  setMetadata(title: string, description: string) { this.title = title; this.description = description; }
  async step(id: string, options: StepOptions) {
    await test.step(options.description, async () => {
      for (const verification of options.verifications) await verification.check();
      await expect(this.page.locator('#status')).toHaveAttribute('data-state', 'ready');
      await expect.poll(() => this.page.evaluate(() => document.fonts.status), { timeout: 2000 }).toBe('loaded');
      const filename = `${String(this.count++).padStart(3, '0')}-${id.replaceAll('_', '-')}.png`;
      await expect(this.page).toHaveScreenshot(filename, { fullPage: true, timeout: 2000 });
      this.steps.push({ description: options.description,
        image: `./screenshots/${this.info.project.name}/${filename}`,
        specs: options.verifications.map(verification => verification.spec) });
    });
  }
  generateDocs() {
    const directory = dirname(this.info.file);
    mkdirSync(directory, { recursive: true });
    writeFileSync(join(directory, `README.${this.info.project.name}.md`),
      `# ${this.title || this.info.title}\n\n${this.description}\n\n` +
      this.steps.map(step => `## ${step.description}\n\n![${step.description}](${step.image})\n\n` +
        step.specs.map(spec => `- [x] ${spec}`).join('\n')).join('\n\n') + '\n');
  }
}
