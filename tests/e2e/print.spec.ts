import { test, expect } from "@playwright/test";

test.describe("print media", () => {
  test.use({
    // Emulate print media query
    colorScheme: "light",
  });

  test("nav is hidden in print media", async ({ page }) => {
    await page.goto("/");
    await page.emulateMedia({ media: "print" });

    // header has class no-print which sets display:none in print CSS
    // The sticky nav header is body > header with class no-print
    const header = page.locator("body > header").first();
    const display = await header.evaluate((el) =>
      getComputedStyle(el).display
    );
    expect(display).toBe("none");
  });

  test("footer is hidden in print media", async ({ page }) => {
    await page.goto("/");
    await page.emulateMedia({ media: "print" });

    const footer = page.locator("footer");
    const display = await footer.evaluate((el) =>
      getComputedStyle(el).display
    );
    expect(display).toBe("none");
  });

  test("h2 has print color (#006600) in print media", async ({ page }) => {
    await page.goto("/");
    await page.emulateMedia({ media: "print" });

    // Find an h2 on the page (about page has section h2s)
    await page.goto("/about");
    await page.emulateMedia({ media: "print" });

    const h2 = page.locator("h2").first();
    const count = await h2.count();
    if (count > 0) {
      const color = await h2.evaluate((el) =>
        getComputedStyle(el).color
      );
      // rgb(0, 102, 0) == #006600
      expect(color).toBe("rgb(0, 102, 0)");
    }
  });
});
