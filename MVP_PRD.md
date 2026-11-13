# MVP Product Requirements

**Status:** proposed requirements for a complete first game. PR1 implements only the table lobby. The chosen event-sourced Firestore architecture, Anonymous Auth, GitHub Pages delivery, and PR1 boundary are defined in [MVP_DESIGN.md](MVP_DESIGN.md). Tabletop hardware details remain open.

## Objective

Deliver a complete game of *Nuns on the Run* for human players in private sessions, on phones, tablets, and laptops, and around a 55-inch tabletop touchscreen with companion phones.

The desired end experience is defined in [VISION.md](VISION.md). This document captures proposed first-release behavior, constraints, validation, and questions to resolve.

## Product requirements


### Preserve the game's tension

Hidden movement, asymmetric roles, and uncertain clues are central to the experience. Automate the administration without introducing hints the physical rules would not provide. Legal-action previews, error messages, animation timing, and histories must respect what the acting player is allowed to know.

Choose a rules edition explicitly. Document interpretations of ambiguous cases and keep optional variants separate from the baseline game.

### Make privacy part of the game model

There are distinct audiences: the shared table, each novice, and the player or players controlling the guards. Each sees exactly what the rules permit. A novice's private route and objective belong on that player's device; the public board shows only permitted sightings, clues, and other public state.

Privacy must hold across network messages, reconnects, notifications, logs, and device changes. Joining a session must not grant access to another player's seat or secrets.

### Design for people around a table

A horizontal 55-inch screen has no single viewing direction. Keep the board legible from multiple sides, offer orientation-aware controls where needed, and place frequent interactions within comfortable reach. Players should not have to reach across the entire display to complete every turn.

Use phones for private route planning, objectives, and confirmations that would expose secrets on the shared screen. Public actions can be made on the table or an authorized personal device, with synchronized feedback. Input from several people must not create conflicting actions or advance the turn twice.

### Make every personal device sufficient

A phone-only player needs a usable board, understandable clues, and a clear way to select and review a move. Tablets and laptops can reveal more spatial context while keeping the same decisions available. Zooming, panning, and inspection must work without making precise taps on tiny board locations mandatory.

Support touch, mouse, and keyboard where appropriate. Use readable text, distinct symbols, and labels alongside color; allow motion and sound to be reduced without losing essential information.

### Keep attention on play

Make it clear whose action is needed, what decisions are available, and what has just happened. Let players review an intended action before committing it. Any undo policy must account for information already revealed.

Guidance should explain a rule when it becomes relevant without revealing hidden facts. Public notifications and phone lock-screen previews must avoid disclosing private game information.

### Make interruptions recoverable

A phone can sleep, a browser can reload, and a connection can drop. Preserve committed progress, show connection status, and let players reclaim their own seats. A reconnect must restore the right private view without replaying an action or revealing another role's information.

The group should be able to understand whether play is waiting, paused, or ready to continue. Hosting and persistence choices must support that promise.

## A representative tabletop session

1. A host starts a game on the table. Players scan a QR code or enter a session code on their phones.
2. Players claim seats and roles. Each phone receives its permitted setup information; the table displays the public setup.
3. Novices plan and submit private moves on their phones. The game resolves actions in the order required by the rules.
4. Guard players make patrol and pursuit decisions using the information available to them. Sightings, sounds, and captures appear only where the rules allow them.
5. Turn prompts and concise feedback keep the group synchronized. A disconnected player can rejoin their seat.
6. The game resolves victory and explains the result. Any optional reveal of private routes happens only after the game ends.

The same session flow should work entirely on personal devices, with each screen presenting both the public board and its player's private controls.

## Scope and priorities

The first milestone is a complete, faithful game for human players in a private session. Prove rules correctness and information separation early, then prove that people can comfortably play around the actual table.

Prioritize clear maps and controls, reliable session synchronization, reconnect support, and understandable turn resolution. Use placeholder assets while the interaction and rules are being validated.

Public matchmaking, computer opponents, campaigns, ranked competition, alternate boards, and elaborate audiovisual effects are outside the initial scope. They can be evaluated after the core game works well across the target devices.

## What success looks like

- A group can join, understand its roles, and finish a game without manual movement logs or an external referee.
- Novices and guards can make informed decisions using exactly the information their roles allow.
- A full game works on phones, tablets, and laptops, including a group using mixed device types.
- People seated on every side of the 55-inch table can read the public state and act comfortably with their phones.
- Reloading or reconnecting preserves the match, seat ownership, and committed actions.
- Playtesters spend their attention on risk, pursuit, and conversation, with little time spent resolving interface confusion.

Before calling the first release ready, verify complete games against the selected rules, test that public and opponent clients never receive unauthorized state, and run full sessions on the target device configurations.

## Decisions to resolve during discovery

- Which rules edition and player configurations define the first release?
- What operating system, browser or runtime, resolution, and simultaneous-touch capabilities does the tabletop provide?
- Where does the session authority run, and what connectivity is required for local and remote play?
- How are games saved, seats reclaimed, and sessions continued if the host disconnects?
- Does the selected TypeScript/Vite client meet the tabletop's runtime and input requirements?
- Which original assets may be used, and what branding and distribution model will the project adopt?
