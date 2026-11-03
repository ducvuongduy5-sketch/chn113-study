import { describe, it, expect } from "vitest";
import {
  normalizePinyin,
  checkPinyin,
  accentedPinyin,
  canSubmit,
} from "../src/lib/pinyin";
import {
  checkAnswer,
  scoreExam,
  shuffle,
  loadProgress,
  persistProgress,
  emptyProgress,
  unresolvedMistakes,
  dedupeQuestions,
} from "../src/lib/study";
import { questions, vocabulary, lessons, audios } from "../src/data";
describe("Pinyin tone-sensitive normalization", () => {
  it.each(["nǚ", "nv3", "nu:3", "nu\u0308\u030c"])("accepts %s", (s) =>
    expect(checkPinyin(s, "nǚ")).toBe(true),
  );
  it("keeps u and ü distinct", () =>
    expect(checkPinyin("nu3", "nǚ")).toBe(false));
  it.each([
    ["nv3 er2", "nǚ'ér"],
    ["nǚ’ér", "nǚ'ér"],
    ["lü4", "lǜ"],
    ["lve4", "lüè"],
    ["xi1 an1", "Xī'ān"],
    ["peng2 you0", "péngyou"],
    ["MA", "ma"],
    ["ma5", "ma"],
  ])("normalizes %s", (a, b) => expect(checkPinyin(a, b)).toBe(true));
  it("preserves syllable boundaries", () =>
    expect(checkPinyin("xian1", "Xī'ān")).toBe(false));
  it("distinguishes all five tones", () =>
    expect(
      new Set(["mā", "má", "mǎ", "mà", "ma"].map((x) => normalizePinyin(x)))
        .size,
    ).toBe(5));
  it.each([
    ["liu4", "liù"],
    ["gui4", "guì"],
    ["xue2", "xué"],
    ["dou1", "dōu"],
    ["nve4", "nüè"],
  ])("places tones in %s", (a, b) => expect(accentedPinyin(a)).toBe(b));
  it("rejects wrong formal mark placement", () =>
    expect(checkPinyin("líu", "liú", "formal")).toBe(false));
  it("rejects IME notation in formal mode", () =>
    expect(checkPinyin("nv3", "nǚ", "formal")).toBe(false));
  it("handles IME keystrokes separately", () =>
    expect(checkPinyin("nver", "nǚ'ér", "ime")).toBe(true));
  it("blocks submissions during either IME composition flag", () => {
    expect(canSubmit(true)).toBe(false);
    expect(canSubmit(false, true)).toBe(false);
    expect(canSubmit(false, false)).toBe(true);
  });
  it("rejects malformed input", () =>
    expect(normalizePinyin("123!")).toBe("!invalid"));
  it("rejects repeated tone numbers", () =>
    expect(normalizePinyin("ma11")).toBe("!invalid"));
});
describe("scoring and attempts", () => {
  const mcq = questions.find((q) => q.type === "mcq")!,
    text = questions.find((q) => q.id === "q2-review-1")!;
  it("checks MCQ by index without accepting blank", () => {
    expect(checkAnswer(mcq, mcq.answer)).toBe(true);
    expect(checkAnswer(mcq, "")).toBe(false);
  });
  it("normalizes Chinese whitespace and punctuation only", () => {
    expect(checkAnswer(text, "你 想 喝 什么?")).toBe(true);
    expect(checkAnswer(text, "你想吃什么")).toBe(false);
  });
  it("scores unanswered as incorrect and reports them", () =>
    expect(scoreExam([mcq, text], { [mcq.id]: mcq.answer })).toEqual({
      correct: 1,
      total: 2,
      unanswered: 1,
    }));
  it("shuffles without mutating or losing questions", () => {
    const xs = [1, 2, 3, 4];
    expect(shuffle(xs, () => 0.1).sort()).toEqual(xs);
    expect(xs).toEqual([1, 2, 3, 4]);
  });
  it("deduplicates identical question content", () =>
    expect(dedupeQuestions([mcq, mcq, text])).toHaveLength(2));
  it("restores real saved attempts and recovers invalid JSON", () => {
    let value = "";
    const storage = {
      getItem: () => value,
      setItem: (_k: string, v: string) => {
        value = v;
      },
    };
    const p = emptyProgress();
    p.known.word = true;
    expect(persistProgress(storage, p)).toBe(true);
    expect(loadProgress(storage)).toEqual(p);
    value = "{bad";
    expect(loadProgress(storage)).toEqual(emptyProgress());
  });
  it("reports storage quota errors", () =>
    expect(
      persistProgress(
        {
          setItem: () => {
            throw Error();
          },
        },
        emptyProgress(),
      ),
    ).toBe(false));
  it("clears a mistake only after its latest attempt succeeds", () => {
    const a = {
      id: "a",
      questionId: "q",
      answer: "x",
      correct: false,
      lesson: 8,
      skill: "reading",
      timestamp: 1,
    };
    expect(unresolvedMistakes([a])).toHaveLength(1);
    expect(
      unresolvedMistakes([a, { ...a, id: "b", correct: true }]),
    ).toHaveLength(0);
  });
});
describe("source-grounded dataset", () => {
  it("has all 15 lessons and vocabulary", () => {
    expect(lessons).toHaveLength(15);
    for (let n = 1; n <= 15; n++)
      expect(vocabulary.some((v) => v.lesson === n)).toBe(true);
  });
  it("has unique question and vocab IDs", () => {
    expect(new Set(questions.map((q) => q.id)).size).toBe(questions.length);
    expect(new Set(vocabulary.map((v) => v.id)).size).toBe(vocabulary.length);
  });
  it("every question has provenance and valid answer indices", () => {
    for (const q of questions) {
      expect(q.source.id).toBeTruthy();
      expect(q.source.filename).toBeTruthy();
      if (q.type === "mcq") {
        expect(Number(q.answer)).toBeGreaterThanOrEqual(0);
        expect(Number(q.answer)).toBeLessThan(q.options.length);
      }
    }
  });
  it("never labels inferred image keys verified", () => {
    for (const q of questions.filter((q) => q.id.startsWith("img-")))
      expect(q.status).toBe("needs_review");
  });
  it("audio has independent IDs and retains unknown matching status", () => {
    expect(audios.some((a) => a.status === "unmatched_audio")).toBe(true);
    expect(new Set(audios.map((a) => a.id)).size).toBe(audios.length);
    for (const a of audios) expect(a.url).toBe("/chn113-study/learning-assets/original-media/" + a.id + ".mp3");
  });
});
