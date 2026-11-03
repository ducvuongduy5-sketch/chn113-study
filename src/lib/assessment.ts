/** Stable identities, never display positions, are the unit of assessment. */
export type Answer = string | string[] | Record<string, string>;
export type Kind =
  "single" | "multiple" | "matching" | "ordering" | "text" | "listening";
export interface Question {
  id: string;
  kind: Kind;
  prompt: string;
  passage?: string;
  options?: { id: string; text: string }[];
  rows?: { id: string; text: string }[];
  key?: Answer;
  alternatives?: Answer[];
  keyStatus: "verified" | "authored" | "derived" | "inferred" | "missing";
  explanation?: string;
  confidence?: string;
  modelAnswer?: string;
  modelPinyin?: string;
  modelMeaning?: string;
  requiredWord?: string;
  rubric?: string[];
  sourceId: string;
  page: number;
  audioId?: string;
  image?: string;
  note?: string;
  weight?: number;
  review?: boolean;
}
export interface Assessment {
  id: string;
  title: string;
  description: string;
  category: "reading" | "writing" | "listening" | "matching";
  sourceId: string;
  filename: string;
  questions: Question[];
  note?: string;
}
export type Verdict =
  "correct" | "incorrect" | "unanswered" | "review" | "invalid";
const distinct = (a: string[]) => new Set(a).size === a.length;
const normalized = (s: string) =>
  s
    .normalize("NFKC")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[。！？.!?]$/, "");
