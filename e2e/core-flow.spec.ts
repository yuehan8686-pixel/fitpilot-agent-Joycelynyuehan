import { expect, test } from "@playwright/test";

test("onboards, creates a plan, records work, and reaches a summary", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute("href", "/manifest.webmanifest");
  await page.getByLabel("你的称呼").fill("小驼");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "生成我的训练计划" }).click();

  await expect(page.getByText("本周程序")).toBeVisible();
  await page.locator(".plan-session").first().getByRole("button", { name: /^开始/ }).click();
  await expect(page.getByText("训练进行中")).toBeVisible();

  const completeSet = page.getByRole("button", { name: /^完成第/ });
  while (await completeSet.isVisible()) {
    await completeSet.click();
    const skipRest = page.getByRole("button", { name: "跳过休息" });
    if (await skipRest.isVisible()) await skipRest.click();
  }

  await expect(page.getByText("这一组感觉怎么样？")).toBeVisible();
  await page.getByRole("button", { name: "保存反馈，下一动作" }).click();
  await page.getByRole("button", { name: "提前结束并保存训练" }).click();

  await expect(page.getByText("训练已存档")).toBeVisible();
  await expect(page.getByText("完成组数")).toBeVisible();
  await page.getByRole("button", { name: "回到训练台" }).click();
  await expect(page.getByText("已完成训练")).toBeVisible();
  await expect(page.getByRole("button", { name: "重置本机数据" })).toBeVisible();
});
