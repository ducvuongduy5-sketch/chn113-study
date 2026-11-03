import {describe,it,expect} from 'vitest';
import {papers,practicePaper} from '../src/features/exam/papers';
import {gradeItem,gradePaper,setExamAnswer,seededOptions,loadExamDraft,type ExamItem} from '../src/features/exam/model';
describe('V4 exam contract',()=>{
 it.each(papers.filter(p=>p.id!=='quiz-co-hoa'))('$id has 12 MCQ, five individual pairs and ten writing items',p=>{
  expect(p.items).toHaveLength(27);expect(p.items.filter(q=>q.kind==='choice')).toHaveLength(12);expect(p.items.filter(q=>q.kind==='match')).toHaveLength(5);expect(p.items.filter(q=>q.section==='writing')).toHaveLength(10);
  expect(new Set(p.items.map(q=>q.id)).size).toBe(27);
 });
 it('uses stable keys with unique distractors and several answer positions',()=>{
  const indices=new Set<number>();for(const q of practicePaper.items.filter(q=>q.options)){
   expect(new Set(q.options!.map(o=>o.text)).size).toBe(q.options!.length);expect(q.options!.filter(o=>o.id===q.key)).toHaveLength(1);
   expect(gradeItem(q,q.key!)).toBe('correct');indices.add(q.options!.findIndex(o=>o.id===q.key));
  }expect(indices.size).toBeGreaterThan(2);
 });
 it('shuffle does not mutate and is stable across rerenders',()=>{const xs=['a','b','c','d'];expect(seededOptions(xs,'seed')).toEqual(seededOptions(xs,'seed'));expect(xs).toEqual(['a','b','c','d']);});
 it.each(['a','b','c','d'])('scores every stable option position %s',id=>{const q={...practicePaper.items[0],key:id,options:['a','b','c','d'].map(id=>({id,text:id}))};expect(gradeItem(q,id)).toBe('correct');expect(gradeItem(q,['a','b','c','d'].find(x=>x!==id)!)).toBe('incorrect');});
 it('never scores inferred keys as verified',()=>{const p={...papers[0],items:papers[0].items.map(q=>({...q,keyStatus:'inferred' as const}))};const a=Object.fromEntries(p.items.map(q=>[q.id,q.key!]));expect(gradePaper(p,a)).toEqual({correct:0,incorrect:0,manual:27,unanswered:0,total:27});});
 it('enforces one-to-one pairs and lets students reassign',()=>{const qs=practicePaper.items.filter(q=>q.kind==='match');const a=setExamAnswer(practicePaper,{[qs[0].id]:qs[0].key!},qs[1].id,qs[0].key!);expect(a[qs[0].id]).toBeUndefined();expect(a[qs[1].id]).toBe(qs[0].key);});
 it('normalizes writing and leaves unknown valid variants for review',()=>{const q:ExamItem={...practicePaper.items[0],kind:'text',key:'我喜欢喝茶。',alternatives:['我爱喝茶。']};expect(gradeItem(q,'我 喜欢 喝 茶!')).toBe('correct');expect(gradeItem(q,'我爱喝茶')).toBe('correct');expect(gradeItem(q,'我很喜欢喝茶')).toBe('manual');expect(gradeItem(q,'')).toBe('unanswered');});
 it('rejects corrupt drafts and clamps a restored index',()=>{expect(loadExamDraft('key',practicePaper,{getItem:()=>'{broken'})).toBeNull();const d={version:4,id:'test',paperId:practicePaper.id,started:123,submitted:false,index:999,flags:['missing'],answers:{}};expect(loadExamDraft('key',practicePaper,{getItem:()=>JSON.stringify(d)})?.index).toBe(26);});
});
