import { expect, test, type Page } from "@playwright/test";

async function onboard(page: Page) {
  await page.goto("/");
  await page.getByLabel("你的称呼").fill("小高");
  await page.getByRole("checkbox", { name: /我了解/ }).check();
  await page.getByRole("button", { name: "生成我的训练计划" }).click();
  await expect(page.getByRole("heading", { name: "增肌塑形 · 3 日计划" })).toBeVisible();
}

async function expectNoHorizontalOverflow(page: Page) {
  const sizes = await page.evaluate(() => ({
    viewport: window.innerWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(sizes.content).toBeLessThanOrEqual(sizes.viewport + 1);
}

test("captures the calm adaptive coach desktop journey", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1024 });
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await onboard(page);
  await page.getByRole("navigation", { name: "产品导航" }).getByRole("button", { name: "训练台" }).click();
  await expect(page.getByText("为什么这样安排？", { exact: true })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: "artifacts/qa/desktop-dashboard.png", fullPage: true });

  await page.getByRole("navigation", { name: "产品导航" }).getByRole("button", { name: "Agent" }).click();
  await expect(page.getByRole("heading", { name: "决策依据" })).toBeVisible();
  await page.screenshot({ path: "artifacts/qa/desktop-agent.png", fullPage: true });

  await page.getByRole("navigation", { name: "产品导航" }).getByRole("button", { name: "计划" }).click();
  await page.getByRole("button", { name: "开始 全身 A" }).click();
  await expect(page.getByRole("heading", { name: "徒手深蹲" })).toBeVisible();
  await page.screenshot({ path: "artifacts/qa/desktop-workout.png", fullPage: true });

  await page.getByRole("button", { name: "完成第 1 组" }).click();
  await page.getByRole("button", { name: "跳过休息" }).click();
  await page.getByRole("button", { name: "完成第 2 组" }).click();
  await expect(page.getByText("下一次训练建议", { exact: true })).toBeVisible();
  await expect(page.getByText(/休息 \d/)).toHaveCount(0);
  await page.screenshot({ path: "artifacts/qa/desktop-feedback.png", fullPage: true });

  expect(consoleErrors).toEqual([]);
});

test("keeps the 390px product shell inside the mobile safe viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await onboard(page);
  const nav = page.getByRole("navigation", { name: "产品导航" });
  await nav.getByRole("button", { name: "训练台" }).click();

  await expectNoHorizontalOverflow(page);
  const navBox = await nav.boundingBox();
  expect(navBox).not.toBeNull();
  expect(Math.abs(844 - (navBox!.y + navBox!.height))).toBeLessThanOrEqual(1);
  await page.screenshot({ path: "artifacts/qa/mobile-dashboard-390.png" });

  await nav.getByRole("button", { name: "计划" }).click();
  await expect(page.getByRole("button", { name: "开始 全身 A" })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: "artifacts/qa/mobile-plan-390.png" });

  await page.getByRole("button", { name: "开始 全身 A" }).click();
  await expect(page.getByRole("heading", { name: "徒手深蹲" })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: "artifacts/qa/mobile-workout-390.png" });
});
