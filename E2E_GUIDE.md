# E2E discipline

This guide is part of PR1's review surface. It adopts `../../food`'s unified `TestStepHelper` pattern with strict synchronization and visual checks. E2E scenarios are the primary evidence for user-visible behavior; reducer and rules tests cover boundaries the UI cannot prove.

## Event-driven synchronization

- No sleeps, `waitForTimeout`, timer-based retries, `networkidle`, or fixed delays. Firestore keeps long-lived connections open.
- Wait for observable conditions: a button becomes enabled after Auth, a committed snapshot renders a roster, an alert appears after a rejected command.
- Every action, navigation, assertion, screenshot, and explicit condition wait is capped at **2000 ms**. Never raise the limit to make a failing test pass.
- The whole scenario has a 30-second execution budget, which is not permission for any individual wait to exceed 2000 ms. Emulator/browser installation happens before scenarios, outside application synchronization.
- No retries in CI. Diagnose missing events, incorrect readiness signals, or slow behavior instead of concealing failures.

Application state changes through user actions, Auth completion, transactions, and subscriptions. The UI's `#status[data-state="ready"]` is an observable readiness signal; it does not replace assertions about the expected state.

## Unified steps

Each scenario directory contains its spec, generated documentation per viewport, and committed baseline screenshots:

```text
tests/e2e/001-table/
  001-table.spec.ts
  README.phone.md
  screenshots/phone/000-welcome.png
```

Use `TestStepHelper` from `tests/e2e/helpers/test-step-helper.ts`:

```ts
const tester = new TestStepHelper(page, testInfo);
tester.setMetadata('Table lobby', 'Two players gather at one table.');
await tester.step('created', {
  description: 'Host opens a table',
  verifications: [
    { spec: 'Host has a seat', check: () => expect(page.getByRole('listitem')).toHaveCount(1) },
  ],
});
tester.generateDocs();
```

Each step verifies behavior, checks readiness and font loading, captures and compares its numbered screenshot, and records documentation. The helper owns names and counters. Do not hand-number screenshots or maintain a separate verification narrative. Assertions without screenshots are appropriate for nonvisual rejection paths; every main user journey needs illustrated steps.

## Zero-pixel tolerance

Set both `maxDiffPixels: 0` and `threshold: 0`. Do not mask dynamic regions, allow a percentage difference, or disable screenshot assertions. Use pinned Playwright, bundled fonts, fixed viewports, locale, timezone, device scale, reduced motion, and software rendering. CI uses macOS with the lockfile's Chromium revision. Treat rendering-platform changes as explicit baseline migrations.

Fixtures control one-time entropy so table codes stay stable in screenshots. Auth identities still come from the real Auth emulator. Keep opaque identities and seed material out of the illustrated UI; test the event payload separately. Do not stub the transport, replace Firestore with local storage, or mock successful joins.

Review baseline changes as product changes. Generate them deliberately with `--update-snapshots`, inspect every image and its generated verification doc, then run without update mode to prove exact agreement. CI never updates baselines automatically. Screenshots and traces from failures are artifacts for diagnosis, not replacements for committed expectations.

## Running the suite

Requires Node 24 and Java 21+ for the Firestore emulator:

```sh
npm ci
npx playwright install chromium
npm run test:emulators
```

For deliberate baseline updates:

```sh
npx firebase emulators:exec --project demo-notr --only auth,firestore "npm run test:e2e:update"
```

On a Nix workstation without Java, prefix the emulator command with `nix shell nixpkgs#jdk21 --command`. The `demo-notr` project prevents tests from touching the deployed backend. Rules tests clear emulator data before E2E; browser contexts are isolated and each viewport uses its own deterministic table code.

Coverage in PR1 includes create, invitation join, live synchronization, restore after reload, invalid/unknown invitations, four screen sizes, immutable log inspection, and malicious Firestore writes. The 1920×1080 viewport is a layout check; real 55-inch hardware and reachability still require in-person testing.
