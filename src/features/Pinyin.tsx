import { useRef, useState, useEffect } from "react";
import { PageTitle } from "../components/Common";
import {
  checkPinyin,
  normalizePinyin,
  accentedPinyin,
  canSubmit,
  type PinyinMode,
} from "../lib/pinyin";
import { useStudy } from "../hooks/useStudy";
import { unresolvedMistakes } from "../lib/study";
import type { PinyinRule, Question } from "../types";
const rules: PinyinRule[] = [
  {
    title: "Pinyin chuẩn và phím gõ IME là hai việc khác nhau",
    body: "Pinyin ghi cách đọc bằng chữ Latin và dấu thanh. IME nhận phím để chọn chữ Hán. Khi viết bài phiên âm, phải dùng Pinyin chuẩn; khi đề yêu cầu chữ Hán, gõ âm rồi chọn đúng chữ. Chuỗi phím không thay thế đáp án chữ Hán.",
    example: "女儿 → Pinyin: nǚ’ér · IME tương thích: nver → chọn 女儿",
  },
  {
    title: "ü, v và u: — dùng đúng chế độ",
    body: "ü có hai chấm và là nguyên âm khác u. Nhiều IME dùng v cho ü; chế độ số thanh thường chấp nhận u:. Đây là quy ước nhập liệu, không phải cách viết Pinyin chính thức.",
    example: "女 nǚ = nv3 = nu:3 trong chế độ số · nǔ là âm khác",
  },
  {
    title: "Sau j, q, x và y: bỏ hai chấm",
    body: "Khi ü kết hợp với j, q, x, hai chấm không viết ra. Nhóm âm ü không có phụ âm đầu dùng y và cũng bỏ hai chấm. Sau n và l vẫn giữ hai chấm để phân biệt.",
    example: "jū, qù, xué, yǔ · nhưng nǚ, lǜ",
  },
  {
    title: "Không đánh đồng u và ü",
    body: "Giữ hai chấm trong nǚ và lǜ. Khi luyện, so sánh từng cặp, đọc và nhìn chữ để tránh chọn nhầm ứng viên.",
    example: "路 lù (đường) ≠ 绿 lǜ (xanh) · 努 nǔ ≠ 女 nǚ",
  },
  {
    title: "Dấu phân cách âm tiết",
    body: "Dùng dấu nháy trước âm tiết bắt đầu bằng a, o, e khi cần làm rõ ranh giới trong một từ. Dấu nháy không biểu thị thanh điệu. Bộ luyện chấp nhận dấu nháy thẳng hoặc cong.",
    example:
      "西安 Xī’ān = xi1 an1 · 女儿 nǚ’ér = nü3 er2 · xiān là một âm tiết khác",
  },
  {
    title: "Đặt dấu thanh ở đâu?",
    body: "Ưu tiên a, rồi e. Với ou, đặt dấu trên o. Nếu không thuộc các trường hợp đó, đặt lên nguyên âm cuối; vì vậy iu và ui đặt dấu ở chữ cuối. Dấu thay chấm trên i.",
    example: "hǎo · xué · dōu · liù · guì",
  },
  {
    title: "Bốn thanh và thanh nhẹ",
    body: "Thanh 1 cao ngang; thanh 2 đi lên; thanh 3 hạ rồi nâng trong dạng đọc riêng; thanh 4 đi xuống. Thanh nhẹ không có dấu, thường ngắn và nhẹ. Trong bài luyện số, thanh nhẹ dùng 5, 0 hoặc không ghi.",
    example: "mā · má · mǎ · mà · ma = ma5 = ma0",
  },
  {
    title: "Các dạng rút gọn iu, ui, un",
    body: "Khi đứng sau phụ âm đầu, iou → iu, uei → ui, uen → un. Đừng khôi phục nguyên âm đã rút gọn khi viết từ thông thường. un sau j/q/x thuộc nhóm ün, cần đọc theo đúng âm.",
    example: "liú (không viết lióu) · shuǐ (không viết shuěi) · lùn",
  },
  {
    title: "z/c/s và zh/ch/sh",
    body: "Có hoặc không có h làm thay đổi âm tiết. Đừng tự thêm h theo thói quen. Luyện nhìn mặt chữ và nhập đúng cả âm, rồi mới chọn chữ.",
    example: "四 sì ≠ 是 shì · 字 zì ≠ 只 zhǐ",
  },
  {
    title: "n/l và các âm bật hơi",
    body: "n/l dễ lẫn với người học Việt. p/t/k và b/d/g khác nhau về bật hơi trong tiếng Phổ thông, không trùng hoàn toàn cách phân biệt tiếng Việt.",
    example: "你 nǐ · 李 Lǐ · 八 bā · 怕 pà",
  },
  {
    title: "-n và -ng; in và ing",
    body: "Giữ đủ phụ âm cuối. Nếu gõ thiếu g, IME có thể đưa ra một chữ hoàn toàn khác. Gõ chậm một lần chính xác trước khi tăng tốc.",
    example: "今年 jīnnián · 北京 Běijīng · 很 hěn · 冷 lěng",
  },
  {
    title: "Chia âm tiết để sửa lỗi",
    body: "Khi từ dài bị sai, tách từng âm tiết, kiểm tra phụ âm đầu, vần, rồi thanh. Chế độ số của bài luyện cho phép khoảng trắng hoặc dấu nháy giữa các âm tiết.",
    example: "shāngdiàn → shang1 dian4 · péngyou → peng2 you5",
  },
  {
    title: "Khoảng cách và dấu câu",
    body: "Pinyin chuẩn thường viết liền các âm tiết trong cùng từ, tách giữa các từ. Tên riêng viết hoa đầu tên. Bài luyện chuẩn hóa hoa/thường nhưng không dùng điều đó để dạy bỏ quy tắc tên riêng.",
    example: "Wǒ xuéxí Hànyǔ. · Xī’ān · Běijīng",
  },
  {
    title: "Chọn ứng viên đúng trong IME",
    body: "Gõ một cụm thường cho kết quả sát hơn gõ từng âm riêng. Vẫn phải đọc lại chữ được chọn: âm đúng chưa chắc chữ đúng. Phím chọn, phím v và xử lý dấu nháy có thể khác theo IME.",
    example: "shi → 是 / 时 / 十 / 事… · kiểm tra chữ phù hợp câu",
  },
  {
    title: "Thanh từ điển và biến điệu",
    body: "Khi nói, thanh 3 trước thanh 3 thay đổi cách đọc; 不 và 一 cũng có biến điệu theo âm sau. Không tự đổi mọi dấu từ điển khi làm bài. Bài luyện dùng đúng dạng đang hiển thị.",
    example: "你好 thường ghi nǐ hǎo; phát âm có biến điệu · 不客气 bú kèqi",
  },
  {
    title: "Tự kiểm tra trước khi nộp bài",
    body: "Đọc lại chữ Hán, ranh giới âm tiết, ü/u và vị trí dấu. Các ví dụ lỗi ở đây là hướng dẫn bổ sung, không phải thống kê lỗi của sinh viên hay trích dẫn đề thi đã xác minh.",
    example: "Sai: nǔ’ér, lǜe, líu · Đúng: nǚ’ér, lüè, liú",
  },
];
const drills = [
  {
    word: "女儿",
    pinyin: "nǚ'ér",
    hint: "Giữ ü; âm ér thanh 2. Có thể nhập nv3 er2 trong chế độ số.",
  },
  {
    word: "女",
    pinyin: "nǚ",
    hint: "n + ü + thanh 3; u và ü không tương đương.",
  },
  { word: "绿", pinyin: "lǜ", hint: "Giữ hai chấm sau l; thanh 4." },
  { word: "略", pinyin: "lüè", hint: "Trong üe, dấu thanh đặt lên e." },
  {
    word: "西安",
    pinyin: "Xī'ān",
    hint: "Hai âm tiết xi1 an1, không phải xian1.",
  },
  {
    word: "妈妈",
    pinyin: "māma",
    hint: "Âm đầu thanh 1, âm thứ hai thanh nhẹ.",
  },
  { word: "水", pinyin: "shuǐ", hint: "ui đặt dấu trên i." },
  { word: "六", pinyin: "liù", hint: "iu đặt dấu trên u." },
  { word: "学习", pinyin: "xuéxí", hint: "Sau x, ü bỏ hai chấm: xue2 xi2." },
  { word: "朋友", pinyin: "péngyou", hint: "you thanh nhẹ, có thể dùng you5." },
];
export default function Pinyin() {
  const [tab, setTab] = useState("practice");
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState<PinyinMode>("numbered");
  const [task, setTask] = useState("type");
  const [input, setInput] = useState("");
  const [result, setResult] = useState<boolean | null>(null);
  const [start, setStart] = useState<number | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [converter, setConverter] = useState("nv3 er2");
  const composing = useRef(false);
  const { record, progress } = useStudy();
  const drill = drills[index % drills.length];
  const attempts = progress.attempts.filter((a) => a.skill === "pinyin");
  const missedDrills = unresolvedMistakes(attempts);
  useEffect(() => {
    if (start === null || result !== null) return;
    const t = setInterval(() => setSeconds((Date.now() - start) / 1000), 250);
    return () => clearInterval(t);
  }, [start, result]);
  function next() {
    setIndex((i) => i + 1);
    setInput("");
    setResult(null);
    setStart(null);
    setSeconds(0);
  }
  function submit() {
    if (!canSubmit(composing.current) || !input.trim() || result !== null)
      return;
    const ok = checkPinyin(input, drill.pinyin, mode);
    setResult(ok);
    const q: Question = {
      id: "pinyin-" + (index % drills.length) + "-" + mode,
      lesson: 0,
      type: "text",
      skill: "pinyin",
      prompt: `${drill.word} — gõ Pinyin (${mode})`,
      options: [],
      answer: drill.pinyin,
      alternatives: [normalizePinyin(drill.pinyin)],
      explanation: drill.hint,
      source: { id: "", filename: "Hướng dẫn bổ sung" },
      status: "supplemental_practice",
      answerStatus: "verified",
      category: "practice",
    };
    record(q, input, ok);
  }
  return (
    <>
      <PageTitle
        title="Lỗi thường gặp khi viết và gõ Pinyin"
        description="Viết đúng phiên âm, hiểu cách gõ chữ Hán và luyện đến khi không còn nhầm."
      />
      <div className="tabs">
        <button
          className={tab === "practice" ? "active" : ""}
          onClick={() => setTab("practice")}
        >
          Luyện gõ
        </button>
        <button
          className={tab === "guide" ? "active" : ""}
          onClick={() => setTab("guide")}
        >
          16 điều cần nhớ
        </button>
        <button
          className={tab === "convert" ? "active" : ""}
          onClick={() => setTab("convert")}
        >
          Đổi dấu thanh
        </button>
      </div>
      {tab === "guide" ? (
        <div className="grammar-list">
          {rules.map((r, i) => (
            <article className="panel" key={r.title}>
              <span className="muted small">{i + 1} / 16</span>
              <h2>{r.title}</h2>
              <p>{r.body}</p>
              <p className="formula">{r.example}</p>
            </article>
          ))}
        </div>
      ) : tab === "convert" ? (
        <section className="study-card">
          <h2>Số thanh ↔ dấu thanh</h2>
          <label className="answer-label">
            Nhập Pinyin có dấu hoặc số
            <input
              value={converter}
              onChange={(e) => setConverter(e.target.value)}
              onCompositionStart={() => {
                composing.current = true;
              }}
              onCompositionEnd={() => {
                composing.current = false;
              }}
            />
          </label>
          <dl className="conversion">
            <dt>Có dấu</dt>
            <dd>
              {accentedPinyin(converter) === "!invalid"
                ? "Chưa nhận diện được âm tiết."
                : accentedPinyin(converter)}
            </dd>
            <dt>Số thanh</dt>
            <dd>
              {normalizePinyin(converter) === "!invalid"
                ? "Kiểm tra lại cách viết."
                : normalizePinyin(converter)}
            </dd>
          </dl>
          <p className="muted">
            Công cụ hiển thị tách âm tiết để học. Đây không phải bộ chuyển đổi
            chữ Hán hay bộ kiểm tra ngữ nghĩa.
          </p>
        </section>
      ) : (
        <>
          <div className="toolbar">
            <label className="filter">
              Chế độ nhập
              <select
                value={mode}
                onChange={(e) => {
                  setMode(e.target.value as PinyinMode);
                  setInput("");
                  setResult(null);
                  setStart(null);
                }}
              >
                <option value="numbered">Dấu hoặc số thanh</option>
                <option value="formal">Pinyin chuẩn có dấu</option>
                <option value="ime" disabled={task === "tone"}>
                  Phím IME (không dấu thanh)
                </option>
              </select>
            </label>
            <label className="filter">
              Dạng luyện
              <select
                value={task}
                onChange={(e) => {
                  setTask(e.target.value);
                  if (e.target.value === "tone") setMode("numbered");
                  setResult(null);
                  setInput("");
                  setStart(null);
                }}
              >
                <option value="type">Gõ theo từ</option>
                <option value="fix">Sửa cách viết sai</option>
                <option value="tone">Chọn thanh đúng</option>
                <option value="speed">Gõ tính thời gian</option>
              </select>
            </label>
          </div>
          <div className="pinyin-workspace">
            <section className="study-card">
              <div className="row between">
                <span className="badge">
                  Bài luyện bổ sung · {(index % drills.length) + 1}/
                  {drills.length}
                </span>
                <span className="muted">
                  {task === "speed" ? seconds.toFixed(1) + " giây" : ""}
                </span>
              </div>
              <h2 className="drill-hanzi" lang="zh-CN">
                {drill.word}
              </h2>
              <p className="drill-pinyin">{drill.pinyin}</p>
              {task === "fix" && (
                <p>
                  Sửa lỗi:{" "}
                  <s>
                    {accentedPinyin(
                      normalizePinyin(drill.pinyin).replace(/[1-5]/, (n) =>
                        String((Number(n) % 5) + 1),
                      ),
                    ).replace("ǐ", "í")}
                  </s>
                </p>
              )}
              <p className="muted">
                {mode === "ime"
                  ? "Dùng v thay ü trong bài này, không gõ số thanh. IME thực tế có thể khác."
                  : mode === "formal"
                    ? "Dùng dấu thanh đúng vị trí. Không dùng v hoặc số."
                    : "Chấp nhận Pinyin có dấu hoặc số: ví dụ nv3 er2."}
              </p>
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
                  submit();
                }}
              >
                {task === "tone" ? (
                  <div className="row wrap">
                    {["mā", "má", "mǎ", "mà", "ma"].map((_, i) => {
                      const base = normalizePinyin(drill.pinyin).replace(
                        /[1-5]/,
                        String(i + 1),
                      );
                      const option = accentedPinyin(base);
                      return (
                        <button
                          type="button"
                          key={i}
                          className={input === option ? "selected" : ""}
                          onClick={() => setInput(option)}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <label className="answer-label">
                    Câu trả lời
                    <input
                      aria-label="Gõ Pinyin"
                      autoComplete="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      value={input}
                      disabled={result !== null}
                      onChange={(e) => {
                        if (start === null) setStart(Date.now());
                        setInput(e.target.value);
                      }}
                    />
                  </label>
                )}
                <div className="row actions">
                  <button
                    className="primary"
                    disabled={!input.trim() || result !== null}
                  >
                    Kiểm tra Pinyin
                  </button>
                  <button type="button" onClick={next}>
                    Từ tiếp theo
                  </button>
                </div>
              </form>
              {result !== null && (
                <div
                  role="status"
                  className={"feedback " + (result ? "correct" : "incorrect")}
                >
                  <strong>
                    {result ? "Chính xác." : "Kiểm tra lại âm và dấu thanh."}
                  </strong>
                  <p>{drill.hint}</p>
                  {task === "speed" && result && (
                    <p>
                      {Math.round((input.length / Math.max(seconds, 1)) * 60)}{" "}
                      ký tự/phút · {seconds.toFixed(1)} giây cho lượt này.
                    </p>
                  )}
                </div>
              )}
            </section>
            <aside className="panel">
              <h2>Nhớ trước khi gõ</h2>
              <div className="rule-pair">
                <strong>nǚ</strong>
                <span>Phiên âm chuẩn</span>
              </div>
              <div className="rule-pair">
                <strong>nv3</strong>
                <span>Biểu diễn số thanh</span>
              </div>
              <div className="rule-pair">
                <strong>nv</strong>
                <span>Phím IME tương thích</span>
              </div>
              <p className="muted">
                Ứng dụng chờ kết thúc bộ gõ IME trước khi chấm đáp án.
              </p>
              <hr />
              <p>
                {attempts.length} lượt luyện ·{" "}
                {attempts.length
                  ? Math.round(
                      (attempts.filter((a) => a.correct).length /
                        attempts.length) *
                        100,
                    ) + "% đúng"
                  : "chưa có kết quả"}
              </p>
              <button
                onClick={() => {
                  const missed = missedDrills.at(-1);
                  if (missed) {
                    setIndex(Number(missed.questionId.split("-")[1]));
                    setInput("");
                    setResult(null);
                    setStart(null);
                  }
                }}
                disabled={!missedDrills.length}
              >
                Luyện lại từ từng sai
              </button>
            </aside>
          </div>
        </>
      )}
    </>
  );
}
