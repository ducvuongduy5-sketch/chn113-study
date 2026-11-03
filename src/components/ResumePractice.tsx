import {Link} from 'react-router-dom';
import data from '../data/assessments.json';
import {restoreAttempt,attemptKey,validAnswer,type Assessment} from '../lib/assessment';
export default function ResumePractice(){
 const recent=(data as Assessment[]).flatMap(a=>{try{const d=restoreAttempt(localStorage.getItem(attemptKey(a.id)),a);return d?[{a,d}]:[]}catch{return []}}).sort((a,b)=>(b.d.submittedAt||b.d.started)-(a.d.submittedAt||a.d.started)).slice(0,4);
 return <section className="resume-practice"><h2>Đề luyện của bạn</h2><p>{recent.length?'Tiếp tục lượt đang làm hoặc mở lại bài đã nộp.':'Chưa có lượt làm đề mới. Bắt đầu với bộ nối câu hoặc bài đọc từ PDF.'}</p><div className="resume-practice-list">{recent.map(({a,d})=><Link key={a.id} to={'/practice/source/'+a.id}><span>{a.title}</span><small>{d.submitted?'Đã nộp':a.questions.filter(q=>validAnswer(q,d.answers[q.id])).length+'/'+a.questions.length+' câu'} →</small></Link>)}{!recent.length&&<><Link to="/matching">9 bộ nối câu gốc <small>Bắt đầu →</small></Link><Link to="/papers">Thư viện bài luyện <small>Mở đề →</small></Link></>}</div></section>
}
