import test from "node:test";
import assert from "node:assert/strict";
import { splitSentences, syllables, gradeLevel, chunkSentence, findHardWords, makeCloze, plainLines, gradeOfLines } from "../src/logic.js";
import { GLOSSARY } from "../src/glossary.js";
import { PASSAGES } from "../src/passages.js";

test("splits sentences and keeps abbreviations", () => {
  assert.deepEqual(splitSentences("Plants grow. Dr. Kim said so! Really?"), ["Plants grow.", "Dr. Kim said so!", "Really?"]);
  assert.deepEqual(splitSentences(""), []);
});
test("syllable counts are sensible", () => {
  assert.equal(syllables("cat"), 1); assert.equal(syllables("water"), 2); assert.ok(syllables("photosynthesis") >= 4);
});
test("long sentences become lines of <= 12 words", () => {
  for (const p of PASSAGES) for (const l of plainLines(p.text, 12)) assert.ok(l.split(/\s+/).length <= 12, l);
  assert.deepEqual(chunkSentence("Short one.", 12), ["Short one."]);
});
test("short lines lower the reading grade for every sample", () => {
  for (const p of PASSAGES) {
    const g0 = gradeLevel(p.text), g1 = gradeOfLines(plainLines(p.text));
    assert.ok(g1 < g0 - 3, `${p.id}: ${g0} -> ${g1}`);
  }
});
test("hard words found with glossary meanings", () => {
  const h = findHardWords(PASSAGES[0].text, GLOSSARY);
  const w = h.map((x) => x.word);
  assert.ok(w.includes("photosynthesis") && w.includes("chlorophyll"));
  assert.ok(!w.includes("the") && !w.includes("sunlight"));
  assert.equal(h.find((x) => x.word === "stomata").meaning, GLOSSARY.stomata);
});
test("cloze questions are well-formed and deterministic", () => {
  for (const p of PASSAGES) {
    const a = makeCloze(p.text, GLOSSARY, 3, 7), b = makeCloze(p.text, GLOSSARY, 3, 7);
    assert.deepEqual(a, b); assert.equal(a.length, 3);
    for (const q of a) { assert.ok(q.prompt.includes("_____")); assert.ok(q.options.includes(q.answer)); assert.equal(new Set(q.options).size, q.options.length); }
  }
});
import { syllabify } from "../src/logic.js";
test("syllabify keeps letters and handles silent e", () => {
  for (const w of ["glucose", "atmosphere", "photosynthesis", "representatives"]) assert.equal(syllabify(w).replace(/·/g, ""), w);
  assert.equal(syllabify("glucose"), "glu·cose");
});
