import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { emptyProgress, loadProgress, persistProgress } from "../lib/study";
import type { Question, ProgressRecord, ExamResult } from "../types";
import {learningActions} from './useLearning';
type Study = {
  progress: ProgressRecord;
  record: (q: Question, answer: string, correct: boolean) => void;
  known: (id: string, value: boolean) => void;
  visit: (lesson: number) => void;
  exam: (result: ExamResult) => void;
  reset: () => void;
  storageError: boolean;
};
const Context = createContext<Study>(null!);
export function StudyProvider({ children }: { children: ReactNode }) {
  const [progress, set] = useState(() => loadProgress(localStorage));
  const [storageError, setError] = useState(false);
  useEffect(() => {
    setError(!persistProgress(localStorage, progress));
  }, [progress]);
  const value: Study = {
    progress,
    storageError,
    record: (q, answer, correct) => {
      const id=/^vocab-(?:meaning|hanzi|pinyin|typing)-(.+)$/.exec(q.id)?.[1];
      if(id)learningActions.recall(id,correct,0,q.type==='text'?'typing':'recognition');
      set((p) => ({
        ...p,
        attempts: [
          ...p.attempts,
          {
            id: crypto.randomUUID(),
            questionId: q.id,
            answer,
            correct,
            lesson: q.lesson,
            skill: q.skill,
            timestamp: Date.now(),
            question: q,
          },
        ],
      }));
    },
    known: (id, value) => {
      learningActions.rate(id,value?'good':'again');
      set((p) => ({ ...p, known: { ...p.known, [id]: value } }));
    },
    visit: (lesson) =>
      set((p) => ({
        ...p,
        recentLessons: [
          lesson,
          ...p.recentLessons.filter((x) => x !== lesson),
        ].slice(0, 5),
      })),
    exam: (r) =>
      set((p) =>
        p.exams.some((x) => x.id === r.id)
          ? p
          : { ...p, exams: [...p.exams, r] },
      ),
    reset: () => {
      for (const key of Object.keys(localStorage)) {
        if (['chn113-draft-','chn113-exam-v4-','chn113-assessment-v1-','chn113-three-games-','chn113-listening-'].some(prefix=>key.startsWith(prefix))) localStorage.removeItem(key);
      }
      set(emptyProgress());
    },
  };
  return (
    <Context.Provider value={value}>
      {storageError && (
        <div role="alert" className="notice">
          Không thể lưu tiến độ trên trình duyệt. Hãy xuất dữ liệu trước khi
          đóng trang.
        </div>
      )}
      {children}
    </Context.Provider>
  );
}
export const useStudy = () => useContext(Context);
