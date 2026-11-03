# V7 QA — 03/11/2026

## Executed checks

- TypeScript `tsc --noEmit`: passed.
- Vitest: 94/94 passed across six files.
- Playwright desktop + iPhone-sized Chromium: 66/68 passed initially. Two failures were an incorrect matching-row test expectation (expected 6, actual correct result 3). After correcting that assertion, both affected cases passed. All 68 distinct cases have passing evidence; no claim of a single all-green 68-case rerun.
- 52 game cases cover all 11 games, score behavior, completion/replay, pause, timer, IME, rapid input and persistence. Spelling Bee TTS is mocked for deterministic game state tests; this does not prove speaker output on every device.
- Speaking capture/playback tested with Chromium fake microphone input. Physical microphone quality and pronunciation recognition are not tested or claimed.
- Production build passed. Vite reports a >500 kB raw main chunk; gzip about195 kB in the standalone public build (137 kB main plus separate vendor/content chunks in the local pages-mode build). Media is loaded on demand.
- All156 unique bundled MP3s decoded through Chromium AudioContext, with nonzero waveform; FE audio clock advanced during actual playback. Details in public-runtime-validation.json.
- Production route render/reload checks, image checks on visited routes, mobile overflow, game start: see runtime JSON.
- Screenshots captured for dashboard desktop/mobile, flashcard, matching/result, writing, speaking, FE, Quiz2, libraries, lobby and gameplay. Visual inspection led to fixes for mobile menu and game HUD contrast.

## Content limits

27 source-practice datasets contain290 records:202 automatically scored practice records and88 model/rubric/manual records. All290 have a solution or model and an explanation. These are not290 verified official keys: no independent official exam key has been recovered. Matching records contain multiple pairs. Derived practice scores stay separate from official scores.

Manual review includes free writing and malformed/ambiguous source items (fruit preferences not inferable from a photo, cat on chair with table-only options, missing ordering token, rain/taxi listening ambiguity). A model is provided with limitations rather than an invented definitive answer. Free Chinese paraphrases are not graded by naive exact matching.

HSK canonical150 retained and tested against the historical HSK2.0 reference. Quiz2 has two explicitly labeled source collections and one authored practice set, each27 positions; source-code identity is not invented. FE remains listening-only with original MP3 and practice keys.

## Runtime and privacy

Progress is browser-local; recordings remain in-session unless downloaded. No paid AI grading/backend/API key. TTS depends on installed/browser Chinese voices. Full PDFs/PPTXs and extraction intermediates stay local. Public runtime media approximately320MB; user confirmed redistribution permission.

Deployment status and live proof are recorded separately after GitHub Pages completes.
