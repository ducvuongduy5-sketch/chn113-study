import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Flag,
  Headphones,
  FileCheck,
  BookOpen,
  Save,
  Check,
} from "lucide-react";
import { audios } from "../../data";
import { assessments } from "../AssessmentCenter";
import { Source } from "../../components/Common";
import { papers } from "./papers";
import {
  gradeItem,
  gradePaper,
  loadExamDraft,
  setExamAnswer,
  type ExamDraft,
  type Paper,
  type ExamItem,
} from "./model";
import "./exam.css";

export default function ExamCenter() {
  const { paperId } = useParams();
  const location = useLocation();
  const category = location.pathname === "/final" ? "final" : "quiz2";
  const [tab, setTab] = useState(category);
  const paper = papers.find((p) => p.id === paperId);
  useEffect(() => setTab(category), [category]);
  return (
    <div className="exam-shell">
      <header className="exam-brand">
        <Link to="/">
          <ArrowLeft size={18} /> Không gian học
        </Link>
        <strong>
          CHN113 <span>EXAM CENTER</span>
        </strong>
        <span>Phòng luyện thi cá nhân</span>
      </header>
      {paperId ? (
        paper ? (
          <ExamRoom key={paper.id} paper={paper} />
        ) : (
          <section className="exam-entry">
            <h1>Không tìm thấy mã đề</h1>
            <Link to="/exams">Chọn lại đề</Link>
          </section>
        )
      ) : (
        <section className="exam-entry">
          <div className="exam-intro">
            <p className="eyebrow">TẬP TRUNG · TỰ KIỂM TRA · ĐỐI CHIẾU</p>
            <h1>Sẵn sàng vào phòng thi.</h1>
            <p>
              Chọn kỹ năng và nguồn đề. Câu trả lời được giữ lại trên trình
              duyệt này khi bạn chuyển câu hoặc tải lại trang.
            </p>
          </div>
          <div className="exam-tabs" role="tablist" aria-label="Loại bài thi">
            <button
              role="tab"
              aria-selected={tab === "quiz2"}
              onClick={() => setTab("quiz2")}
            >
              <FileCheck /> Quiz 2 · Reading & Writing
            </button>
            <button
              role="tab"
              aria-selected={tab === "final"}
              onClick={() => setTab("final")}
            >
              <Headphones /> Final Exam · Listening
            </button>
          </div>
          {tab === "quiz2" ? (
            <>
              <div className="exam-blueprint">
                <div>
                  <b>12</b> Trắc nghiệm
                </div>
                <div>
                  <b>5</b> Cặp nối
                </div>
                <div>
                  <b>10</b> Viết
                </div>
                <div>
                  <b>27</b> Tổng câu
                </div>
              </div>
              <div className="exam-paper-list">
                {papers.map((p) => (
                  <article key={p.id}>
                    <div className="exam-paper-icon">
                      <BookOpen />
                    </div>
                    <div>
                      <span className="eyebrow">
                        {p.origin === "supplemental"
                          ? "BÀI LUYỆN BỔ SUNG"
                          : "BỘ GHÉP TỪ TÀI LIỆU ĐÃ CÓ"}
                      </span>
                      <h2>{p.title}</h2>
                      <p>{p.description}</p>
                      <Link className="button primary" to={"/exams/" + p.id}>
                        Xem hướng dẫn <ArrowRight size={18} />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <div className="exam-fe">
              <Headphones size={36} />
              <h2>Final Exam chỉ kiểm tra Listening</h2>
              <p>
                Có bài luyện 20 vị trí câu hỏi với bản thu SP24 FE ứng viên.
                Chưa có khóa đáp án xác minh nên bài luyện không chấm điểm.
              </p>
              <div className="notice">
                <strong>SU26-RE-L · Chưa xác minh</strong>
                <p>
                  Trang nguồn có 20 ảnh câu hỏi và Audios.zip. Chưa tải được
                  đính kèm và chưa xác nhận các audio trùng tên ở máy này thuộc
                  mã đề đó.
                </p>
                <a
                  href="https://fuoverflow.com/threads/chn113-su26-re-l.7129/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Mở trang nguồn
                </a>
              </div>
              <p>
                {audios.filter((a) => !a.lesson).length} audio trong thư viện
                đang chờ ghép theo câu.
              </p>
              <div className="exam-paper-list">
                {assessments
                  .filter((a) => a.category === "listening")
                  .map((a) => (
                    <article key={a.id}>
                      <div className="exam-paper-icon">
                        <Headphones />
                      </div>
                      <div>
                        <span className="eyebrow">
                          20 CÂU · 4 AUDIO GỐC · CHƯA CÓ KHÓA XÁC MINH
                        </span>
                        <h2>{a.title}</h2>
                        <p>{a.description}</p>
                        <Link
                          className="button primary"
                          to={"/practice/source/" + a.id}
                        >
                          Mở phòng luyện nghe <ArrowRight size={18} />
                        </Link>
                      </div>
                    </article>
                  ))}
              </div>
            </div>
          )}
          <p className="exam-footnote">
            Mô phỏng luồng làm bài; không phải phần mềm EOS chính thức. Không tự
            đặt thời hạn thi khi chưa có cấu hình đã xác minh.
          </p>
        </section>
      )}
    </div>
  );
}

function ExamRoom({ paper }: { paper: Paper }) {
  const storageKey = "chn113-exam-v4-" + paper.id;
  const navigate = useNavigate();
  const [draft, setDraft] = useState<ExamDraft | null>(() =>
    loadExamDraft(storageKey, paper, localStorage),
  );
  const [storageError, setStorageError] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!draft) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(draft));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [draft, storageKey]);
  useEffect(() => {
    if (!draft || draft.submitted) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [draft?.id, draft?.submitted]);
  useEffect(() => {
    if (confirm) dialog.current?.showModal();
    else dialog.current?.close();
  }, [confirm]);
  const begin = () => {
    setNow(Date.now());
    setDraft({
      version: 4,
      id: crypto.randomUUID(),
      paperId: paper.id,
      answers: {},
      flags: [],
      index: 0,
      started: Date.now(),
      submitted: false,
    });
  };
  if (!draft)
    return (
      <section className="exam-entry instructions">
        <span className="eyebrow">TRƯỚC KHI BẮT ĐẦU</span>
        <h1>{paper.title}</h1>
        <p>{paper.description}</p>
        <ol>
          <li>27 câu: 12 trắc nghiệm, 5 cặp nối, 10 câu viết.</li>
          <li>Có thể đổi đáp án và đánh dấu câu cần xem lại.</li>
          <li>Ghép cặp là một–một; chọn lại đáp án đang dùng sẽ bỏ ghép cũ.</li>
          <li>Không hiện đáp án tham khảo trước khi nộp.</li>
          <li>
            {paper.origin === "source_collection"
              ? "Nguồn chưa có khóa đáp án được xác minh: không tính điểm chính thức."
              : "Điểm luyện chỉ tính các câu xác định được; câu viết khác mẫu cần xem lại."}
          </li>
          <li>Không giới hạn giờ. Đồng hồ chỉ ghi thời gian đã làm.</li>
        </ol>
        <button className="primary" onClick={begin}>
          Bắt đầu làm bài
        </button>
      </section>
    );
  const results = gradePaper(paper, draft.answers);
  const q = paper.items[draft.index];
  const elapsed = Math.max(
    0,
    Math.floor(((draft.submittedAt || now) - draft.started) / 1000),
  );
  const answer = (id: string, value: string) =>
    setDraft((d) =>
      d && !d.submitted
        ? { ...d, answers: setExamAnswer(paper, d.answers, id, value) }
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
  const saveFile = () => {
    const url = URL.createObjectURL(
      new Blob(
        [
          JSON.stringify(
            { paperId: paper.id, origin: paper.origin, draft, results },
            null,
            2,
          ),
        ],
        { type: "application/json" },
      ),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = paper.id + "-bai-lam.json";
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <section className="exam-room">
      <div className="exam-room-heading">
        <div>
          <span className="eyebrow">
            {draft.submitted ? "ĐÃ NỘP · XEM LẠI" : "ĐANG LÀM BÀI"}
          </span>
          <h1>{paper.title}</h1>
        </div>
        <div className="exam-clock">
          <span>Thời gian đã làm</span>
          <b>
            {Math.floor(elapsed / 60)
              .toString()
              .padStart(2, "0")}
            :{(elapsed % 60).toString().padStart(2, "0")}
          </b>
        </div>
      </div>
      {storageError && (
        <p className="notice" role="alert">
          Trình duyệt không lưu được bài. Hãy xuất bài làm trước khi thoát.
        </p>
      )}
      {draft.submitted && (
        <div className="exam-results" role="status">
          <h2>Kết quả bài luyện</h2>
          <div className="exam-blueprint">
            <div>
              <b>{results.correct}</b> Đúng theo mẫu
            </div>
            <div>
              <b>{results.incorrect}</b> Chưa đúng
            </div>
            <div>
              <b>{results.manual}</b> Cần đối chiếu
            </div>
            <div>
              <b>{results.unanswered}</b> Chưa trả lời
            </div>
          </div>
          <p>
            {paper.origin === "source_collection"
              ? "Chấm luyện tập bằng lời giải biên soạn. Đây không phải điểm thi theo khóa chính thức; câu viết mở được tách riêng."
              : "Câu viết có thể có nhiều cách diễn đạt đúng. Câu khác mẫu không bị tự động tính sai."}
          </p>
          <p>Điểm luyện phần xác định: {results.correct}/{paper.items.filter(x=>!x.review&&['verified','derived','supplemental'].includes(x.keyStatus)).length}. Phần tự đánh giá: {results.manual} câu.</p><button onClick={begin}>Làm lượt mới</button>{paper.items.some(x=>gradeItem(x,draft.answers[x.id]||'')==='incorrect')&&<button onClick={()=>{const ids=paper.items.filter(x=>gradeItem(x,draft.answers[x.id]||'')==='incorrect').map(x=>x.id);setDraft(d=>d?{...d,submitted:false,submittedAt:undefined,index:paper.items.findIndex(x=>ids.includes(x.id)),answers:Object.fromEntries(Object.entries(d.answers).filter(([id])=>!ids.includes(id)))}:d)}}>Luyện lại câu sai</button>}
        </div>
      )}
      <div className="exam-room-grid">
        <article className="exam-question">
          <div className="exam-question-top">
            <span>
              {q.section === "reading" ? "READING" : "WRITING"} · CÂU{" "}
              {draft.index + 1} / 27
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
              <Flag size={17} />{" "}
              {draft.flags.includes(q.id) ? "Đã đánh dấu" : "Đánh dấu"}
            </button>
          </div>
          {q.passage && (
            <p className="exam-passage" lang="zh-CN">
              {q.passage}
            </p>
          )}
          <h2 lang="zh-CN">{q.prompt}</h2>
          {q.image && (
            <img
              className="exam-stimulus"
              src={q.image}
              alt="Tranh tình huống của câu hỏi"
            />
          )}
          {q.kind === "match" ? (
            <div className="exam-matching">
              {paper.items
                .filter((x) => x.group === q.group)
                .map((item, i) => (
                  <label key={item.id}>
                    <span>
                      {i + 1}. {item.prompt}
                    </span>
                    <select
                      aria-label={"Ghép " + (i + 1)}
                      disabled={draft.submitted}
                      value={draft.answers[item.id] || ""}
                      onChange={(e) => answer(item.id, e.target.value)}
                    >
                      <option value="">Chọn câu trả lời</option>
                      {item.options?.map((o, i) => (
                        <option key={o.id} value={o.id}>
                          {String.fromCharCode(65 + i)}. {o.text}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
            </div>
          ) : (
            <AnswerInput
              key={q.id}
              q={q}
              value={draft.answers[q.id] || ""}
              disabled={draft.submitted}
              onChange={(value) => answer(q.id, value)}
            />
          )}
          {draft.submitted && (
            <div className="exam-review">
              <h3>
                {
                  {
                    correct: "Đúng theo mẫu",
                    incorrect: "Chưa đúng",
                    manual: "Cần đối chiếu",
                    unanswered: "Chưa trả lời",
                  }[gradeItem(q, draft.answers[q.id] || "")]
                }
              </h3>
              <p>
                <strong>
                  {q.keyStatus === "inferred"
                    ? "Gợi ý suy luận, chưa phải khóa đáp án: "
                    : "Mẫu đối chiếu: "}
                </strong>
                {q.options?.find((o) => o.id === q.key)?.text ||
                  q.key ||
                  "Chưa có"}
              </p>
              <p>{q.explanation}</p>
              <Source source={q.source} />
            </div>
          )}
          <div className="exam-question-actions">
            <button
              disabled={draft.index === 0}
              onClick={() => move(draft.index - 1)}
            >
              <ArrowLeft size={18} /> Câu trước
            </button>
            <button
              disabled={draft.index === 26}
              onClick={() => move(draft.index + 1)}
            >
              Câu tiếp <ArrowRight size={18} />
            </button>
          </div>
        </article>
        <aside className="exam-navigation">
          <h2>Phiếu trả lời</h2>
          <p>
            {Object.values(draft.answers).filter((v) => v.trim()).length} / 27
            câu đã trả lời
          </p>
          {(["reading", "writing"] as const).map((section) => (
            <div key={section}>
              <h3>
                {section === "reading"
                  ? "Reading · 17 câu"
                  : "Writing · 10 câu"}
              </h3>
              <div className="exam-number-grid">
                {paper.items.map((item, i) =>
                  item.section === section ? (
                    <button
                      key={item.id}
                      aria-label={"Câu " + (i + 1)}
                      aria-current={i === draft.index ? "step" : undefined}
                      className={
                        (draft.answers[item.id]?.trim() ? "answered " : "") +
                        (draft.flags.includes(item.id) ? "flagged" : "")
                      }
                      onClick={() => move(i)}
                    >
                      {i + 1}
                      {draft.flags.includes(item.id) && <Flag size={10} />}
                    </button>
                  ) : null,
                )}
              </div>
            </div>
          ))}
          <p className="exam-legend">
            <Check size={14} /> Màu xanh: đã trả lời · Cờ: xem lại
          </p>
          {!draft.submitted && (
            <button className="primary" onClick={() => setConfirm(true)}>
              Nộp bài
            </button>
          )}
          <button onClick={saveFile}>
            <Save size={16} /> Xuất bài làm
          </button>
          <button onClick={() => navigate("/exams")}>
            Rời phòng · giữ bài
          </button>
        </aside>
      </div>
      <dialog ref={dialog} onCancel={() => setConfirm(false)}>
        <h2>Nộp bài luyện?</h2>
        <p>
          Còn {results.unanswered} câu chưa trả lời, {draft.flags.length} câu
          được đánh dấu.
        </p>
        <p>Sau khi nộp, bạn có thể xem lại nhưng không sửa lượt này.</p>
        <div className="actions">
          <button onClick={() => setConfirm(false)}>Tiếp tục làm</button>
          <button className="primary" onClick={submit}>
            Xác nhận nộp bài
          </button>
        </div>
      </dialog>
    </section>
  );
}
function AnswerInput({
  q,
  value,
  disabled,
  onChange,
}: {
  q: ExamItem;
  value: string;
  disabled: boolean;
  onChange: (v: string) => void;
}) {
  // Derive used tokens from the persisted answer; switching questions must never reset
  // the token bank and let the same token be appended again accidentally.
  const selected: number[] = [];
  if (q.tokens?.length) {
    let remaining = value;
    while (remaining) {
      const tokenIndex = q.tokens.findIndex(
        (token, i) => !selected.includes(i) && remaining.startsWith(token),
      );
      if (tokenIndex < 0) break;
      selected.push(tokenIndex);
      remaining = remaining.slice(q.tokens[tokenIndex].length);
    }
  }
  return q.kind === "choice" ? (
    <fieldset className="exam-choices" disabled={disabled}>
      <legend>Chọn một đáp án</legend>
      {q.options?.map((o, i) => (
        <label key={o.id}>
          <input
            type="radio"
            name={q.id}
            value={o.id}
            checked={value === o.id}
            onChange={() => onChange(o.id)}
          />
          <span className="option-letter">{String.fromCharCode(65 + i)}</span>
          <span>{o.text}</span>
        </label>
      ))}
    </fieldset>
  ) : (
    <div className="exam-writing">
      {q.tokens && q.tokens.length > 0 && (
        <>
          <p>Chọn cụm từ để sắp xếp, hoặc gõ trực tiếp.</p>
          <div className="exam-tokens">
            {q.tokens.map((token, i) => (
              <button
                key={i}
                disabled={disabled || selected.includes(i)}
                onClick={() => {
                  onChange(value + token);
                }}
              >
                {token}
              </button>
            ))}
            <button
              disabled={disabled}
              onClick={() => {
                onChange("");
              }}
            >
              Xếp lại
            </button>
          </div>
        </>
      )}
      <label>
        Câu trả lời của bạn
        <textarea
          lang="zh-CN"
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Nhập câu tiếng Trung…"
        />
      </label>
    </div>
  );
}
