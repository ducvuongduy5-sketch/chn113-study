# Audio recovery and mapping — 03/11/2026

164 inventoried audio entries resolve to156 unique original MP3 files. Eight entries are duplicate aliases. All recovered files were checked against source SHA256; missing runtime files:0. The previous58-file handoff is now expanded to all156 unique originals.

Registry: `src/data/audio-registry.json`. Mapping: `audio-paper-map.json` (`paperId → sectionId → audioAsset → questionIds`). HSK lesson attribution uses the original lesson/track filename. Other recordings remain selectable by their original group; identical names from different folders are not merged unless hashes match.

FA24 and SP24 practice mappings were compared against source question descriptions/images and available transcriptions. They are content-reviewed candidates, not independent official exam-code/key certification. Therefore scores are explicitly practice scores. FA24 question11 retains manual review because rain and taxi content make the intended pictured answer ambiguous.

Browser evidence: all156 unique public MP3 responses decoded successfully, with positive duration and nonzero sampled audio waveform; the FE player also advanced its clock during playback. See `public-runtime-validation.json`. This validates file decoding/playback, not a claim that every spoken syllable or answer key has been independently listened to and certified.

No TTS replaces FE source recordings. Original PDF/PPTX and intermediate transcriptions are excluded from the public package. Audio filenames use stable source IDs; source labels remain visible in the app. The library exposes all164 entries (including aliases); only question-linked subsets produce practice scores.
