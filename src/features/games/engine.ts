import {type Word} from '../../data/vocabulary';
import {seededOptions} from '../exam/model';
import {normalizePinyin} from '../../lib/pinyin';
export const gameDefinitions=[
 {id:'word-match',name:'Nối từ tốc độ',english:'WORD MATCH',skill:'Nhận diện',description:'Tìm hai nửa cùng nghĩa. Dọn bảng bằng trí nhớ.',theme:'jade',rules:'Chọn một Hanzi và một nghĩa tương ứng. Ghép đúng để dọn bảng; ghép sai mất combo. Hoàn thành hai bảng để thắng.'},
 {id:'quiz-meteor',name:'Thiên thạch',english:'QUIZ METEOR',skill:'Nhận diện',description:'Chọn từ đúng trước khi thiên thạch chạm đất.',theme:'indigo',rules:'Đọc nghĩa trên thiên thạch. Chọn Hanzi bằng 1–4 hoặc chạm. Arcade có ba mạng; mỗi lần sai hoặc quá giờ mất một mạng.'},
 {id:'memory-flip',name:'Lật thẻ ký ức',english:'MEMORY FLIP',skill:'Ghi nhớ',description:'Lật, nhớ vị trí và tìm cặp Hanzi — nghĩa.',theme:'amber',rules:'Lật hai thẻ để tìm Hanzi và nghĩa tương ứng. Chờ thẻ úp lại nếu sai. Tìm hết các cặp để hoàn thành.'},
 {id:'word-shooter',name:'Bắn từ Pinyin',english:'WORD SHOOTER',skill:'Gõ Pinyin',description:'Khóa mục tiêu, gõ đúng, bảo vệ trạm học.',theme:'navy',rules:'Hanzi rơi xuống. Nhập Pinyin trọn từ rồi Enter để bắn. Mỗi từ chạm đáy mất một mạng trong Arcade.'},
 {id:'word-rain',name:'Mưa từ vựng',english:'WORD RAIN',skill:'Gõ Pinyin',description:'Nhìn nghĩa đang rơi. Tự nhớ ra cách đọc.',theme:'blue',rules:'Giọt mưa chỉ hiện nghĩa. Gõ Pinyin của từ tương ứng. Có gợi ý độ dài; hoàn thành trước khi giọt mưa chạm đất.'},
 {id:'spelling-bee',name:'Ong chính tả',english:'SPELLING BEE',skill:'Nghe',description:'Lắng nghe giọng đọc và viết lại Pinyin.',theme:'honey',rules:'Bấm nghe giọng TTS tiếng Trung rồi gõ Pinyin. Nghe lại tùy ý. Không có giọng đọc? Quay về chọn game chữ; không đoán khi chưa nghe được.'},
 {id:'word-guess',name:'Đoán Pinyin',english:'WORD GUESS',skill:'Gõ Pinyin',description:'Sáu lượt đoán, từng ký tự dẫn đường.',theme:'plum',rules:'Nhìn Hanzi và nghĩa, đoán Pinyin trong sáu lượt. Dấu ✓ đúng vị trí, ↔ đúng chữ sai chỗ, · không có. Chế độ có thanh giữ nguyên lỗi thanh điệu.'},
 {id:'bubble-pop',name:'Bong bóng từ',english:'BUBBLE POP',skill:'Nhận diện',description:'Chạm đúng bong bóng trước khi nó bay mất.',theme:'aqua',rules:'Đọc nghĩa mục tiêu và chạm bong bóng Hanzi đúng. Bấm sai mất một mạng trong Arcade. Có thể dùng phím 1–4.'},
 {id:'bridge-builder',name:'Xây cầu ghép câu',english:'BRIDGE BUILDER',skill:'Ngữ pháp',description:'Đặt từng cụm từ, nối hai bờ câu hoàn chỉnh.',theme:'clay',rules:'Chọn các cụm từ để xếp câu theo nghĩa Việt. Mỗi cụm đúng vị trí là một tấm ván. Có thể bỏ cụm vừa chọn trước khi xác nhận.'},
 {id:'sky-runner',name:'Chạy chọn làn',english:'SKY RUNNER',skill:'Phản xạ',description:'Đổi làn và đi qua cổng mang từ đúng.',theme:'sky',rules:'Chọn một trong ba làn bằng ← → hoặc nút chạm, rồi vượt cổng. Trong Arcade, cổng tự kiểm tra khi hết thời gian.'},
 {id:'fruit-toss',name:'Ném quả phòng thủ',english:'FRUIT TOSS',skill:'Gõ Pinyin',description:'Nhớ từ và ném quả đẩy lùi mục tiêu.',theme:'coral',rules:'Gõ Pinyin để ném quả vào mục tiêu đang tiến tới. Từ dài có nhiều thời gian hơn. Mục tiêu chạm vạch nguy hiểm làm mất một mạng.'},
] as const;
export type GameId=typeof gameDefinitions[number]['id'];
export type Difficulty='easy'|'normal'|'hard';
export interface GameConfig{deck:string;difficulty:Difficulty;arcade:boolean;tones:boolean;seed:string}
export interface GameScore{score:number;combo:number;bestCombo:number;lives:number;correct:number;wrong:number;resolved:string[]}
export const initialScore=():GameScore=>({score:0,combo:0,bestCombo:0,lives:3,correct:0,wrong:0,resolved:[]});
export function resolveScore(s:GameScore,key:string,correct:boolean,arcade:boolean):GameScore{
 if(s.resolved.includes(key))return s;
 const combo=correct?s.combo+1:0;
 return {score:Math.max(0,s.score+(correct?100+Math.min(combo,10)*10:-25)),combo,bestCombo:Math.max(s.bestCombo,combo),lives:Math.max(0,s.lives-Number(arcade&&!correct)),correct:s.correct+Number(correct),wrong:s.wrong+Number(!correct),resolved:[...s.resolved,key]};
}
export function timeBudget(word:Word,difficulty:Difficulty,level:number){return Math.max(5000,(difficulty==='easy'?22000:difficulty==='normal'?15000:10000)+Math.max(0,word.pinyinNumbered.split(' ').length-1)*2500-Math.min(level,8)*650)}
export function uniquePool(pool:Word[]){const meanings=new Set<string>();return pool.filter(w=>{if(meanings.has(w.meaning))return false;meanings.add(w.meaning);return true})}
export function optionWords(word:Word,pool:Word[],seed:string,count=4){return seededOptions([word,...seededOptions(uniquePool(pool).filter(w=>w.id!==word.id&&w.hanzi!==word.hanzi),seed).slice(0,count-1)],seed+'options')}
export function guessForm(pinyin:string,tones:boolean){return normalizePinyin(pinyin,tones?'numbered':'ime').replace(/\s/g,'')}
export function gradeGuess(input:string,target:string){const guess=Array.from(input),answer=Array.from(target);const result=guess.map(()=> 'absent');const remaining=new Map<string,number>();answer.forEach((c,i)=>{if(guess[i]===c)result[i]='correct';else remaining.set(c,(remaining.get(c)||0)+1)});guess.forEach((c,i)=>{if(result[i]!=='correct'&&(remaining.get(c)||0)>0){result[i]='present';remaining.set(c,remaining.get(c)!-1)}});return result;}
const vocabularyTokens=['打电话','看电视','看电影','睡觉','中国菜','出租车','火车站','什么时候','怎么样','多少钱','汉语','中国','北京','星期','今天','明天','昨天','现在','老师','妈妈','爸爸','女儿','儿子','我们','你们','学校','医院','商店','前面','后面','下面','桌子','椅子','杯子','电脑','电影','电视','水果','苹果','米饭','衣服','名字','学生','朋友','医生','先生','小姐','喜欢','学习','认识','漂亮','高兴','对不起','不客气','没关系','看见','分钟','十二','一个','三个','六点','七点','八点','九点','十点','这些','这个','那个','这本','那本','哪本','什么','这儿','哪儿','这里','下雨','做饭','吃饭','回家'];
export function sentenceTokens(sentence:string){let s=sentence.replace(/[。？！？，、]/g,'');const tokens:string[]=[];const sorted=vocabularyTokens.slice().sort((a,b)=>b.length-a.length);while(s){const token=sorted.find(w=>s.startsWith(w))||Array.from(s)[0];tokens.push(token);s=s.slice(token.length)}return tokens}
