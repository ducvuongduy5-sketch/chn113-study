# V7 production recovery — 03/11/2026

| Module | Bug | Root cause | Priority | File | Fix | Test evidence | Status |
|---|---|---|---|---|---|---|---|
| Source practice | Most questions not graded/reviewed | Missing or inferred keys not eligible | P0 | GradingEngine.ts, assessments.json, AnswerReview.tsx | Explicit derived keys, 202 automatic practice records; models/rubrics for 88 manual records | 94 unit tests; source E2E | Fixed with confidence labels |
| Matching | All-or-nothing feedback | Group boolean grading | P0 | GradingEngine.ts | Per-pair credit, correct pairs and student pairs, duplicates rejected | 3/5 = 60% browser test desktop/mobile | Fixed |
| Ordering | Undo/alternatives absent | One exact arrangement | P1 | AssessmentCenter.tsx, assessments.json | Undo/reset, explicit valid variants, persisted draft | Unit and browser ordering test | Fixed |
| Wrong answers | No focused retry | Full paper only | P1 | AssessmentCenter.tsx, StudyCompass.tsx | Saved wrong IDs and scoped retry | Browser reload/retry | Fixed |
| Writing | No usable correction | Missing answer keys | P0 | assessments.json, AnswerReview.tsx | Model answer, explanation, rubric, keyword/length checks; no fabricated semantic score | Manual-answer unit/E2E | Fixed as manual review |
| Quiz2 | One collection | Only initial source assembled | P1 | exam-v4.json, model.ts, ExamCenter.tsx | Two labeled source collections plus authored practice; 27 positions | Quiz2 tests | Fixed; codes not independently certified |
| FE | No practice grading | No official keys | P0 | assessments.json, GradingEngine.ts | Reviewed candidate keys separately labeled practice; ambiguous item manual | 18/19 = 95% E2E, real MP3 playback | Fixed as practice |
| Audio | 98 unavailable registry entries | Incomplete handoff packaging | P0 | restore_audio.py, audio-registry.json | Restore 156 unique files for 164 entries with hash checks | All 156 decoded in Chromium, no silent files | Fixed |
| Design | Weak hierarchy and low contrast | Layered old styles | P1 | production-v7.css, StudyCompass.tsx | Goal selector, study/exam/arcade styling, mobile and game contrast fixes | Actual screenshots + overflow test | Fixed |
| Games | Risk of timer/duplicate scores | Stateful gameplay | P0 | games engine and stages | Existing safeguards verified across all 11 games | 52 game browser cases desktop/mobile | Verified |
| Public deployment | Windows-only sources and root routes | Local middleware | P0 | vite.config.ts, prepare_public.py, package_v7.py | Portable runtime assets, HashRouter, static build, no PDFs/PPTXs | Production build and runtime probe | Prepared |

The initial matching E2E assertion mistakenly expected six correct rows; the actual result correctly rendered three. Assertion corrected and both platforms rerun successfully. No test failure was hidden.
