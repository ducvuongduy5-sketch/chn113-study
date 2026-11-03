import {describe,it,expect} from 'vitest';
import {coreWords} from '../src/data/vocabulary';
import {gameDefinitions,initialScore,resolveScore,timeBudget,optionWords,gradeGuess,guessForm,sentenceTokens,uniquePool} from '../src/features/games/engine';
describe('game engine contracts',()=>{
 it('has eleven unique actual game definitions',()=>{expect(gameDefinitions).toHaveLength(11);expect(new Set(gameDefinitions.map(g=>g.id)).size).toBe(11)});
 it('resolves each event once and resets combo on misses',()=>{let s=resolveScore(initialScore(),'1',true,true);expect(s.score).toBe(110);expect(resolveScore(s,'1',true,true)).toBe(s);s=resolveScore(s,'2',false,true);expect(s.combo).toBe(0);expect(s.lives).toBe(2);expect(s.score).toBe(85)});
 it('practice misses do not remove lives and scores never become negative',()=>{const s=resolveScore(initialScore(),'x',false,false);expect(s.lives).toBe(3);expect(s.score).toBe(0)});
 it('three arcade misses exhaust lives exactly once',()=>{let s=initialScore();for(let i=0;i<3;i++)s=resolveScore(s,String(i),false,true);expect(s.lives).toBe(0);expect(s.wrong).toBe(3)});
 it('longer words receive extra time and time has a floor',()=>{const w=coreWords[0];expect(timeBudget({...w,pinyinNumbered:'bu4 ke4 qi5'},'easy',0)).toBeGreaterThan(timeBudget(w,'easy',0));expect(timeBudget(w,'hard',100)).toBeGreaterThanOrEqual(5000)});
 it('keeps one stable answer and distinct choices across rerenders',()=>{for(const w of coreWords.slice(0,20)){const o=optionWords(w,coreWords,w.id);expect(o).toEqual(optionWords(w,coreWords,w.id));expect(o.filter(x=>x.id===w.id)).toHaveLength(1);expect(new Set(o.map(x=>x.hanzi)).size).toBe(4)}});
 it('removes ambiguous duplicate meanings from matching boards',()=>expect(uniquePool([coreWords[0],{...coreWords[0],id:'different'}])).toHaveLength(1));
 it('accounts for repeated characters in a Wordle-style guess',()=>{expect(gradeGuess('aaaa','baab')).toEqual(['absent','correct','correct','absent']);expect(gradeGuess('abbb','baab')).toEqual(['present','present','absent','correct'])});
 it('keeps tones and ü distinctions only as specified',()=>{expect(guessForm('nǚ',true)).toBe('nü3');expect(guessForm('nv3',true)).toBe('nü3');expect(guessForm('nǚ',false)).toBe('nv');expect(guessForm('nù',true)).not.toBe(guessForm('nǚ',true))});
 it('bridge tokens preserve words and reproduce the complete sentence',()=>{expect(sentenceTokens('我给妈妈打电话。')).toEqual(['我','给','妈妈','打电话']);for(const w of coreWords)expect(sentenceTokens(w.example!.hanzi).join('')).toBe(w.example!.hanzi.replace(/[。？！？，、]/g,''))});
});
