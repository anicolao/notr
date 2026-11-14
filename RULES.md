# Rules summary

Baseline: [Mayfair rulebook](https://mind-maze.uk/nuns-on-the-run/rules/notr-rules.pdf), standard game, without optional variants. This overview is not a replacement for its cards and visibility tables.

- **Players:** 2–8. One controls both guards; at eight, two share that duty. Everyone else is a novice.
- **Setup:** novices receive secret wishes and blessings; guards receive blessings and patrol routes. Blessings are single-use advantages.
- **Novice goal:** stop at the required keys, then the wish location, then return home first. Captures break simultaneous-win ties.
- **Turns:** novices move secretly, reveal movement types, and check noise; guards move, reveal movement types, clear clues, and listen. Novices get two opening moves using one movement type.
- **Movement:** novices stand still, sneak 1–2, walk 3–4, or run up to 5 dots. Noise modifiers respectively: −3, −2, −1, 0. Guards walk 3–4 or run 5–6; running prevents hearing.
- **Detection:** sight checks each traversed dot, facing, walls, doors, six-dot range, and special visibility rules. Hearing uses dice, movement modifiers, and path distance. Clues allow guards to leave patrols.
- **Capture:** sharing a guard's dot scores a capture. The novice keeps keys, loses the collected wish, and walks home while visible; caught status temporarily prevents recapture.
- **Guard victory:** captures equal player count, or no novice wins by turn 15's end.

PR1 implements the lobby only. Board geometry, card effects, noise direction choices, capture recovery, and exact phase timing need executable rule scenarios before gameplay is added.
