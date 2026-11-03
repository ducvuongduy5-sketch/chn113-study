import {sourceUrl} from "../lib/sourceLinks";
import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { audios, speaking, sources } from "../data";
import { PageTitle, Source, Speak, Empty } from "../components/Common";
import type { AudioAsset, SourceFile } from "../types";
import { speakingFollowups } from '../data/speaking-followups';
export function AudioPlayer({ asset }: { asset: AudioAsset }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [speed, setSpeed] = useState(1);
  const [error, setError] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  return (
    <div className="audio-player">
      <h2>{asset.name}</h2>
      <p className="muted">{asset.group}</p>
      <span className="badge">
        Bản thu gốc ·{" "}
        {asset.lesson
          ? `bài ${asset.lesson} theo tên tệp`
          : "chưa ghép với câu hỏi"}
      </span>
      {error ? (
        <div role="alert" className="notice">
          Không tải được âm thanh. Tệp có thể đã được di chuyển.
          <button
            onClick={() => {
              setError(false);
              setTimeout(() => audio.current?.load(), 0);
            }}
          >
            Thử lại
          </button>
        </div>
      ) : (
        <audio
          ref={audio}
          controls
          preload="metadata"
          src={asset.url}
          onError={() => setError(true)}
          onLoadedMetadata={() => {
            if (audio.current) audio.current.playbackRate = speed;
          }}
          onTimeUpdate={() => setElapsed(audio.current?.currentTime || 0)}
          aria-label={`Phát ${asset.group} ${asset.name}`}
        />
      )}
      <div className="row wrap">
        <button
          disabled={error}
          onClick={() => {
            if (audio.current) {
              audio.current.currentTime = 0;
              void audio.current.play().catch(() => setError(true));
            }
          }}
        >
          Nghe lại từ đầu
        </button>
        <label className="filter">
          Tốc độ
          <select
            value={speed}
            onChange={(e) => {
              const n = Number(e.target.value);
              setSpeed(n);
              if (audio.current) audio.current.playbackRate = n;
            }}
          >
            {[0.75, 1, 1.25, 1.5].map((s) => (
              <option key={s} value={s}>
                {s}×
              </option>
            ))}
          </select>
        </label>
        <span className="muted small">
          {Math.floor(elapsed)} / {Math.round(asset.duration)} giây
        </span>
      </div>
    </div>
  );
}
export function Listening() {
  const [params] = useSearchParams();
  const [group, setGroup] = useState(
    params.has("lesson") ? "lesson-" + params.get("lesson") : "lesson-8",
  );
  const pool = audios.filter(
    (a) =>
      group === "all" ||
      (group.startsWith("lesson-")
        ? a.lesson === Number(group.slice(7))
        : a.group === group),
  );
  const [selected, setSelected] = useState("");
  const asset = pool.find((a) => a.id === selected) || pool[0];
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    try {
      setNote(localStorage.getItem("chn113-listening-" + asset?.id) || "");
    } catch {
      setNote("");
    }
    setSaved(false);
  }, [asset?.id]);
  return (
    <>
      <PageTitle
        title="Luyện nghe"
        description="Nghe bản thu gốc theo đúng thư mục. Không tự ghép các tệp audio1 có tên giống nhau."
      />
      <div className="toolbar">
        <label className="filter">
          Bộ âm thanh
          <select
            value={group}
            onChange={(e) => {
              setGroup(e.target.value);
              setSelected("");
            }}
          >
            <option value="all">Tất cả bản thu</option>
            {Array.from({ length: 15 }, (_, i) => (
              <option key={i} value={"lesson-" + (i + 1)}>
                Giáo trình · Bài {i + 1}
              </option>
            ))}
            {Array.from(
              new Set(audios.filter((a) => !a.lesson).map((a) => a.group)),
            ).map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>
        <span className="muted">{pool.length} bản thu</span>
      </div>
      <div className="listening-layout">
        <div className="track-list" aria-label="Danh sách bài nghe">
          {pool.map((a, i) => (
            <button
              key={a.id}
              className={a.id === asset?.id ? "active" : ""}
              onClick={() => setSelected(a.id)}
            >
              <span>{String(i + 1).padStart(2, "0")}</span>
              <div>
                <strong>{a.name}</strong>
                <small>{Math.round(a.duration)} giây</small>
              </div>
            </button>
          ))}
        </div>
        {asset ? (
          <section className="panel">
            <AudioPlayer key={asset.id} asset={asset} />
            <div className="notice">
              {asset.lesson
                ? "Bài được nhận diện theo số trong tên tệp giáo trình. Chưa xác minh tệp này ứng với đoạn hội thoại hoặc câu hỏi nào."
                : "Chưa xác minh được quan hệ giữa bản thu này và đề/câu hỏi. Bạn có thể nghe độc lập và ghi câu trả lời, nhưng chưa có chấm điểm nghe tự động."}
            </div>
            <label className="answer-label">
              Ghi lại điều bạn nghe hoặc đáp án theo số câu
              <textarea
                rows={5}
                value={note}
                onChange={(e) => {
                  setNote(e.target.value);
                  setSaved(false);
                }}
                placeholder="Ví dụ: câu 1 — …; từ nghe chưa rõ — …"
              />
            </label>
            <div className="row actions">
              <button
                onClick={() => {
                  try {
                    localStorage.setItem("chn113-listening-" + asset.id, note);
                    setSaved(true);
                  } catch {
                    setSaved(false);
                  }
                }}
              >
                Lưu ghi chú
              </button>
              {saved && <span role="status">Đã lưu trên thiết bị.</span>}
            </div>
            <Source source={asset.source} />
          </section>
        ) : (
          <Empty>Không có bản thu trong nhóm này.</Empty>
        )}
      </div>
    </>
  );
}
export function Speaking() {
  const [promptIndex, setPromptIndex] = useState(0);
  const prompt = speaking[promptIndex];
  const [show, setShow] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordUrl, setRecordUrl] = useState("");
  const [error, setError] = useState("");
  const [requesting, setRequesting] = useState(false);
  const alive = useRef(true);
  const followup = speakingFollowups[prompt.id];
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const urlRef = useRef("");
  useEffect(
    () => {alive.current=true;return () => {
      alive.current=false;
      if (recorder.current?.state === "recording") recorder.current.stop();
      stream.current?.getTracks().forEach((t) => t.stop());
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    }},
    [],
  );
  async function start() {
    if(requesting||recording)return;
    setRequesting(true);
    try {
      if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder)
        throw new Error("Trình duyệt này không hỗ trợ ghi âm.");
      stream.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      if(!alive.current){stream.current.getTracks().forEach(t=>t.stop());return;}
      const r = new MediaRecorder(stream.current);
      const parts: BlobPart[] = [];
      r.ondataavailable = (e) => parts.push(e.data);
      r.onstop = () => {
        if(!alive.current){stream.current?.getTracks().forEach(t=>t.stop());return;}
        if (urlRef.current) URL.revokeObjectURL(urlRef.current);
        const u = URL.createObjectURL(new Blob(parts, { type: r.mimeType }));
        urlRef.current = u;
        setRecordUrl(u);
        setRecording(false);
        stream.current?.getTracks().forEach((t) => t.stop());
      };
      r.onerror = () => {
        setError("Không ghi được âm thanh. Hãy thử lại.");
        stream.current?.getTracks().forEach((t) => t.stop());
        setRecording(false);
      };
      r.start();
      recorder.current = r;
      setRecording(true);
      setError("");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Không thể truy cập micro. Kiểm tra quyền micro.",
      );
    } finally {if(alive.current)setRequesting(false);}
  }
  return (
    <>
      <PageTitle
        title="Luyện nói theo tranh"
        description="Quan sát tranh, nói ít nhất ba câu, rồi tự nghe lại bản ghi của mình."
      />
      <div className="panel row wrap"><button onClick={()=>{setPromptIndex(speaking.findIndex(s=>s.id.startsWith('hoa-picture-')));setShow(false)}} disabled={recording||requesting}>Ôn tập tranh mới · 18 tranh</button><Link className="button primary" to="/speaking/hoa">Dịch Việt–Trung & hỏi đáp · tài liệu 26</Link></div>
      <div className="toolbar">
        <label className="filter grow">
          Chọn tranh luyện nói
          <select
            disabled={recording||requesting}
            value={promptIndex}
            onChange={(e) => {
              setPromptIndex(Number(e.target.value));
              setShow(false);
            }}
          >
            {speaking.map((s, i) => (
              <option key={s.id} value={i}>
                {i + 1}. {s.title}
              </option>
            ))}
          </select>
        </label>
        <span className="muted">{speaking.length} tranh từ tài liệu</span>
      </div>
      <div className="two-col speaking-grid">
        <section className="panel">
          <img
            className="speaking-image"
            src={prompt.image}
            alt={prompt.title + ", tranh gốc cùng từ gợi ý"}
          />
          <Source source={prompt.source} />
        </section>
        <section className="panel">
          <span className="badge">Mẫu trả lời bổ sung</span>
          <h2>{prompt.title}</h2>
          <div className="row wrap">
            {prompt.keywords.map((k) => (
              <span className="word-chip" key={k} lang="zh-CN">
                {k}
              </span>
            ))}
          </div>
          <p>
            Thử nói trước khi mở gợi ý. Mẫu dưới đây là bài luyện bổ sung; tên,
            tuổi và chi tiết không có trong tranh là tình huống minh họa. Một
            vài mẫu có từ mở rộng ngoài HSK 1.
          </p>
          <button onClick={() => setShow((v) => !v)}>
            {show ? "Ẩn bài nói mẫu" : "Xem bài nói mẫu"}
          </button>
          {show && (
            <div className="sample-speech">
              {prompt.sentences.map(([hanzi, py, vi]) => (
                <div key={hanzi}>
                  <p className="hanzi" lang="zh-CN">
                    {hanzi}
                    <Speak text={hanzi} />
                  </p>
                  <p className="pinyin">{py}</p>
                  <p>{vi}</p>
                </div>
              ))}
              <h3>Câu hỏi luyện thêm</h3>
              <p className="muted small">Hỏi đáp bổ sung theo chủ đề; câu trả lời minh họa, không phải đáp án chính thức. Có từ mở rộng như 身体, 口, 只.</p>
              {followup&&<div className="teacher-followup"><p className="hanzi" lang="zh-CN">{followup.question}<Speak text={followup.question}/></p><p className="pinyin">{followup.pinyin}</p><p>{followup.meaning}</p><details><summary>Xem câu trả lời gợi ý</summary><p className="hanzi" lang="zh-CN">{followup.answer}<Speak text={followup.answer}/></p><p className="pinyin">{followup.answerPinyin}</p><p>{followup.answerMeaning}</p></details></div>}
              <div className="teacher-followup"><p className="hanzi" lang="zh-CN">你能再说一句吗？<Speak text="你能再说一句吗？"/></p><p className="pinyin">Nǐ néng zài shuō yí jù ma?</p><p>Bạn có thể nói thêm một câu không?</p><details><summary>Gợi ý nói tiếp</summary><p>Thêm một câu về sở thích, thời gian hoặc địa điểm phù hợp với tranh. Có thể dùng câu mẫu sau:</p><p lang="zh-CN">{prompt.sentences[2][0]}</p><p className="pinyin">{prompt.sentences[2][1]}</p><p>{prompt.sentences[2][2]}</p></details></div>
            </div>
          )}
        </section>
      </div>
      <section className="panel">
        <h2>Ghi âm và tự đánh giá</h2>
        <p>
          Bản ghi chỉ ở trong phiên hiện tại. Tải xuống nếu muốn giữ. Công cụ
          không chấm phát âm hay thay thế bài thi nói.
        </p>
        <div className="row wrap">
          <button
            className={recording ? "danger" : "primary"}
            disabled={requesting}
            onClick={() =>
              recording ? recorder.current?.stop() : void start()
            }
          >
            {requesting ? 'Đang mở micro…' : recording ? "Dừng ghi âm" : "Bắt đầu ghi âm"}
          </button>
          {recording && <span role="status">Đang ghi âm…</span>}
          {recordUrl && (
            <>
              <audio controls src={recordUrl} aria-label="Bản ghi của bạn" />
              <a
                className="button"
                href={recordUrl}
                download="chn113-luyen-noi.webm"
              >
                Tải bản ghi
              </a>
              <button disabled={recording} onClick={()=>{URL.revokeObjectURL(urlRef.current);urlRef.current='';setRecordUrl('')}}>Xóa bản ghi</button>
            </>
          )}
        </div>
        {error && (
          <p role="alert" className="notice">
            {error}
          </p>
        )}
        <div className="self-check">
          {[
            "Tôi đã nói ít nhất ba câu liên quan với nhau.",
            "Tôi dùng đúng từ gợi ý và thông tin trong tranh.",
            "Tôi đọc đủ âm tiết và kiểm tra các thanh dễ nhầm.",
          ].map((t) => (
            <label className="check" key={t}>
              <input type="checkbox" />
              {t}
            </label>
          ))}
        </div>
      </section>
    </>
  );
}
function Extracted({ file }: { file: SourceFile }) {
  const [rows, setRows] = useState<
    { page?: number; slide?: number; text: string }[]
  >([]);
  const [state, setState] = useState("loading");
  useEffect(() => {
    let active = true;
    setState("loading");
    fetch("/extraction/" + file.id)
      .then((r) => {
        if (!r.ok) throw Error();
        return r.json();
      })
      .then((r) => {
        if (active) {
          setRows(r);
          setState("ready");
        }
      })
      .catch(() => {
        if (active) setState("error");
      });
    return () => {
      active = false;
    };
  }, [file.id]);
  return (
    <section className="panel">
      <h2>{file.name}</h2>
      <p className="notice">
        Văn bản trích xuất/OCR để tra cứu, chưa được xác minh toàn bộ. Đối chiếu
        trang gốc trước khi dùng làm đáp án.
      </p>
      {state === "loading" ? (
        <p role="status">Đang tải văn bản…</p>
      ) : state === "error" ? (
        <p role="alert">Chưa có bản trích xuất. Hãy mở tệp gốc.</p>
      ) : (
        rows.map((r, i) => (
          <details key={i}>
            <summary>
              {r.page ? "Trang " + r.page : "Slide " + r.slide}
              {!r.text.trim() ? " · không trích được chữ" : ""}
            </summary>
            <pre className="extraction">
              {r.text || "Trang ảnh quét. Mở PDF gốc để xem nội dung."}
            </pre>
          </details>
        ))
      )}
    </section>
  );
}
export function Sources() {
  const [limit, setLimit] = useState(50);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [selected, setSelected] = useState<SourceFile | null>(null);
  const filtered = sources.filter(
    (s) =>
      (type === "all" || s.extension === type) &&
      (s.name + " " + s.relativePath)
        .toLocaleLowerCase()
        .includes(query.toLocaleLowerCase()),
  );
  return (
    <>
      <PageTitle
        title="Tài liệu & nguồn"
        description="Tra cứu nguồn của bài học. Bản web cung cấp bài luyện, ảnh và audio; PDF và slide gốc được lưu riêng."
      />
      <div className="toolbar">
        <label className="filter grow">
          Tìm tài liệu
          <input
            type="search"
            placeholder="Tên đề, bài học, session…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label className="filter">
          Loại tệp
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="all">Tất cả</option>
            {[".pdf", ".pptx", ".mp3", ".jpg", ".html"].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
      </div>
      <p className="muted small">
        {filtered.length} tệp · Không có khóa đáp án độc lập được giả định từ
        tên tệp.
      </p>
      {selected && (
        <>
          <button onClick={() => setSelected(null)}>
            Đóng văn bản trích xuất
          </button>
          <Extracted file={selected} />
        </>
      )}
      <div className="source-list">
        {filtered.slice(0, limit).map((s, i) => (
          <article key={s.id + i} className="source-row">
            <span className="file-type">{s.extension.slice(1)}</span>
            <div>
              <strong>{s.name}</strong>
              <p className="muted small">
                {s.pages
                  ? `${s.pages} trang · `
                  : s.slides
                    ? `${s.slides} slide · `
                    : ""}
                {(s.size / 1024 / 1024).toFixed(1)} MB
                {s.duplicateOf ? " · Bản trùng SHA256" : ""}
              </p>
              <small className="muted path">{s.relativePath}</small>
            </div>
            <div className="row wrap">
              {sourceUrl(s.id) ? <a className="button" href={sourceUrl(s.id)!} target="_blank" rel="noreferrer">Mở gốc</a> : <span className="muted small">Đã trích xuất, không kèm bản gốc</span>}
              {[".pdf", ".pptx"].includes(s.extension) && (
                __PUBLIC_BUILD__ ? <Link className="button" to={s.extension === '.pptx' ? '/lessons' : '/papers'}>Mở nội dung học</Link> : <button onClick={() => setSelected(s)}>Đọc chữ</button>
              )}
            </div>
          </article>
        ))}
      </div>
      {filtered.length > limit && (
        <button className="full" onClick={() => setLimit((n) => n + 50)}>
          Hiển thị thêm tài liệu ({limit}/{filtered.length})
        </button>
      )}
    </>
  );
}
