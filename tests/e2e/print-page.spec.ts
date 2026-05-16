import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

/**
 * print-page.spec.ts — covers Phase 2B
 * Verifies /print page content, print-media behaviour, and cv.pdf artifact.
 */
test.describe("print page (2B)", () => {
  // ── 1. /print returns 200 ───────────────────────────────────────────────────
  test("/print returns HTTP 200", async ({ page }) => {
    const response = await page.goto("/print");
    expect(response?.status()).toBe(200);
  });

  // ── 2. Required resume content present ─────────────────────────────────────
  test("/print contains required resume content", async ({ page }) => {
    await page.goto("/print");

    const requiredStrings = [
      "朱奕樟",
      "中山大学",
      "武汉理工大学",
      "冯建设",
      "Education",
      "Projects",
      "Publications",
    ];

    for (const str of requiredStrings) {
      const locator = page.getByText(new RegExp(str, "i"));
      await expect(
        locator.first(),
        `Expected "${str}" to be present on /print`
      ).toBeVisible();
    }
  });

  // ── 3. <title> contains 朱奕樟 or CV ─────────────────────────────────────────
  test("/print <title> contains 朱奕樟 or CV", async ({ page }) => {
    await page.goto("/print");
    await expect(page).toHaveTitle(/朱奕樟|CV/i);
  });

  // ── 4. Nav not visible in print media ──────────────────────────────────────
  test("/print nav is hidden under print media", async ({ page }) => {
    await page.goto("/print");
    await page.emulateMedia({ media: "print" });

    // Body-level header nav (sticky bar) should have display:none in print.
    const header = page.locator("body > header, nav").first();
    const count = await header.count();

    if (count > 0) {
      const display = await header.evaluate(
        (el) => getComputedStyle(el).display
      );
      expect(display).toBe("none");
    } else {
      // If no nav exists on /print that's also acceptable — pass.
      expect(true).toBe(true);
    }
  });

  // ── 5. public/cv.pdf exists and is <500KB ──────────────────────────────────
  test("public/cv.pdf exists and is smaller than 500 KB", async () => {
    const pdfPath = path.resolve(
      "/Users/zhuyizhang/code/cv-blog/public/cv.pdf"
    );
    expect(fs.existsSync(pdfPath), `cv.pdf not found at ${pdfPath}`).toBe(
      true
    );

    const stats = fs.statSync(pdfPath);
    const sizeKB = stats.size / 1024;
    expect(
      sizeKB,
      `cv.pdf is ${sizeKB.toFixed(1)} KB — exceeds 500 KB limit`
    ).toBeLessThan(500);
  });
});
