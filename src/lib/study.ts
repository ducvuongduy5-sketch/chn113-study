import type { Question, ProgressRecord, StudentAttempt } from "../types";
import { checkPinyin } from "./pinyin";
export const STORAGE_KEY = "chn113-study-v1";
export const emptyProgress = (): ProgressRecord => ({
  version: 1,
  attempts: [],
  known: {},
  exams: [],
  recentLessons: [],
  lastRoute: "/",
});
export function loadProgress(
  storage: Pick<Storage, "getItem">,
): ProgressRecord {
  try {
    const p = JSON.parse(storage.getItem(STORAGE_KEY) || "null");
    if (
      p?.version === 1 &&
      Array.isArray(p.attempts) &&
      p.attempts.every(
        (a: StudentAttempt) =>
          a &&
          typeof a.questionId === "string" &&
          typeof a.correct === "boolean" &&
          typeof a.lesson === "number",
      ) &&
      Array.isArray(p.exams) &&
      p.exams.every(
        (e: { id: string; questionIds: string[]; answers: object }) =>
          e &&
          typeof e.id === "string" &&
          Array.isArray(e.questionIds) &&
          e.answers,
      ) &&
      p.known &&
      typeof p.known === "object" &&
      Array.isArray(p.recentLessons) &&
      p.recentLessons.every(
        (n: number) => Number.isInteger(n) && n >= 1 && n <= 15,
      )
    )
      return p;
  } catch {}
  return emptyProgress();
}
export function persistProgress(
  storage: Pick<Storage, "setItem">,
  p: ProgressRecord,
) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(p));
    return true;
  } catch {
    return false;
  }
}
export const normalizeAnswer = (s: string) =>
  s
    .normalize("NFC")
    .replace(/[\s，,。.!！?？、；;：:]/g, "")
    .trim();
export function checkAnswer(q: Question, a: string) {
  if (!a.trim()) return false;
  if (q.skill === "pinyin") {
    const mode = q.id.endsWith("-ime")
      ? "ime"
      : q.id.endsWith("-formal")
        ? "formal"
        : "numbered";
    return checkPinyin(a, q.answer, mode);
  }
  return q.type === "mcq"
    ? q.answer === a
    : [q.answer, ...(q.alternatives || [])].some(
        (x) => normalizeAnswer(x) === normalizeAnswer(a),
      );
}
export function scoreExam(qs: Question[], answers: Record<string, string>) {
  return {
    correct: qs.filter((q) => checkAnswer(q, answers[q.id] || "")).length,
    total: qs.length,
    unanswered: qs.filter((q) => !answers[q.id]?.trim()).length,
  };
}
export function unresolvedMistakes(attempts: StudentAttempt[]) {
  const latest = new Map<string, StudentAttempt>();
  attempts.forEach((a) => latest.set(a.questionId, a));
  return [...latest.values()].filter((a) => !a.correct);
}
export function shuffle<T>(xs: T[], random = Math.random): T[] {
  const arr = [...xs];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
export function dedupeQuestions(qs: Question[]) {
  const seen = new Set<string>();
  return qs.filter((q) => {
    const k = q.prompt + JSON.stringify(q.options) + q.passage;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}
