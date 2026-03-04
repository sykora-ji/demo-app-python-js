const API_URL = window.API_URL || "http://localhost:8000";
const DEBOUNCE_MS = 500;

const textarea = document.getElementById("text-input");
const spinner = document.getElementById("spinner");

const els = {
  wordCount:       document.getElementById("word-count"),
  sentenceCount:   document.getElementById("sentence-count"),
  charCount:       document.getElementById("char-count"),
  charNoSpaces:    document.getElementById("char-no-spaces"),
  avgWordLength:   document.getElementById("avg-word-length"),
  readingTime:     document.getElementById("reading-time"),
  lexicalDiversity:document.getElementById("lexical-diversity"),
  topWords:        document.getElementById("top-words"),
};

let debounceTimer = null;

function debounce(fn, delay) {
  return (...args) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => fn(...args), delay);
  };
}

function animateValue(el, newValue) {
  el.textContent = newValue;
  el.classList.remove("updated");
  void el.offsetWidth; // reflow to restart animation
  el.classList.add("updated");
  setTimeout(() => el.classList.remove("updated"), 500);
}

function formatReadingTime(sec) {
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function renderTopWords(topWords) {
  if (!topWords || topWords.length === 0) {
    els.topWords.innerHTML = '<li class="placeholder">Žádná slova k zobrazení</li>';
    return;
  }

  const maxCount = topWords[0][1];
  els.topWords.innerHTML = topWords
    .map(([word, count]) => {
      const pct = Math.round((count / maxCount) * 100);
      return `
        <li class="word-row">
          <span class="word-label" title="${word}">${word}</span>
          <div class="bar-wrap">
            <div class="bar-fill" style="width: ${pct}%"></div>
          </div>
          <span class="word-count">${count}×</span>
        </li>`;
    })
    .join("");
}

function resetStats() {
  Object.values(els).forEach(el => {
    if (el === els.topWords) {
      el.innerHTML = '<li class="placeholder">Zatím žádný text</li>';
    } else {
      el.textContent = "—";
    }
  });
}

async function analyze(text) {
  if (!text.trim()) {
    resetStats();
    return;
  }

  spinner.classList.add("visible");

  try {
    const res = await fetch(`${API_URL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();

    animateValue(els.wordCount,        data.word_count);
    animateValue(els.sentenceCount,    data.sentence_count);
    animateValue(els.charCount,        data.char_count);
    animateValue(els.charNoSpaces,     data.char_no_spaces);
    animateValue(els.avgWordLength,    data.avg_word_length.toFixed(1));
    animateValue(els.readingTime,      formatReadingTime(data.reading_time_sec));
    animateValue(els.lexicalDiversity, `${Math.round(data.lexical_diversity * 100)}%`);
    renderTopWords(data.top_words);
  } catch (err) {
    console.error("Chyba při analýze:", err);
  } finally {
    spinner.classList.remove("visible");
  }
}

const debouncedAnalyze = debounce((text) => analyze(text), DEBOUNCE_MS);

textarea.addEventListener("input", () => {
  debouncedAnalyze(textarea.value);
});
