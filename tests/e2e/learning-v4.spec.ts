import {test,expect} from '@playwright/test';
test('150-word library, flashcard self-rating, persistence and difficult deck',async({page})=>{
 await page.goto('/vocabulary');await expect(page.locator('.vocab-count')).toContainText('150/150');await expect(page.locator('.word-entry')).toHaveCount(150);
 await page.goto('/flashcards');await expect(page.locator('.deck-counter')).toContainText('1 / 150');await expect(page.getByRole('button',{name:'Chưa nhớ',exact:false})).toBeDisabled();
 await page.locator('.study-flashcard').focus();await page.keyboard.press('Space');await page.getByRole('button',{name:'Chưa nhớ',exact:false}).click();await expect(page.locator('.deck-counter')).toContainText('2 / 150');
 await page.reload();await expect(page.locator('.learning-stats')).toContainText('Đã luyện nhớ');await page.getByLabel('Bộ từ',{exact:true}).selectOption('difficult');await expect(page.locator('.deck-counter')).toContainText('1 / 1');
 await page.getByLabel('Mặt trước',{exact:true}).selectOption('reverse');await expect(page.locator('.study-flashcard h2')).toContainText('yêu');await page.locator('.study-flashcard').click();await expect(page.locator('.deck-example')).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});
test('typed vocabulary answer cannot submit during IME and wrong words enter review',async({page})=>{
 await page.goto('/vocabulary/practice');await page.getByLabel('Cách luyện',{exact:true}).selectOption('typing');await page.getByLabel('Xáo trộn',{exact:true}).uncheck();await page.getByRole('button',{name:'Bắt đầu luyện'}).click();
 const input=page.getByRole('textbox',{name:'Câu trả lời'});await input.dispatchEvent('compositionstart');await input.fill('wrong');await input.press('Enter');await expect(page.locator('.practice-feedback')).toHaveCount(0);await input.dispatchEvent('compositionend');await page.getByRole('button',{name:'Kiểm tra',exact:true}).click();await expect(page.getByRole('heading',{name:'Cùng xem lại'})).toBeVisible();await page.getByRole('button',{name:'Kết thúc lượt luyện'}).click();await expect(page.getByRole('heading',{name:'Kết quả lượt luyện'})).toBeVisible();await page.getByRole('link',{name:'Thẻ từ sai'}).click();await page.getByLabel('Chế độ',{exact:true}).selectOption('all');await expect(page.locator('.deck-counter')).toContainText('1 / 1');
});
