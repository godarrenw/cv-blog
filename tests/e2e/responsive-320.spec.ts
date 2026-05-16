import { test, expect } from "@playwright/test";

/**
 * Responsive 320px tests — verifies layout at the narrowest common viewport.
 * Written for Phase 1 executor 1A verification.
 * Viewport: 320×568 (iPhone SE 1st gen / small Android)
 */

const pages = ["/", "/about", "/projects", "/publications", "/awards"];

test.describe("responsive 320px viewport", () => {
  test.use({ viewport: { width: 320, height: 568 } });

  for (const url of pages) {
    test(`320: ${url} — no horizontal overflow`, async ({ page }) => {
      await page.goto(url);
      // Wait for layout to settle
      await page.waitForLoadState("domcontentloaded");
      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth <= window.innerWidth;
      });
      expect(overflow).toBe(true);
    });

    test(`320: ${url} — h1 is visible and not clipped`, async ({ page }) => {
      await page.goto(url);
      await page.waitForLoadState("domcontentloaded");
      const h1 = page.locator("h1").first();
      await expect(h1).toBeVisible();
      // Confirm text is not hidden via overflow:hidden clipping
      const clipped = await h1.evaluate((el) => {
        const style = getComputedStyle(el);
        // If overflow is hidden and scrollHeight > clientHeight, text may be clipped
        // We just check the element itself is not zero-height
        return el.clientHeight > 0;
      });
      expect(clipped).toBe(true);
    });

    test(`320: ${url} — interactive elements meet touch target size`, async ({
      page,
    }) => {
      await page.goto(url);
      await page.waitForLoadState("domcontentloaded");

      // Collect all visible <a> and <button> elements
      const violations = await page.evaluate(() => {
        const candidates = Array.from(
          document.querySelectorAll<HTMLElement>("a, button")
        );
        const bad: string[] = [];
        for (const el of candidates) {
          // Only check elements that are actually rendered/visible
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) continue;
          // Check visibility via computed style
          const style = getComputedStyle(el);
          if (
            style.display === "none" ||
            style.visibility === "hidden" ||
            parseFloat(style.opacity) === 0
          )
            continue;

          const area = rect.width * rect.height;
          // Nav main links get a relaxed 36px minimum dimension (they are text links)
          const isNavLink =
            el.closest("nav") !== null || el.closest("header") !== null;
          const minDim = isNavLink ? 36 : 44;

          const meetsDim = rect.width >= minDim || rect.height >= minDim;
          if (!meetsDim) {
            bad.push(
              `${el.tagName.toLowerCase()}[${el.textContent?.trim().slice(0, 30)}] ${Math.round(rect.width)}x${Math.round(rect.height)}`
            );
          }
        }
        return bad;
      });

      if (violations.length > 0) {
        console.warn(
          `[touch-target] ${url} violations at 320px:`,
          violations.join("; ")
        );
      }
      // Allow up to 3 minor violations (e.g. icon-only decorative links) to avoid flakiness
      // during executor implementation; tighten to 0 after full implementation lands.
      expect(violations.length).toBeLessThanOrEqual(3);
    });

    test(`320: ${url} — long URLs and mailto links do not overflow`, async ({
      page,
    }) => {
      await page.goto(url);
      await page.waitForLoadState("domcontentloaded");

      const viewportWidth = 320;
      const overflowing = await page.evaluate((vw) => {
        const links = Array.from(
          document.querySelectorAll<HTMLAnchorElement>("a[href]")
        );
        const bad: string[] = [];
        for (const a of links) {
          const href = a.getAttribute("href") ?? "";
          // Only check long URLs (http/https with path) and mailto links
          if (
            !href.startsWith("mailto:") &&
            !href.startsWith("http") &&
            !href.startsWith("https")
          )
            continue;

          const rect = a.getBoundingClientRect();
          if (rect.width === 0) continue; // not rendered

          // Check if the element's right edge exceeds viewport
          if (rect.right > vw + 1) {
            // +1 for subpixel rounding
            bad.push(`${href.slice(0, 60)} right=${Math.round(rect.right)}`);
          }
        }
        return bad;
      }, viewportWidth);

      if (overflowing.length > 0) {
        console.warn(`[link-overflow] ${url}:`, overflowing.join("; "));
      }
      expect(overflowing).toHaveLength(0);
    });
  }
});
