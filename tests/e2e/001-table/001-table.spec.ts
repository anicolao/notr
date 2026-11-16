import { test, expect } from '@playwright/test';
import { TestStepHelper } from '../helpers/test-step-helper.ts';

test('create, join, synchronize and restore a table', async ({ page, browser }, info) => {
  const faults: string[] = [];
  page.on('pageerror', error => faults.push(error.message));
  // Control only one-time browser entropy; all Auth/Firestore traffic uses real emulators.
  const byte = ['phone', 'laptop', 'tablet', 'tabletop'].indexOf(info.project.name);
  await page.addInitScript(value => {
    const original = crypto.getRandomValues.bind(crypto);
    crypto.getRandomValues = ((array: ArrayBufferView<ArrayBuffer>) => {
      if (array instanceof Uint8Array && (array.length === 8 || array.length === 16)) {
        array.fill(value); return array;
      }
      return original(array);
    }) as typeof crypto.getRandomValues;
  }, byte);
  const tester = new TestStepHelper(page, info);
  tester.setMetadata('Create and join a table', 'Two anonymous players share a table backed by the immutable Firestore event log.');
  await page.goto('/');
  await tester.step('welcome', { description: 'Find a table', verifications: [
    { spec: 'Anonymous authentication enables creating and joining.', check: () => expect(page.getByRole('button', { name: 'Create a table' })).toBeEnabled() },
  ] });
  await page.getByLabel('Your name', { exact: true }).fill('Alex');
  await page.getByRole('button', { name: 'Create a table' }).click();
  await expect(page.getByLabel('Table lobby')).toBeVisible();
  const code = (await page.getByLabel('Invitation code').textContent())!;
  await tester.step('created', { description: 'Host opens the table', verifications: [
    { spec: 'The host appears in the roster with an invitation code.', check: () => expect(page.getByRole('listitem')).toHaveText(['AlexHost · You']) },
  ] });

  const guestContext = await browser.newContext({ viewport: { width: 393, height: 852 } });
  const guest = await guestContext.newPage();
  guest.on('pageerror', error => faults.push(error.message));
  await guest.goto(`/#table=${code}`);
  await expect(guest.getByRole('button', { name: 'Join a table' })).toBeEnabled();
  await guest.getByLabel('Your name', { exact: true }).fill('Sam');
  await guest.getByRole('button', { name: 'Join a table' }).click();
  await expect(guest.getByRole('listitem')).toHaveText(['AlexHost', 'SamPlayer · You']);
  await tester.step('joined', { description: 'A friend joins from a separate device', verifications: [
    { spec: 'The host receives the guest through the Firestore subscription.', check: () => expect(page.getByRole('listitem')).toHaveText(['AlexHost · You', 'SamPlayer']) },
  ] });
  await guest.reload();
  await expect(guest.getByRole('listitem')).toHaveCount(2);
  await page.reload();
  await tester.step('restored', { description: 'Reload restores the same table and seat', verifications: [
    { spec: 'The original anonymous identity and both seats survive reload.', check: () => expect(page.getByRole('listitem')).toHaveText(['AlexHost · You', 'SamPlayer']) },
    { spec: 'There are exactly two immutable facts; reload did not add an event.', check: async () => {
      const events = JSON.parse((await page.locator('#events').textContent())!);
      expect(events.map((event: { type: string }) => event.type).sort()).toEqual(['PlayerJoined', 'TableCreated']);
    } },
    { spec: 'Both browser contexts run without uncaught application errors.', check: async () => expect(faults).toEqual([]) },
  ] });
  tester.generateDocs();
  await guestContext.close();
});

test('invalid and unknown invitations show actionable errors', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Join a table' })).toBeEnabled();
  await page.getByLabel('Your name', { exact: true }).fill('Visitor');
  await page.getByLabel('Table code', { exact: true }).fill('bad');
  await page.getByRole('button', { name: 'Join a table' }).click();
  await expect(page.getByRole('alert')).toHaveText('Enter an 8-character table code.');
  await page.getByLabel('Table code', { exact: true }).fill('ZZZZZZZZ');
  await page.getByRole('button', { name: 'Join a table' }).click();
  await expect(page.getByRole('alert')).toHaveText('Table not found. Check the code and try again.');
  await expect(page.getByLabel('Find your table')).toBeVisible();
});
