import StudyCompass, {SourceMistakes} from '../components/StudyCompass';
import { useEffect, useState } from "react";
import { Link, useSearchParams, useParams } from "react-router-dom";
import { ArrowRight, BookOpen, Check, RotateCcw } from "lucide-react";
import {
  lessons,
  vocabulary,
  questions,
  grammar,
  vocabQuestion,
} from "../data";
import { useStudy } from "../hooks/useStudy";
import { useLearning } from "../hooks/useLearning";
import ResumePractice from '../components/ResumePractice';
import { CenterLinks, LearningOverview, VocabularyMistakes } from './vocabulary/LearningOverview';
import { Matching } from "../components/PracticeInteractions";
import { unresolvedMistakes, shuffle } from "../lib/study";
import {
  PageTitle,
  LessonFilter,
  Source,
  Speak,
  PracticeCard,
  StudyLinks,
  Empty,
} from "../components/Common";
export function Dashboard() {
  const { progress } = useStudy();
  const wrong = unresolvedMistakes(progress.attempts);
  const recent = progress.recentLessons[0] || 8;
  const total = progress.attempts.length;
  const right = progress.attempts.filter((a) => a.correct).length;
  return (
    <>
      <PageTitle
        title="Một nét chữ, thêm một bước tiến."
        description="Học có lộ trình, luyện bằng dữ liệu thật và kiểm tra đúng chỗ cần ôn."
      />
      <StudyCompass/><div className="dashboard-main">
        <section className="focus-panel">
          <div>
            <span className="badge light">Trọng tâm · Bài 8–13</span>
            <h2>Sẵn sàng cho Quiz 2</h2>
            <p>
              Ôn từ vựng, nắm cấu trúc câu, rồi thử sức với bài luyện từ tài
              liệu trên lớp.
            </p>
            <div className="row wrap">
              <Link className="button primary" to="/quiz2">
                Vào ôn Quiz 2 <ArrowRight size={17} />
              </Link>
              <Link className="text-link" to="/final">
                Ôn thi cuối kỳ
              </Link>
            </div>
          </div>
          <div className="hanzi-study" lang="zh-CN">
            <ruby>
              学<rt>xué</rt>
            </ruby>
            <ruby>
              习<rt>xí</rt>
            </ruby>
            <span>Học mỗi ngày, nhớ từng chút.</span>
          </div>
        </section>
        <section className="resume-panel">
          <span className="muted small">
            {progress.recentLessons.length
              ? "Tiếp tục bài gần nhất"
              : "Bắt đầu từ bài 8"}
          </span>
          <h3 lang="zh-CN">{lessons[recent - 1].title}</h3>
          <p>{lessons[recent - 1].meaning}</p>
          <Link to={`/lessons/${recent}`} className="text-link">
            Mở bài {recent} <ArrowRight size={16} />
          </Link>
        </section>
      </div>
      <CenterLinks />
      <ResumePractice /><SourceMistakes />
      <LearningOverview />
      <section className="activity-strip">
        <div>
          <strong>{total}</strong>
          <span>Lượt trả lời</span>
        </div>
        <div>
          <strong>
            {total ? Math.round((right / total) * 100) + "%" : "—"}
          </strong>
          <span>Độ chính xác</span>
        </div>
        <div>
          <strong>{wrong.length}</strong>
          <span>Câu cần ôn lại</span>
        </div>
        <div>
          <strong>{progress.exams.length}</strong>
          <span>Bài luyện đã nộp</span>
        </div>
      </section>
      <div className="section-heading">
        <h2>Lộ trình Quiz 2</h2>
        <Link to="/lessons">Tất cả 15 bài</Link>
      </div>
      <div className="lesson-list">
        {lessons.slice(7, 13).map((l) => (
          <Link key={l.id} className="lesson-row" to={`/lessons/${l.id}`}>
            <span className="lesson-num">{String(l.id).padStart(2, "0")}</span>
            <div>
              <h3 lang="zh-CN">{l.title}</h3>
              <p>{l.meaning}</p>
            </div>
            <span className="muted small">
              {vocabulary.filter((v) => v.lesson === l.id).length} từ
            </span>
            <ArrowRight size={18} />
          </Link>
        ))}
      </div>
      <div className="two-col bottom-grid">
        <section className="panel">
          <h2>Ôn đúng chỗ còn vướng</h2>
          {wrong.length ? (
            <>
              <p>
                Bạn có {wrong.length} câu trả lời gần nhất chưa đúng. Làm lại để
                kiểm tra mình đã nhớ chưa.
              </p>
              <Link className="button" to="/review">
                Mở sổ lỗi
              </Link>
            </>
          ) : (
            <p>
              Chưa có câu cần ôn. Khi làm bài, những câu sai sẽ được lưu tại
              đây.
            </p>
          )}
        </section>
        <section className="panel pinyin-promo">
          <span className="pinyin-sample">nǚ ≠ nǔ</span>
          <h2>Viết đúng, gõ nhanh</h2>
          <p>
            Phân biệt Pinyin chuẩn và phím gõ IME. Luyện dấu thanh, ü và ranh
            giới âm tiết.
          </p>
          <Link className="text-link" to="/pinyin">
            Luyện gõ Pinyin <ArrowRight size={16} />
          </Link>
        </section>
      </div>
    </>
  );
}
export function LessonLibrary() {
  const [filter, set] = useState("all");
  return (
    <>
      <PageTitle
        title="Thư viện bài học"
        description="15 bài học. Từ vựng và nguồn slide được giữ cùng nhau để dễ tra cứu."
      />
      <div className="tabs" aria-label="Phạm vi">
        <button
          className={filter === "all" ? "active" : ""}
          onClick={() => set("all")}
        >
          Tất cả
        </button>
        <button
          className={filter === "q2" ? "active" : ""}
          onClick={() => set("q2")}
        >
          Quiz 2 · Bài 8–13
        </button>
        <button
          className={filter === "q1" ? "active" : ""}
          onClick={() => set("q1")}
        >
          Quiz 1 · Bài 1–7
        </button>
      </div>
      <div className="lesson-cards">
        {lessons
          .filter(
            (l) =>
              filter === "all" ||
              (filter === "q2" ? l.id >= 8 && l.id <= 13 : l.id <= 7),
          )
          .map((l) => (
            <Link className="lesson-card" key={l.id} to={`/lessons/${l.id}`}>
              <span className="muted small">
                Bài {String(l.id).padStart(2, "0")}
              </span>
              <h2 lang="zh-CN">{l.title}</h2>
              <p className="pinyin">{l.pinyin}</p>
              <p>{l.meaning}</p>
              <footer>
                {vocabulary.filter((v) => v.lesson === l.id).length} từ vựng{" "}
                <ArrowRight size={17} />
              </footer>
            </Link>
          ))}
      </div>
    </>
  );
}
export function LessonDetail() {
  const id = Number(useParams().id);
  const l = lessons.find((l) => l.id === id);
  const { visit } = useStudy();
  const [pinyin, set] = useState(true);
  useEffect(() => {
    if (l) visit(id);
  }, [id]);
  if (!l)
    return (
      <Empty>
        Không có bài học này. <Link to="/lessons">Về thư viện</Link>
      </Empty>
    );
  return (
    <>
      <PageTitle title={`Bài ${id} · ${l.meaning}`} description={l.pinyin} />
      <section className="lesson-heading">
        <h2 lang="zh-CN">{l.title}</h2>
        <Speak text={l.title} />
      </section>
      <StudyLinks lesson={id} />
      <div className="section-heading">
        <h2>Từ vựng trong bài</h2>
        <label className="check">
          <input
            type="checkbox"
            checked={pinyin}
            onChange={(e) => set(e.target.checked)}
          />
          Hiện Pinyin
        </label>
      </div>
      <div className="vocab-table">
        {vocabulary
          .filter((v) => v.lesson === id)
          .map((v) => (
            <article key={v.id} className="vocab-row">
              <span className="hanzi" lang="zh-CN">
                {v.hanzi}
              </span>
              <span className="pinyin">{pinyin ? v.pinyin : "—"}</span>
              <span>{v.meaning}</span>
              <Speak text={v.hanzi} />
              <Source source={v.source} />
            </article>
          ))}
      </div>
      <div className="section-heading">
        <h2>Học cùng tài liệu gốc</h2>
        <Link to={`/listening?lesson=${id}`}>Mở bài nghe</Link>
      </div>
      <div className="panel">
        <p>
          Giọng nút loa là giọng tổng hợp. Bản thu giáo trình nằm trong mục
          Luyện nghe.
        </p>
        {l.sources.map((s) => (
          <Source key={s.id} source={s} />
        ))}
      </div>
    </>
  );
}
export function Vocabulary() {
  const [params, setParams] = useSearchParams();
  const lesson = Number(params.get("lesson") || 8);
  const [mode, setMode] = useState("meaning");
  const [index, setIndex] = useState(0);
  const [hard, setHard] = useState(false);
  const { progress } = useStudy();
  const wrong = unresolvedMistakes(progress.attempts);
  const pool = vocabulary.filter(
    (v) =>
      (!lesson || v.lesson === lesson) &&
      (!hard ||
        progress.known[v.id] === false ||
        wrong.some((w) => w.questionId.endsWith(v.id))),
  );
  const v = pool[index % pool.length];
  return (
    <>
      <PageTitle
        title="Luyện từ vựng"
        description="Nhận mặt chữ, nhớ nghĩa và gõ lại. Câu hỏi được tạo từ từ vựng của bài học."
      />
      <div className="toolbar">
        <LessonFilter
          value={lesson}
          onChange={(n) => {
            setParams({ lesson: String(n) });
            setIndex(0);
          }}
        />
        <label className="filter">
          Cách luyện
          <select
            value={mode}
            onChange={(e) => {
              setMode(e.target.value);
              setIndex(0);
            }}
          >
            <option value="meaning">Chữ Hán → nghĩa Việt</option>
            <option value="hanzi">Nghĩa Việt → chữ Hán</option>
            <option value="pinyin">Nhận diện Pinyin</option>
            <option value="typing">Gõ chữ Hán</option>
          </select>
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={hard}
            onChange={(e) => {
              setHard(e.target.checked);
              setIndex(0);
            }}
          />
          Chỉ từ cần ôn
        </label>
      </div>
      {v ? (
        <>
          <p className="muted small">
            Từ {(index % pool.length) + 1} / {pool.length}
          </p>
          <PracticeCard
            key={v.id + mode + index}
            q={vocabQuestion(v, mode)}
            onNext={() => setIndex((i) => i + 1)}
          />
        </>
      ) : (
        <Empty>
          Chưa có từ trong bộ lọc này. Bỏ chọn “Chỉ từ cần ôn” để học từ mới.
        </Empty>
      )}
    </>
  );
}
export function Flashcards() {
  const [params, setParams] = useSearchParams();
  const lesson = Number(params.get("lesson") || 8);
  const [only, setOnly] = useState(false);
  const [index, setIndex] = useState(0);
  const [flip, setFlip] = useState(false);
  const [showPin, setPin] = useState(true);
  const [order, setOrder] = useState<string[]>([]);
  const { progress, known } = useStudy();
  let deck = vocabulary.filter(
    (v) =>
      (!lesson || v.lesson === lesson) &&
      (!only || progress.known[v.id] === false),
  );
  if (order.length)
    deck = deck
      .slice()
      .sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  const card = deck[index % deck.length];
  function next() {
    setFlip(false);
    setIndex((i) => i + 1);
  }
  useEffect(() => {
    function key(e: KeyboardEvent) {
      if ((e.target as HTMLElement).matches("input,select,textarea,button"))
        return;
      if (e.code === "Space") {
        e.preventDefault();
        setFlip((f) => !f);
      }
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  return (
    <>
      <PageTitle
        title="Thẻ từ"
        description="Nhớ mặt chữ trước, rồi lật thẻ để kiểm tra. Phím Space: lật · →: thẻ tiếp."
      />
      <div className="toolbar">
        <LessonFilter
          value={lesson}
          onChange={(n) => {
            setParams({ lesson: String(n) });
            setIndex(0);
            setFlip(false);
          }}
        />
        <label className="check">
          <input
            type="checkbox"
            checked={only}
            onChange={(e) => {
              setOnly(e.target.checked);
              setIndex(0);
              setFlip(false);
            }}
          />
          Từ cần ôn
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={showPin}
            onChange={(e) => setPin(e.target.checked)}
          />
          Hiện Pinyin khi lật
        </label>
        <button
          onClick={() => {
            setOrder(shuffle(deck).map((x) => x.id));
            setIndex(0);
            setFlip(false);
          }}
        >
          <RotateCcw size={16} />
          Trộn thẻ
        </button>
      </div>
      {card ? (
        <>
          <p className="muted center">
            {(index % deck.length) + 1} / {deck.length}
          </p>
          <button
            className="flashcard"
            onClick={() => setFlip((f) => !f)}
            aria-label="Lật thẻ"
          >
            <span className="muted small">Bài {card.lesson}</span>
            <span lang="zh-CN" className="flash-hanzi">
              {card.hanzi}
            </span>
            {flip ? (
              <>
                <span className="pinyin">{showPin && card.pinyin}</span>
                <strong>{card.meaning}</strong>
              </>
            ) : (
              <span className="muted">Chạm để xem nghĩa</span>
            )}
          </button>
          <div className="row center actions">
            <button
              onClick={() => {
                known(card.id, false);
                next();
              }}
            >
              Cần ôn lại
            </button>
            <button
              className="primary"
              onClick={() => {
                known(card.id, true);
                next();
              }}
            >
              <Check size={17} />
              Đã nhớ
            </button>
            <button onClick={next}>Bỏ qua</button>
            <Speak text={card.hanzi} />
          </div>
          <Source source={card.source} />
        </>
      ) : (
        <Empty>Chưa có thẻ cần ôn trong bộ lọc này.</Empty>
      )}
    </>
  );
}
export function Grammar() {
  const [params, setParams] = useSearchParams();
  const lesson = Number(params.get("lesson") || 8);
  return (
    <>
      <PageTitle
        title="Ngữ pháp"
        description="Hiểu cấu trúc, đọc ví dụ, thử đặt một câu. Phần giải thích bổ sung bằng tiếng Việt."
      />
      <LessonFilter
        value={lesson}
        onChange={(n) => setParams({ lesson: String(n) })}
      />
      <div className="grammar-list">
        {grammar
          .filter((g) => !lesson || g.lesson === lesson)
          .map((g) => (
            <article className="panel" key={g.id}>
              <span className="muted small">
                Bài {g.lesson} ·{" "}
                {g.status === "needs_review"
                  ? "Nội dung kế thừa · cần rà soát"
                  : "Hướng dẫn bổ sung dựa trên bài học"}
              </span>
              <h2>{g.title}</h2>
              <p className="formula">{g.formula}</p>
              <p>{g.explanation}</p>
              {g.examples.map((e, i) => (
                <p className="example" key={i}>
                  {e}
                </p>
              ))}
              <Source source={g.source} />
              <Link className="text-link" to={`/writing?lesson=${g.lesson}`}>
                Luyện câu bài {g.lesson}
              </Link>
            </article>
          ))}
      </div>
    </>
  );
}
export function QuestionPractice({ skill }: { skill: "reading" | "writing" }) {
  const [format, setFormat] = useState("single");
  const [params, setParams] = useSearchParams();
  const lesson = Number(params.get("lesson") || 0);
  const [index, setIndex] = useState(0);
  const pool = questions.filter(
    (q) => q.skill === skill && (!lesson || q.lesson === lesson),
  );
  const q = pool[index % pool.length];
  return (
    <>
      <PageTitle
        title={skill === "reading" ? "Luyện đọc" : "Luyện viết"}
        description={
          skill === "reading"
            ? "Đọc hiểu, điền từ và ghép câu. Đáp án suy luận được ghi rõ khi chưa có khóa đáp án gốc."
            : "Dịch, sắp xếp từ và điền chữ Hán. Bộ chấm so khớp đáp án mẫu, không thay thế đánh giá của giáo viên."
        }
      />
        {skill === "reading" && <div className="notice"><Link to="/matching">Mở toàn bộ 9 bộ nối câu gốc →</Link> · <Link to="/papers">Làm đề PDF tương tác</Link></div>}
      <div className="toolbar">
        <LessonFilter
          value={lesson}
          onChange={(n) => {
            setParams({ lesson: String(n) });
            setIndex(0);
          }}
        />
        <span className="muted">{pool.length} câu</span>
        {skill === "reading" && (
          <label className="filter">
            Dạng bài
            <select value={format} onChange={(e) => setFormat(e.target.value)}>
              <option value="single">Từng câu</option>
              <option value="matching">Ghép câu Q13</option>
            </select>
          </label>
        )}
      </div>
      {format === "matching" ? (
        <Matching />
      ) : q ? (
        <PracticeCard
          key={q.id + index}
          q={q}
          onNext={() => setIndex((i) => i + 1)}
        />
      ) : (
        <Empty>
          Chưa có câu đã biên tập cho bài này.{" "}
          <Link to={`/lessons/${lesson}`}>Mở slide gốc của bài</Link>.
        </Empty>
      )}
    </>
  );
}
export function Review() {
  const { progress } = useStudy();
  const [lesson, setLesson] = useState(0);
  const [skill, setSkill] = useState("all");
  const wrong = unresolvedMistakes(progress.attempts).filter(
    (w) =>
      (!lesson || w.lesson === lesson) &&
      (skill === "all" || w.skill === skill),
  );
  return (
    <>
      <PageTitle
        title="Sổ lỗi"
        description="Câu trả lời gần nhất chưa đúng sẽ ở đây. Trả lời đúng khi làm lại để đưa câu ra khỏi danh sách."
      />
      <VocabularyMistakes />
      <div className="toolbar">
        <LessonFilter value={lesson} onChange={setLesson} />
        <label className="filter">
          Kỹ năng
          <select value={skill} onChange={(e) => setSkill(e.target.value)}>
            <option value="all">Tất cả</option>
            {["vocabulary", "reading", "writing", "pinyin"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>
      {wrong.length ? (
        wrong.map((w) =>
          w.question ? <PracticeCard key={w.id} q={w.question} /> : null,
        )
      ) : (
        <Empty>
          Không có câu cần ôn trong bộ lọc này.{" "}
          <Link to="/vocabulary">Luyện từ vựng</Link>
        </Empty>
      )}
    </>
  );
}
export function Progress() {
  const { progress, reset } = useStudy();
  const learning = useLearning();
  const [confirm, setConfirm] = useState(false);
  const total = progress.attempts.length;
  const correct = progress.attempts.filter((a) => a.correct).length;
  function exportData() {
    const u = URL.createObjectURL(
      new Blob([JSON.stringify({version:4,study:progress,learning:learning.data,practice:Object.fromEntries(Object.keys(localStorage).filter(k=>['chn113-assessment-v1-','chn113-three-games-','chn113-listening-'].some(prefix=>k.startsWith(prefix))).map(k=>[k,localStorage.getItem(k)]))}, null, 2)], {
        type: "application/json",
      }),
    );
    const a = document.createElement("a");
    a.href = u;
    a.download = "chn113-tien-do.json";
    a.click();
    URL.revokeObjectURL(u);
  }
  return (
    <>
      <PageTitle
        title="Tiến độ học"
        description="Chỉ tính những lần bạn thực sự làm bài trên trình duyệt này."
        action={<button onClick={exportData}>Xuất tiến độ</button>}
      />
      <LearningOverview detailed />
      <div className="activity-strip">
        <div>
          <strong>{total}</strong>
          <span>Lượt trả lời</span>
        </div>
        <div>
          <strong>
            {total ? Math.round((correct / total) * 100) + "%" : "—"}
          </strong>
          <span>Độ chính xác</span>
        </div>
        <div>
          <strong>
            {Object.values(progress.known).filter(Boolean).length}
          </strong>
          <span>Thẻ đã nhớ</span>
        </div>
        <div>
          <strong>{progress.exams.length}</strong>
          <span>Bài luyện đã nộp</span>
        </div>
      </div>
      <section className="panel">
        <h2>Theo từng bài</h2>
        {lessons.map((l) => {
          const arr = progress.attempts.filter((a) => a.lesson === l.id),
            right = arr.filter((a) => a.correct).length;
          return (
            <div className="progress-row" key={l.id}>
              <Link to={`/lessons/${l.id}`}>Bài {l.id}</Link>
              <progress
                value={right}
                max={arr.length || 1}
                aria-label={`Độ chính xác bài ${l.id}`}
              />
              <span>
                {arr.length ? `${right}/${arr.length} đúng` : "Chưa luyện"}
              </span>
            </div>
          );
        })}
      </section>
      <section className="panel">
        <h2>Lịch sử bài luyện</h2>
        {progress.exams.length ? (
          progress.exams
            .slice()
            .reverse()
            .map((e) => (
              <details key={e.id}>
                <summary className="history-row">
                  <div>
                    <strong>{e.title}</strong>
                    <p className="muted small">
                      {new Date(e.timestamp).toLocaleString("vi-VN", {
                        timeZone: "Asia/Ho_Chi_Minh",
                      })}
                    </p>
                  </div>
                  <span>
                    {e.correct}/{e.total} đúng
                  </span>
                </summary>
                {e.questionIds.map((id, i) => {
                  const q =
                    questions.find((q) => q.id === id) ||
                    progress.attempts.find((a) => a.questionId === id)
                      ?.question;
                  if (!q)
                    return (
                      <p key={id}>
                        Câu {i + 1}: nội dung không còn trong phiên bản hiện
                        tại.
                      </p>
                    );
                  return (
                    <article className="history-answer" key={id}>
                      <strong>
                        Câu {i + 1}: {q.prompt}
                      </strong>
                      <p>
                        Bạn trả lời:{" "}
                        {q.type === "mcq"
                          ? q.options[Number(e.answers[id])] || "—"
                          : e.answers[id] || "—"}
                      </p>
                      <p>
                        Đáp án mẫu:{" "}
                        {q.type === "mcq"
                          ? q.options[Number(q.answer)]
                          : q.answer}
                      </p>
                      <Source source={q.source} />
                    </article>
                  );
                })}
              </details>
            ))
        ) : (
          <p>Chưa có bài luyện được nộp.</p>
        )}
      </section>
      <section className="panel">
        <h2>Dữ liệu trên thiết bị</h2>
        <p>
          Tiến độ lưu cục bộ, không đồng bộ giữa trình duyệt. Xuất một bản sao
          trước khi đặt lại.
        </p>
        {confirm ? (
          <div role="alert">
            <p>Xóa toàn bộ tiến độ học trên trình duyệt này?</p>
            <div className="row">
              <button
                className="danger"
                onClick={() => {
                  reset();
                  learning.reset();
                  setConfirm(false);
                }}
              >
                Xác nhận đặt lại
              </button>
              <button onClick={() => setConfirm(false)}>Giữ lại</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setConfirm(true)}>Đặt lại tiến độ</button>
        )}
      </section>
    </>
  );
}