export function validQuestion(q: Question): boolean {
  if (
    !q.id?.trim() ||
    !q.prompt?.trim() ||
    !q.sourceId ||
    !Number.isInteger(q.page) ||
    q.page < 1 ||
    ![
      "single",
      "multiple",
      "matching",
      "ordering",
      "text",
      "listening",
    ].includes(q.kind) ||
    !Number.isFinite(q.weight ?? 1) ||
    (q.weight ?? 1) <= 0
  )
    return false;
  if (
    q.kind !== "text" &&
    (!q.options?.length ||
      q.options.some((o) => !o.id || !o.text?.trim()) ||
      !distinct(q.options.map((o) => o.id)))
  )
    return false;
  if (
    q.kind === "matching" &&
    (!q.rows?.length ||
      q.rows.some((r) => !r.id || !r.text) ||
      !distinct(q.rows.map((r) => r.id)))
  )
    return false;
  if (["verified", "authored", "derived"].includes(q.keyStatus) && !validAnswer(q, q.key))
    return false;
  return true;
}
export function validAnswer(q: Question, a: Answer | undefined): boolean {
  const ids = q.options?.map((o) => o.id) || [];
  if (q.kind === "text") return typeof a === "string" && !!a.trim();
  if (q.kind === "single" || q.kind === "listening")
    return typeof a === "string" && ids.includes(a);
  if (q.kind === "matching")
    return (
      !!a &&
      !Array.isArray(a) &&
      typeof a === "object" &&
      Object.keys(a).length === q.rows?.length &&
      q.rows.every((r) => ids.includes(a[r.id])) &&
      distinct(Object.values(a))
    );
  return (
    Array.isArray(a) &&
    a.length > 0 &&
    distinct(a) &&
    a.every((id) => ids.includes(id)) &&
    (q.kind !== "ordering" || a.length === ids.length)
  );
}
export function hasAnswer(a: Answer | undefined) {
  return typeof a === "string"
    ? !!a.trim()
    : Array.isArray(a)
      ? a.length > 0
      : !!a && Object.values(a).some(Boolean);
}
export function evaluate(q: Question, a: Answer | undefined): Verdict {
  if (!validQuestion(q)) return "invalid";
  if (!hasAnswer(a)) return "unanswered";
  if (!validAnswer(q, a)) return "invalid";
  if (q.review || !["verified", "authored", "derived"].includes(q.keyStatus))
    return "review";
  const equal = (key: Answer) =>
    q.kind === "text"
      ? normalized(a as string) === normalized(key as string)
      : q.kind === "matching"
        ? q.rows!.every(
            (r) =>
              (a as Record<string, string>)[r.id] ===
              (key as Record<string, string>)[r.id],
          )
        : Array.isArray(a)
          ? q.kind === "ordering"
            ? a.join("\0") === (key as string[]).join("\0")
            : [...a].sort().join("\0") ===
              [...(key as string[])].sort().join("\0")
          : a === key;
  return [q.key!, ...(q.alternatives || [])].some(equal)
    ? "correct"
    : "incorrect";
}
/** A non-official comparison to inferred answers. Never count in verified exam score. */
export function compareSuggestion(
  q: Question,
  a: Answer | undefined,
): "matches" | "differs" | "not_available" {
  if (q.keyStatus !== "inferred" || !q.key || !validAnswer(q, a))
    return "not_available";
  const normalizedText = (v: string) =>
    v
      .normalize("NFKC")
      .replace(/\s+/g, "")
      .replace(/[。！？，,.!?；;：:]/g, "");
  const isEqual = (key: Answer) => {
    if (q.kind === "text")
      return (
        typeof a === "string" &&
        typeof key === "string" &&
        normalizedText(a) === normalizedText(key)
      );
    if (
      q.kind === "matching" &&
      a &&
      typeof a === "object" &&
      !Array.isArray(a) &&
      key &&
      typeof key === "object" &&
      !Array.isArray(key)
    )
      return q.rows?.every((row) => a[row.id] === key[row.id]) || false;
    if (Array.isArray(a) && Array.isArray(key))
      return q.kind === "ordering"
        ? a.join("|") === key.join("|")
        : [...a].sort().join("|") === [...key].sort().join("|");
    return a === key;
  };
  return [q.key, ...(q.alternatives || [])].some(isEqual)
    ? "matches"
    : "differs";
}
export function suggestionSummary(
  questions: Question[],
  answers: Record<string, Answer>,
) {
  const rows = questions.filter(
    (q) => q.keyStatus === "inferred" && validAnswer(q, answers[q.id]),
  );
  return {
    compared: rows.length,
    matches: rows.filter(
      (q) => compareSuggestion(q, answers[q.id]) === "matches",
    ).length,
    differs: rows.filter(
      (q) => compareSuggestion(q, answers[q.id]) === "differs",
    ).length,
  };
}
export function summarize(
  questions: Question[],
  answers: Record<string, Answer>,
) {
  const seen = new Set<string>();
  let excluded = 0;
  const items = questions.filter((q) => {
    if (seen.has(q.id) || !validQuestion(q)) {
      excluded++;
      return false;
    }
    seen.add(q.id);
    return true;
  });
  const verdicts = Object.fromEntries(
    items.map((q) => [q.id, evaluate(q, answers[q.id])]),
  );
  const count = (v: Verdict) =>
    Object.values(verdicts).filter((x) => x === v).length;
  const gradable = items.filter(
    (q) => !q.review && ["verified", "authored"].includes(q.keyStatus),
  );
  const maximum = gradable.reduce((n, q) => n + (q.weight ?? 1), 0),
    points = gradable.reduce(
      (n, q) => n + (verdicts[q.id] === "correct" ? (q.weight ?? 1) : 0),
      0,
    );
  return {
    verdicts,
    total: items.length,
    excluded,
    correct: count("correct"),
    incorrect: count("incorrect"),
    unanswered: count("unanswered"),
    review: count("review"),
    invalid: count("invalid"),
    points,
    maximum,
    percent: maximum ? Math.round((points / maximum) * 100) : null,
  };
}
export function matchAnswer(
  current: Record<string, string>,
  row: string,
  option: string,
) {
  const next = { ...current };
  for (const id of Object.keys(next)) if (next[id] === option) delete next[id];
  if (option) next[row] = option;
  else delete next[row];
  return next;
}
export interface Attempt {
  questionIds?: string[];
  version: 1;
  id: string;
  assessmentId: string;
  answers: Record<string, Answer>;
  flags: string[];
  index: number;
  submitted: boolean;
  started: number;
  submittedAt?: number;
}
export const attemptKey = (id: string) => "chn113-assessment-v1-" + id;
export function freshAttempt(id: string): Attempt {
  return {
    version: 1,
    id: crypto.randomUUID(),
    assessmentId: id,
    answers: {},
    flags: [],
    index: 0,
    submitted: false,
    started: Date.now(),
  };
}
export function restoreAttempt(
  raw: string | null,
  a: Assessment,
): Attempt | null {
  try {
    const d = JSON.parse(raw || "null") as Attempt;
    if (
      !d ||
      d.version !== 1 ||
      d.assessmentId !== a.id ||
      typeof d.id !== "string" ||
      !Number.isFinite(d.started) ||
      !d.answers ||
      typeof d.answers !== "object" ||
      Array.isArray(d.answers) ||
      !Array.isArray(d.flags) ||
      typeof d.submitted !== "boolean"
    )
      return null;
    const answers: Record<string, Answer> = {};
    for (const q of a.questions) {
      const value = d.answers[q.id];
      const ids = q.options?.map((o) => o.id) || [];
      if (validAnswer(q, value)) answers[q.id] = value;
      else if (
        (q.kind === "ordering" || q.kind === "multiple") &&
        Array.isArray(value)
      )
        answers[q.id] = [...new Set(value.filter((id) => ids.includes(id)))];
      else if (
        q.kind === "matching" &&
        value &&
        typeof value === "object" &&
        !Array.isArray(value)
      ) {
        let pairs: Record<string, string> = {};
        for (const row of q.rows || [])
          if (ids.includes(value[row.id]))
            pairs = matchAnswer(pairs, row.id, value[row.id]);
        answers[q.id] = pairs;
      }
    }
    return {
      ...d,
      index: Math.max(
        0,
        Math.min(
          a.questions.length - 1,
          Number.isInteger(d.index) ? d.index : 0,
        ),
      ),
      answers,
      flags: d.flags.filter((id) => a.questions.some((q) => q.id === id)),
    };
  } catch {
    return null;
  }
}
