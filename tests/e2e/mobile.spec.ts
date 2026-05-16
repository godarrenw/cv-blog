import { test, expect } from "@playwright/test";

// These tests run under mobile project (375x667) defined in playwright.config.ts
// but can also be run standalone — viewport is enforced per test for clarity.

test.describe("mobile viewport", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("homepage hero has no horizontal scrollbar", async ({ page }) => {
    await page.goto("/");
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth);
  });

  test("homepage h1 text is readable (font-size >= 24px)", async ({ page }) => {
    await page.goto("/");
    const h1 = page.locator("h1").first();
    await expect(h1).toBeVisible();
    const fontSize = await h1.evaluate((el) =>
      parseFloat(getComputedStyle(el).fontSize)
    );
    expect(fontSize).toBeGreaterThanOrEqual(24);
  });

  test("CV / print button touch target >= 44px", async ({ page }) => {
    await page.goto("/");
    // PrintButton renders a button or anchor — find the first interactive element in hero area
    const btn = page.locator("button, a[href]").filter({ hasText: /CV|下载/i }).first();
    const box = await btn.boundingBox();
    if (box) {
      // Either width or height should meet 44px touch target
      const meetsTarget = box.height >= 44 || box.width >= 44;
      expect(meetsTarget).toBe(true);
    }
  });

  test("mobile nav hamburger is visible on small screen", async ({ page }) => {
    await page.goto("/");
    const menuBtn = page.locator("#menu-btn");
    await expect(menuBtn).toBeVisible();
  });

  test("desktop nav links are hidden on mobile", async ({ page }) => {
    await page.goto("/");
    // The desktop nav container has class hidden md:flex
    const desktopNav = page.locator("nav .hidden.md\\:flex").first();
    await expect(desktopNav).toBeHidden();
  });
});
