// ReadAlong core logic: pure functions, no DOM. Used by the app and the tests.

export function splitSentences(text) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (!clean) return [];
  const out = [];
  const re = /[^.!?]+(?:[.!?]+["')\]]*|$)/g;
  let m;
  while ((m = re.exec(clean))) {
    const s = m[0].trim();
    // Merge abbreviations like "e.g." or "Dr." into the next piece.
    if (out.length && /\b(?:e\.g|i\.e|Dr|Mr|Mrs|Ms|St|vs|etc)\.$/i.test(out[out.length - 1])) {
      out[out.length - 1] += " " + s;
    } else out.push(s);
  }
  return out;
}

export function words(text) {
  return (String(text || "").match(/[A-Za-z][A-Za-z'-]*/g) || []);
}

export function syllables(word) {
  let w = String(word).toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 0;
  if (w.length <= 3) return 1;
  w = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "");
  const groups = w.match(/[aeiouy]{1,2}/g);
  return Math.max(1, groups ? groups.length : 1);
}

// Split a word into rough syllable chunks for display, e.g. "photosynthesis" -> "pho·to·syn·the·sis".
export function syllabify(word) {
  const w = String(word);
  const parts = w.match(/[^aeiouy]*[aeiouy]+(?:[^aeiouy]*$|[^aeiouy](?=[^aeiouy]))?/gi);
  if (!parts || parts.join("") !== w) return w;
  // Silent final "e" (glucose, atmosphere) and "-ide" belong to the previous chunk.
  if (parts.length > 1 && /^[^aeiouy]*e$/i.test(parts[parts.length - 1])) parts.splice(-2, 2, parts[parts.length - 2] + parts[parts.length - 1]);
  return parts.join("·");
}

export function gradeLevel(text) {
  const sents = splitSentences(text);
  const ws = words(text);
  if (!sents.length || !ws.length) return 0;
  const syl = ws.reduce((a, w) => a + syllables(w), 0);
  const g = 0.39 * (ws.length / sents.length) + 11.8 * (syl / ws.length) - 15.59;
  return Math.round(Math.max(0, g) * 10) / 10;
}

const BREAKERS = /,\s+|;\s+|:\s+|\s+(?=(?:which|because|while|although|where|when|but|so that|and then)\b)/i;

// Break a long sentence into short lines (<= maxWords) at natural pauses.
export function chunkSentence(sentence, maxWords = 12) {
  const s = String(sentence).trim();
  if (words(s).length <= maxWords) return [s];
  const pieces = s.split(BREAKERS).map((p) => p.trim()).filter(Boolean);
  const out = [];
  for (const p of pieces) {
    if (words(p).length <= maxWords) { out.push(p); continue; }
    const toks = p.split(/\s+/);
    for (let i = 0; i < toks.length; i += maxWords) out.push(toks.slice(i, i + maxWords).join(" "));
  }
  return out;
}

export const COMMON = new Set(("the of and to in is was for on are as with his they at be this from have or by one had not but what all were when we there can an your which their said if do will each about how up out them then she many some so these would other into has more her two like him see time could no make than first been its who now people my made over did down only way find use may water long little very after words called just where most know get through back much before go good new write our used me man too any day same right look think also around another came come work three word must because does part even place well such here take why things help put years different away again off went old number great tell men say small every found still between name should home big give air line set own under read last never us left end along while might next sound below saw something thought both few those always looked show large often together asked house don't world going want school important until form food keep children feet land side without boy once animals life enough took sometimes four head above kind began almost live page got earth need far hand high year mother light parts country father let night following picture being study second eyes soon times story boys since white days ever paper hard near sentence better best across during today others sure means however leave family example energy available opening openings depending product by-product plants plant sunlight carbon oxygen sugar cells cell leaves process").split(" "));

export function isHardWord(word, glossary = {}) {
  const lw = String(word).toLowerCase();
  if (glossary[lw]) return true;
  if (COMMON.has(lw)) return false;
  return syllables(lw) >= 3 && lw.length >= 7;
}

export function findHardWords(text, glossary = {}) {
  const seen = new Map();
  for (const w of words(text)) {
    const lw = w.toLowerCase();
    if (seen.has(lw) || !isHardWord(lw, glossary)) continue;
    seen.set(lw, { word: lw, split: syllabify(lw), meaning: glossary[lw] || null });
  }
  return [...seen.values()];
}

// Build fill-in-the-blank questions from key words, deterministic for a given seed.
export function makeCloze(text, glossary = {}, count = 3, seed = 1) {
  // Use the short lines (not whole sentences) so questions stay easy to read.
  const sents = plainLines(text, 14);
  const hard = findHardWords(text, glossary);
  const keys = [...hard.filter((h) => h.meaning), ...hard.filter((h) => !h.meaning)].map((h) => h.word);
  let r = seed >>> 0 || 1;
  const rand = () => ((r = (r * 1664525 + 1013904223) >>> 0) / 2 ** 32);
  const qs = [];
  const used = new Set();
  for (const key of keys) {
    if (qs.length >= count) break;
    const re = new RegExp(`\\b${key}\\b`, "i");
    const i = sents.findIndex((x, j) => re.test(x) && !used.has(j));
    if (i < 0) continue;
    let s = sents[i];
    if (words(s).length < 6) s = i + 1 < sents.length && !/[.!?]$/.test(s) ? `${s} ${sents[i + 1]}` : `${sents[i - 1] || ""} ${s}`.trim();
    used.add(i);
    const others = keys.filter((k) => k !== key && !new RegExp(`\\b${k}\\b`, "i").test(s));
    const distract = [];
    while (distract.length < Math.min(2, others.length)) {
      const d = others[Math.floor(rand() * others.length)];
      if (!distract.includes(d)) distract.push(d);
    }
    const options = [key, ...distract].sort(() => rand() - 0.5);
    qs.push({ prompt: s.replace(new RegExp(`\\b${key}\\b`, "i"), "_____"), answer: key, options });
  }
  return qs;
}

export function plainLines(text, maxWords = 12) {
  return splitSentences(text).flatMap((s) => chunkSentence(s, maxWords));
}

export function gradeOfLines(lines) {
  // Each line read as its own unit: average words per line drives the score down.
  return gradeLevel(lines.map((l) => l.replace(/[.!?]*$/, ".")).join(" "));
}
