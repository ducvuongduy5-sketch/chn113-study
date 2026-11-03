import {test,expect,type Page} from '@playwright/test';
import {gameDefinitions,sentenceTokens} from '../../src/features/games/engine';
import fs from 'node:fs';
import type {Word} from '../../src/data/vocabulary';
const words=JSON.parse(fs.readFileSync('src/data/vocabulary/hsk1-2.0.json','utf8')) as Word[];
async function target(page:Page){const id=await page.locator('.game-play').getAttribute('data-current-word');return words.find(w=>w.id===id)!}
async function next(page:Page){await page.getByRole('button',{name:'Vòng tiếp',exact:true}).click()}
async function correct(page:Page,id:string){const w=await target(page);
 if(id==='bridge-builder'){for(const t of sentenceTokens(w.example!.hanzi))await page.locator('.bridge-token-bank button:not(:disabled)').filter({hasText:new RegExp('^'+t+'$')}).first().click();await page.getByRole('button',{name:'Kiểm tra cầu'}).click()}
 else if(id==='sky-runner'){await page.locator('.runner-lanes button').filter({hasText:w.hanzi}).click();await page.getByRole('button',{name:'Vượt cổng'}).click()}
 else if(id==='quiz-meteor')await page.locator('.game-choice-buttons button').filter({hasText:w.hanzi}).click();
 else if(id==='bubble-pop'){const bubble=page.locator('.word-bubble').filter({hasText:w.hanzi});await expect(bubble).toBeVisible();const box=(await bubble.boundingBox())!;await page.mouse.click(box.x+box.width/2,box.y+box.height/2);}
 else {if(id==='spelling-bee')await page.getByRole('button',{name:'Nghe từ bằng TTS'}).click();await page.getByRole('textbox',{name:'Pinyin của bạn'}).fill(w.pinyin);await page.getByRole('textbox',{name:'Pinyin của bạn'}).press('Enter')}
}
for(const game of gameDefinitions.filter(g=>!['word-match','memory-flip'].includes(g.id))){
 test(game.id+' starts, resolves correctly, pauses, resumes, exits and saves',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  if(game.id==='spelling-bee')await page.addInitScript(()=>{Object.defineProperty(window,'speechSynthesis',{value:{getVoices:()=>[],cancel:()=>{},speak:(u:SpeechSynthesisUtterance)=>{u.onstart?.(new Event('start') as SpeechSynthesisEvent);u.onend?.(new Event('end') as SpeechSynthesisEvent)}}});});
  await page.goto('/games/'+game.id);await page.getByRole('button',{name:'Bắt đầu chơi'}).click();await expect(page.locator('.game-hud')).toContainText('0 điểm');
  await correct(page,game.id);await expect(page.getByRole('heading',{name:'Đúng rồi!',exact:true})).toBeVisible();await expect(page.locator('.game-hud')).toContainText('110 điểm');await next(page);
  await page.getByRole('button',{name:'Tạm dừng',exact:true}).click();await expect(page.getByRole('dialog')).toBeVisible();await page.getByRole('button',{name:'Tiếp tục chơi'}).click();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await page.getByRole('button',{name:'Thoát',exact:true}).click();await page.getByRole('button',{name:'Lưu kết quả và thoát'}).click();await expect(page.getByRole('heading',{name:'Đã lưu lượt đang chơi.'})).toBeVisible();
  const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('chn113-learning-v4')||'{}'));expect(stored.sessions).toHaveLength(1);expect(stored.sessions[0].correctIds).toHaveLength(1);expect(errors).toEqual([]);
 });
}
test('Word Match wins two boards and does not score duplicate clicks',async({page})=>{
 await page.goto('/games/word-match');await page.getByRole('button',{name:'Bắt đầu chơi'}).click();
 for(let board=0;board<2;board++){
  const texts=await page.locator('.pair-grid button span').allTextContents();
  for(const w of words.filter(w=>texts.includes(w.hanzi)&&texts.includes(w.meaning))){await page.locator('.pair-grid button').filter({hasText:new RegExp('^'+w.hanzi+'$')}).click();await page.locator('.pair-grid button').filter({hasText:w.meaning}).click();}
  await page.getByRole('button',{name:board===0?'Bảng tiếp theo':'Hoàn thành trò chơi'}).click();
 }await expect(page.getByRole('heading',{name:'Hoàn thành lượt chơi.'})).toBeVisible();await expect(page.locator('.game-result-metrics')).toContainText('8 lần đúng');await page.getByRole('button',{name:'Chơi lại',exact:true}).click();await expect(page.locator('.game-hud')).toContainText('0 điểm');
});
test('Memory Flip resolves mismatch, blocks a third card, then finds a pair',async({page})=>{
 await page.goto('/games/memory-flip');await page.getByRole('button',{name:'Bắt đầu chơi'}).click();
 const buttons=page.locator('.pair-grid button');let known:{i:number;text:string}[]=[];let found=false;
 for(let i=0;i<8&&!found;i++){
  if(await buttons.nth(i).isDisabled())continue;await buttons.nth(i).click();const text=(await buttons.nth(i).innerText()).trim();
  const w=words.find(w=>w.hanzi===text||w.meaning===text)!;const partner=known.find(k=>k.i!==i&&(k.text===w.hanzi||k.text===w.meaning));
  if(partner){await buttons.nth(partner.i).click();found=true;break}
  known.push({i,text});const j=(i+1)%8;if(j===i)continue;await buttons.nth(j).click();const other=(await buttons.nth(j).innerText()).trim();known.push({i:j,text:other});
  if(other===w.hanzi||other===w.meaning){found=true;break}
  await expect(buttons.nth((j+1)%8)).toBeDisabled();await expect(buttons.nth(i)).toBeEnabled({timeout:2500});
 }expect(found).toBe(true);await expect(page.locator('.pair-grid .matched')).toHaveCount(2);
});
test('Arcade timer freezes on pause, fails three times and restarts cleanly',async({page})=>{
 await page.clock.install();await page.goto('/games/quiz-meteor');await page.getByLabel('Arcade · giới hạn thời gian và 3 mạng').check();await page.getByRole('button',{name:'Bắt đầu chơi'}).click();await page.getByRole('button',{name:'Tạm dừng',exact:true}).click();await page.clock.runFor(30000);await expect(page.locator('.game-hud')).toContainText('3');await expect(page.locator('.game-timebar')).toHaveAttribute('aria-valuenow','0');await page.getByRole('button',{name:'Tiếp tục chơi'}).click();
 for(let i=0;i<3;i++){await page.clock.runFor(30000);if(i<2){await expect(page.getByRole('heading',{name:'Nhớ lại cùng nhau'})).toBeVisible();await next(page)}}
 await expect(page.getByRole('heading',{name:'Hết lượt, thêm một lần nhớ.'})).toBeVisible();await page.getByRole('button',{name:'Chơi lại',exact:true}).click();await expect(page.locator('.game-hud')).toContainText('0 điểm');
});
test('typing game respects IME composition and reports a wrong answer once',async({page})=>{
 await page.goto('/games/word-shooter');await page.getByRole('button',{name:'Bắt đầu chơi'}).click();const input=page.getByRole('textbox',{name:'Pinyin của bạn'});await input.dispatchEvent('compositionstart');await input.fill('invalid');await input.press('Enter');await expect(page.locator('.game-feedback')).toHaveCount(0);await input.dispatchEvent('compositionend');await input.press('Enter');await expect(page.getByRole('heading',{name:'Nhớ lại cùng nhau'})).toBeVisible();await expect(page.locator('.game-hud')).toContainText('0 điểm');
});
for(const game of gameDefinitions.filter(g=>!['word-match','memory-flip'].includes(g.id))){
 test(game.id+' completes a real four-word session and replays',async({page})=>{
  if(game.id==='spelling-bee')await page.addInitScript(()=>Object.defineProperty(window,'speechSynthesis',{value:{getVoices:()=>[],cancel:()=>{},speak:(u:SpeechSynthesisUtterance)=>{u.onstart?.(new Event('start') as SpeechSynthesisEvent);u.onend?.(new Event('end') as SpeechSynthesisEvent)}}}));
  await page.goto('/games/'+game.id+'?ids='+words.slice(0,4).map(w=>w.id).join(','));await page.getByRole('button',{name:'Bắt đầu chơi'}).click();
  for(let i=0;i<4;i++){await correct(page,game.id);await expect(page.getByRole('heading',{name:'Đúng rồi!',exact:true})).toBeVisible();await page.getByRole('button',{name:i===3?'Xem kết quả':'Vòng tiếp',exact:true}).click();}
  await expect(page.getByRole('heading',{name:'Hoàn thành lượt chơi.'})).toBeVisible();await expect(page.locator('.game-result-metrics')).toContainText('4 lần đúng');await expect(page.locator('.game-result-score')).toContainText('500');
  await page.getByRole('button',{name:'Chơi lại',exact:true}).click();await expect(page.locator('.game-hud')).toContainText('0 điểm');
 });
}
test('Spelling Bee does not spend lives while TTS is unavailable',async({page})=>{
 await page.clock.install();await page.addInitScript(()=>Object.defineProperty(window,'speechSynthesis',{value:{getVoices:()=>[],cancel:()=>{},speak:(u:SpeechSynthesisUtterance)=>u.onerror?.({error:'voice-unavailable'} as SpeechSynthesisErrorEvent)}}));
 await page.goto('/games/spelling-bee');await page.getByLabel('Arcade · giới hạn thời gian và 3 mạng').check();await page.getByRole('button',{name:'Bắt đầu chơi'}).click();await page.getByRole('button',{name:'Nghe từ bằng TTS'}).click();await page.clock.runFor(40000);await expect(page.getByRole('alert')).toContainText('Chưa phát được tiếng Trung');await expect(page.getByRole('textbox')).toBeDisabled();await expect(page.locator('.game-timebar')).toHaveAttribute('aria-valuenow','0');
});
test('Runner checks the chosen lane at the automatic gate',async({page})=>{
 await page.clock.install();await page.goto('/games/sky-runner');await page.getByLabel('Arcade · giới hạn thời gian và 3 mạng').check();await page.getByRole('button',{name:'Bắt đầu chơi'}).click();const w=await target(page);await page.locator('.runner-lanes button').filter({hasText:w.hanzi}).click();await page.clock.runFor(40000);await expect(page.getByRole('heading',{name:'Đúng rồi!',exact:true})).toBeVisible();await expect(page.locator('.game-hud')).toContainText('110 điểm');
});
test('Memory Flip clears the complete board and replays',async({page})=>{
 await page.goto('/games/memory-flip?ids='+words.slice(0,2).map(w=>w.id).join(','));await page.getByRole('button',{name:'Bắt đầu chơi'}).click();const cards=page.locator('.pair-grid button');
 while(await page.locator('.pair-grid .matched').count()<4){
  const available:number[]=[];for(let i=0;i<4;i++)if(!(await cards.nth(i).isDisabled()))available.push(i);
  const first=available[0];for(const j of available.slice(1)){await cards.nth(first).click();await cards.nth(j).click();if((await cards.nth(first).getAttribute('class'))?.includes('matched'))break;await expect(cards.nth(first)).toBeEnabled({timeout:2500});}
 }
 await page.getByRole('button',{name:'Hoàn thành trò chơi'}).click();await expect(page.getByRole('heading',{name:'Hoàn thành lượt chơi.'})).toBeVisible();await expect(page.locator('.game-result-metrics')).toContainText('2 lần đúng');await page.getByRole('button',{name:'Chơi lại',exact:true}).click();await expect(page.locator('.pair-grid .matched')).toHaveCount(0);
});
test('Word Guess allows exactly six failed guesses before revealing feedback',async({page})=>{
 await page.goto('/games/word-guess?ids='+words.find(w=>w.hanzi==='爱')!.id);await page.getByRole('button',{name:'Bắt đầu chơi'}).click();const input=page.getByRole('textbox');
 for(let i=0;i<6;i++){await input.fill('ai1');await input.press('Enter');if(i<5)await expect(page.locator('.game-feedback')).toHaveCount(0);}
 await expect(page.getByRole('heading',{name:'Nhớ lại cùng nhau'})).toBeVisible();await expect(page.locator('.guess-row .absent')).toHaveCount(6);await expect(input).toBeDisabled();await page.getByRole('button',{name:'Xem kết quả'}).click();await expect(page.locator('.game-result-metrics')).toContainText('1 lần sai');
});
