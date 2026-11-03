import AnswerReview from '../components/AnswerReview';
import {gradeAssessment,gradable} from '../lib/GradingEngine';
import { useEffect, useRef, useState } from "react";
import { sourceUrl } from "../lib/sourceLinks";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Flag,
  Headphones,
  BookOpen,
  Link2,
  CheckCircle2,
} from "lucide-react";
import data from "../data/assessments.json";
import audio from "../data/audio-registry.json";
import OriginalAudio from "../components/OriginalAudio";
import {
  type Assessment,
  type Question,
  type Answer,
  type Attempt,
  attemptKey,
  restoreAttempt,
  freshAttempt,
  validQuestion,
  validAnswer,
  summarize,
  matchAnswer,
  suggestionSummary,
  compareSuggestion,
} from "../lib/assessment";
import "./repair.css";
export const assessments = data as Assessment[];
const labels = {
  correct: "Đúng",
  incorrect: "Chưa đúng",
  unanswered: "Chưa trả lời",
  review: "Cần đối chiếu",
  invalid: "Câu trả lời chưa hợp lệ",
};
function load(a: Assessment) {
  try {
    return restoreAttempt(localStorage.getItem(attemptKey(a.id)), a);
  } catch {
    return null;
  }
}
export default function AssessmentCenter() {
  const { assessmentId } = useParams();
  const location = useLocation();
  const [filter, setFilter] = useState("all");
  const a = assessments.find((x) => x.id === assessmentId);
  const final = ["/final","/practice/listening"].includes(location.pathname);
  const matching = location.pathname === "/matching";
  const pool = assessments.filter((x) =>
    final
      ? x.category === "listening"
      : matching
        ? x.category === "matching"
        : filter === "all" || x.category === filter,
  );
  if (assessmentId)
    return a ? (
      <Workspace key={a.id} assessment={a} />
    ) : (
      <main className="repair-center">
        <h1>Không tìm thấy bộ câu hỏi</h1>
        <Link to="/papers">Về thư viện</Link>
      </main>
    );
  return (
    <main className="repair-center">
      <header className="repair-nav">
        <Link to="/">← Không gian học</Link>
        <strong>CHN113 / PRACTICE</strong>
        <Link to="/listening">Thư viện audio</Link>
      </header>
      <section className="repair-hero">
        <span className="eyebrow">NGUỒN THẬT · BÀI LÀM CỦA BẠN</span>
        <h1>
          {final
            ? "Nghe từng phần. Làm trọn lượt."
            : matching
              ? "Nối câu, hiểu ngữ cảnh."
              : "Mở đề. Bắt đầu làm."}
        </h1>
        <p>
          {final
            ? "Bản thu gốc nằm ngay cạnh câu hỏi. Lưu câu trả lời và quay lại đối chiếu, kể cả khi nguồn chưa có khóa đáp án."
            : `${assessments.filter((x) => x.category === "matching").length} bộ nối câu khác nhau và các câu hỏi đã tách từ tài liệu. Không cần ghi đáp án lên ảnh chụp.`}
        </p>
      </section>
      {!final && !matching && (
        <div className="repair-filters" aria-label="Loại bài">
          {[
            ["all", "Tất cả"],
            ["reading", "Đọc hiểu"],
            ["writing", "Viết"],
            ["matching", "Nối câu"],
            ["listening", "Nghe"],
          ].map(([id, text]) => (
            <button
              key={id}
              aria-pressed={filter === id}
              onClick={() => setFilter(id)}
            >
              {text}
            </button>
          ))}
          <Link to="/papers/reference">Xem toàn bộ PDF gốc</Link>
        </div>
      )}
      <div className="repair-library">
        {pool.map((p, i) => {
          const d = load(p),
            answered = p.questions.filter((q) =>
              validAnswer(q, d?.answers[q.id]),
            ).length;
          const Icon =
            p.category === "listening"
              ? Headphones
              : p.category === "matching"
                ? Link2
                : BookOpen;
          return (
            <article key={p.id}>
              <div className={"paper-icon " + p.category}>
                <Icon />
                <span>{String(i + 1).padStart(2, "0")}</span>
              </div>
              <span className="eyebrow">
                {p.category === "matching"
                  ? "5 CẶP NỐI"
                  : p.questions.length + " CÂU"}{" "}
                · CÓ LỜI GIẢI
              </span>
              <h2>{p.title}</h2>
              <p>{p.description}</p>
              <small>{p.filename}</small>
              <div className="paper-progress">
                <progress value={answered} max={p.questions.length} />
                <span>
                  {d?.submitted
                    ? "Đã nộp"
                    : `${answered}/${p.questions.length} đã hoàn thành`}
                </span>
              </div>
              <Link className="button primary" to={"/practice/source/" + p.id}>
                {d
                  ? d.submitted
                    ? "Xem bài đã nộp"
                    : "Tiếp tục"
                  : "Mở bài luyện"}{" "}
                <ArrowRight size={17} />
              </Link>
            </article>
          );
        })}
      </div>
      {final && (
        <details className="repair-limitations">
          <summary>Nguồn chưa đủ để mở đề chấm điểm</summary>
          <p>
            SP24 FE: liên kết audio–PDF dựa trên đối chiếu bản nhận dạng tự
            động, cần xác minh độc lập; chưa có khóa đáp án, câu 20 bị cắt một
            lựa chọn. SU26-RE-L: chưa xác định được Audios.zip theo mã đề. Không
            dùng audio FE để thay cho RE.
          </p>
        </details>
      )}
    </main>
  );
}
function Workspace({ assessment: a }: { assessment: Assessment }) {
  const [draft, setDraft] = useState<Attempt | null>(() => load(a));
  const [selfReview, setSelfReview] = useState<
    Record<string, "correct" | "incorrect" | "unsure">
  >(() => {
    try {
      return JSON.parse(
        localStorage.getItem("chn113-selfcheck-" + a.id) || "{}",
      );
    } catch {
      return {};
    }
  });
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const questions = a.questions.filter(q=>validQuestion(q)&&(!draft?.questionIds?.length||draft.questionIds.includes(q.id)));
  const clean = { ...a, questions };
  useEffect(() => {
    if (!draft) return;
    try {
      localStorage.setItem(attemptKey(a.id), JSON.stringify(draft));
      setError("");
    } catch {
      setError(
        "Không lưu được trên thiết bị. Hãy xuất bài làm trước khi rời trang.",
      );
    }
  }, [draft, a.id]);
  useEffect(() => {
    if (confirm) dialog.current?.showModal();
    else dialog.current?.close();
  }, [confirm]);
  useEffect(()=>{if(!draft?.submitted)return;const report=gradeAssessment(a.questions.filter(q=>!draft.questionIds?.length||draft.questionIds.includes(q.id)),draft.answers,draft.submittedAt);try{localStorage.setItem('chn113-grades-'+draft.id,JSON.stringify(report));const old=JSON.parse(localStorage.getItem('chn113-source-mistakes')||'{}');for(const row of report.rows){if(['incorrect','partial','invalid'].includes(row.status))old[row.questionId]={...row,assessmentId:a.id};else if(row.status==='correct')delete old[row.questionId]}localStorage.setItem('chn113-source-mistakes',JSON.stringify(old))}catch{}},[draft,a]);
  const begin = () => {
    setSelfReview({});
    try {
      localStorage.removeItem("chn113-selfcheck-" + a.id);
    } catch {}
    setDraft(freshAttempt(a.id));
  };
  if (!questions.length)
    return (
      <main className="repair-center">
        <h1>Bộ câu hỏi chưa hợp lệ</h1>
        <p>Không đưa câu lỗi vào tổng hoặc tính điểm.</p>
        <Link to="/papers">Chọn bài khác</Link>
      </main>
    );
  if (!draft)
    return (
      <main className="repair-center">
        <Link to="/papers">← Thư viện bài luyện</Link>
        <section className="repair-intro">
          <span className="eyebrow">TRƯỚC KHI BẮT ĐẦU</span>
          <h1>{a.title}</h1>
          <p>{a.description}</p>
          {a.note && <p className="notice">{a.note}</p>}
          <ul>
            <li>Chọn đáp án, chuyển câu và đánh dấu nội dung cần xem lại.</li>
            <li>Tự lưu trên trình duyệt này. Không giới hạn thời gian.</li>
            <li>
              Chỉ chấm câu có khóa xác minh hoặc nội dung do ứng dụng biên soạn.
              Các câu còn lại được giữ để đối chiếu, không tự tính sai.
            </li>
          </ul>
          <button className="primary" onClick={begin}>
            Bắt đầu làm bài
          </button>
        </section>
      </main>
    );
  const q = questions[Math.min(draft.index, questions.length - 1)];
  const result = summarize(questions, draft.answers);
  const grades=gradeAssessment(questions,draft.answers,draft.submittedAt);
  const suggested = suggestionSummary(questions, draft.answers);
  const manualDone = Object.values(selfReview).filter(
    (x) => x !== "unsure",
  ).length;
  const answered = questions.filter((x) =>
    validAnswer(x, draft.answers[x.id]),
  ).length;
  const asset = audio.find((x) => x.sourceId === q.audioId);
  const groupIndex = assessments
    .filter((x) => x.category === "matching")
    .findIndex((x) => x.id === a.id);
  const nextGroup = assessments.filter((x) => x.category === "matching")[
    groupIndex + 1
  ];
  const selfGrade = (id: string, value: "correct" | "incorrect" | "unsure") =>
    setSelfReview((prev) => {
      const next = { ...prev, [id]: value };
      try {
        localStorage.setItem("chn113-selfcheck-" + a.id, JSON.stringify(next));
      } catch {
        setError("Không lưu được đánh giá tự kiểm tra.");
      }
      return next;
    });
  const change = (value: Answer) =>
    setDraft((d) =>
      d && !d.submitted
        ? { ...d, answers: { ...d.answers, [q.id]: value } }
        : d,
    );
  const move = (index: number) => setDraft((d) => (d ? { ...d, index } : d));
  const submit = () => {
    setDraft((d) =>
      d && !d.submitted
        ? { ...d, submitted: true, submittedAt: Date.now() }
        : d,
    );
    setConfirm(false);
  };
  function exportAttempt() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify({ assessment: a.id, draft, result }, null, 2)], {
        type: "application/json",
      }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = a.id + "-bai-lam.json";
    link.click();
    URL.revokeObjectURL(url);
  }
  return (
    <main className="repair-center">
      <header className="repair-nav">
        <Link to={a.category === "listening" ? "/final" : "/papers"}>
          ← Rời phòng · giữ bài
        </Link>
        <strong>{draft.submitted ? "ĐÃ NỘP" : "ĐANG LÀM BÀI"}</strong>
        <span>
          {answered}/{questions.length} hoàn thành
        </span>
      </header>
      <h1 className="repair-room-title">{a.title}</h1>
      {a.category === "matching" && (
        <p>
          Bộ {groupIndex + 1} /{" "}
          {assessments.filter((x) => x.category === "matching").length} · 5 cặp
          nối
        </p>
      )}
      {error && (
        <p role="alert" className="notice">
          {error}
        </p>
      )}
      {a.note && (
        <details className="repair-limitations">
          <summary>Trạng thái nguồn và giới hạn bài luyện</summary>
          <p>{a.note}</p>
        </details>
      )}
      {draft.submitted && (
        <section className="repair-results" role="status">
          <CheckCircle2 />
          <div>
            <h2>{grades.practice.percent===null?'Đã lưu bài · xem mẫu và tự đánh giá':`Điểm luyện tập: ${grades.practice.percent}%`}</h2>
            <p>{grades.practice.score}/{grades.practice.maximum} điểm có thể chấm · {grades.manual} câu cần tự đánh giá · {result.unanswered} chưa trả lời.</p>
            <p>Điểm thi theo khóa chính thức: {grades.official.percent===null?'chưa có khóa xác minh':grades.official.percent+'%'}.</p>
            <p>Thời gian: {Math.max(0,Math.round(((draft.submittedAt||Date.now())-draft.started)/1000))} giây. {manualDone} câu đã tự đối chiếu.</p>
          </div>
          <button onClick={begin}>Làm lại</button>
          {grades.wrongIds.length>0&&<button onClick={()=>setDraft({...freshAttempt(a.id),questionIds:grades.wrongIds})}>Luyện lại {grades.wrongIds.length} câu sai</button>}
          {nextGroup && (
            <Link className="button" to={"/practice/source/" + nextGroup.id}>
              Bộ tiếp theo →
            </Link>
          )}
        </section>
      )}
      <div className="repair-room">
        <article className="repair-question">
          <div className="repair-question-head">
            <span>
              CÂU {draft.index + 1} / {questions.length}
            </span>
            <button
              aria-pressed={draft.flags.includes(q.id)}
              onClick={() =>
                setDraft((d) =>
                  d
                    ? {
                        ...d,
                        flags: d.flags.includes(q.id)
                          ? d.flags.filter((id) => id !== q.id)
                          : [...d.flags, q.id],
                      }
                    : d,
                )
              }
            >
              <Flag size={16} />{" "}
              {draft.flags.includes(q.id) ? "Đã đánh dấu" : "Đánh dấu"}
            </button>
          </div>
          {asset && <OriginalAudio key={asset.id} asset={asset} />}
          <div className="question-copy">
            {q.passage && (
              <p className="repair-passage" lang="zh-CN">
                {q.passage}
              </p>
            )}
            <h2>{q.prompt}</h2>
            {q.image && (
              <img
                className="repair-illustration"
                src={q.image}
                alt="Minh họa trích từ câu hỏi gốc"
              />
            )}
            {q.note && <p className="muted">{q.note}</p>}
            {q.keyStatus === "inferred" && (
              <p className="practice-source-chip">
                Có gợi ý biên tập để tự chữa sau khi nộp · chưa xác minh độc lập
              </p>
            )}
            {q.keyStatus === "derived" && <p className="practice-source-chip">Chấm luyện tập · có đáp án và giải thích sau khi nộp</p>}
            {q.keyStatus === "missing" && (
              <p className="practice-source-chip">
                Có câu mẫu và hướng dẫn chữa · tự đánh giá phần viết mở
              </p>
            )}
            {!draft.submitted&&<details className="answer-hint"><summary>Xem cách giải / đáp án để học</summary><AnswerReview q={q} answer={draft.answers[q.id]}/><p>Đã xem lời giải thì điểm lượt này chỉ phản ánh luyện tập.</p></details>}
            <QuestionInput
              key={q.id}
              q={q}
              value={draft.answers[q.id]}
              disabled={draft.submitted}
              onChange={change}
            />
          </div>
          {draft.submitted && (
            <section className="repair-review">
              <AnswerReview q={q} answer={draft.answers[q.id]}/>
              {!gradable(q) && (
                <div className="self-review">
                  <p>
                    <strong>Tự đối chiếu:</strong> Sau khi đọc đáp án gợi ý hoặc
                    mở tài liệu, chọn kết quả để đưa câu này vào lịch ôn. Không
                    được coi đây là điểm chấm chính thức.
                  </p>
                  <div className="repair-actions">
                    {(
                      [
                        ["correct", "Tôi làm đúng"],
                        ["incorrect", "Tôi cần ôn lại"],
                        ["unsure", "Chưa chắc"],
                      ] as const
                    ).map(([status, label]) => (
                      <button
                        key={status}
                        className={
                          selfReview[q.id] === status ? "selected" : ""
                        }
                        aria-pressed={selfReview[q.id] === status}
                        onClick={() => selfGrade(q.id, status)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {selfReview[q.id] && (
                    <p role="status">
                      Đã lưu tự đánh giá:{" "}
                      {selfReview[q.id] === "correct"
                        ? "Đúng"
                        : selfReview[q.id] === "incorrect"
                          ? "Cần ôn lại"
                          : "Chưa chắc"}
                      .
                    </p>
                  )}
                </div>
              )}
            </section>
          )}
          <details className="repair-source">
            <summary>
              Nguồn · {a.filename}, trang {q.page}
            </summary>
            {sourceUrl(q.sourceId, q.page) ? (
              <a
                href={sourceUrl(q.sourceId, q.page)!}
                target="_blank"
                rel="noreferrer"
              >
                Mở tài liệu gốc
              </a>
            ) : (
              <span className="muted">
                Tệp gốc chưa có trong bản này. Nội dung câu hỏi vẫn được giữ.
              </span>
            )}
            <p>
              Giữ thứ tự trang của nguồn. Không coi lựa chọn được tô trong ảnh
              là khóa đáp án.
            </p>
          </details>
          <div className="repair-actions">
            <button
              disabled={draft.index === 0}
              onClick={() => move(draft.index - 1)}
            >
              <ArrowLeft size={16} /> Câu trước
            </button>
            <button
              disabled={draft.index >= questions.length - 1}
              onClick={() => move(draft.index + 1)}
            >
              Câu tiếp <ArrowRight size={16} />
            </button>
          </div>
        </article>
        <aside className="repair-answer-sheet">
          <h2>Phiếu trả lời</h2>
          <progress value={answered} max={questions.length} />
          <p>
            {answered}/{questions.length} đã hoàn thành
          </p>
          <div className="repair-number-grid">
            {questions.map((item, i) => (
              <button
                key={item.id}
                aria-label={"Câu " + (i + 1)}
                aria-current={i === draft.index ? "step" : undefined}
                className={
                  (validAnswer(item, draft.answers[item.id])
                    ? "answered "
                    : "") + (draft.flags.includes(item.id) ? "flagged" : "")
                }
                onClick={() => move(i)}
              >
                {i + 1}
                {draft.flags.includes(item.id) && <Flag size={10} />}
              </button>
            ))}
          </div>
          {!draft.submitted && (
            <button className="primary" onClick={() => setConfirm(true)}>
              Nộp bài
            </button>
          )}
          <button onClick={exportAttempt}>Xuất bài làm</button>
          <p className="muted">
            Tự lưu trên thiết bị. Màu xanh: đã trả lời, không phải đáp án đúng.
          </p>
        </aside>
      </div>
      <dialog ref={dialog} onCancel={() => setConfirm(false)}>
        <h2>Nộp bài luyện?</h2>
        <p>
          Còn {questions.length - answered} câu chưa hoàn thành. Bài đã nộp được
          giữ để xem lại.
        </p>
        <div className="repair-actions">
          <button onClick={() => setConfirm(false)}>Tiếp tục làm</button>
          <button className="primary" onClick={submit}>
            Xác nhận nộp bài
          </button>
        </div>
      </dialog>
    </main>
  );
}
export function QuestionInput({
  q,
  value,
  disabled,
  onChange,
}: {
  q: Question;
  value: Answer | undefined;
  disabled: boolean;
  onChange: (a: Answer) => void;
}) {
  const [picked, setPicked] = useState("");
  const mapping = (
    value && typeof value === "object" && !Array.isArray(value) ? value : {}
  ) as Record<string, string>;
  if (q.kind === "matching")
    return (
      <div className="matching-board">
        <p>
          Chọn một đáp án rồi bấm câu hỏi, hoặc kéo đáp án vào câu. Có thể dùng
          danh sách chọn bằng bàn phím.
        </p>
        <div className="matching-options">
          {q.options?.map((o, i) => (
            <button
              key={o.id}
              disabled={disabled}
              draggable={!disabled}
              aria-pressed={picked === o.id}
              onDragStart={(e) => e.dataTransfer.setData("text/plain", o.id)}
              onClick={() => setPicked(o.id)}
              className={Object.values(mapping).includes(o.id) ? "used" : ""}
            >
              <b>{String.fromCharCode(65 + i)}</b>
              {o.text}
            </button>
          ))}
        </div>
        <div className="matching-rows">
          {q.rows?.map((r, i) => (
            <div
              key={r.id}
              className={mapping[r.id] ? "matched" : ""}
              onDragOver={(e) => {
                if (!disabled) e.preventDefault();
              }}
              onDrop={(e) => {
                e.preventDefault();
                const id = e.dataTransfer.getData("text/plain");
                if (!disabled && q.options?.some((o) => o.id === id))
                  onChange(matchAnswer(mapping, r.id, id));
              }}
            >
              <button
                disabled={disabled || !picked}
                onClick={() => {
                  onChange(matchAnswer(mapping, r.id, picked));
                  setPicked("");
                }}
              >
                <b>{i + 1}.</b> {r.text}
              </button>
              <select
                aria-label={"Ghép câu " + (i + 1)}
                disabled={disabled}
                value={mapping[r.id] || ""}
                onChange={(e) =>
                  onChange(matchAnswer(mapping, r.id, e.target.value))
                }
              >
                <option value="">Chọn đáp án</option>
                {q.options?.map((o, j) => (
                  <option key={o.id} value={o.id}>
                    {String.fromCharCode(65 + j)}. {o.text}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>
    );
  if (q.kind === "text")
    return (
      <label>
        Câu trả lời
        <textarea
          aria-label="Câu trả lời"
          disabled={disabled}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
    );
  if (q.kind === "ordering") {
    const ordered = Array.isArray(value) ? value : [];
    return (
      <div className="sentence-builder">
        <div aria-label="Câu đã xếp">
          {ordered.map((id, i) => (
            <button
              key={id}
              disabled={disabled}
              onClick={() => onChange(ordered.filter((_, j) => j !== i))}
            >
              {q.options?.find((o) => o.id === id)?.text}
            </button>
          ))}
        </div>
        <div>
          {q.options?.map((o) => (
            <button
              key={o.id}
              disabled={disabled || ordered.includes(o.id)}
              onClick={() => onChange([...ordered, o.id])}
            >
              {o.text}
            </button>
          ))}
        </div>
        <button disabled={disabled||!ordered.length} onClick={()=>onChange(ordered.slice(0,-1))}>Hoàn tác</button>
        <button disabled={disabled} onClick={() => onChange([])}>
          Xếp lại
        </button>
      </div>
    );
  }
  return (
    <fieldset className="repair-options" disabled={disabled}>
      <legend>
        {q.kind === "multiple" ? "Chọn các đáp án phù hợp" : "Chọn một đáp án"}
      </legend>
      {q.options?.map((o, i) => (
        <label
          key={o.id}
          className={
            (Array.isArray(value) ? value.includes(o.id) : value === o.id)
              ? "selected"
              : ""
          }
        >
          <input
            type={q.kind === "multiple" ? "checkbox" : "radio"}
            name={q.id}
            checked={
              Array.isArray(value) ? value.includes(o.id) : value === o.id
            }
            onChange={() =>
              onChange(
                q.kind === "multiple"
                  ? Array.isArray(value) && value.includes(o.id)
                    ? value.filter((id) => id !== o.id)
                    : [...(Array.isArray(value) ? value : []), o.id]
                  : o.id,
              )
            }
          />
          <b>{String.fromCharCode(65 + i)}</b>
          <span>{o.text}</span>
        </label>
      ))}
    </fieldset>
  );
}
