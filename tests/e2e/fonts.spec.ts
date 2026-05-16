import { test, expect } from "@playwright/test";

/**
 * Font self-hosting tests — verifies executor 1B removed Google Fonts
 * dependency and serves woff2 files from the local origin.
 */

test.describe("font self-hosting", () => {
  test("no requests to fonts.googleapis.com or fonts.gstatic.com", async ({
    page,
  }) => {
    const googleFontRequests: string[] = [];

    page.on("request", (req) => {
      const url = req.url();
      if (
        url.includes("fonts.googleapis.com") ||
        url.includes("fonts.gstatic.com")
      ) {
        googleFontRequests.push(url);
      }
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    if (googleFontRequests.length > 0) {
      console.error(
        "[fonts] External Google Font requests detected:",
        googleFontRequests
      );
    }
    expect(googleFontRequests).toHaveLength(0);
  });

  test("at least one local woff2 font file is loaded", async ({ page }) => {
    const woff2Requests: string[] = [];
    const pageOrigin = "http://localhost:4321";

    page.on("request", (req) => {
      const url = req.url();
      if (url.endsWith(".woff2") && url.startsWith(pageOrigin)) {
        woff2Requests.push(url);
      }
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    if (woff2Requests.length === 0) {
      console.warn(
        "[fonts] No local woff2 requests captured. " +
          "Fonts may be loaded lazily or via CSS @font-face without network request (cached). " +
          "Checking @font-face declarations in stylesheets instead..."
      );

      // Fallback: verify @font-face src in loaded stylesheets references local paths
      const hasFontFace = await page.evaluate(() => {
        for (const sheet of Array.from(document.styleSheets)) {
          try {
            for (const rule of Array.from(sheet.cssRules ?? [])) {
              if (rule instanceof CSSFontFaceRule) {
                const src = rule.style.getPropertyValue("src");
                if (src.includes(".woff2") && !src.includes("fonts.gstatic")) {
                  return true;
                }
              }
            }
          } catch {
            // Cross-origin sheets throw SecurityError — skip
          }
        }
        return false;
      });

      expect(hasFontFace).toBe(true);
    } else {
      expect(woff2Requests.length).toBeGreaterThanOrEqual(1);
    }
  });

  test("Poppins or Lora font-family is applied to body or heading", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const fonts = await page.evaluate(() => {
      const body = getComputedStyle(document.body).fontFamily;
      const h1 = document.querySelector("h1");
      const h1Font = h1 ? getComputedStyle(h1).fontFamily : "";
      return { body, h1: h1Font };
    });

    const combined = `${fonts.body} ${fonts.h1}`.toLowerCase();
    const hasPoppins = combined.includes("poppins");
    const hasLora = combined.includes("lora");

    // At least one of Poppins or Lora should be in computed font stack
    expect(hasPoppins || hasLora).toBe(true);
  });
});
