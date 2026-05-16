import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

/**
 * hero-summary.spec.ts — covers Phase 2A
 * Verifies the homepage hero "10-second summary card" fits entirely within
 * the 375×667 iPhone SE first viewport with no scrolling required.
 */
test.describe("hero summary card (2A)", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  const VIEWPORT_HEIGHT = 667;

  /** Returns true when the element's bounding box is fully within the first viewport. */
  async function isInFirstViewport(
    locator: import("@playwright/test").Locator
  ): Promise<boolean> {
    const box = await locator.boundingBox();
    if (!box) return false;
    return box.y >= 0 && box.y + box.height <= VIEWPORT_HEIGHT;
  }

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Ensure page is scrolled to the very top.
    await page.evaluate(() => window.scrollTo(0, 0));
  });

  // ── 1. Name visible in first viewport ───────────────────────────────────────
  test("name (朱奕樟 or Zhu Yizhang) is visible in first viewport", async ({
    page,
  }) => {
    const nameZh = page.getByText(/朱奕樟/);
    const nameEn = page.getByText(/Zhu\s+Yizhang/i);

    const zhCount = await nameZh.count();
    const enCount = await nameEn.count();

    expect(zhCount + enCount).toBeGreaterThan(0);

    // At least one instance must be in the first viewport.
    if (zhCount > 0) {
      expect(await isInFirstViewport(nameZh.first())).toBe(true);
    } else {
      expect(await isInFirstViewport(nameEn.first())).toBe(true);
    }
  });

  // ── 2. University + lab context visible ─────────────────────────────────────
  test("中山大学 and 先进制造 are visible in first viewport", async ({
    page,
  }) => {
    // They may appear in the same element or different elements.
    const sysu = page.getByText(/中山大学/);
    const lab = page.getByText(/先进制造/);

    await expect(sysu.first()).toBeVisible();
    await expect(lab.first()).toBeVisible();

    expect(await isInFirstViewport(sysu.first())).toBe(true);
    expect(await isInFirstViewport(lab.first())).toBe(true);
  });

  // ── 3. Academic identity visible ────────────────────────────────────────────
  test("academic identity (硕博连读 / PhD / 2024) is visible in first viewport", async ({
    page,
  }) => {
    const identity = page.getByText(/硕博连读|PhD|2024/);
    const count = await identity.count();
    expect(count).toBeGreaterThan(0);
    expect(await isInFirstViewport(identity.first())).toBe(true);
  });

  // ── 4. Research direction tags ───────────────────────────────────────────────
  test("at least 2 of 3 research direction keywords visible in first viewport", async ({
    page,
  }) => {
    const keywords = [/PHM/, /时空建模/, /量化/];
    let visibleInViewport = 0;

    for (const kw of keywords) {
      const el = page.getByText(kw).first();
      const count = await page.getByText(kw).count();
      if (count > 0 && (await isInFirstViewport(el))) {
        visibleInViewport++;
      }
    }

    expect(visibleInViewport).toBeGreaterThanOrEqual(2);
  });

  // ── 5. Email contact link present ────────────────────────────────────────────
  test("at least one mailto: link is visible in first viewport", async ({
    page,
  }) => {
    const mailtoLinks = page.locator('a[href^="mailto:"]');
    const count = await mailtoLinks.count();
    expect(count).toBeGreaterThan(0);

    let anyInViewport = false;
    for (let i = 0; i < count; i++) {
      if (await isInFirstViewport(mailtoLinks.nth(i))) {
        anyInViewport = true;
        break;
      }
    }
    expect(anyInViewport).toBe(true);
  });

  // ── 6. GitHub link present ──────────────────────────────────────────────────
  test("at least one GitHub link is visible in first viewport", async ({
    page,
  }) => {
    const ghLinks = page.locator('a[href*="github"]');
    const count = await ghLinks.count();
    expect(count).toBeGreaterThan(0);

    let anyInViewport = false;
    for (let i = 0; i < count; i++) {
      if (await isInFirstViewport(ghLinks.nth(i))) {
        anyInViewport = true;
        break;
      }
    }
    expect(anyInViewport).toBe(true);
  });

  // ── 7. Touch target size ≥44px ──────────────────────────────────────────────
  test("interactive hero elements meet 44px touch target", async ({ page }) => {
    // Check all visible interactive elements in the hero area (buttons and links).
    const interactive = page.locator("button, a[href]");
    const count = await interactive.count();

    for (let i = 0; i < count; i++) {
      const el = interactive.nth(i);
      const box = await el.boundingBox();
      if (!box) continue;
      // Only evaluate elements within the first viewport.
      if (box.y < 0 || box.y + box.height > VIEWPORT_HEIGHT) continue;
      // Touch target: either dimension must be ≥44px.
      const meetsTarget = box.height >= 44 || box.width >= 44;
      expect(
        meetsTarget,
        `Element at y=${box.y} (${box.width}×${box.height}) fails 44px touch target`
      ).toBe(true);
    }
  });
});
