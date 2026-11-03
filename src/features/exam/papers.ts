import raw from '../../data/exam-v4.json';
import hoa from '../../data/hoa-quiz.json';
import { vocabulary, questions } from '../../data';
import { seededOptions, type Paper, type ExamItem } from './model';
export const sourcePapers=raw as Paper[];
const pool=vocabulary.filter(v=>v.lesson>=8&&v.lesson<=13);
const optionsFor=(v:typeof pool[number],index:number)=>seededOptions([
  {id:v.id,text:v.meaning},...pool.filter(x=>x.id!==v.id&&x.meaning!==v.meaning).filter((v,i,a)=>a.findIndex(x=>x.meaning===v.meaning)===i).slice(index,index+3).map(x=>({id:x.id,text:x.meaning}))
],v.id);
const mcq:ExamItem[]=pool.slice(0,12).map((v,i)=>({id:'practice-r-'+v.id,section:'reading',kind:'choice',prompt:`Chọn nghĩa phù hợp: ${v.hanzi}`,options:optionsFor(v,i),key:v.id,keyStatus:'supplemental',explanation:`${v.hanzi} · ${v.pinyin} · ${v.meaning}`,source:v.source}));
const matches=pool.slice(15,20);const matchOptions=seededOptions(matches.map(v=>({id:v.id,text:v.meaning})),'matching-v4');
const matching:ExamItem[]=matches.map(v=>({id:'practice-m-'+v.id,section:'reading',kind:'match',group:'practice-match',prompt:v.hanzi,options:matchOptions,key:v.id,keyStatus:'supplemental',explanation:`${v.pinyin} · ${v.meaning}`,source:v.source}));
const writing:ExamItem[]=questions.filter(q=>q.status==='verified'&&q.answerStatus==='verified'&&q.lesson>=8&&q.lesson<=13).slice(0,10).map(q=>({id:'practice-w-'+q.id,section:'writing',kind:'text',prompt:q.prompt,key:q.answer,alternatives:q.alternatives,keyStatus:'verified',explanation:q.explanation,source:q.source}));
export const practicePaper:Paper={id:'quiz2-supplemental-v4',title:'Quiz 2 · Luyện bổ sung 27 câu',category:'quiz2',origin:'supplemental',description:'12 câu nhận diện từ + 5 cặp nối + 10 câu dịch có mẫu trên slide. Bài bổ sung theo số lượng 17 Reading / 10 Writing, không tái hiện đủ dạng Writing của một mã đề thật. Chấm câu dịch theo mẫu; biến thể khác cần đối chiếu.',items:[...mcq,...matching,...writing]};
export const papers=[hoa as Paper,...sourcePapers,practicePaper];
