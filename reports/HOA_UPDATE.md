# Cô Hoa content update — 2026-11-03

- 30 quiz source pages reduce to 27 unique items: page 27 duplicates 13, 28 duplicates 26, 29 duplicates 10.
- Composition: 21 multiple choice, 4 sentence ordering, 2 question writing. All include derived answers and explanations; these are not an official teacher answer key. Writing accepts listed variants. Question 21 explains the grammatical ambiguity and intended common expression.
- Speaking: 18 picture prompts with three model sentences each; 110 Vietnamese-to-Chinese prompts and 96 conversational questions with Chinese models, Pinyin and Vietnamese support. Personal details in models are examples.
- Source hashes and item counts: `hoa-content-audit.json`. Runtime includes 18 picture pages and 8 cropped quiz illustrations, not full source PDFs.
- Verification: 96 unit tests pass. `tests/verify-hoa.mjs` exercises all 27 answers and full score, reload persistence, picture/model display, speaking drafts, microphone recording and playback, desktop/mobile layouts and browser errors. Recording uses a browser-simulated microphone, not physical hardware.
- Existing public URL and saved old asset chunks are retained during deployment.
