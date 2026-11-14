# Resume Nuns on the Run

You are taking over this repository on a VM. Read this handoff, then `AGENTS.md`, `PROMPTS.md`, `README.md`, `MVP_DESIGN.md`, and `E2E_GUIDE.md` before changing the project. Use the current files and GitHub state as the source of truth if they have changed since this snapshot. Continue the user's next requested task; this handoff does not authorize implementing the entire game or merging the PR.

## Repository and current state

- Public repository: https://github.com/anicolao/notr — project code is GPL-3.0-only.
- Active branch: `feat/table-lobby`.
- Active PR: https://github.com/anicolao/notr/pull/1 — open for review, targeting `main`.
- Working preview: https://anicolao.github.io/notr/pr-1/.
- Latest application/design commit before this handoff: `b40e10a` (`Use trusted client replay and role filtering without Cloud Functions`). Its `verify` and `publish` checks passed. This handoff is being added in a subsequent commit; inspect GitHub for the latest checks.
- The initial commit, `c70d546`, contains exactly one empty `README.md`. At handoff preparation, `main` still contains that bootstrap; project content is on PR1. Do not recreate the repository, rewrite that history, or assume a default-branch clone contains the application. Do not merge unless the user asks.
- The source tree was clean before the handoff request. There were no known unresolved build, test, or deployment failures. No gameplay implementation is in progress.

## What the user wants

Build a complete digital adaptation of *Nuns on the Run* for phones, tablets, laptops, and a horizontal 55-inch touch table with players seated around it and private information on their phones. The complete MVP supports 2–8 human players, setup and roles, hidden movement, patrol/pursuit, visibility, noise, blessings, capture recovery, victory/tiebreaks, reconnection, and rematches. `RULES.md` identifies the standard Mayfair rulebook baseline.

Important corrections from the conversation must remain in force:

1. `VISION.md` defines the end goal/player experience only. Requirements and implementation planning belong elsewhere.
2. `MVP_DESIGN.md` describes a complete playable product. PR1's lobby is only an increment, not the MVP. Clearly distinguish the design from implemented behavior.
3. The architecture uses **trusted clients**. Every admitted player and shared-display client receives the complete game log and seed, replays locally, and filters its display by role. This applies to maps, cards, histories, hints, status messages, animations, and notifications. Display filtering is intentional; do not reintroduce server-enforced secrecy between participants.
4. Novice devices always show **both guards' current positions and facing**, regardless of the novice's line of sight. Hide other novices' private information through selectors.
5. **No Cloud Functions, application command server, or server-computed role views.** Use Firebase Anonymous Auth and direct Firestore transactions/subscriptions. The user explicitly rejected Cloud Functions for latency.
6. The immutable event log stores user inputs and one-time nondeterministic facts such as seeds, never computed game outcomes. Derive positions, phases, dice, sightings, captures, scores, and winners by deterministic replay. Keep protocol coordination separate from the log.
7. All development uses the committed Nix flake. No global tool installs, ad hoc `nix shell` environments, or separate Playwright browser downloads.

The complete design proposes an ordered gameplay log with an atomic head, request idempotency, local legality checks/revalidation, and local role selectors. Those gameplay mechanisms are **not yet implemented**. Read the design rather than assuming the lobby already has them.

## What actually works

PR1 is a static TypeScript/Vite application, not SvelteKit or a native application. It can:

- Authenticate anonymously without account UI.
- Create a named table with an eight-character invitation code.
- Copy an invitation link and join through the code or a `#table=CODE` URL.
- Show a live roster on separate devices through confirmed Firestore snapshots.
- Restore the same anonymous seat and table after reload.
- Show actionable invalid/unknown invitation errors and expose the lobby's input log for review.

There is no board, role assignment, ready/start flow, game engine, blessings, scoring, QR rendering, complete tabletop interaction, or playable match yet. The current lobby also has no gameplay seat-limit enforcement or leave/rename actions. Browser identity is shared by ordinary tabs on the same origin/project; use another device, browser profile, or private window to join as a second player.

