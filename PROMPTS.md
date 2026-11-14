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
