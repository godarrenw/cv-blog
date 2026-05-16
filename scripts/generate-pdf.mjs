import { chromium } from "playwright";

const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();

await page.goto("http://localhost:4321/print", { waitUntil: "networkidle" });
await page.emulateMedia({ media: "print" });
await page.pdf({
  path: "public/cv.pdf",
  format: "A4",
  margin: { top: "12mm", right: "14mm", bottom: "12mm", left: "14mm" },
  printBackground: true,
  preferCSSPageSize: false,
});
await browser.close();
console.log("public/cv.pdf 生成完成");