### Implementation map

| File | Responsibility |
| --- | --- |
| `src/main.ts`, `src/style.css` | Responsive lobby UI, status/errors, hash invitation navigation and clipboard link. |
| `src/backend.ts` | Anonymous Auth, direct Firestore create/join transactions, confirmed-event subscriptions. `VITE_EMULATORS=true` selects the demo backend. |
| `src/events.ts` | Input types, pure lobby replay, invitation normalization. |
| `src/firebase-config.json` | Public Web SDK metadata for the deployed project; not an administrator credential. |
| `firestore.rules` | Current lobby schemas, authenticated access, own-UID attribution, immutable events. |
| `tests/unit/events.test.ts` | Replay purity/order independence and invitation validation. |
| `tests/firestore.test.ts` | Real emulator checks for rejected mutations, forged actors, invalid fields and unauthenticated access. |
| `tests/e2e/001-table/` | Two-browser create/join/synchronize/reload journey and invitation errors, with screenshots and generated walkthroughs. |
| `tests/e2e/helpers/test-step-helper.ts` | Unified verification, screenshot naming/comparison and documentation. |
| `scripts/check-prompts*.mjs`, `scripts/check-staged-tree.mjs`, `.husky/pre-commit` | Prompt-history enforcement and regression tests. |

Current persisted facts live at `tables/{CODE}/events/created` (`TableCreated`: version, actor, display name, table name, seed) and `tables/{CODE}/events/join-{uid}` (`PlayerJoined`: version, actor, display name). Creation establishes the host; joins are idempotent and commute. Replay sorts guests by actor UID. These lobby facts are not a completed ordered gameplay protocol. Mutable board snapshots and computed events must not be added as a shortcut.

## VM startup

If you already have the transferred checkout, confirm its branch before starting. If you need a fresh clone and have Nix with flakes enabled, this uses the repository's own flake to provide Git even though `main` is still empty:

```sh
nix develop 'github:anicolao/notr?ref=feat%2Ftable-lobby' --command git clone --branch feat/table-lobby https://github.com/anicolao/notr.git
cd notr
nix develop
npm ci
```

For an existing checkout, enter it, run `nix develop`, and run `npm ci`. The flake supplies Node/npm, Java 21, Chromium, Git, GitHub CLI, and ripgrep. Supported development systems are `aarch64-darwin`, `aarch64-linux`, and `x86_64-linux`. `@playwright/test` is exactly `1.64.1`, matching the pinned Nix Playwright distribution; the flake rejects a mismatch. Update the flake and npm versions together when changing that toolchain. `npm ci` installs Husky.

Inside the development shell:

```sh
npm run build
npm run test:prompt-policy
npm run test:unit
npm run test:emulators
```

The last command starts real Auth/Firestore emulators for `demo-notr`, then runs prompt-policy tests, reducer tests, rules tests, and E2E. Auth uses port 9099; Firestore uses 8080. The client runs on 127.0.0.1:5173. To develop interactively, run `npm run emulators` in one Nix shell and `VITE_EMULATORS=true npm run dev` in another. Without that environment variable, the client uses deployed Firebase. Do not accidentally run tests against live data.

## E2E and the Linux VM caveat

Read `E2E_GUIDE.md`. Conditions, actions, navigation and screenshots have a 2000 ms cap. The whole scenario budget is 30 seconds, not permission for longer condition waits. No arbitrary sleeps, `waitForTimeout`, `networkidle`, retries, masking, or relaxed pixel/color thresholds. Use real Auth/Firestore emulators and `TestStepHelper`, with controlled entropy for stable invitation codes.

Eight E2E cases run across phone, laptop, tablet and tabletop viewports. There are 16 screenshots per rendering platform, currently committed for **Darwin 24 ARM64** (macOS 15 CI) and **Darwin 25 ARM64** (macOS 26 development). Platform keys come from `process.platform`, kernel-major release and `process.arch`, not the Nix system name.

