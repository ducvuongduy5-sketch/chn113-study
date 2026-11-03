import {useSyncExternalStore} from 'react';
import {canonicalId} from '../data/vocabulary';
import {emptyLearning,emptyWord,recall,schedule,restoreLearning,type Rating,type LearningData,type LearningSession} from '../lib/learning';
const KEY='chn113-learning-v4';
let storageError=false;
function initial(){try{return typeof localStorage==='undefined'?emptyLearning():restoreLearning(localStorage.getItem(KEY))}catch{storageError=true;return emptyLearning()}}
let snapshot:LearningData=initial();
const listeners=new Set<()=>void>();
const emit=()=>listeners.forEach(f=>f());
function update(fn:(d:LearningData)=>LearningData){snapshot=fn(snapshot);try{localStorage.setItem(KEY,JSON.stringify(snapshot));storageError=false}catch{storageError=true}emit()}
export const learningActions={
 view:(id:string)=>{id=canonicalId(id);update(d=>{const s=d.words[id]||emptyWord();return {...d,words:{...d.words,[id]:{...s,views:s.views+1}}}})},
 rate:(id:string,rating:Rating)=>{id=canonicalId(id);update(d=>{const s=d.words[id]||emptyWord();return {...d,words:{...d.words,[id]:{...schedule(s,rating,Date.now()),correct:s.correct+Number(rating!=='again'),wrong:s.wrong+Number(rating==='again'),lastCorrect:rating!=='again'}}}})},
 recall:(id:string,correct:boolean,ms=0,skill='recognition')=>{id=canonicalId(id);update(d=>({...d,words:{...d.words,[id]:recall(d.words[id]||emptyWord(),correct,Date.now(),ms,skill)}}))},
 finish:(session:LearningSession)=>update(d=>d.sessions.some(s=>s.id===session.id)?d:{...d,sessions:[...d.sessions,session].slice(-500)}),
 reset:()=>update(()=>emptyLearning()),
};
export function useLearning(){const data=useSyncExternalStore(f=>{listeners.add(f);return()=>listeners.delete(f)},()=>snapshot);return {data,...learningActions,storageError}}
