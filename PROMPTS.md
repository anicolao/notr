# Project prompts

User prompts are recorded verbatim below, in conversation order. Environment context and assistant messages are excluded.

## Prompt 1: Define Project Documents

We're going to write a digital board game implementation of "Nuns on The Run" targeting phones, tablets, laptops, and a tabletop game system which is like a giant 55" tablet that the palyers sit around with private info on their phones. Write a README.md and a VISION.md describing this project.

## Prompt 2: Focus Project Vision

VISION.md goes way beyond a vision, into implementation ideas and constraints. Stick to defining the end goal and if you want put other thoughts in MVP_PRD.md instead

## Prompt 3: Build First Increment

We're going to write this as an event-sourced game, using an immutable event log for game setup and all player decisions. Teh event log should never contain computed information, only the results of user actions or one time things like random number seeds to ensure replayability. we'll use firestore for the backend and you'll need to configure firestore with anonynous auth using the CLI. we'll host on github pages, and want each PR to have a preview URL that lets us see the game state. Summarize the rules of hte game in RULES.md and write an MVP_DESIGN.md with a minimal design doc, and then put up a first PR that lets us create and join a table. We'll want to follow the E2E discipline of a project like ../../food, zero-pixel tolerance, no more than 2000ms waits ever, everything event driven, using TestStepHelper just as in the other project. write an E2E guide to define this, and we'll review it on PR1. The github repo should be public and GPLv3, and the initial commit shoudl contain only an empty README.md file.

## Prompt 4: Require Nix Development

The E2E guide is wrong about nix usage; this project will always be developed on a nix system and we shoudl install all required tools with flake.nix and have instructions that say to use nix develop to run commands. Let's fix that and record that in the README too

## Prompt 5: Design Complete MVP

the MVP_DESIGN doc only describes PR1. WTF? we should have an actual viable product, not just a sign in, described in our design document. Let's fix that. Also, we need prompt discipline similar to htat in ../deepsea. You may write short 2-4 word prompt summaries in teh heading and record all prompts verbatim including my topos.

## Prompt 6: Trust Game Clients

in the MVP design: Novice device should show the positions of the guards; the architecture is trusted clients so we can rely on teh client to filter the display appropriately (for all participants); no cloud functions in the implementaiton (they are too slow). Fix the design with these things in mind.

## Prompt 7: Prepare VM Handoff

We're going to transfer this work to a VM. Write CONTEXT.md, a prompt that captures our work so far and will enable the other agent to resume easily from here.

## Prompt 8: Summarize Current Progress

 - summarize where we are at and what you think the next step is.

## Prompt 9: Resume Nuns Project

nuns

## Prompt 10: Fix PR Publishing

Yes, please fix publishing

## Prompt 11: Share Production Games

Do not use isolated PR and production namespaces; make it possible to test a PR on an ongoing production game state

## Prompt 12: Illustrate Game UX

Write UX_DESIGN.md with images of mockups that demonstrate what the UI would look like for the game

## Prompt 13: Redesign Game Experience

This looks really ugly. I was expecting you to use image generation to generate a slick looking game, not mock-ups that look like SVG/HTML diagrams rather than a game players would react positively to. Additionally, the ux design dosen't seem rules-aware: noise can't appear anywhre on the map for example; and it doesn't clearly communicate the user flow (how does the user choose a role int he lobby for just one example of many hwere the actual clicks and screens involved aran't shown). let's try again.
