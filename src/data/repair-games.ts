import type {Question} from '../lib/assessment';
// Application-authored comprehension questions. Track references and dialogue were
// cross-checked against the printed textbook p14/p20 and local recognition output.
// These are practice keys, not official examination answer keys.
const sourceId='sad77970f18b2';
export const listeningChallenges:(Question&{lesson:number;explanation:string})[]=[
 {id:'listen-01-1',lesson:1,audioId:'sc28cb9a487ec',page:14,prompt:'Trong đoạn hội thoại, hai người nói gì với nhau?',texts:['你好','谢谢','再见'],answer:0,explanation:'Bài khóa 1, track 01-1: A: 你好！B: 你好！'},
 {id:'listen-01-2',lesson:1,audioId:'sc785a83ce50c',page:14,prompt:'Người thứ hai đáp lại bằng câu nào?',texts:['没关系','你们好','谢谢你'],answer:1,explanation:'Bài khóa 2, track 01-2: A: 您好！B: 你们好！'},
 {id:'listen-01-3',lesson:1,audioId:'s507d95df3a29',page:14,prompt:'Người thứ hai đáp lại lời xin lỗi thế nào?',texts:['再见','不谢','没关系'],answer:2,explanation:'Bài khóa 3, track 01-3: A: 对不起！B: 没关系！'},
 {id:'listen-02-1',lesson:2,audioId:'s98b216b078ef',page:20,prompt:'Câu đáp lại lời cảm ơn trong hội thoại là gì?',texts:['不谢','你好','对不起'],answer:0,explanation:'Bài khóa 1, track 02-1: A: 谢谢！B: 不谢！'},
 {id:'listen-02-2',lesson:2,audioId:'sa5513aa57988',page:20,prompt:'Người thứ hai dùng câu nào trong hội thoại?',texts:['没关系','不客气','再见'],answer:1,explanation:'Bài khóa 2, track 02-2: A: 谢谢你！B: 不客气！'},
 {id:'listen-02-3',lesson:2,audioId:'s3410fa66c052',page:20,prompt:'Hai người đang chào theo cách nào?',texts:['Chào khi gặp mặt','Nói lời cảm ơn','Chào tạm biệt'],answer:2,explanation:'Bài khóa 3, track 02-3: A: 再见！B: 再见！'},
].map(({texts,answer,...q})=>({...q,sourceId,kind:'listening',keyStatus:'authored',options:texts.map((text,i)=>({id:q.id+'-o'+i,text})),key:q.id+'-o'+answer}));
export const sentenceChallenges:Question[]=[
 {meaning:'Hôm nay tôi đi học.',tokens:['我','今天','去','学校'],alternatives:[[1,0,2,3]]},
 {meaning:'Tôi thích uống trà.',tokens:['我','喜欢','喝','茶'],alternatives:[]},
 {meaning:'Bố tôi là bác sĩ.',tokens:['我','爸爸','是','医生'],alternatives:[]},
 {meaning:'Bạn muốn mua gì?',tokens:['你','想','买','什么'],alternatives:[]},
 {meaning:'Ngày mai chúng tôi xem phim.',tokens:['我们','明天','看','电影'],alternatives:[[1,0,2,3]]},
].map((s,i)=>{const id='sentence-authored-'+i;return {id,kind:'ordering',prompt:s.meaning,sourceId:'application-authored',page:1,keyStatus:'authored',options:s.tokens.map((text,j)=>({id:id+'-t'+j,text})),key:s.tokens.map((_,j)=>id+'-t'+j),alternatives:s.alternatives.map(order=>order.map(j=>id+'-t'+j)),note:'Câu luyện do ứng dụng biên soạn; chấp nhận thời gian trước hoặc sau chủ ngữ ở câu có hai cách đặt.'}});
