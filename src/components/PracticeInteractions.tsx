import { useState } from "react";
import { questions } from "../data";
import { useStudy } from "../hooks/useStudy";
import { checkAnswer } from "../lib/study";
import { Source } from "./Common";
export function SentenceBuilder({
  prompt,
  onChange,
  disabled,
}: {
  prompt: string;
  onChange: (s: string) => void;
  disabled: boolean;
}) {
  const words = prompt
    .replace(/^Sắp xếp:\s*/, "")
    .split("/")
    .map((s) => s.trim())
    .filter(Boolean);
  const [picked, setPicked] = useState<number[]>([]);
  function update(ids: number[]) {
    setPicked(ids);
    onChange(ids.map((i) => words[i]).join(""));
  }
  return (
    <div className="sentence-builder">
      <p className="muted small">
        Chạm các từ theo thứ tự hoặc gõ trực tiếp bên dưới.
      </p>
      <div className="row wrap">
        {words.map((w, i) => (
          <button
            type="button"
            key={i}
            disabled={disabled || picked.includes(i)}
            onClick={() => update([...picked, i])}
          >
            {w}
          </button>
        ))}
      </div>
      <div className="assembled" aria-live="polite">
        {picked.map((i, j) => (
          <button
            type="button"
            disabled={disabled}
            key={i}
            onClick={() => update(picked.filter((_, n) => n !== j))}
            title="Bỏ từ này"
          >
            {words[i]}
          </button>
        ))}
      </div>
      <button
        type="button"
        disabled={disabled || !picked.length}
        onClick={() => update([])}
      >
        Xếp lại từ đầu
      </button>
    </div>
  );
}
export function Matching() {
  const group = questions.filter((q) => q.group === "Q13");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const { record } = useStudy();
  return (
    <section className="study-card">
      <span className="badge">Q13 · Ghép câu hỏi và câu trả lời</span>
      <p className="notice">
        Nội dung được đọc từ ảnh Q13. Đáp án ghép do suy luận ngôn ngữ, chưa có
        khóa đáp án chính thức.
      </p>
      <div className="matching-options">
        {group[0].options.map((s, i) => (
          <p key={s}>
            <strong>{String.fromCharCode(65 + i)}.</strong>{" "}
            <span lang="zh-CN">{s}</span>
          </p>
        ))}
      </div>
      {group.map((q, i) => (
        <div className="matching-row" key={q.id}>
          <label htmlFor={q.id} lang="zh-CN">
            {i + 1}. {q.prompt}
          </label>
          <select
            id={q.id}
            value={answers[q.id] ?? ""}
            disabled={submitted}
            onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
          >
            <option value="">Chọn</option>
            {q.options.map((_, n) => (
              <option key={n} value={n}>
                {String.fromCharCode(65 + n)}
              </option>
            ))}
          </select>
          {submitted && (
            <span
              className={
                checkAnswer(q, answers[q.id] || "") ? "match-ok" : "match-wrong"
              }
            >
              {checkAnswer(q, answers[q.id] || "")
                ? "Đúng"
                : "Đáp án: " + String.fromCharCode(65 + Number(q.answer))}
            </span>
          )}
        </div>
      ))}
      <div className="row actions">
        {submitted ? (
          <button
            onClick={() => {
              setAnswers({});
              setSubmitted(false);
            }}
          >
            Làm lại
          </button>
        ) : (
          <button
            className="primary"
            disabled={group.some(
              (q) => answers[q.id] === undefined || answers[q.id] === "",
            )}
            onClick={() => {
              group.forEach((q) =>
                record(q, answers[q.id], checkAnswer(q, answers[q.id])),
              );
              setSubmitted(true);
            }}
          >
            Kiểm tra bài ghép
          </button>
        )}
      </div>
      {submitted && (
        <p role="status">
          {group.filter((q) => checkAnswer(q, answers[q.id])).length}/
          {group.length} câu ghép đúng theo đáp án tham khảo.
        </p>
      )}
      <Source source={group[0].source} />
    </section>
  );
}
