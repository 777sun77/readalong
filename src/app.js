import { plainLines, gradeLevel, gradeOfLines, findHardWords, makeCloze, words } from "./logic.js";
import { GLOSSARY } from "./glossary.js";
import { PASSAGES } from "./passages.js";

const $ = (s) => document.querySelector(s);
const state = { lines: [], cur: 0, playing: false, quiz: [], answered: 0, correct: 0 };
const hardSet = new Set();

for (const p of PASSAGES) $("#sample").append(new Option(p.title, p.id));
$("#sample").append(new Option("(my own text)", "own"));
$("#src").value = PASSAGES[0].text;
$("#sample").addEventListener("change", (e) => {
  const p = PASSAGES.find((x) => x.id === e.target.value);
  if (p) { $("#src").value = p.text; build(); } else { $("#src").value = ""; $("#src").focus(); }
});
$("#go").addEventListener("click", () => { build(); $("#reader").focus(); });
$("#src").addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); build(); $("#reader").focus(); } });

function esc(s) { return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]); }

function renderLine(text) {
  let i = 0;
  return text.replace(/[A-Za-z][A-Za-z'-]*|[^A-Za-z]+/g, (tok) => {
    if (!/^[A-Za-z]/.test(tok)) return esc(tok);
    const cls = hardSet.has(tok.toLowerCase()) ? "w0 hard" : "w0";
    return `<span class="${cls}" data-i="${i++}">${esc(tok)}</span>`;
  });
}

function build() {
  stop();
  const text = $("#src").value.trim();
  if (!text) { $("#before").textContent = "Paste some text first."; return; }
  state.lines = plainLines(text, 12);
  state.cur = 0;
  hardSet.clear();
  const hard = findHardWords(text, GLOSSARY);
  hard.forEach((h) => hardSet.add(h.word));
  const g0 = gradeLevel(text), g1 = gradeOfLines(state.lines);
  const sentWords = Math.round(words(text).length / Math.max(1, text.split(/[.!?]+\s/).length));
  $("#before").textContent = `Original: reading grade ${g0}, about ${sentWords} words per sentence`;
  $("#after").textContent = `Short lines: grade ${g1}, ${state.lines.length} lines`;
  $("#lines").innerHTML = state.lines.map((l, i) => `<li tabindex="-1" data-n="${i}">${renderLine(l)}</li>`).join("");
  $("#hard").innerHTML = hard.map((h) => `<li><button data-say="${esc(h.word)}"><b>${esc(h.split)}</b><small>${esc(h.meaning || "no meaning saved: ask your teacher or check a dictionary")}</small></button></li>`).join("") || "<li class=muted>No tricky words found.</li>";
  state.quiz = makeCloze(text, GLOSSARY, 3, text.length);
  state.answered = 0; state.correct = 0; $("#score").textContent = "";
  $("#quiz").innerHTML = state.quiz.map((q, qi) => `<div class="q" role="group" aria-labelledby="q${qi}"><p id="q${qi}"><b>${qi + 1}.</b> ${esc(q.prompt)}</p><div class="opts">${q.options.map((o, oi) => `<button data-q="${qi}" data-o="${esc(o)}">${oi + 1}. ${esc(o)}</button>`).join("")}</div></div>`).join("") || "<p class=muted>Not enough key words for a quiz in this text.</p>";
  setCur(0);
}

function setCur(n) {
  state.cur = Math.max(0, Math.min(state.lines.length - 1, n));
  document.querySelectorAll("#lines li").forEach((li, i) => li.classList.toggle("cur", i === state.cur));
  $("#pos").textContent = state.lines.length ? `Line ${state.cur + 1} of ${state.lines.length}` : "";
}

function voice() { return speechSynthesis.getVoices().find((v) => /^en/i.test(v.lang)); }

