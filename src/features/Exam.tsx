import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Flag, ChevronLeft, ChevronRight } from "lucide-react";
import { questions, lessons, vocabulary, vocabQuestion } from "../data";
import { PageTitle, QuestionBody, Source } from "../components/Common";
import { scoreExam, checkAnswer } from "../lib/study";
import { useStudy } from "../hooks/useStudy";
import type { Question } from "../types";
type Draft = {
  id: string;
  started: number;
  answers: Record<string, string>;
  flags: string[];
  index: number;
  submitted: boolean;
  timed: number;
};
export default function Exam({
  scope,
}: {
  scope: "quiz2" | "final" | "quiz1";
}) {
  const title =
    scope === "quiz2" ? "Quiz 2" : scope === "quiz1" ? "Quiz 1" : "Thi cuối kỳ";
  const validLessons = lessons.filter((l) =>
    scope === "quiz2"
      ? l.id >= 8 && l.id <= 13
      : scope === "quiz1"
        ? l.id <= 7
        : true,
  );
  const sourceQuestions = questions.filter(
    (q) =>
      q.status === "verified" &&
      q.answerStatus === "verified" &&
      validLessons.some((l) => l.id === q.lesson),
  );
  const qs: Question[] =
    scope === "quiz1"
      ? validLessons.flatMap((l) =>
          vocabulary
            .filter((v) => v.lesson === l.id)
            .slice(0, 2)
            .map((v) => vocabQuestion(v)),
        )
      : scope === "final"
        ? [
            ...sourceQuestions,
            ...validLessons.flatMap((l) =>
              vocabulary
                .filter((v) => v.lesson === l.id && v.status === "verified")
                .slice(0, 1)
                .map((v) => vocabQuestion(v)),
            ),
          ]
        : sourceQuestions;
  const key = "chn113-draft-" + scope;
  const [draft, setDraft] = useState<Draft | null>(() => {
    try {
      const d = JSON.parse(localStorage.getItem(key) || "null");
      return d &&
        typeof d.id === "string" &&
        d.answers &&
        Array.isArray(d.flags)
        ? d
        : null;
    } catch {
      return null;
    }
  });
  const [confirm, setConfirm] = useState(false);
  const [minutes, setMinutes] = useState(0);
  const [now, setNow] = useState(Date.now());
  const { record, exam } = useStudy();
  const submitLock = useRef(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const [storageError, setStorageError] = useState(false);
  useEffect(() => {
    try {
      if (draft) localStorage.setItem(key, JSON.stringify(draft));
      else localStorage.removeItem(key);
    } catch {
      setStorageError(true);
    }
  }, [draft, key]);
  useEffect(() => {
    if (!draft || draft.submitted) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [draft?.id, draft?.submitted]);
  const remaining = draft?.timed
    ? Math.max(0, draft.started + draft.timed * 60000 - now)
    : 0;
  function submit() {
    if (!draft || draft.submitted || submitLock.current) return;
    submitLock.current = true;
    const result = scoreExam(qs, draft.answers);
    qs.forEach((q) =>
      record(
        q,
        draft.answers[q.id] || "",
        checkAnswer(q, draft.answers[q.id] || ""),
      ),
    );
    exam({
      id: draft.id,
      title: title + " · bộ luyện",
      questionIds: qs.map((q) => q.id),
      answers: draft.answers,
      ...result,
      timestamp: Date.now(),
    });
    setDraft({ ...draft, submitted: true });
    setConfirm(false);
  }
  useEffect(() => {
    if (draft?.timed && !draft.submitted && remaining === 0) submit();
  }, [remaining, draft?.submitted]);
  useEffect(() => {
    if (confirm) dialog.current?.showModal();
    else dialog.current?.close();
  }, [confirm]);
  if (!draft)
    return (
      <>
        <PageTitle
          title={`Ôn ${title}`}
          description={
            scope === "quiz2"
              ? "Tập trung bài 8–13. Học theo từng bài hoặc tự kiểm tra trong phòng luyện."
              : "Ôn theo phạm vi bài học và luyện lại các kỹ năng cần củng cố."
          }
        />
        <section className="exam-intro panel">
          <span className="badge">
            Phòng luyện · không phải phần mềm thi chính thức
          </span>
          <h2>
            {scope === "quiz2"
              ? "Bài luyện viết theo slide ôn Quiz 2"
              : "Bài luyện tổng hợp"}
          </h2>
          <p>
            {scope === "quiz2"
              ? `${qs.length} câu dịch từ slide session 49, có đáp án mẫu trong tài liệu.`
              : `${qs.length} câu gồm nội dung đã đối chiếu và bài luyện từ vựng bổ sung.`}{" "}
            Bộ này dùng để tự kiểm tra; không đại diện cho toàn bộ cấu trúc đề
            chính thức.
          </p>
          <ul>
            <li>Đáp án được giữ khi chuyển câu và tải lại trang.</li>
            <li>
              Có thể đánh dấu câu cần xem lại. Chỉ hiện đáp án sau khi nộp.
            </li>
            <li>
              Mỗi câu đúng được tính 1; câu viết so khớp đáp án mẫu. Đây là cách
              tính của bộ luyện.
            </li>
          </ul>
          <div className="toolbar">
            <label className="filter">
              Thời gian tự đặt
              <select
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
              >
                <option value={0}>Không giới hạn</option>
                <option value={15}>15 phút</option>
                <option value={25}>25 phút</option>
                <option value={40}>40 phút</option>
              </select>
            </label>
            <button
              className="primary"
              onClick={() => {
                setNow(Date.now());
                setDraft({
                  id: crypto.randomUUID(),
                  started: Date.now(),
                  answers: {},
                  flags: [],
                  index: 0,
                  submitted: false,
                  timed: minutes,
                });
              }}
            >
              Bắt đầu bài luyện
            </button>
          </div>
          <p className="muted small">
            Thời gian trên là lựa chọn cá nhân, không phải thời lượng thi đã xác
            minh.
          </p>
        </section>
        <div className="section-heading">
          <h2>Ôn trước khi làm bài</h2>
          <Link to="/papers">Luyện với trang đề gốc</Link>
        </div>
        <div className="lesson-cards">
          {validLessons.map((l) => (
            <Link
              to={`/lessons/${l.id}`}
              className="lesson-card compact"
              key={l.id}
            >
              <span className="muted small">Bài {l.id}</span>
              <h3>{l.title}</h3>
              <p>{l.meaning}</p>
            </Link>
          ))}
        </div>
      </>
    );
  const result = scoreExam(qs, draft.answers);
  const q = qs[Math.min(draft.index, qs.length - 1)];
  const answer = draft.answers[q.id] || "";
  if (draft.submitted)
    return (
      <>
        <PageTitle
          title="Kết quả bài luyện"
          description={
            title + " · Kết quả tự luyện, không phải điểm thi chính thức"
          }
        />
        <section className="result-banner">
          <strong>
            {result.correct}
            <span> / {result.total}</span>
          </strong>
          <div>
            <h2>Câu đúng theo đáp án mẫu</h2>
            <p>
              {result.unanswered} câu chưa trả lời ·{" "}
              {result.total - result.correct - result.unanswered} câu chưa khớp.
            </p>
          </div>
          <button
            onClick={() => {
              setDraft(null);
              submitLock.current = false;
            }}
          >
            Luyện một lượt mới
          </button>
        </section>
        <div className="notice">
          Với câu viết, một câu khác đáp án mẫu vẫn có thể đúng về ngôn ngữ. Đối
          chiếu với giáo viên khi cần.
        </div>
        {qs.map((item, i) => {
          const correct = checkAnswer(item, draft.answers[item.id] || "");
          return (
            <article className="panel result-item" key={item.id}>
              <span className={"badge " + (correct ? "good" : "warn")}>
                Câu {i + 1} ·{" "}
                {correct
                  ? "Đúng"
                  : draft.answers[item.id]
                    ? "Chưa khớp"
                    : "Chưa trả lời"}
              </span>
              <h3>{item.prompt}</h3>
              <p>
                Bạn trả lời:{" "}
                {item.type === "mcq"
                  ? item.options[Number(draft.answers[item.id])] || "—"
                  : draft.answers[item.id] || "—"}
              </p>
              <p>
                Đáp án mẫu:{" "}
                <strong lang="zh-CN">
                  {item.type === "mcq"
                    ? item.options[Number(item.answer)]
                    : item.answer}
                </strong>
              </p>
              <p className="muted">{item.explanation}</p>
              <Source source={item.source} />
            </article>
          );
        })}
      </>
    );
  return (
    <>
      <PageTitle
        title={`${title} · Đang làm bài`}
        description="Đáp án chỉ hiển thị sau khi nộp."
        action={
          <span className="timer">
            {draft.timed
              ? `${Math.floor(remaining / 60000)}:${String(Math.floor(remaining / 1000) % 60).padStart(2, "0")}`
              : "Không giới hạn"}
          </span>
        }
      />
      {storageError && (
        <p role="alert">Không thể lưu nháp. Giữ trang mở cho đến khi nộp.</p>
      )}
      <div className="exam-layout">
        <section className="study-card">
          <div className="row between">
            <span className="badge">
              Câu {draft.index + 1}/{qs.length}
            </span>
            <button
              aria-pressed={draft.flags.includes(q.id)}
              onClick={() =>
                setDraft({
                  ...draft,
                  flags: draft.flags.includes(q.id)
                    ? draft.flags.filter((id) => id !== q.id)
                    : [...draft.flags, q.id],
                })
              }
            >
              <Flag size={16} />
              {draft.flags.includes(q.id) ? "Đã đánh dấu" : "Đánh dấu"}
            </button>
          </div>
          <QuestionBody
            q={q}
            value={answer}
            onChange={(a) =>
              setDraft({ ...draft, answers: { ...draft.answers, [q.id]: a } })
            }
          />
          <div className="row between actions">
            <button
              disabled={draft.index === 0}
              onClick={() => setDraft({ ...draft, index: draft.index - 1 })}
            >
              <ChevronLeft size={16} />
              Câu trước
            </button>
            <button
              disabled={draft.index === qs.length - 1}
              onClick={() => setDraft({ ...draft, index: draft.index + 1 })}
            >
              Câu sau
              <ChevronRight size={16} />
            </button>
          </div>
        </section>
        <aside className="panel exam-nav">
          <h2>Danh sách câu</h2>
          <p className="muted">
            {result.total - result.unanswered}/{result.total} đã trả lời
          </p>
          <div className="question-grid">
            {qs.map((x, i) => (
              <button
                key={x.id}
                aria-label={`Đến câu ${i + 1}${draft.flags.includes(x.id) ? ", đã đánh dấu" : ""}`}
                aria-current={i === draft.index ? "step" : undefined}
                className={`${draft.answers[x.id] ? "answered" : ""} ${i === draft.index ? "current" : ""}`}
                onClick={() => setDraft({ ...draft, index: i })}
              >
                {i + 1}
                {draft.flags.includes(x.id) && <span className="flag-dot" />}
              </button>
            ))}
          </div>
          <p className="small muted">
            Viền đậm: câu hiện tại · chấm vàng: xem lại
          </p>
          <button className="primary full" onClick={() => setConfirm(true)}>
            Nộp bài
          </button>
        </aside>
      </div>
      <dialog
        ref={dialog}
        onCancel={() => setConfirm(false)}
        aria-labelledby="submit-title"
      >
        <h2 id="submit-title">Nộp bài luyện?</h2>
        <p>
          Còn {result.unanswered} câu chưa trả lời và {draft.flags.length} câu
          đánh dấu.
        </p>
        <div className="row">
          <button onClick={() => setConfirm(false)}>Tiếp tục làm</button>
          <button className="primary" onClick={submit}>
            Xác nhận nộp bài
          </button>
        </div>
      </dialog>
    </>
  );
}