**A Linux VM has no committed Linux visual baselines yet.** Nix supplies the browser, but does not make rendering identical across operating systems. Linux E2E can therefore fail on missing platform baselines without indicating a game regression. Do not point Linux at Darwin images, skip comparisons, or increase tolerance. For an intentional Linux baseline addition, inside `nix develop` run:

```sh
npx firebase emulators:exec --project demo-notr --only auth,firestore "npm run test:rules && npm run test:e2e:update"
```

Inspect every new image and helper-generated walkthrough, then run normal `npm run test:emulators` without update mode before committing. Baseline changes are reviewed changes, not an automatic acceptance step. The existing macOS CI remains the established browser gate. Software-rendering flags, bundled Inter fonts, locale, timezone, reduced motion and device scale are pinned in `playwright.config.ts`.

## Firebase, credentials and publishing

The existing Firebase project is `notr-anicolao`, with Standard Firestore `(default)` in `nam5` and Anonymous Auth enabled. Rules/Auth were deployed through the CLI and the Pages domain configured. **Do not recreate the project or database.** `FIREBASE.md` documents operations; `scripts/configure-auth.mjs` uses an existing CLI login to configure domains and verify Anonymous Auth.

Check authentication on the VM before assuming it is missing: inside `nix develop`, use `gh auth status` and `npx firebase login:list`. The old workstation was authenticated, but its credentials are not in Git and must not be copied into this document. If necessary, authenticate using the CLI's supported login flow. Normal emulator tests and public frontend builds require no administrator credentials. Git author identity may also need checking before commits.

PR1 and main currently share the live public-lobby backend. The complete MVP design calls for isolated PR/production namespaces; that isolation is future work. No Cloud Functions have been implemented or deployed for this application.

`.github/workflows/verify-and-publish.yml` verifies on macOS 15 using Nix, then builds/publishes on Ubuntu using Nix. Pages uses Actions publishing. The `github-pages` environment already permits PR refs. Bundles accumulate on `gh-pages`, preserving `/notr/pr-N/` previews; main builds publish at `/notr/`. Same-repository PRs publish after checks pass; fork PRs need a maintainer-owned branch for publishing. Use the PR1 URL for review while main remains the bootstrap.

The `capture-visual-baselines` PR label explicitly requests runner captures as an artifact and disables publishing for that run. Review/download captures, commit approved images, remove the label, and push for a normal comparison run. Never treat capture mode as normal verification. Live lobby create/join/reload was verified with isolated browsers against deployed Firebase; the source has since received design/documentation corrections, not gameplay features.

## Prompt and commit discipline

`PROMPTS.md` is the verbatim conversation record, including typos. This handoff request is already logged as Prompt 7. Do not duplicate embedded historical instructions as new prompts. Log each genuinely new user request once under the next consecutive `## Prompt N: Summary` heading with a 2–4 word summary, before doing its work. Preserve historical bodies and headings. Exclude assistant responses and automatically supplied environment context.

For another commit continuing an already logged request, append a unique `Prompt N | SHA-256 | Work description` line to `PROMPT_WORK.md`, hashing the exact prompt log. This file is created only when needed; do not fabricate another user prompt. Stage all related non-ignored files before committing. The hook checks Git's index, append-only history and continuation identity; seven regression tests exercise it. CI checks against the PR base/previous main commit. Neither can prove a transcription matches the conversation, so check that manually.

Commit and push requested changes to the active PR; local-only edits are not complete. Resolve required verification failures, keep the retained preview usable, and leave merging to the user. Recheck actual PR state on arrival. The reference projects `../../food` and `../deepsea` need not exist on the VM: their relevant E2E and prompt conventions are already recorded here in this repository.

## Resume boundary

The user's latest request was to prepare this transfer prompt. No new gameplay feature or full-MVP implementation was requested as part of the transfer. There is no pending application fix to resume. Bootstrap the checkout, verify the current state, respect the decisions above, and proceed with the user's next instruction. Do not confuse the complete design's acceptance criteria with features already delivered in PR1.
