# Nuns on the Run

An event-sourced digital adaptation of *Nuns on the Run* for phones, tablets, laptops, and a 55-inch tabletop touchscreen with private information on companion phones.

**PR1: the table lobby.** Create a table, share its invitation code or link, and join from another device. The roster updates live and your anonymous seat survives reload. Expand **Table event log** to inspect the immutable inputs behind the current view. Gameplay comes in later increments.

## Development

Requires Node 24 and Java 21+ for the Firestore emulator.

```sh
npm ci
npx playwright install chromium
npm run emulators
```

In a second terminal, start the client against those emulators:

```sh
VITE_EMULATORS=true npm run dev
```

Open the printed local URL. Run `npm run test:emulators` for reducer, security-rule, and E2E checks. Run `npm run build` to typecheck and produce the static site in `dist/`. Running the client without `VITE_EMULATORS=true` connects to the deployed Firebase project.

## Architecture and delivery

Accepted setup choices and player decisions are appended to an immutable Firestore event log. Events contain user inputs and one-time facts such as seeds; views are computed by deterministic replay. No computed game information belongs in the log.

The client uses TypeScript, Vite, Firebase Anonymous Auth, and Firestore subscriptions. GitHub Pages hosts the static build. Main publishes at `https://anicolao.github.io/notr/`; same-repository PRs publish at `https://anicolao.github.io/notr/pr-N/` after checks pass. Preview and main currently share the public lobby backend. A table link uses a hash, so it works without server-side routing.

The repository's initial commit contains only an empty `README.md`. All project content is introduced for review in PR1.

## Documents

- [VISION.md](VISION.md): the end goal and player experience.
- [RULES.md](RULES.md): a summary of the physical game.
- [MVP_PRD.md](MVP_PRD.md): proposed product requirements for the complete first game.
- [MVP_DESIGN.md](MVP_DESIGN.md): minimal design and the PR1 event contract.
- [E2E_GUIDE.md](E2E_GUIDE.md): TestStepHelper, event-driven conditions, 2000 ms wait limit, and zero-pixel comparisons.
- [FIREBASE.md](FIREBASE.md): backend provisioning and operations.

## License and credits

Project code is licensed under [GPLv3](LICENSE) (`GPL-3.0-only`). *Nuns on the Run* is a board game by Fréderic Moyersoen; see the [publisher's description](https://www.towertacticgames.com/en/products/notr-001). The code license does not grant rights to the original game's artwork, branding, or rulebook. PR1 includes no original board or card artwork. The bundled Inter font is distributed by `@fontsource-variable/inter` under the SIL Open Font License.
