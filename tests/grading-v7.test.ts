import {describe,it,expect} from 'vitest';
import bank from '../src/data/assessments.json';
import {gradeAssessment,gradeQuestion,gradable} from '../src/lib/GradingEngine';
import {validQuestion,type Question} from '../src/lib/assessment';
const all=(bank as unknown as {questions:Question[]}[]).flatMap(d=>d.questions);
describe('V7 grading integrity',()=>{
 it('validates all data and provides a solution for every source question',()=>{expect(all).toHaveLength(290);for(const q of all){expect(validQuestion(q),q.id).toBe(true);expect(Boolean(q.key||q.modelAnswer),q.id).toBe(true);expect(q.explanation,q.id).toBeTruthy()}});
 it('derived keys score practice only',()=>{const q=all.find(q=>q.kind==='single'&&gradable(q))!;const r=gradeAssessment([q],{[q.id]:q.key!});expect(r.practice.percent).toBe(100);expect(r.official.percent).toBeNull()});
 it('every closed key and explicit alternative is accepted',()=>{for(const q of all.filter(gradable)){expect(gradeQuestion(q,q.key).status,q.id).toBe('correct');for(const a of q.alternatives||[])expect(gradeQuestion(q,a).status,q.id).toBe('correct')}});
 it('single-choice distractors do not earn points',()=>{for(const q of all.filter(q=>gradable(q)&&['single','listening'].includes(q.kind))){for(const o of q.options!.filter(o=>o.id!==q.key)){expect(gradeQuestion(q,o.id).score,q.id).toBe(0)}}});
 it('matching awards points per pair and rejects reused options',()=>{const q=all.find(q=>q.kind==='matching')!;const answer={...(q.key as Record<string,string>)};const [a,b]=q.rows!;[answer[a.id],answer[b.id]]=[answer[b.id],answer[a.id]];const r=gradeQuestion(q,answer);expect(r.score).toBe(3);expect(r.status).toBe('partial');answer[a.id]=answer[b.id];expect(gradeQuestion(q,answer).score).toBe(0)});
 it('partial unfinished matching retains earned pairs',()=>{const q=all.find(q=>q.kind==='matching')!;const row=q.rows![0];expect(gradeQuestion(q,{[row.id]:(q.key as Record<string,string>)[row.id]}).score).toBe(1)});
 it('free translation and incomplete source never get invented scores',()=>{for(const q of all.filter(q=>q.review)){expect(gradeQuestion(q,q.modelAnswer||q.key).maximum,q.id).toBe(0)}});
 it('mistakes and timestamp are reproducible',()=>{const q=all.find(q=>q.kind==='single'&&gradable(q))!;const bad=q.options!.find(o=>o.id!==q.key)!;const r=gradeAssessment([q],{[q.id]:bad.id},123);expect(r.wrongIds).toEqual([q.id]);expect(r.rows[0].timestamp).toBe(123)});
 it('invalid duplicate records cannot inflate totals',()=>{const q=all.find(gradable)!;expect(gradeAssessment([q,q],{[q.id]:q.key!}).rows).toHaveLength(1)});
});
