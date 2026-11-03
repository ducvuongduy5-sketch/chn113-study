import {describe,it,expect} from 'vitest';
import raw from '../src/data/vocabulary/hsk1-2.0.json';
import source from '../data/reference/hsk1-canonical.json';
import {coreWords,words,selectDeck} from '../src/data/vocabulary';
import {normalizePinyin,checkPinyin} from '../src/lib/pinyin';
import {emptyWord,schedule,recall,restoreLearning} from '../src/lib/learning';
import {buildRounds} from '../src/features/vocabulary/Practice';
describe('HSK 2.0 canonical data',()=>{
 it('matches all 150 numbered CTI source entries, no manufactured padding',()=>{expect(raw).toHaveLength(150);expect(raw.map(w=>w.hanzi)).toEqual(source.map(w=>w.hanzi));expect(new Set(raw.map(w=>w.id)).size).toBe(150)});
 it('keeps vocabulary unique across decks and preserves provenance and examples',()=>{expect(new Set(words.map(w=>w.hanzi)).size).toBe(words.length);for(const w of raw){expect(w.source.entry).toBeGreaterThan(0);expect(w.source.sha256).toMatch(/^[a-f0-9]{64}$/);expect(w.meaning).toBeTruthy();expect(w.example.hanzi).toContain(w.hanzi);expect(w.example.origin).toBe('supplemental_practice');expect(w.audio.kind).toBe('browser_tts');}});
 it('all tones normalize consistently to stored numbered forms',()=>{for(const w of raw){expect(normalizePinyin(w.pinyin)).not.toBe('!invalid');expect(normalizePinyin(w.pinyin)).toBe(w.pinyinNumbered);expect(checkPinyin(w.pinyinNumbered,w.pinyin)).toBe(true)}});
 it('filters lesson decks on actual source associations',()=>{expect(selectDeck('hsk1',{})).toHaveLength(150);expect(selectDeck('quiz2',{}).every(w=>w.lessonIds.some(n=>n>=8&&n<=13))).toBe(true);expect(selectDeck('due',{})).toHaveLength(0)});
 it('keeps options stable and distinct across practice modes',()=>{for(const mode of ['meaning','hanzi','pinyin','reversePinyin','listen','mixed'] as const){const rounds=buildRounds(coreWords.slice(0,10),mode,'test');expect(rounds).toEqual(buildRounds(coreWords.slice(0,10),mode,'test'));for(const r of rounds){expect(new Set(r.options.map(o=>o.text)).size).toBe(r.options.length);expect(r.options.filter(o=>o.id===r.word.id)).toHaveLength(1)}}});
});
describe('honest spaced repetition',()=>{
 it('viewing does not imply recall or mastery',()=>{expect({...emptyWord(),views:10}.correct).toBe(0)});
 it('again is due in one minute and resets streak',()=>{const s=schedule({...emptyWord(),streak:4},'again',1000);expect(s.due).toBe(61000);expect(s.streak).toBe(0)});
 it('good grows intervals and hard remains short',()=>{const s=schedule(emptyWord(),'good',0);expect(s.interval).toBe(86400000);expect(schedule(s,'good',0).interval).toBeGreaterThan(s.interval);expect(schedule(s,'hard',0).interval).toBeLessThanOrEqual(86400000)});
 it('tracks failed recall and skill-specific successful recall',()=>{let s=recall(emptyWord(),false,100,500,'typing');expect(s.wrong).toBe(1);expect(s.lastCorrect).toBe(false);s=recall(s,true,200,800,'listening');expect(s.listeningCorrect).toBe(1);expect(s.recallMs).toBe(1300)});
 it('invalid persisted state recovers cleanly',()=>{expect(restoreLearning('{broken').words).toEqual({});expect(restoreLearning(JSON.stringify({version:4,words:{x:{due:-3}},sessions:[]})).words).toEqual({})});
});