function speakLine() {
  if (!("speechSynthesis" in window)) { $("#pos").textContent = "Read-aloud is not available in this browser."; state.playing = false; return; }
  const li = document.querySelector(`#lines li[data-n="${state.cur}"]`);
  const u = new SpeechSynthesisUtterance(state.lines[state.cur]);
  u.rate = Number($("#rate").value); const v = voice(); if (v) u.voice = v;
  const spans = [...li.querySelectorAll("span.w0")];
  const offs = []; let pos = 0;
  for (const s of spans) { pos = state.lines[state.cur].indexOf(s.textContent, pos); offs.push(pos); pos += s.textContent.length; }
  u.onboundary = (e) => {
    let k = offs.findIndex((o, j) => e.charIndex >= o && (j === offs.length - 1 || e.charIndex < offs[j + 1]));
    li.querySelectorAll("mark.w").forEach((m) => m.replaceWith(...m.childNodes));
    if (k >= 0) { const m = document.createElement("mark"); m.className = "w"; spans[k].replaceWith(m); m.append(spans[k]); }
  };
  u.onend = () => {
    li.querySelectorAll("mark.w").forEach((m) => m.replaceWith(...m.childNodes));
    if (state.playing && state.cur < state.lines.length - 1) { setCur(state.cur + 1); speakLine(); } else stop();
  };
  speechSynthesis.speak(u);
}
function play() { if (!state.lines.length) build(); state.playing = true; $("#play").textContent = "❚❚ Pause"; speechSynthesis.cancel(); speakLine(); }
function stop() { state.playing = false; if ("speechSynthesis" in window) speechSynthesis.cancel(); $("#play").innerHTML = "▶ Read aloud <kbd>Space</kbd>"; }
function say(t) { if (!("speechSynthesis" in window)) return; speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.rate = 0.8; const v = voice(); if (v) u.voice = v; speechSynthesis.speak(u); }

$("#play").addEventListener("click", () => (state.playing ? stop() : play()));
$("#next").addEventListener("click", () => { stop(); setCur(state.cur + 1); });
$("#prev").addEventListener("click", () => { stop(); setCur(state.cur - 1); });
$("#lines").addEventListener("click", (e) => {
  const li = e.target.closest("li"); if (!li) return;
  stop(); setCur(Number(li.dataset.n));
  if (e.target.classList.contains("hard")) say(e.target.textContent);
});
$("#hard").addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) say(b.dataset.say); });
$("#quiz").addEventListener("click", (e) => { const b = e.target.closest("button[data-q]"); if (b) answer(b); });

function answer(b) {
  const q = state.quiz[Number(b.dataset.q)]; const group = b.parentElement;
  if (group.dataset.done) return; group.dataset.done = "1";
  const ok = b.dataset.o === q.answer; state.answered++; if (ok) state.correct++;
  b.classList.add(ok ? "ok" : "no");
  if (!ok) group.querySelector(`button[data-o="${CSS.escape(q.answer)}"]`).classList.add("ok");
  b.setAttribute("aria-label", `${b.dataset.o}: ${ok ? "correct" : "not quite, the answer is " + q.answer}`);
  $("#score").textContent = `${ok ? "Correct!" : `Not quite: the answer is "${q.answer}".`} Score ${state.correct} of ${state.answered}${state.answered === state.quiz.length ? " — done." : ""}`;
}

document.addEventListener("keydown", (e) => {
  if (e.target.matches("textarea,select,input")) return;
  if (e.key === " ") { e.preventDefault(); state.playing ? stop() : play(); }
  else if (e.key === "j" || e.key === "ArrowDown") { e.preventDefault(); stop(); setCur(state.cur + 1); }
  else if (e.key === "k" || e.key === "ArrowUp") { e.preventDefault(); stop(); setCur(state.cur - 1); }
  else if (/^[1-3]$/.test(e.key)) {
    const g = [...document.querySelectorAll("#quiz .opts")].find((x) => !x.dataset.done);
    const b = g && g.querySelectorAll("button")[Number(e.key) - 1]; if (b) answer(b);
  }
});

const prefs = JSON.parse(localStorage.getItem("ra-prefs") || "{}");
document.querySelectorAll("[data-pref]").forEach((b) => {
  const k = b.dataset.pref; const apply = () => { document.body.classList.toggle(k, !!prefs[k]); b.setAttribute("aria-pressed", String(!!prefs[k])); };
  apply(); b.addEventListener("click", () => { prefs[k] = !prefs[k]; localStorage.setItem("ra-prefs", JSON.stringify(prefs)); apply(); });
});

if ("serviceWorker" in navigator && location.protocol !== "file:") navigator.serviceWorker.register("sw.js").catch(() => {});
build();
