// Transparent, rule-based extraction for a small workshop-detail schema.
const samples = {
  complete: "Title: Generative AI for Everyone. Date: 15 November 2026. Venue: Innovation Lab, Block A. Speaker: Dr. Maya Rao. Topics: prompt engineering, responsible AI, and structured outputs.",
  partial: "Title: Practical Prompt Design. Venue: Seminar Hall 2. Topics: writing clear instructions and evaluating model responses.",
  minimal: "Title: Introduction to Generative AI. Venue: Main Auditorium."
};
const keys = ['title', 'date', 'venue', 'speaker', 'topics'];
const paragraph = document.querySelector('#paragraph');
const output = document.querySelector('#output');
const validation = document.querySelector('#validation');
const runState = document.querySelector('#runState');
const count = document.querySelector('#count');
const missingList = document.querySelector('#missingList');
const copyButton = document.querySelector('#copy');

// Finds a labelled value and stops at the next known label or sentence boundary.
function labelled(text, labels) {
  const allLabels = '(?:title|workshop(?: title)?|date|when|venue|location|speaker|presenter|facilitator|topics?|subject areas?)';
  for (const label of labels) {
    const re = new RegExp('(?:^|[.!?\\n])\\s*(?:' + label + ')\\s*[:-]\\s*([\\s\\S]*?)(?=\\s+(?:' + allLabels + ')\\s*[:-]|$)', 'i');
    const match = text.match(re);
    if (match && match[1].trim()) return clean(match[1]);
  }
  return null;
}
function clean(value) { return value.trim().replace(/[.,;]+$/, '').replace(/\s+/g, ' '); }
function firstMatch(text, regexes) {
  for (const re of regexes) { const m = text.match(re); if (m) return clean(m[1]); }
  return null;
}
function extract(text) {
  const result = { title: null, date: null, venue: null, speaker: null, topics: [] };
  result.title = labelled(text, ['title', 'workshop(?: title)?']) || firstMatch(text, [/(?:workshop|session|seminar)\s+(?:called|titled)\s+["“]?([^.!?"”]+)["”]?/i]);
  // Recognize explicit dates, plus common numeric and month-name formats.
  result.date = labelled(text, ['date', 'when']) || firstMatch(text, [/(\b(?:\d{1,2}\s+)?(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}(?:,)?\s+\d{4}\b)/i, /(\b\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4}\b)/, /\b(?:on|scheduled for)\s+([^.!?]+)/i]);
  if (result.date && /^(on|scheduled for)\s/i.test(result.date)) result.date = result.date.replace(/^(on|scheduled for)\s/i, '');
  result.venue = labelled(text, ['venue', 'location']) || firstMatch(text, [/(?:will be held|takes place|take place|will take place)\s+(?:at|in)\s+([^.!?]+)/i, /\b(?:at|in)\s+([^.!?]+(?:hall|auditorium|lab|room|centre|center|campus|block|building)[^.!?]*)/i]);
  result.speaker = labelled(text, ['speaker', 'presenter', 'facilitator']) || firstMatch(text, [/(?:speaker|presenter|facilitator)\s+(?:is|will be)\s+([^.!?]+)/i, /(?:led|taught|presented|conducted)\s+by\s+([^.!?]+)/i]);
  const topicText = labelled(text, ['topics?', 'subject areas?']) || firstMatch(text, [/(?:covering|focused on|focus(?:es)? on|sessions on|discuss(?:ing|es)?)\s+([^.!?]+)/i]);
  if (topicText) result.topics = topicText.split(/,|\band\b|\n|;/i).map(clean).filter(Boolean);
  return result;
}
function validate(value) {
  const parsed = JSON.parse(JSON.stringify(value));
  const errors = [];
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) errors.push('Output must be a JSON object.');
  for (const key of keys) if (!(key in parsed)) errors.push(`Missing key: ${key}.`);
  for (const key of ['title', 'date', 'venue', 'speaker']) if (key in parsed && parsed[key] !== null && typeof parsed[key] !== 'string') errors.push(`${key} must be a string or null.`);
  if ('topics' in parsed && (!Array.isArray(parsed.topics) || parsed.topics.some(x => typeof x !== 'string'))) errors.push('topics must be an array of strings.');
  return errors;
}
function render(data) {
  const json = JSON.stringify(data, null, 2);
  output.textContent = json;
  let errors = [];
  try { JSON.parse(json); errors = validate(data); } catch { errors = ['Output is not valid JSON.']; }
  const missing = keys.filter(k => k === 'topics' ? data.topics.length === 0 : data[k] === null);
  const extracted = keys.length - missing.length;
  count.innerHTML = `${extracted} <small>/ 5</small>`;
  missingList.innerHTML = missing.length ? missing.map(k => `<li>${k}</li>`).join('') : '<li class="muted">No missing fields.</li>';
  validation.className = `validation ${errors.length ? 'invalid' : missing.length ? 'valid' : 'valid'}`;
  validation.innerHTML = `<span class="status-symbol">${errors.length ? '!' : 'OK'}</span><span>${errors.length ? errors.join(' ') : 'Valid JSON · Schema passed'}</span>`;
  runState.className = `state ${missing.length ? 'incomplete' : 'ready'}`;
  runState.innerHTML = `<i></i> ${missing.length ? 'Extracted with gaps' : 'Extraction complete'}`;
  copyButton.disabled = false;
}
document.querySelector('#generate').addEventListener('click', () => {
  const text = paragraph.value.trim();
  const message = document.querySelector('#inputMessage');
  if (!text) { message.textContent = 'Enter a paragraph or choose a sample first.'; paragraph.focus(); return; }
  message.textContent = '';
  render(extract(text));
});
document.querySelectorAll('[data-sample]').forEach(button => button.addEventListener('click', () => {
  paragraph.value = samples[button.dataset.sample];
  document.querySelector('#inputMessage').textContent = '';
  document.querySelector('#copyMessage').textContent = '';
}));
copyButton.addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(output.textContent); document.querySelector('#copyMessage').textContent = 'JSON copied to clipboard.'; }
  catch { document.querySelector('#copyMessage').textContent = 'Clipboard access is unavailable in this browser context.'; }
});
document.querySelector('#reset').addEventListener('click', () => {
  paragraph.value = '';
  output.textContent = '{\n  "title": null,\n  "date": null,\n  "venue": null,\n  "speaker": null,\n  "topics": []\n}';
  count.innerHTML = '0 <small>/ 5</small>';
  missingList.innerHTML = '<li class="muted">Run extraction to check fields.</li>';
  validation.className = 'validation neutral'; validation.innerHTML = '<span class="status-symbol">—</span><span>Not validated yet</span>';
  runState.className = 'state idle'; runState.innerHTML = '<i></i> Waiting for input';
  copyButton.disabled = true;
  document.querySelector('#inputMessage').textContent = '';
  document.querySelector('#copyMessage').textContent = '';
});
