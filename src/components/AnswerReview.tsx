import {type Question,type Answer} from '../lib/assessment';
import {gradeQuestion,displayAnswer} from '../lib/GradingEngine';
const labels:Record<string,string>={correct:'Đúng',incorrect:'Chưa đúng',partial:'Đúng một phần',review:'Tự đối chiếu theo rubric',unanswered:'Chưa trả lời',invalid:'Câu trả lời chưa hợp lệ'};
export default function AnswerReview({q,answer}:{q:Question;answer:Answer|undefined}){
 const r=gradeQuestion(q,answer);
 return <div className={'answer-feedback feedback-'+r.status}><div className="answer-feedback-heading"><h3>{labels[r.status]}</h3><span>{r.maximum?`${r.score}/${r.maximum} điểm luyện`:'Không tự chấm ngữ nghĩa'}</span></div><p><strong>Bạn trả lời:</strong> {displayAnswer(q,answer)}</p>
 {q.kind==='matching'&&r.pairs.length?<div className="pair-review">{r.pairs.map(pair=><div key={pair.rowId} className={pair.correct?'pair-correct':'pair-wrong'}><span>{pair.correct?'✓':'✕'} {q.rows?.find(x=>x.id===pair.rowId)?.text}</span><strong>→ {q.options?.find(x=>x.id===pair.correctAnswer)?.text}</strong><small>Bạn chọn: {q.options?.find(x=>x.id===pair.userAnswer)?.text||'Chưa nối'}</small></div>)}</div>:<><p className="model-answer" lang="zh-CN"><strong>{q.review?'Câu mẫu / cách giải: ':'Đáp án: '}</strong>{q.modelAnswer||displayAnswer(q,q.key)}</p>{q.modelPinyin&&<p>{q.modelPinyin}</p>}{q.modelMeaning&&<p>{q.modelMeaning}</p>}{q.alternatives?.length? <p>Cũng chấp nhận: {q.alternatives.map(x=>displayAnswer(q,x)).join(' / ')}</p>:null}</>}
 <p>{r.explanation}</p>{r.checks.map(c=><p key={c.label}>{c.passed?'✓':'✕'} {c.label} · chỉ kiểm tra hình thức</p>)}{q.rubric&&<ul>{q.rubric.map(x=><li key={x}>{x}</li>)}</ul>}<small>{q.keyStatus==='verified'?'Khóa đã xác minh':'Lời giải luyện tập do biên tập; không phải khóa thi chính thức.'}</small></div>
}
