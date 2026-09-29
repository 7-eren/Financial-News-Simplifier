// Text handling for the reading view. Kept dependency-free and small on
// purpose: everything here runs client-side, per article, on demand.

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Providers often truncate descriptions with a trailing "... [+1234 chars]"
// marker, and some prefix the source name. Strip both before showing text.
function cleanText(raw) {
  if (!raw) return '';
  return raw
    .replace(/\s*\[\+\d+\s*chars\]\s*$/i, '')
    .replace(/\s*\.\.\.$/, '.')
    .trim();
}

// A simplified read is the first one or two sentences of the cleaned
// description, capped to a comfortable reading length. This is a
// presentation choice (less to read at a glance), not a rewrite of the
// source's wording.
function toSimplified(raw) {
  const text = cleanText(raw);
  if (!text) return '';
  // Protect decimal points (e.g. "6.5%", "\u20b91.2 lakh crore") so they
  // aren't mistaken for sentence endings, then restore them afterwards.
  const guarded = text.replace(/(\d)\.(\d)/g, '$1\u0000$2');
  const sentences = guarded.match(/[^.!?]+[.!?]+/g) || [guarded];
  const unguard = (s) => s.replace(/\u0000/g, '.').trim();
  let result = unguard(sentences[0]);
  if (result.length < 60 && sentences[1]) {
    result += ' ' + unguard(sentences[1]);
  }
  return result;
}

// Wraps every glossary term found in `text` with a <span class="term">,
// carrying its definition in a data attribute for the tooltip/popover.
// Operates on already-escaped HTML text, so it is safe to insert directly.
function highlightTerms(escapedText, glossary) {
  let html = escapedText;
  const found = [];
  glossary.forEach(([term, def]) => {
    const pattern = new RegExp(`\\b(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\b`, 'i');
    if (pattern.test(html) && !found.some((f) => f.term.toLowerCase() === term.toLowerCase())) {
      html = html.replace(
        pattern,
        (match) => `<span class="term" tabindex="0" data-term="${escapeHtml(term)}">${match}</span>`
      );
      found.push({ term, def });
    }
  });
  return { html, found };
}

// Rough reading-effort label, based on average sentence length. Not a
// scientific readability score \u2014 just a quick, honest signal for the reader.
function readingEffort(raw) {
  const text = cleanText(raw);
  if (!text) return 'Quick read';
  const words = text.split(/\s+/).filter(Boolean).length;
  const sentences = (text.match(/[.!?]+/g) || [text]).length;
  const avgWordsPerSentence = words / Math.max(sentences, 1);
  if (avgWordsPerSentence > 26) return 'Dense';
  if (avgWordsPerSentence > 17) return 'Moderate';
  return 'Quick read';
}

function timeAgo(isoString) {
  if (!isoString) return '';
  const diffMs = Date.now() - new Date(isoString).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}
