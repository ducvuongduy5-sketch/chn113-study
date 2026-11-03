import { test, expect } from "@playwright/test";
import fs from "node:fs";
import type { VocabularyItem, Question, AudioAsset } from "../../src/types";
const raw = JSON.parse(
  fs.readFileSync(
    new URL("../../src/data/content.json", import.meta.url),
    "utf8",
  ),
);
const vocabulary: VocabularyItem[] = raw.vocabulary,
  questions: Question[] = raw.questions,
  audios: AudioAsset[] = raw.audio;
const vocabQuestion = (v: VocabularyItem) => ({
  prompt: v.hanzi,
  meaning: v.meaning,
});
test("home, lesson, vocabulary feedback, persisted progress and error retry", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Hôm nay, mình học gì?" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Vào ôn Quiz 2" }).click();
  await expect(
    page.getByRole("heading", { name: "Sẵn sàng vào phòng thi.", exact: true }),
  ).toBeVisible();
  await page.goto("/lessons/8");
  await expect(
    page.getByRole("heading", { name: "Từ vựng trong bài" }),
  ).toBeVisible();
  await page.goto("/practice/vocabulary?lesson=8");
  const vs = vocabulary.filter((v) => v.lesson === 8);
  const q = vocabQuestion(vs[0]);
  await page.locator("label").filter({hasText:q.meaning}).getByRole("radio").check();
  await page.getByRole("button", { name: "Kiểm tra đáp án" }).click();
  await expect(page.getByRole("status")).toContainText("Đúng rồi");
  await page.getByRole("button", { name: "Câu tiếp theo" }).click();
  const q2 = vocabQuestion(vs[1]);
  await page.locator("label").filter({has:page.getByRole("radio")}).filter({hasNotText:q2.meaning}).first().getByRole("radio").check();
  await page.getByRole("button", { name: "Kiểm tra đáp án" }).click();
  await expect(page.getByRole("status")).toContainText("Chưa đúng");
  await page.reload();
  const count = await page.evaluate(
    () => JSON.parse(localStorage.getItem("chn113-study-v1")!).attempts.length,
  );
  expect(count).toBe(2);
  await page.goto("/review");
  await expect(
    page.getByRole("heading", { name: q2.prompt, exact: true }),
  ).toBeVisible();
  await page.locator("label").filter({hasText:q2.meaning}).getByRole("radio").check();
  await page.getByRole("button", { name: "Kiểm tra đáp án" }).click();
  await expect(
    page.getByText("Không có câu cần ôn trong bộ lọc này."),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("flashcards flip and Pinyin handles IME composition", async ({ page }) => {
  await page.goto("/practice/flashcards?lesson=8");
  await page.getByRole("button", { name: "Lật thẻ" }).click();
  await expect(page.getByRole("button", { name: "Lật thẻ" })).toContainText(
    vocabulary.find((v) => v.lesson === 8)!.meaning,
  );
  await page.getByRole("button", { name: "Đã nhớ", exact: true }).click();
  await page.goto("/pinyin");
  const input = page.getByRole("textbox", { name: "Gõ Pinyin" });
  await input.fill("nv3 er2");
  await input.dispatchEvent("compositionstart");
  await input.press("Enter");
  await expect(page.getByText("Chính xác.", { exact: true })).toHaveCount(0);
  await input.dispatchEvent("compositionend");
  await page.getByRole("button", { name: "Kiểm tra Pinyin" }).click();
  await expect(page.getByRole("status")).toContainText("Chính xác");
});
test("exam preserves answers, hides keys, submits and scores exactly", async ({
  page,
}) => {
  await page.goto("/practice/quiz2");
  await page.getByRole("button", { name: "Bắt đầu bài luyện" }).click();
  const first = questions.find((q) => q.id === "q2-review-1")!;
  await expect(page.getByText("Đáp án mẫu:", { exact: false })).toHaveCount(0);
  await page
    .getByRole("textbox", { name: "Câu trả lời của bạn" })
    .fill(first.answer);
  await page.getByRole("button", { name: "Đánh dấu", exact: true }).click();
  await page.getByRole("button", { name: "Câu sau" }).click();
  await page.getByRole("button", { name: "Câu trước" }).click();
  await expect(page.getByRole("textbox")).toHaveValue(first.answer);
  await page.reload();
  await expect(page.getByRole("textbox")).toHaveValue(first.answer);
  await page.getByRole("button", { name: "Nộp bài", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Xác nhận nộp bài" }).click();
  await expect(
    page.getByRole("heading", { name: "Kết quả bài luyện" }),
  ).toBeVisible();
  const result = await page.evaluate(
    () => JSON.parse(localStorage.getItem("chn113-study-v1")!).exams[0],
  );
  expect(result.correct).toBe(1);
  expect(result.total).toBe(17);
});
test("original audio loads and source endpoint supports byte ranges", async ({
  page,
  request,
}) => {
  await page.goto("/listening?lesson=8");
  await expect(page.locator("audio")).toHaveAttribute(
    "src",
    audios.find((a) => a.lesson === 8)!.url,
  );
  await expect
    .poll(() =>
      page.locator("audio").evaluate((el: HTMLAudioElement) => el.readyState),
    )
    .toBeGreaterThanOrEqual(1);
  const url = await page.locator("audio").getAttribute("src");
  const r = await request.get(url!, { headers: { Range: "bytes=0-99" } });
  expect(r.status()).toBe(206);
  expect((await r.body()).length).toBe(100);
  await page.getByLabel("Tốc độ").selectOption("0.75");
  expect(
    await page
      .locator("audio")
      .evaluate((a: HTMLAudioElement) => a.playbackRate),
  ).toBe(0.75);
});
test("missing audio presents an actionable message", async ({ page }) => {
  await page.route("**/source/**", (route) =>
    route.fulfill({ status: 404, body: "missing" }),
  );
  await page.goto("/listening");
  await expect(page.getByRole("alert")).toContainText(
    "Không tải được âm thanh",
  );
  await expect(page.getByRole("button", { name: "Thử lại" })).toBeVisible();
});
test("matching, word arrangement and original paper annotations", async ({
  page,
}) => {
  await page.goto("/reading");
  await page
    .getByRole("combobox", { name: "Dạng bài", exact: true })
    .selectOption("matching");
  for (const [i, a] of [3, 4, 0, 1, 2].entries())
    await page.locator(".matching-row select").nth(i).selectOption(String(a));
  await page.getByRole("button", { name: "Kiểm tra bài ghép" }).click();
  await expect(page.getByRole("status")).toContainText("5/5");
  await page.goto("/writing?lesson=5");
  await page
    .locator(".sentence-builder button")
    .filter({ hasText: /^你$/ })
    .click();
  await page
    .locator(".sentence-builder button")
    .filter({ hasText: /^家$/ })
    .click();
  await expect(page.getByRole("textbox")).toHaveValue("你家");
  await page.getByRole("button", { name: "Xếp lại từ đầu" }).click();
  await expect(page.getByRole("textbox")).toHaveValue("");
  await page.goto("/papers/reference");
  await expect(page.locator(".paper-page img")).toBeVisible();
  await expect
    .poll(() =>
      page
        .locator(".paper-page img")
        .evaluate((i: HTMLImageElement) => i.naturalWidth),
    )
    .toBeGreaterThan(0);
  await page
    .getByRole("textbox", { name: /Đáp án \/ ghi chú/ })
    .fill("Câu 1: C");
  await page.getByRole("button", { name: "Trang sau" }).click();
  await page.getByRole("button", { name: "Trang trước" }).click();
  await expect(page.getByRole("textbox")).toHaveValue("Câu 1: C");
  await page.reload();
  await expect(page.getByRole("textbox")).toHaveValue("Câu 1: C");
  await page.getByRole("button", { name: "Kết thúc lượt làm" }).click();
  await page.getByRole("button", { name: "Xác nhận lưu bài" }).click();
  await expect(
    page.getByRole("heading", { name: "Bài làm đã lưu" }),
  ).toBeVisible();
});
test("speaking prompts and microphone recording lifecycle", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["microphone"]);
  await page.goto("/speaking");
  await page.getByLabel("Chọn tranh luyện nói").selectOption("20");
  await expect(
    page.getByRole("heading", { name: "Tháng Sáu nóng" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Xem bài nói mẫu" }).click();
  await expect(page.getByText("现在是六月。", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Bắt đầu ghi âm" }).click();
  await expect(page.getByRole("status")).toContainText("Đang ghi âm");
  await page.getByRole("button", { name: "Dừng ghi âm" }).click();
  await expect(page.getByRole("link", { name: "Tải bản ghi" })).toHaveAttribute(
    "href",
    /^blob:/,
  );
});
test("timed practice auto-submits once and Pinyin tone options include the answer", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/practice/quiz2");
  await page
    .getByRole("combobox", { name: "Thời gian tự đặt" })
    .selectOption("15");
  await page.getByRole("button", { name: "Bắt đầu bài luyện" }).click();
  await page.clock.fastForward("15:01");
  await expect(
    page.getByRole("heading", { name: "Kết quả bài luyện" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("chn113-study-v1")!).attempts.length,
    ),
  ).toBe(17);
  await page.goto("/pinyin");
  await page.getByRole("combobox", { name: "Dạng luyện" }).selectOption("tone");
  await page.getByRole("button", { name: "nǚ ér", exact: true }).click();
  await page.getByRole("button", { name: "Kiểm tra Pinyin" }).click();
  await expect(page.getByRole("status")).toContainText("Chính xác");
});
test("all pages responsive with no blocking errors", async ({ page }, info) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const route of [
    "/",
    "/lessons",
    "/lessons/15",
    "/vocabulary",
    "/flashcards",
    "/grammar",
    "/pinyin",
    "/reading",
    "/writing",
    "/speaking",
    "/final",
    "/quiz1",
    "/progress",
    "/sources",
  ]) {
    await page.goto(route);
    await expect(page.locator("h1")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
      route,
    ).toBe(true);
  }
  if (info.project.name === "mobile") {
    await page.getByRole("button", { name: "Mở menu", exact: true }).click();
    await page.getByRole("link", { name: "Gõ Pinyin", exact: true }).click();
    await expect(page.locator("h1")).toContainText("Pinyin");
    await expect(
      page.getByRole("button", { name: "Mở menu", exact: true }),
    ).toBeVisible();
  }
  expect(errors).toEqual([]);
  await page.goto("/");
  await page.screenshot({
    path: `docs/screenshots/home-${info.project.name}.png`,
    fullPage: true,
  });
  await page.goto("/pinyin");
  await expect(page.locator("h1")).toBeVisible();
  await page.screenshot({
    path: `docs/screenshots/pinyin-${info.project.name}.png`,
    fullPage: true,
  });
});
test("source pagination, progress export, history review and reset confirmation", async ({page}) => {
  await page.goto('/sources');
  await expect(page.locator('.source-row')).toHaveCount(50);
  await page.getByRole('button',{name:/Hiển thị thêm tài liệu/}).click();
  await expect(page.locator('.source-row')).toHaveCount(100);
  await page.goto('/practice/quiz2');
  await page.getByRole('button',{name:'Bắt đầu bài luyện'}).click();
  await page.getByRole('button',{name:'Nộp bài',exact:true}).click();
  await page.getByRole('button',{name:'Xác nhận nộp bài'}).click();
  await page.goto('/progress');
  await page.locator('summary.history-row').click();
  await expect(page.locator('.history-answer')).toHaveCount(17);
  const downloadEvent=page.waitForEvent('download');
  await page.getByRole('button',{name:'Xuất tiến độ'}).click();
  const download=await downloadEvent;expect(download.suggestedFilename()).toBe('chn113-tien-do.json');
  await page.getByRole('button',{name:'Đặt lại tiến độ',exact:true}).click();
  await page.getByRole('button',{name:'Giữ lại'}).click();
  await expect(page.locator('summary.history-row')).toHaveCount(1);
  await page.getByRole('button',{name:'Đặt lại tiến độ',exact:true}).click();
  await page.getByRole('button',{name:'Xác nhận đặt lại'}).click();
  await expect(page.getByText('Chưa có bài luyện được nộp.')).toBeVisible();
  expect(await page.evaluate(()=>localStorage.getItem('chn113-draft-quiz2'))).toBe(null);
});
