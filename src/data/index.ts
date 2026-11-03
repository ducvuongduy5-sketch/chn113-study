import raw from "./content.json";
import type {
  Lesson,
  VocabularyItem,
  Question,
  GrammarRule,
  AudioAsset,
  SpeakingPrompt,
  SourceFile,
} from "../types";
export const lessons = raw.lessons as Lesson[];
export const vocabulary = raw.vocabulary as VocabularyItem[];
export const questions = raw.questions as Question[];
export const grammar = raw.grammar as GrammarRule[];
export const audios = raw.audio as AudioAsset[];
export const speaking = raw.speaking as SpeakingPrompt[];
export const sources = raw.sources as SourceFile[];
export const counts = raw.counts;
import {seededOptions} from '../features/exam/model';
export function vocabQuestion(v: VocabularyItem, mode = "meaning"): Question {
  const reverse = mode === "hanzi";
  const get = (x: VocabularyItem) =>
    mode === "pinyin" ? x.pinyin : reverse ? x.hanzi : x.meaning;
  const correct = get(v);
  const others = Array.from(
    new Set(vocabulary.filter((x) => x.id !== v.id).map(get)),
  )
    .filter((x) => x !== correct)
    .slice((v.lesson * 3) % 50, ((v.lesson * 3) % 50) + 3);
  const options = seededOptions([...others,correct],v.id+'-'+mode);
  return {
    id: `vocab-${mode}-${v.id}`,
    lesson: v.lesson,
    type: mode === "typing" ? "text" : "mcq",
    skill: "vocabulary",
    prompt: reverse || mode === "typing" ? v.meaning : v.hanzi,
    options,
    answer: mode === "typing" ? v.hanzi : String(options.indexOf(correct)),
    explanation: `${v.hanzi} · ${v.pinyin} · ${v.meaning}`,
    source: v.source,
    status: "supplemental_practice",
    answerStatus: "verified",
    category: "practice",
  };
}
