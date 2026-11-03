import { lazy, Suspense, useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { NavLink, Route, Routes, useLocation, Link } from "react-router-dom";
import {
  BookOpen,
  LayoutDashboard,
  Languages,
  Layers,
  Headphones,
  FileText,
  PenLine,
  Mic,
  ClipboardCheck,
  RotateCcw,
  ChartNoAxesCombined,
  Library,
  Menu,
  X,
  Keyboard,
  Gamepad2,
} from "lucide-react";
import {
  Dashboard,
  LessonLibrary,
  LessonDetail,
  Vocabulary,
  Flashcards,
  Grammar,
  QuestionPractice,
  Review,
  Progress,
} from "../features/StudyPages";
import { Listening, Speaking, Sources } from "../features/MediaPages";
const Pinyin = lazy(() => import("../features/Pinyin"));
const ListeningRepair = lazy(() => import('../features/ListeningRepair'));
const AssessmentCenter = lazy(() => import('../features/AssessmentCenter'));
const ExamCenter = lazy(() => import("../features/exam/ExamCenter"));
const StudyDeck = lazy(() => import("../features/vocabulary/StudyDeck"));
const WordLibrary = lazy(() => import("../features/vocabulary/StudyDeck").then(m=>({default:m.WordLibrary})));
const VocabularyPractice = lazy(() => import("../features/vocabulary/Practice"));
const GameCenter = lazy(() => import("../features/games/GameCenter"));
const Exam = lazy(() => import("../features/Exam"));
const PaperPractice = lazy(() => import("../features/PaperPractice"));
const sections: { label: string; items: [string, string, LucideIcon][] }[] = [
  {
    label: "Không gian học",
    items: [
      ["/", "Tổng quan", LayoutDashboard],
      ["/lessons", "Bài học", BookOpen],
      ["/vocabulary", "Từ vựng", Languages],
      ["/flashcards", "Thẻ từ", Layers],
      ["/grammar", "Ngữ pháp", FileText],
      ["/pinyin", "Gõ Pinyin", Keyboard],
      ["/games", "Trò chơi", Gamepad2],
      ["/exams", "Phòng thi EOS", ClipboardCheck],
    ],
  },
  {
    label: "Luyện kỹ năng",
    items: [
      ["/listening", "Nghe", Headphones],
      ["/reading", "Đọc", BookOpen],
      ["/papers", "Luyện đề gốc", FileText],
      ["/matching", "Nối cột", Layers],
      ["/writing", "Viết", PenLine],
      ["/speaking", "Nói", Mic],
    ],
  },
  {
    label: "Ôn thi & theo dõi",
    items: [
      ["/quiz2", "Quiz 2", ClipboardCheck],
      ["/final", "Thi cuối kỳ", ClipboardCheck],
      ["/quiz1", "Quiz 1", ClipboardCheck],
      ["/review", "Sổ lỗi", RotateCcw],
      ["/progress", "Tiến độ", ChartNoAxesCombined],
      ["/sources", "Tài liệu gốc", Library],
    ],
  },
];
export default function App() {
  const [open, setOpen] = useState(false);
  const [collapsed,setCollapsed]=useState(()=>{try{return localStorage.getItem('chn113-sidebar-collapsed')==='true'}catch{return false}});
  useEffect(()=>{try{localStorage.setItem('chn113-sidebar-collapsed',String(collapsed))}catch{}},[collapsed]);
  const location = useLocation();
  useEffect(() => {
    setOpen(false);
    window.scrollTo(0, 0);
    document.title =
      (sections
        .flatMap((s) => s.items)
        .find((i) => i[0] === location.pathname)?.[1] || "Bài học") +
      " · CHN113";
  }, [location.pathname]);
  if (location.pathname.startsWith('/games')) return <Suspense fallback={<p role='status'>Đang mở phòng chơi…</p>}><Routes><Route path='/games/:gameId' element={<GameCenter key={location.search}/>}/><Route path='*' element={<GameCenter/>}/></Routes></Suspense>;
  if (['/papers','/matching','/practice/listening'].includes(location.pathname)||location.pathname.startsWith('/practice/source/')) return <Suspense fallback={<p role="status">Đang mở bài luyện…</p>}><Routes><Route path="/practice/source/:assessmentId" element={<AssessmentCenter/>}/><Route path="*" element={<AssessmentCenter key={location.pathname}/>}/></Routes></Suspense>;
  if (location.pathname.startsWith('/exams') || ['/quiz2','/final'].includes(location.pathname)) return <Suspense fallback={<p role="status">Đang mở phòng thi…</p>}><Routes><Route path="/exams/:paperId" element={<ExamCenter/>}/><Route path="*" element={<ExamCenter/>}/></Routes></Suspense>;
  return (
    <>
      <a className="skip-link" href="#main">
        Đến nội dung chính
      </a>
      <header className="mobile-bar">
        <Link to="/">
          学 <strong>CHN113</strong>
        </Link>
        <button
          aria-label={open ? "Đóng menu" : "Mở menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </header>
      {open && (
        <button
          className="nav-backdrop"
          aria-label="Đóng menu"
          onClick={() => setOpen(false)}
        />
      )}
      <aside className={"sidebar " + (open ? "open " : "")+(collapsed?'collapsed':'')}>
        <Link to="/" className="brand">
          <span lang="zh-CN">学</span>
          <div>
            <strong>CHN113</strong>
            <small>Phòng học tiếng Trung</small>
          </div>
        </Link>
        <button className="sidebar-toggle" aria-label={collapsed?'Mở rộng thanh bên':'Thu gọn thanh bên'} aria-expanded={!collapsed} onClick={()=>setCollapsed(v=>!v)}><Menu size={17}/><span>Thu gọn</span></button>
        <nav aria-label="Điều hướng chính">
          {sections.map((s) => (
            <div className="nav-section" key={s.label}>
              <p>{s.label}</p>
              {s.items.map(([path, label, Icon]) => (
                <NavLink end={path === "/"} key={path} to={path} title={label} aria-label={label}>
                  <Icon size={18} strokeWidth={1.7} />
                  <span>{label}</span>
                  {path === "/quiz2" && <span className="nav-tag">8–13</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <span className="online-dot" /> Lưu trên thiết bị của bạn
        </div>
      </aside>
      <div className={"workspace "+(collapsed?'sidebar-collapsed':'')}>
        <div className="topbar">
          <span>CHN113 / HSK 1</span>
          <span>Tự học cùng tài liệu trên lớp</span>
        </div>
        <main id="main" tabIndex={-1}>
          <Suspense
            fallback={
              <p role="status" className="panel">
                Đang mở bài học…
              </p>
            }
          >
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/lessons" element={<LessonLibrary />} />
              <Route path="/lessons/:id" element={<LessonDetail />} />
              <Route path="/vocabulary" element={<WordLibrary />} />
              <Route path="/vocabulary/practice" element={<VocabularyPractice />} />
              <Route path="/flashcards" element={<StudyDeck />} />
              <Route path="/practice/vocabulary" element={<Vocabulary />} />
              <Route path="/practice/flashcards" element={<Flashcards />} />
              <Route path="/grammar" element={<Grammar />} />
              <Route path="/pinyin" element={<Pinyin />} />
              <Route path="/listening" element={<ListeningRepair />} />
              <Route
                path="/reading"
                element={<QuestionPractice key="reading" skill="reading" />}
              />
              <Route
                path="/writing"
                element={<QuestionPractice key="writing" skill="writing" />}
              />
              <Route path="/speaking" element={<Speaking />} />
              <Route
                path="/practice/quiz2"
                element={<Exam key="quiz2" scope="quiz2" />}
              />
              <Route
                path="/quiz1"
                element={<Exam key="quiz1" scope="quiz1" />}
              />
              <Route
                path="/practice/final"
                element={<Exam key="final" scope="final" />}
              />
              <Route path="/review" element={<Review />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/sources" element={<Sources />} />
              <Route path="/papers" element={<PaperPractice />} />
              <Route path="/papers/reference" element={<PaperPractice />} />
              <Route
                path="*"
                element={
                  <section className="empty">
                    <h1>Không tìm thấy trang</h1>
                    <Link to="/">Về tổng quan</Link>
                  </section>
                }
              />
            </Routes>
          </Suspense>
        </main>
        <footer className="site-footer">
          Học để hiểu, luyện để nhớ.
          <span>Tài liệu có nguồn · Tiến độ của riêng bạn</span>
        </footer>
      </div>
    </>
  );
}
