import {test,expect} from '@playwright/test';
test('V4 source exam: 27 interactive items, persistence, matching, writing and honest result',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/exams/local-q2-collection');await page.getByRole('button',{name:'Bắt đầu làm bài'}).click();
 await expect(page.locator('.sidebar')).toHaveCount(0);await expect(page.locator('.exam-number-grid button')).toHaveCount(27);
 await page.getByRole('radio').last().check();await page.getByRole('button',{name:'Đánh dấu',exact:true}).click();
 await page.getByRole('button',{name:'Câu 13',exact:true}).click();
 await page.getByLabel('Ghép 1',{exact:true}).selectOption('option-3');await page.getByLabel('Ghép 2',{exact:true}).selectOption('option-3');
 await expect(page.getByLabel('Ghép 1',{exact:true})).toHaveValue('');
 await page.getByLabel('Ghép 1',{exact:true}).selectOption('option-4');
 await page.getByRole('button',{name:'Câu 18',exact:true}).click();await page.getByRole('button',{name:'妈妈',exact:true}).click();
 await page.getByLabel('Câu trả lời của bạn').fill('妈妈不爱看电视。');await page.reload();await expect(page.getByLabel('Câu trả lời của bạn')).toHaveValue('妈妈不爱看电视。');
 await page.getByRole('button',{name:'Câu 1',exact:true}).click();await expect(page.getByRole('radio').last()).toBeChecked();
 await expect(page.getByRole('button',{name:'Đã đánh dấu',exact:true})).toHaveAttribute('aria-pressed','true');
 await page.getByRole('button',{name:'Nộp bài',exact:true}).click();await page.getByRole('button',{name:'Xác nhận nộp bài'}).click();
 await expect(page.getByRole('heading',{name:'Kết quả bài luyện'})).toBeVisible();await expect(page.locator('.exam-results')).toContainText('không quy thành điểm');
 await expect(page.getByRole('radio').last()).toBeDisabled();
 const download=page.waitForEvent('download');await page.getByRole('button',{name:'Xuất bài làm'}).click();expect((await download).suggestedFilename()).toContain('bai-lam');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);expect(errors).toEqual([]);
});
test('FE offers candid non-scored practice and retains factual blockers',async({page})=>{
 await page.goto('/final');await expect(page.getByRole('heading',{name:'Nghe từng phần. Làm trọn lượt.'})).toBeVisible();await expect(page.locator('a[href*=sp24-fe-practice]')).toHaveAttribute('href','/practice/source/sp24-fe-practice');
 await page.getByText('Nguồn chưa đủ để mở đề chấm điểm',{exact:true}).click();await expect(page.locator('.repair-limitations')).toContainText('chưa có khóa đáp án');await expect(page.locator('.sidebar')).toHaveCount(0);
});
test('supplemental exam can submit, review and restart without stale answers',async({page})=>{
 await page.goto('/exams/quiz2-supplemental-v4');await page.getByRole('button',{name:'Bắt đầu làm bài'}).click();await page.getByRole('radio').first().check();await page.getByRole('button',{name:'Nộp bài',exact:true}).click();await page.getByRole('button',{name:'Tiếp tục làm'}).click();await expect(page.locator('dialog')).not.toBeVisible();await page.getByRole('button',{name:'Nộp bài',exact:true}).click();await page.getByRole('button',{name:'Xác nhận nộp bài'}).click();await page.getByRole('button',{name:'Làm lượt mới'}).click();await expect(page.getByRole('radio').first()).not.toBeChecked();await expect(page.locator('.exam-navigation')).toContainText('0 / 27');
});
