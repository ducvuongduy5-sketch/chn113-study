import {evaluate, validQuestion, hasAnswer, type Question, type Answer} from './assessment';
export const gradable=(q:Question)=>validQuestion(q)&&!q.review&&['verified','authored','derived'].includes(q.keyStatus);
export function displayAnswer(q:Question,a:Answer|undefined):string{
 if(a===undefined)return 'Chưa trả lời';
 const text=(id:string)=>q.options?.find(o=>o.id===id)?.text||id;
 if(Array.isArray(a))return a.map(text).join(q.kind==='ordering'?'':' · ');
 if(typeof a==='object')return (q.rows||[]).map(r=>r.text+' → '+(a[r.id]?text(a[r.id]):'Chưa nối')).join('\n');
 return text(a);
}
export function gradeQuestion(q:Question,answer:Answer|undefined,timestamp=Date.now()){
 const eligible=gradable(q),maximum=eligible?(q.weight??(q.kind==='matching'?q.rows!.length:1)):0;
 let status:string=evaluate(q,answer),score=status==='correct'?maximum:0;
 let pairs:{rowId:string;correctAnswer:string;userAnswer:string;correct:boolean}[]=[];
 if(eligible&&q.kind==='matching'){
  const value=answer&&typeof answer==='object'&&!Array.isArray(answer)?answer:{};
  const ids=new Set(q.options!.map(o=>o.id));const used=Object.values(value);
  const shape=used.every(id=>ids.has(id))&&new Set(used).size===used.length&&Object.keys(value).every(id=>q.rows!.some(r=>r.id===id));
  pairs=q.rows!.map(r=>({rowId:r.id,correctAnswer:(q.key as Record<string,string>)[r.id],userAnswer:value[r.id]||'',correct:shape&&value[r.id]===(q.key as Record<string,string>)[r.id]}));
  score=shape?maximum*pairs.filter(p=>p.correct).length/pairs.length:0;
  status=!shape?'invalid':!hasAnswer(answer)?'unanswered':score===maximum?'correct':score>0?'partial':'incorrect';
 }
 const checks=q.requiredWord&&typeof answer==='string'?[{label:'Có từ '+q.requiredWord,passed:answer.includes(q.requiredWord)},{label:'Ít nhất 5 chữ Hán',passed:(answer.match(/[\u3400-\u9fff]/g)||[]).length>=5}]:[];
 return {questionId:q.id,userAnswer:answer,correctAnswer:q.key,acceptedAnswers:q.alternatives||[],score,maximum,status,explanation:q.explanation||q.note||'Đối chiếu với mẫu và nguồn.',confidence:q.keyStatus,timestamp,pairs,checks};
}
export function gradeAssessment(questions:Question[],answers:Record<string,Answer>,timestamp=Date.now()){
 const seen=new Set<string>();const rows=questions.filter(q=>validQuestion(q)&&!seen.has(q.id)&&!!seen.add(q.id)).map(q=>gradeQuestion(q,answers[q.id],timestamp));
 const section=(verified:boolean)=>{const group=rows.filter(r=>(r.confidence==='verified')===verified&&r.maximum>0);const maximum=group.reduce((s,r)=>s+r.maximum,0),score=group.reduce((s,r)=>s+r.score,0);return {score,maximum,percent:maximum?Math.round(score/maximum*100):null}};
 return {rows,official:section(true),practice:section(false),manual:rows.filter(r=>!r.maximum).length,wrongIds:rows.filter(r=>['incorrect','partial','invalid'].includes(r.status)).map(r=>r.questionId)};
}
