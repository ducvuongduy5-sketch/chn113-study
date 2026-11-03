import { normalizeAnswer, shuffle } from "../../lib/study";
import {gradeQuestion} from '../../lib/GradingEngine';
export interface ExamItem {
  id: string;
  section: "reading" | "writing" | "listening";
  kind: "choice" | "match" | "arrange" | "text";
  prompt: string;
  passage?: string;
  options?: { id: string; text: string }[];
  tokens?: string[];
  group?: string;
  image?: string;
  key?: string;
  alternatives?: string[];
  keyStatus: "verified" | "supplemental" | "derived" | "inferred" | "missing";
  review?: boolean;
  explanation: string;
  source: {
    id: string;
    filename: string;
    page?: number | null;
    slide?: number | null;
  };
}
export interface Paper {
  id: string;
  title: string;
  category: "quiz2" | "final";
  origin: "source_collection" | "supplemental";
  description: string;
  items: ExamItem[];
}
export interface ExamDraft {
  version: 4;
  id: string;
  paperId: string;
  answers: Record<string, string>;
  flags: string[];
  index: number;
  started: number;
  submitted: boolean;
  submittedAt?: number;
}
export function gradeItem(q: ExamItem, value: string) {
  if (!value.trim()) return "unanswered" as const;
  if (q.review || !q.key || !["verified", "supplemental", "derived"].includes(q.keyStatus))
    return "manual" as const;
  if (q.kind === "choice" || q.kind === "match") {
    const result=gradeQuestion({id:q.id,kind:'single',prompt:q.prompt,options:q.options,key:q.key,keyStatus:q.keyStatus==='supplemental'?'authored':q.keyStatus,sourceId:q.source.id||'authored',page:q.source.page||1},value);
    return result.status==='correct'?'correct' as const:result.status==='incorrect'?'incorrect' as const:'manual' as const;
  }
  if (
    [q.key, ...(q.alternatives || [])].some(
      (a) => normalizeAnswer(a) === normalizeAnswer(value),
    )
  )
    return "correct" as const;
  // A different grammatical expression may still be valid. Never mark open writing wrong by exact match alone.
  return q.kind === "text" ? ("manual" as const) : ("incorrect" as const);
}
export function gradePaper(paper: Paper, answers: Record<string, string>) {
  const counts = { correct: 0, incorrect: 0, manual: 0, unanswered: 0 };
  paper.items.forEach((q) => counts[gradeItem(q, answers[q.id] || "")]++);
  return { ...counts, total: paper.items.length };
}
export function setExamAnswer(
  paper: Paper,
  answers: Record<string, string>,
  id: string,
  value: string,
) {
  const q = paper.items.find((q) => q.id === id);
  if (!q) return answers;
  const next = { ...answers, [id]: value };
  if (q.kind === "match" && value)
    paper.items
      .filter((p) => p.group === q.group && p.id !== id)
      .forEach((p) => {
        if (next[p.id] === value) delete next[p.id];
      });
  return next;
}
export function seededOptions<T>(items: T[], seed: string): T[] {
  let n = 2166136261;
  for (const ch of seed) n = Math.imul(n ^ ch.charCodeAt(0), 16777619) >>> 0;
  return shuffle(items, () => {
    n = (Math.imul(n, 1664525) + 1013904223) >>> 0;
    return n / 4294967296;
  });
}
export function loadExamDraft(
  key: string,
  paper: Paper,
  storage: Pick<Storage, "getItem">,
): ExamDraft | null {
  try {
    const d = JSON.parse(storage.getItem(key) || "null");
    if (
      d?.version !== 4 ||
      d.paperId !== paper.id ||
      typeof d.id !== "string" ||
      !Number.isFinite(d.started) ||
      typeof d.submitted !== "boolean" ||
      !Array.isArray(d.flags) ||
      !d.answers ||
      typeof d.answers !== "object" ||
      Array.isArray(d.answers)
    )
      return null;
    let answers: Record<string, string> = {};
    for (const q of paper.items) {
      const a = d.answers[q.id];
      if (
        typeof a === "string" &&
        (!q.options || q.options.some((o) => o.id === a))
      )
        answers = setExamAnswer(paper, answers, q.id, a);
    }
    return {
      ...d,
      answers,
      flags: d.flags.filter((id: string) =>
        paper.items.some((q) => q.id === id),
      ),
      index: Math.min(
        paper.items.length - 1,
        Math.max(0, Number.isInteger(d.index) ? d.index : 0),
      ),
    };
  } catch {
    return null;
  }
}
