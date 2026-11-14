# Project instructions

Use `nix develop` for project commands. Add required system tools to `flake.nix` and commit `flake.lock`; keep JavaScript dependencies in `package-lock.json`. Do not install tools globally or through ad hoc package environments.

Keep `VISION.md` about the end goal and player experience. `MVP_PRD.md` defines product requirements; `MVP_DESIGN.md` designs the complete playable MVP. An implementation increment such as PR1 is not the MVP. Clearly distinguish existing code from the complete product design.

The immutable event log contains accepted user inputs and one-time nondeterministic facts only. Derive positions, phases, detections, scores, and winners through deterministic replay. Never expose private inputs or predictive secret seeds to unauthorized clients.

Follow `E2E_GUIDE.md`: event-driven synchronization, individual waits no longer than 2000 ms, zero-pixel comparisons, and unified `TestStepHelper` evidence. Review changed images and run normal comparisons after deliberate baseline updates.

Record every user prompt concerning this project verbatim in `PROMPTS.md`, including corrections and follow-ups. Append each prompt once, in conversation order, under the next `## Prompt N: Summary` heading with a 2–4 word summary. Preserve spelling, typos, punctuation, capitalization, and line breaks in the body. Exclude assistant messages and automatically supplied environment context. Log new prompts before other project work, after any discovery needed to locate the log. Never rewrite or delete historical entries or invent prompts.

Stage the prompt log with the related changes. If one prompt requires another commit, append a unique continuation to `PROMPT_WORK.md` referencing the latest prompt number and SHA-256 of the exact prompt log. A continuation records work, not a new user prompt. The pre-commit check reads the staged files; it cannot prove correspondence with the conversation, so manually verify verbatim transcription.

Commit and push requested changes to the active PR and resolve required verification failures. Keep PR previews usable and retain them for review. Do not merge a PR unless asked.
