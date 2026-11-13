# MVP design

## Scope

PR1 lets anonymous players create a named table, share a code/link, join from another device, see a live roster, and reload into their original seat. It exposes the lobby's event log for review. Gameplay, role assignment, seat limits, leaving, and renaming are subsequent increments.

## Event sourcing

Firestore is the durable source of truth. Every accepted setup choice and player decision is an immutable event. Events hold inputs and one-time nondeterministic facts, such as seeds; they never hold computed positions, rosters, turn numbers, legal moves, detections, scores, or winners. Pure, versioned reducers derive views by replay. No clocks, random calls, network calls, or side effects belong in replay.

PR1 stores a single logical log at `tables/{code}/events/{eventId}`:

| Event ID | Input fact |
| --- | --- |
| `created` | `TableCreated { version: 1, actor, displayName, tableName, seed }` |
| `join-{uid}` | `PlayerJoined { version: 1, actor, displayName }` |

The code is a cryptographically generated eight-character invitation. The seed is 128 bits generated once before the create transaction; transaction retries reuse it. `version` pins event semantics. Document IDs provide idempotency; events contain no projection fields or timestamps.

Creation contributes the host's seat. Join events commute, so PR1 does not require a sequence counter: creation logically precedes joins, and the roster sorts guests by actor ID. A transaction checks that creation exists and the actor has not already joined; rules reject overwriting or deleting any event. Rejoining with the same identity is a no-op. Simultaneous joins by different actors cannot overwrite one another.

Before noncommuting gameplay decisions, introduce an authoritative append boundary with explicit predecessor/event identity and pinned rules/PRNG versions. Reject stale decisions against replayed state. Store neither a new turn nor the result of a detection as an event: derive them from the recorded choices and deterministic randomness. Retain original event semantics across upgrades.

## Identity and visibility

Firebase Anonymous Auth persists browser identity. No account UI is needed. The table link identifies the table; it does not confer another player's identity. Clearing browser data loses the anonymous seat; cross-device seat recovery is outside PR1.

The invitation grants access to the **public lobby** for authenticated visitors who know the code. Table enumeration is denied. Security rules enforce actor identity, exact event schemas, creation-before-join, and append-only writes. This is an invite-code lobby, not an authorization model for secret gameplay. Firestore administrators can bypass client rules; infrastructure credentials must remain private.

Do not extend public lobby reads to secret movement or objectives. Before gameplay, add a trusted rules resolver and protected private input streams; distribute only authorized derived views. Never publish a seed capable of predicting hidden wishes or blessings. PR1's public seed is reserved for public randomness and is not used for private setup. Private randomness will need separate protected seed material. Computed views may be delivered or cached outside the immutable log; they remain disposable projections.

## Client and backend

Use TypeScript, Vite, and the Firebase Web SDK. The static client runs on GitHub Pages. Firestore transactions submit events; snapshot subscriptions rebuild the lobby. No polling, timer-driven state transitions, or optimistic claims of accepted decisions. Render committed snapshots; failures stay visible and do not invent events.

Deploy Firestore rules and the declared Anonymous Auth provider through the Firebase CLI. The checked-in CLI script adds the Pages domain and verifies Auth configuration using the Identity Toolkit admin API and an existing Firebase CLI login. Web Firebase configuration is public client metadata; CLI tokens and administrator credentials are never bundled or committed. See [FIREBASE.md](FIREBASE.md).

## Delivery and verification

The root commit contains only an empty `README.md`. PR1 adds the application, GPLv3 license, docs, tests, and workflows. Main deploys at `/notr/`; each same-repository PR deploys at `/notr/pr-N/`. Hash table links survive static hosting and preview subpaths. Each build displays its own live table state through its event subscription.

Preview bundles coexist on the Pages publishing branch; publishing one path preserves the others. A PR's preview and main currently use the same lobby backend, so a shared code works across versions. Keep event schemas compatible; isolate backends before testing incompatible gameplay schemas. Fork PRs run checks but require a maintainer-owned branch to publish a preview.

Use real Auth and Firestore emulators for E2E and adversarial rules tests. Verify replay purity, synchronization between isolated browsers, anonymous identity restoration, and rejection of mutations, forged actors, unknown fields, and unauthenticated access. Follow [E2E_GUIDE.md](E2E_GUIDE.md): event-driven conditions, 2000 ms maximum individual waits, zero-pixel visual comparisons, and unified `TestStepHelper` evidence.
