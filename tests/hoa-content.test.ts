import {describe,it,expect} from 'vitest';
import hoa from '../src/data/hoa-quiz.json';
import speaking from '../src/data/hoa-speaking.json';
import content from '../src/data/content.json';
import {gradeItem,type ExamItem} from '../src/features/exam/model';
describe('Hoa source import',()=>{
 it('keeps 27 unique source pages and grades every model answer',()=>{
  expect(hoa.items).toHaveLength(27);expect(hoa.items.map(q=>q.source.page)).toEqual([...Array.from({length:26},(_,i)=>i+1),30]);
  for(const q of hoa.items){expect(gradeItem(q as ExamItem,q.key)).toBe('correct');expect(q.explanation.length).toBeGreaterThan(20);for(const a of 'alternatives' in q?q.alternatives||[]:[])expect(gradeItem(q as ExamItem,a)).toBe('correct');}
 });
 it('provides all source speaking records with nonempty models',()=>{
  expect(speaking.filter(x=>x.kind==='translate')).toHaveLength(110);expect(speaking.filter(x=>x.kind==='conversation')).toHaveLength(96);
  for(const q of speaking){expect(q.answer.length).toBeGreaterThan(2);expect(q.pinyin.length).toBeGreaterThan(2);expect(q.meaning.length).toBeGreaterThan(2)}
  const pics=content.speaking.filter(x=>x.id.startsWith('hoa-picture-'));expect(pics).toHaveLength(18);for(const p of pics){expect(p.sentences).toHaveLength(3);for(const s of p.sentences)expect(s.every(Boolean)).toBe(true)}
 });
});
