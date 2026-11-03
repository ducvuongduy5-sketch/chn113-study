export type Verification =
  | "verified"
  | "needs_review"
  | "missing_answer"
  | "unmatched_audio"
  | "supplemental_practice";
export interface SourceReference {
  id: string;
  filename: string;
  page?: number | null;
  slide?: number | null;
}
export interface Lesson {
  id: number;
  title: string;
  pinyin: string;
  meaning: string;
  sources: SourceReference[];
}
export interface VocabularyItem {
  id: string;
  lesson: number;
  hanzi: string;
  pinyin: string;
  meaning: string;
  source: SourceReference;
  status: Verification;
}
export interface GrammarRule {
  id: string;
  lesson: number;
  title: string;
  formula: string;
  examples: string[];
  explanation: string;
  source: SourceReference;
  status: Verification;
}
export interface AnswerOption {
  id: string;
  text: string;
}
export interface AnswerKey {
  value: string;
  status: "verified" | "inferred" | "missing";
}
export interface Question {
  id: string;
  lesson: number;
  type: "mcq" | "text";
  skill: string;
  prompt: string;
  passage?: string;
  options: string[];
  answer: string;
  alternatives?: string[];
  explanation: string;
  source: SourceReference;
  status: Verification;
  answerStatus: string;
  category: string;
  image?: string | null;
  group?: string;
}
export interface AudioAsset {
  id: string;
  name: string;
  group: string;
  duration: number;
  url: string;
  lesson: number | null;
  status: string;
  source: SourceReference;
}
export interface ImageAsset {
  id: string;
  url: string;
  source: SourceReference;
}
export interface ExamSection {
  id: string;
  title: string;
  questionIds: string[];
}
export interface ExamPaper {
  id: string;
  title: string;
  sections: ExamSection[];
  durationMinutes?: number;
  source: SourceReference;
  status: Verification;
}
export interface StudentAttempt {
  id: string;
  questionId: string;
  answer: string;
  correct: boolean;
  lesson: number;
  skill: string;
  timestamp: number;
  question?: Question;
}
export interface ExamResult {
  id: string;
  title: string;
  questionIds: string[];
  answers: Record<string, string>;
  correct: number;
  total: number;
  timestamp: number;
}
export interface ProgressRecord {
  version: 1;
  attempts: StudentAttempt[];
  known: Record<string, boolean>;
  exams: ExamResult[];
  recentLessons: number[];
  lastRoute: string;
}
export interface SpeakingPrompt {
  id: string;
  title: string;
  image: string;
  keywords: string[];
  sentences: string[][];
  followups: string[];
  source: SourceReference;
  status: Verification;
}
export interface PinyinRule {
  title: string;
  body: string;
  example: string;
}
export interface SourceFile {
  id: string;
  name: string;
  relativePath: string;
  extension: string;
  size: number;
  pages?: number;
  slides?: number;
  duplicateOf?: string | null;
  emptyTextPages?: number[];
}
