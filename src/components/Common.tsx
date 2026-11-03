import { useState, useRef, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Volume2, ExternalLink } from "lucide-react";
import {sourceUrl} from "../lib/sourceLinks";
import type { SourceReference, Question } from "../types";
import { canSubmit } from "../lib/pinyin";
import { checkAnswer } from "../lib/study";
import { useStudy } from "../hooks/useStudy";
import { SentenceBuilder } from "./PracticeInteractions";
export function PageTitle({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="page-title">
      <div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action}
    </header>
  );
}
export function Source({ source }: { source: SourceReference }) {
  if (!source.id) return <span className="source">{source.filename}</span>;
  const href=sourceUrl(source.id,source.page);
  if(!href)return <span className="source source-missing" title="Đã trích xuất nội dung nhưng không đóng gói tệp gốc">{source.filename}{source.page?` · trang ${source.page}`:""} · Nguồn chưa có trong gói</span>;
  return (
    <a
      className="source"
      href={href}
      target="_blank"
      rel="noreferrer"
    >
      <ExternalLink size={13} />
      <span>
        {source.filename}
        {source.slide ? ` · slide ${source.slide}` : ""}
        {source.page ? ` · trang ${source.page}` : ""}
      </span>
    </a>
  );
}
export function Speak({ text }: { text: string }) {
  const [error, set] = useState("");
  return (
    <>
      <button
        className="icon-button"
        aria-label="Đọc bằng giọng tổng hợp"
        title="Giọng tổng hợp của trình duyệt"
        onClick={() => {
          if (!("speechSynthesis" in window)) {
            set("Trình duyệt không hỗ trợ giọng đọc.");
            return;
          }
          const u = new SpeechSynthesisUtterance(text);
          u.lang = "zh-CN";
          u.rate = 0.8;
          u.onerror = () =>
            set(
              "Không phát được giọng đọc tiếng Trung. Kiểm tra giọng ngôn ngữ trong trình duyệt.",
            );
          speechSynthesis.cancel();
          speechSynthesis.speak(u);
        }}
      >
        <Volume2 size={19} />
      </button>
      {error && <small role="status">{error}</small>}
    </>
  );
}
export function LessonFilter({
  value,
  onChange,
  zero = true,
}: {
  value: number;
  onChange: (n: number) => void;
  zero?: boolean;
}) {
  return (
    <label className="filter">
      Bài học
      <select value={value} onChange={(e) => onChange(Number(e.target.value))}>
        {zero && <option value={0}>Tất cả bài học</option>}
        {Array.from({ length: 15 }, (_, i) => (
          <option key={i} value={i + 1}>
            Bài {i + 1}
            {i >= 7 && i <= 12 ? " · Quiz 2" : ""}
          </option>
        ))}
      </select>
    </label>
  );
}
export function Empty({ children }: { children: ReactNode }) {
  return <div className="empty">{children}</div>;
}
export function QuestionBody({
  q,
  value,
  onChange,
  disabled = false,
}: {
  q: Question;
  value: string;
  onChange: (s: string) => void;
  disabled?: boolean;
}) {
  return (
    <>
      <div className="question-prompt">
        {q.passage && (
          <p className="passage" lang="zh-CN">
            {q.passage}
          </p>
        )}
        <h2>{q.prompt}</h2>
      </div>
      {q.image && (
        <img
          className="question-image"
          src={q.image}
          alt="Ảnh câu hỏi gốc"
          width={1920}
          height={720}
          loading="lazy"
        />
      )}
      {q.type === "mcq" ? (
        <fieldset className="options">
          <legend className="sr-only">Chọn đáp án</legend>
          {q.options.map((o, i) => (
            <label
              key={i}
              className={"option " + (value === String(i) ? "selected" : "")}
            >
              <input
                type="radio"
                name={q.id}
                value={i}
                checked={value === String(i)}
                disabled={disabled}
                onChange={() => onChange(String(i))}
              />
              <span className="letter">{String.fromCharCode(65 + i)}</span>
              <span lang="zh-CN">{o}</span>
            </label>
          ))}
        </fieldset>
      ) : (
        <label className="answer-label">
          Câu trả lời của bạn
          <textarea
            lang="zh-CN"
            rows={3}
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Nhập chữ Hán…"
            autoComplete="off"
          />
        </label>
      )}
    </>
  );
}
export function PracticeCard({
  q,
  onNext,
}: {
  q: Question;
  onNext?: () => void;
}) {
  const { record } = useStudy();
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const composing = useRef(false);
  const ok = checkAnswer(q, value);
  return (
    <section className="study-card">
      <div className="row between">
        <span className="badge">Bài {q.lesson} · Luyện tập</span>
        <span className="muted small">
          {q.status === "verified"
            ? "Có đáp án trong nguồn"
            : q.status === "supplemental_practice"
              ? "Bài luyện bổ sung"
              : "Đáp án tham khảo · chưa xác minh"}
        </span>
      </div>
      <form
        onCompositionStart={() => {
          composing.current = true;
        }}
        onCompositionEnd={() => {
          composing.current = false;
        }}
        onKeyDown={(e) => {
          if (
            e.key === "Enter" &&
            !canSubmit(composing.current, e.nativeEvent.isComposing)
          )
            e.preventDefault();
        }}
        onSubmit={(e) => {
          e.preventDefault();
          if (!value.trim() || submitted || !canSubmit(composing.current))
            return;
          setSubmitted(true);
          record(q, value, ok);
        }}
      >
        <QuestionBody
          q={q}
          value={value}
          onChange={setValue}
          disabled={submitted}
        />
        {q.type === "text" && q.prompt.includes("/") && (
          <SentenceBuilder
            key={q.id}
            prompt={q.prompt}
            onChange={setValue}
            disabled={submitted}
          />
        )}
        <div className="row actions">
          {!submitted ? (
            <button className="primary" disabled={!value.trim()}>
              Kiểm tra đáp án
            </button>
          ) : onNext ? (
            <button type="button" className="primary" onClick={onNext}>
              Câu tiếp theo
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setValue("");
              }}
            >
              Làm lại
            </button>
          )}
        </div>
      </form>
      {submitted && (
        <div
          className={"feedback " + (ok ? "correct" : "incorrect")}
          role="status"
        >
          <strong>
            {ok
              ? "Đúng rồi."
              : q.type === "text"
                ? "Chưa khớp đáp án mẫu."
                : "Chưa đúng."}
          </strong>
          <p>
            Đáp án {q.answerStatus === "inferred" ? "tham khảo" : "mẫu"}:{" "}
            <span lang="zh-CN">
              {q.type === "mcq" ? q.options[Number(q.answer)] : q.answer}
            </span>
          </p>
          <p>{q.explanation}</p>
        </div>
      )}
      <Source source={q.source} />
    </section>
  );
}
export function StudyLinks({ lesson }: { lesson: number }) {
  return (
    <div className="row wrap">
      <Link className="button primary" to={`/vocabulary/practice?deck=final&lesson=${lesson}`}>
        Luyện từ vựng
      </Link>
      <Link className="button" to={`/flashcards?lesson=${lesson}`}>
        Ôn thẻ từ
      </Link>
      <Link className="button" to={`/grammar?lesson=${lesson}`}>
        Ngữ pháp
      </Link>
    </div>
  );
}
