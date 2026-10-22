# ReadAlong

**Textbook reading, one short line at a time.** ReadAlong turns a dense school passage into short lines, reads it aloud with word-by-word highlighting, explains tricky words in plain language, and ends with a 3-question check. No account, no upload, works offline, under 25 KB.

Built for **AccessED Hacks 2026** (Oct 17 – Nov 20, 2026). All code was written during the event.

## The learner, the task, the barrier
- **Learner:** a 12–13 year-old (grade 6–8) with dyslexia or still learning English, often on a cheap phone or a shared, slow connection.
- **Task:** read one science or civics paragraph for homework and understand it well enough to answer questions.
- **Barrier:** textbook sentences run 30+ words with several clauses. The sample photosynthesis paragraph scores **reading grade 16.1** (Flesch-Kincaid), college level, for a grade-7 topic. Most "accessible reading" tools need a login, a fast connection or a paid plan.

## Before and after (measured, not claimed)
| Sample (synthetic) | Original | ReadAlong short lines |
|---|---|---|
| Photosynthesis (grade 7 topic) | grade 16.1, ~32 words/sentence | grade 5.9, 16 lines of ≤12 words |
| Water cycle (grade 6) | grade 13.4 | grade 6.0 |
| Separation of powers (grade 8) | grade 14.5 | grade 6.1 |

Scores are Flesch-Kincaid computed by `src/logic.js` and checked in the tests. Shorter lines lower the formula score; they do not change the words, so this measures sentence load, not vocabulary. That is why Word help exists.

## Features
- **Short lines:** sentences are split at natural pauses (commas, "which", "because", "while"...) into lines of at most 12 words.
- **Read aloud with highlighting:** the device's built-in voice reads line by line, highlighting each word; adjustable speed.
- **Word help:** long or tricky words are underlined, split into sound chunks (pho·to·syn·the·sis) with a plain meaning; click to hear.
- **Quick check:** 3 fill-the-gap questions built from the passage, instant feedback, right answer always shown.
- **Reading settings:** larger text, wide letter/word spacing, cream paper, high contrast, one-line-at-a-time focus. Remembered on the device.
- **Keyboard first:** Space play/pause, J/K next/previous line, 1-3 answer, visible focus rings, skip link, ARIA live regions.
- **Low bandwidth:** ~24 KB total, no frameworks, no fonts downloaded, service worker makes it work offline after the first visit.
- **Private:** text never leaves the browser.

## Run it
Open `index.html` through any static server (`python3 -m http.server`), or use the hosted page. Tests: `npm test` (Node 20, no dependencies).

## Testing evidence
- 7 unit tests (`test/logic.test.js`): sentence splitting, syllables, ≤12-word lines, grade drop >3 levels for every sample, glossary lookup, well-formed deterministic quizzes.
- 17 browser checks (`tools/e2e.mjs`, headless Chrome): keyboard navigation, quiz by keys, settings persist, one-line mode, works offline, size < 40 KB, no console errors.

## Limitations (honest)
- English only. The glossary covers ~30 words used in the samples plus common school words; other tricky words get sound chunks but "no meaning saved".
- Syllable splitting is a heuristic and is sometimes off (e.g. chlo·rop·hyll).
- Read-aloud quality depends on the device voice; some browsers have none.
- Not tested with real students yet; the grade numbers are a formula, not a learning outcome.

## Credits and AI disclosure
No third-party libraries in the app. Puppeteer-core is used only for tests and the demo recording. Sample passages and glossary are original synthetic text. Built with AI coding assistance; all features were designed, reviewed and tested for this event. No real student data is used.

MIT License.
