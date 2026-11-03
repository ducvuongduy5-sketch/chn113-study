export type Rating='again'|'hard'|'good'|'easy';
export interface WordStats{views:number;correct:number;wrong:number;lastCorrect?:boolean;rating?:Rating;due:number;interval:number;streak:number;lastReview:number;recallMs:number;typingCorrect:number;listeningCorrect:number}
export interface LearningSession{id:string;kind:string;deck:string;started:number;finished:number;score:number;correctIds:string[];wrongIds:string[]}
export interface LearningData{version:4;words:Record<string,WordStats>;sessions:LearningSession[]}
export const emptyLearning=():LearningData=>({version:4,words:{},sessions:[]});
export const emptyWord=():WordStats=>({views:0,correct:0,wrong:0,due:0,interval:0,streak:0,lastReview:0,recallMs:0,typingCorrect:0,listeningCorrect:0});
export function schedule(prev:WordStats,rating:Rating,now:number):WordStats{
 const day=86400000;const interval=rating==='again'?60000:rating==='hard'?Math.max(600000,Math.min(day,prev.interval*.6)):rating==='good'?Math.max(day,prev.interval*2.2):Math.max(4*day,prev.interval*3);
 return {...prev,rating,interval,due:now+interval,lastReview:now,streak:rating==='again'?0:prev.streak+1};
}
export function recall(prev:WordStats,correct:boolean,now:number,ms=0,skill='recognition'):WordStats{
 const next=schedule(prev,correct?'good':'again',now);
 return {...next,correct:prev.correct+Number(correct),wrong:prev.wrong+Number(!correct),lastCorrect:correct,recallMs:prev.recallMs+Math.max(0,ms),typingCorrect:prev.typingCorrect+Number(correct&&skill==='typing'),listeningCorrect:prev.listeningCorrect+Number(correct&&skill==='listening')};
}
export function restoreLearning(value:string|null):LearningData{
 try{const d=JSON.parse(value||'null');if(d?.version!==4||!d.words||typeof d.words!=='object'||!Array.isArray(d.sessions))return emptyLearning();
  for(const v of Object.values(d.words) as WordStats[])if(!v||![v.views,v.correct,v.wrong,v.due,v.interval,v.streak].every(n=>Number.isFinite(n)&&n>=0))return emptyLearning();
  return d;
 }catch{return emptyLearning()}
}
