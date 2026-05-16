import { test, expect } from "@playwright/test";

const pages = [
  { url: "/", titleContains: "朱奕樟" },
  { url: "/about", titleContains: "关于我" },
  { url: "/projects", titleContains: "项目" },
  { url: "/publications", titleContains: "论文" },
  { url: "/awards", titleContains: "荣誉" },
];

for (const { url, titleContains } of pages) {
  test(`smoke: ${url} loads and has correct title`, async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    await page.goto(url);
    await expect(page).toHaveTitle(new RegExp(titleContains, "i"));
    expect(
      consoleErrors.filter(
        (e) =>
          // ignore favicon 404 which is a common non-critical error
          !e.includes("favicon") && !e.includes("ERR_ABORTED")
      )
    ).toHaveLength(0);
  });

  test(`smoke: ${url} has visible h1`, async ({ page }) => {
    await page.goto(url);
    const h1 = page.locator("h1").first();
    await expect(h1).toBeVisible();
  });

  test(`smoke: ${url} nav links are present`, async ({ page }) => {
    await page.goto(url);
    // Use the sticky nav header specifically (body > header, not section headers)
    const navHeader = page.locator("body > header").first();
    await expect(navHeader).toBeVisible();
    await expect(page.locator("body > header a[href='/']").first()).toBeVisible();
  });
}
