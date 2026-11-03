import core from './hsk1-2.0.json';
import legacy from '../content.json';
import {normalizePinyin} from '../../lib/pinyin';
export interface Word {
 id:string;hanzi:string;pinyin:string;pinyinNumbered:string;meaning:string;partOfSpeech:string;topic:string;
 lessonIds:number[];legacyIds:string[];core:boolean;aliases:string[];
 example?:{hanzi:string;pinyin:string;meaning:string;origin:string};
 source:{url?:string;page?:number;entry?:number;filename?:string};
}
export const coreWords:Word[]=core.map(v=>({...v,core:true,pinyinNumbered:normalizePinyin(v.pinyin)}));
const seen=new Set(coreWords.map(v=>v.hanzi));
const extras:Word[]=[];
for(const v of legacy.vocabulary){
 if(seen.has(v.hanzi))continue;seen.add(v.hanzi);
 extras.push({id:v.id,hanzi:v.hanzi,pinyin:v.pinyin,pinyinNumbered:normalizePinyin(v.pinyin),meaning:v.meaning,partOfSpeech:'',topic:'Từ mở rộng CHN113',lessonIds:legacy.vocabulary.filter(x=>x.hanzi===v.hanzi).map(x=>x.lesson),legacyIds:[v.id],core:false,aliases:[],source:{filename:v.source.filename}});
}
export const words=[...coreWords,...extras];
export const wordById=new Map(words.map(v=>[v.id,v]));
export const canonicalId=(id:string)=>words.find(v=>v.id===id||v.legacyIds.includes(id))?.id||id;
export const deckNames={hsk1:'HSK1 2.0 · 150 từ',early:'CHN113 · Bài 1–7',quiz2:'Quiz 2 · Bài 8–13',late:'CHN113 · Bài 14–15',final:'Final · Bài 1–15',seen:'Từ đã gặp',difficult:'Từ khó',missed:'Từ trả lời sai',due:'Đến hạn ôn'};
export type Deck=keyof typeof deckNames;
export function selectDeck(deck:Deck,stats:Record<string,{views:number;wrong:number;lastCorrect?:boolean;rating?:string;due:number}>,now=Date.now()){
 return words.filter(v=>{
  const s=stats[v.id];
  if(deck==='hsk1')return v.core;
  if(deck==='early')return v.lessonIds.some(n=>n<=7);
  if(deck==='quiz2')return v.lessonIds.some(n=>n>=8&&n<=13);
  if(deck==='late')return v.lessonIds.some(n=>n>=14);
  if(deck==='final')return v.lessonIds.length>0;
  if(deck==='seen')return !!s?.views;
  if(deck==='difficult')return s?.rating==='hard'||s?.rating==='again';
  if(deck==='missed')return !!s?.wrong&&s.lastCorrect===false;
  return !!s&&s.due>0&&s.due<=now;
 });
}
