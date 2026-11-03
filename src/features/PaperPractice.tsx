import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import papers from "../data/papers.json";
import { PageTitle, Source } from "../components/Common";
type Notes = {
  answers: Record<string, string>;
  flags: number[];
  submitted: boolean;
};
const fresh = (): Notes => ({ answers: {}, flags: [], submitted: false });
export default function PaperPractice() {
  const [params, setParams] = useSearchParams();
  const paper = papers.find((p) => p.id === params.get("id")) || papers[0];
  const page = Math.min(
    paper.pages,
    Math.max(1, Number(params.get("page") || 1)),
  );
  const [notes, setNotes] = useState<Notes>(fresh);
  const [status, setStatus] = useState("");
  const [confirm, setConfirm] = useState(false);
  const key = "chn113-paper-" + paper.id;
  useEffect(() => {
    try {
      const n = JSON.parse(localStorage.getItem(key) || "null");
      setNotes(n && n.answers && Array.isArray(n.flags) ? n : fresh());
    } catch {
      setNotes(fresh());
    }
    setConfirm(false);
    setStatus("");
  }, [key]);
  function save(n: Notes) {
    setNotes(n);
    try {
      localStorage.setItem(key, JSON.stringify(n));
      setStatus("Đã lưu trên thiết bị.");
    } catch {
      setStatus("Không lưu được. Hãy xuất bài làm trước khi đóng trang.");
    }
  }
  function go(n: number) {
    setParams({ id: paper.id, page: String(n) });
  }
  function exportAnswers() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify({ source: paper.name, ...notes }, null, 2)], {
        type: "application/json",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = paper.name.replace(".pdf", "-bai-lam.json");
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <>
      <PageTitle
        title="Luyện với trang đề gốc"
        description="Giữ nguyên hình và nội dung tài liệu. Ghi bài làm theo từng trang, đánh dấu để kiểm tra lại."
      />
      <div className="toolbar">
        <label className="filter grow">
          Chọn tài liệu
          <select
            value={paper.id}
            onChange={(e) => setParams({ id: e.target.value, page: "1" })}
          >
            {papers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className="filter">
          Trang
          <select value={page} onChange={(e) => go(Number(e.target.value))}>
            {Array.from({ length: paper.pages }, (_, i) => (
              <option key={i} value={i + 1}>
                {i + 1} / {paper.pages}
              </option>
            ))}
          </select>
        </label>
        <button onClick={exportAnswers}>Xuất bài làm</button>
      </div>
      <div className="notice">
        Chưa có khóa đáp án được xác minh cho tài liệu này. Bài làm được lưu để
        tự đối chiếu; ứng dụng không tính điểm. Một số PDF là bản biên soạn lại
        từ đề.
      </div>
      <div className="paper-layout">
        <section className="paper-page">
          <img
            src={`/chn113-study/learning-assets/papers/${paper.id}/${page}.webp`}
            alt={`${paper.name}, trang ${page}`}
            width={1600}
          />
          <Source source={{ ...paper.source, page }} />
          <div className="row between actions">
            <button disabled={page === 1} onClick={() => go(page - 1)}>
              Trang trước
            </button>
            <button
              disabled={page === paper.pages}
              onClick={() => go(page + 1)}
            >
              Trang sau
            </button>
          </div>
        </section>
        <aside className="panel">
          <h2>{notes.submitted ? "Bài làm đã lưu" : "Bài làm của bạn"}</h2>
          <p className="muted small">
            {Object.values(notes.answers).filter((s) => s.trim()).length} /{" "}
            {paper.pages} trang có ghi chú
          </p>
          <label className="answer-label">
            Đáp án / ghi chú trang {page}
            <textarea
              rows={7}
              disabled={notes.submitted}
              value={notes.answers[page] || ""}
              onChange={(e) =>
                save({
                  ...notes,
                  answers: { ...notes.answers, [page]: e.target.value },
                })
              }
              placeholder="Ghi số câu và đáp án…"
            />
          </label>
          <label className="check actions">
            <input
              type="checkbox"
              checked={notes.flags.includes(page)}
              onChange={(e) =>
                save({
                  ...notes,
                  flags: e.target.checked
                    ? [...notes.flags, page]
                    : notes.flags.filter((n) => n !== page),
                })
              }
            />
            Trang cần xem lại
          </label>
          <p className="small muted" role="status">
            {status}
          </p>
          {notes.flags.length > 0 && (
            <p className="small">
              Cần xem lại:{" "}
              {notes.flags.map((n) => (
                <button key={n} onClick={() => go(n)}>
                  {n}
                </button>
              ))}
            </p>
          )}
          {notes.submitted ? (
            <button onClick={() => save({ ...notes, submitted: false })}>
              Tiếp tục sửa bài
            </button>
          ) : confirm ? (
            <div>
              <p>Lưu kết thúc lượt làm? Bạn vẫn có thể mở lại để sửa.</p>
              <div className="row wrap">
                <button
                  className="primary"
                  onClick={() => {
                    save({ ...notes, submitted: true });
                    setConfirm(false);
                  }}
                >
                  Xác nhận lưu bài
                </button>
                <button onClick={() => setConfirm(false)}>Quay lại</button>
              </div>
            </div>
          ) : (
            <button className="primary" onClick={() => setConfirm(true)}>
              Kết thúc lượt làm
            </button>
          )}
        </aside>
      </div>
    </>
  );
}
