# Workshop Structurer

## Project aim

This MCA Generative AI practical demonstrates prompt engineering ideas and structured output generation. It takes a workshop paragraph and produces JSON with a predictable schema, while identifying details that were not provided.

This is a **rule-based demonstration**. It does not call an AI model, use an API key, or claim that pattern matching is generative AI. The displayed prompt describes the extraction instruction an AI system could receive; JavaScript rules perform the actual extraction here.

## Features

- Responsive home page explaining the aim and prompt engineering.
- Paragraph input and three sample paragraph buttons.
- Visible extraction prompt with instructions to avoid invented information.
- JSON output with `title`, `date`, `venue`, `speaker`, and `topics`.
- Missing single values represented as `null`; absent topics represented as `[]`.
- Schema and JSON validation, missing field warnings, and extracted field count.
- Copy JSON and reset controls.
- No dependencies or server required.

## Folder structure

```text
LAB01/
├── index.html     # Page structure and content
├── styles.css     # Responsive layout and visual styling
├── app.js         # Samples, rule-based extraction, validation, and controls
└── README.md      # Setup, demonstration, and practical notes
```

## Installation and running in VS Code

1. Open this folder in VS Code (`File > Open Folder...`).
2. Open `index.html` and choose **Open with Live Server** if the Live Server extension is installed.
3. Alternatively, open `index.html` directly in Chrome, Edge, or Firefox. The app uses only local files and browser JavaScript.
4. No Python, Flask, package installation, API key, or network service is needed. (The optional font import falls back to system fonts when offline.)

## Test cases and expected results

Choose a sample button and click **Generate structured JSON**.

### 1. All details available

Sample: Title `Generative AI for Everyone`; date `15 November 2026`; venue `Innovation Lab, Block A`; speaker `Dr. Maya Rao`; topics `prompt engineering`, `responsible AI`, `structured outputs`.

Expected: all five keys have values, topics is an array of three strings, the field count is 5/5, and schema validation passes.

### 2. Date and speaker missing

Sample: Title `Practical Prompt Design`; venue `Seminar Hall 2`; topics `writing clear instructions`, `evaluating model responses`.

Expected: `date` and `speaker` are `null`, `topics` is an array of two strings, missing fields list contains date and speaker, and field count is 3/5.

### 3. Only title and venue available

Sample: Title `Introduction to Generative AI`; venue `Main Auditorium`.

Expected: date and speaker are `null`, topics is `[]`, missing fields list contains date, speaker, and topics, and field count is 2/5.

For each case, the displayed JSON should parse and pass required-key/type validation. The empty input case should show a helpful message without replacing the current results. **Copy JSON** copies the current output where browser clipboard permission is available; **Reset** clears the paragraph and restores the initial dashboard.

## Observations

The explicit `Label: value` format is the most reliable because it removes ambiguity in free-form paragraphs. Missing data stays missing instead of being guessed. The field count treats a non-empty topics array as one populated schema field.

## Limitations

- This parser uses regular expressions and a small set of common wording patterns. It is not a language model and may miss paraphrases, ambiguous phrases, or unusual date and venue formats.
- Put each labelled detail in a clear sentence, preferably using `Title:`, `Date:`, `Venue:`, `Speaker:`, and `Topics:`. Topic items can be separated by commas or “and”.
- Browser clipboard access can be restricted when opened from a local file; use Live Server if copy is unavailable.
- The validation routine checks the generated object. It is intended for this beginner demonstration, not as a security or production data validation library.

## Conclusion

The project shows how a clear extraction prompt, a fixed schema, explicit missing-value rules, and validation can make paragraph-to-JSON output easier to inspect. A real AI-backed version could replace the extraction function while keeping the same schema, validation, and dashboard.
