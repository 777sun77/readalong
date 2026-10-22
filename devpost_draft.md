# Devpost submission draft — AccessED Hacks (https://accessed-hacks.devpost.com/)
Deadline: Nov 20, 2026 5:00 PM EST (= Nov 21 07:00 KST). Students only, 18+. $225 to 1st. 40 registrants (Oct 22).

**Project name:** ReadAlong
**Tagline:** Textbook reading, one short line at a time — read aloud, word help and a quick check, offline in 24 KB.
**Built with:** javascript, html5, css3, web-speech-api, service-worker
**Try it:** https://777sun77.github.io/readalong/  (after publishing)
**Code:** https://github.com/777sun77/readalong  (after publishing)
**Video:** docs/demo.mp4 (1:10, captions burned in) — upload to YouTube as unlisted, paste link

## Inspiration
A grade-7 photosynthesis paragraph in our sample scores reading grade 16 — college level — because its sentences run 30+ words. For a student with dyslexia or one still learning English, the barrier isn't the science, it's the sentence. Most reading aids need an account, fast internet or a subscription.

## What it does
(Use README "Features" list.)

## Before and after
Before: one 85-word sentence, grade 16.1. After: 16 lines of ≤12 words, grade 5.9, each read aloud with the current word highlighted, tricky words explained ("stomata: tiny holes on a leaf that let air in and out"), then three fill-the-gap questions.

## How we built it
Plain HTML/CSS/JS ES modules, no framework. Sentence chunking splits at commas, semicolons and clause words. Flesch-Kincaid grade and syllable heuristics are computed in the browser. The Web Speech API reads lines and boundary events drive the word highlight. A service worker caches the 7 files for offline use.

## Challenges
Chunking without breaking meaning; quiz prompts that are short enough for the target reader but still give context (we join a too-short line with its neighbour and drop distractors that appear in the prompt); syllable splitting with silent "e".

## Accomplishments
Measured grade drop of 7–10 levels on all three samples; full keyboard operation; works offline; 24 KB.

## What we learned / What's next
Formula scores measure sentence load, not understanding — next is testing with real learners (with consent), bigger plain-language glossary, Korean and Spanish UI, and teacher-shareable passage links.

## Event contribution / pre-existing work
Everything was built during the event (Oct 22, 2026). No pre-existing code. AI coding assistance used; disclosed in README.
