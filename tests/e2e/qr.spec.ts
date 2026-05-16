import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

/**
 * qr.spec.ts — covers Phase 2C
 * Verifies that qr.svg and qr.png are served correctly and that the SVG
 * uses the correct foreground colour (#006600, SYSU green).
 */
test.describe("QR code assets (2C)", () => {
  // ── 1. GET /qr.svg — 200, svg content-type, non-trivial body ───────────────
  test("GET /qr.svg returns 200 with svg content-type and non-empty body", async ({
    page,
  }) => {
    const response = await page.request.get("/qr.svg");
    expect(response.status()).toBe(200);

    const contentType = response.headers()["content-type"] ?? "";
    expect(contentType).toMatch(/svg/i);

    const body = await response.text();
    expect(body.length).toBeGreaterThan(100);
  });

  // ── 2. GET /qr.png — 200, png content-type ──────────────────────────────────
  test("GET /qr.png returns 200 with png content-type", async ({ page }) => {
    const response = await page.request.get("/qr.png");
    expect(response.status()).toBe(200);

    const contentType = response.headers()["content-type"] ?? "";
    expect(contentType).toMatch(/png/i);
  });

  // ── 3. SVG contains #006600 foreground fill ──────────────────────────────────
  test("qr.svg contains #006600 fill colour", async ({ page }) => {
    const response = await page.request.get("/qr.svg");
    const svgText = await response.text();

    // Accept both lowercase and uppercase hex, and fill/stroke/style attributes.
    expect(svgText).toMatch(/#006600/i);
  });

  // ── 4. Local file sanity checks (static assets must exist on disk) ───────────
  test("public/qr.svg exists on disk and is >100 bytes", () => {
    const svgPath = path.resolve(
      "/Users/zhuyizhang/code/cv-blog/public/qr.svg"
    );
    expect(fs.existsSync(svgPath), `qr.svg not found at ${svgPath}`).toBe(
      true
    );
    const stats = fs.statSync(svgPath);
    expect(
      stats.size,
      `qr.svg is only ${stats.size} bytes — expected >100`
    ).toBeGreaterThan(100);
  });

  test("public/qr.png exists on disk", () => {
    const pngPath = path.resolve(
      "/Users/zhuyizhang/code/cv-blog/public/qr.png"
    );
    expect(fs.existsSync(pngPath), `qr.png not found at ${pngPath}`).toBe(
      true
    );
  });
});
