# cv-blog v2 优化完成报告

**Date:** 2026-05-17
**Branch:** main
**Live:** https://cv-blog.pages.dev (zhuyzh.cn 待用户确认迁移)

---

## 1. 最终指标

### Lighthouse (mobile emulation, 7 pages)

| 页面 | Perf | A11y | BP | SEO |
|------|:---:|:---:|:--:|:---:|
| `/` | 100 | 100 | 100 | 100 |
| `/about` | 100 | 100 | 100 | 100 |
| `/projects` | 100 | 100 | 100 | 100 |
| `/publications` | 100 | 100 | 100 | 100 |
| `/awards` | 100 | 100 | 100 | 100 |
| `/now` | 100 | 100 | 100 | 100 |
| `/print` | 100 | 100 | 100 | 100 |

阈值: ≥95 全部 error 级（不达标会 CI 失败）。实际全 100。

### Playwright E2E

**330 / 330 通过**，覆盖：
- smoke / mobile (375/768/1280) / print / seo / responsive-320 / fonts / a11y-contrast / hero-summary / print-page / qr / image-pipeline / now / footer-buildtime / nav

### 关键资源

| 项 | 值 |
|---|---|
| 字体 | 自托管 30 个 woff2 子集 (484 KB)，零外部请求 |
| CV PDF (`public/cv.pdf`) | 82 KB / 1 页 A4 |
| QR PNG (`public/qr.png`) | 6.9 KB / 1024×1024 |
| OG image (`public/og-default.png`) | 27 KB / 1200×630 |
| favicon (`public/favicon.svg`) | 290 B |

---

## 2. 实现回顾

| Phase | 内容 | 状态 |
|---|---|---|
| 0 | Playwright + Lighthouse CI 测试体系 | ✅ |
| 1A | 320/375/768 响应式修复 (hero clamp / avatar / touch≥44px / 长链接 break) | ✅ |
| 1B | Google Fonts CDN → @fontsource 自托管；ink-muted 对比度 3.4 → 5.5 | ✅ |
| 1C | OG/Twitter/Canonical/JSON-LD Person + favicon + robots.txt | ✅ |
| 2A | 首页 hero 改为"10 秒摘要卡" (姓名/学校/身份/方向/3 入口) | ✅ |
| 2B | `/print` 整合页 + `npm run pdf` 生成 cv.pdf | ✅ |
| 2C | `npm run qr` 生成 SVG + PNG 二维码 | ✅ |
| 3A | GitHub Actions: push → test:e2e (阻塞) → wrangler-action 部署 | ✅ |
| 3B | `scripts/migrate-domain.sh` (需用户提供 API token) | ✅ (待用户跑) |
| 4A | Astro `image()` schema + `<Image>` 组件 (自动 WebP/srcset/lazy) | ✅ |
| 4B | `/now` 页 + Footer "最后构建" + Nav "Now" 链接 | ✅ |
| 5 | 最终验证 + 本报告 | ✅ |

---

## 3. 设计语言（已固化）

- **底色** `#faf9f5` (Anthropic 暖米白)
- **强调** `#006600` (中山大学官方校色, CMYK 100/0/100/60 推导)
- **正文** Lora 衬线 17px / 行高 1.7
- **标题** Poppins 字重 500，letter-spacing -0.02em
- **节标记** `§ 01` Poppins uppercase tracked
- **不用** box / shadow / gradient / animation
- 所有交互 200ms ease，仅 color + border transition

---

## 4. 用户后续动作清单

按优先级：

### 必做
1. **填项目** — 按 `CONTENT-GUIDE.md` 写 `src/content/projects/{slug}.mdx`，图片放 `src/content/projects/images/`
2. **配 GitHub Secrets** 启用自动部署（README 末尾有步骤）：
   - `CLOUDFLARE_API_TOKEN` (新建)
   - `CLOUDFLARE_ACCOUNT_ID` = `890302dd848f7702b490d8a2bed9de73`

### 选做
3. **迁域名 zhuyzh.cn** — Dashboard 30 秒 (README 方案 B)，或带 API token 跑 `scripts/migrate-domain.sh`
4. **替换真实头像** — 当前是文字"朱"占位，可放 `public/avatar.jpg` 然后改 about.astro
5. **更新 ORCID 等学术 ID** — 当前 About 联系区无 ORCID（要时让我加）
6. **填论文/荣誉/Talks** — 同 CONTENT-GUIDE.md 模板

### 一些建议
7. **印简历前** 跑一次 `npm run qr` 确认 QR 指向最新域名（如果迁了 zhuyzh.cn 要改 `scripts/generate-qr.mjs` 的 URL 常量）
8. **更新 `/now` 页** 每月一次（如果想保持鲜活）

---

## 5. 已知遗留 / 不做

- **OG image 文字字体** 当前是 SVG 直接写 Poppins family name，访问者浏览器若无 Poppins 会退到 sans-serif。社交平台预览图基本用静态 PNG (`og-default.png`)，已经 prerender 过，无此问题
- **`apple-touch-icon`** 当前指向 favicon.svg；iOS 不支持 SVG 应用图标，会退到 Cloudflare 默认。要做正经的需要一张 180×180 PNG
- **Astro Image 组件还没真实图片测试** 通过测试用例验证过 schema 正确；用户放第一张真实项目封面图时如有问题立即可见
- **中英双语** 当前仅中文（用户明确意愿），未来若要双语需要 i18n 重构
- **dark mode** 用户明确反对，不做
- **搜索功能** Pagefind 等可后续追加，当前页数太少不必要

---

## 6. 文件结构（最终）

```
cv-blog/
├── .github/workflows/deploy.yml    新 — CI/CD
├── astro.config.mjs
├── lighthouserc.json                LH 阈值配置 (≥95 error)
├── playwright.config.ts             3 视口
├── CONTENT-GUIDE.md                 内容速查表
├── FINAL-REPORT.md                  本文件
├── README.md                        含 secrets / 域名迁移说明
├── scripts/
│   ├── generate-pdf.mjs             npm run pdf
│   ├── generate-qr.mjs              npm run qr
│   └── migrate-domain.sh            需用户 API token
├── src/
│   ├── content.config.ts            含 image() schema
│   ├── content/{projects,publications,talks,awards}/
│   ├── layouts/Base.astro           完整 OG/Twitter/JSON-LD/canonical
│   ├── components/
│   │   ├── Nav.astro                6 项: About/Pubs/Projects/Awards/Now/CV
│   │   ├── Footer.astro             含构建日期
│   │   ├── ProjectCard.astro        Astro <Image> 集成
│   │   ├── PubItem.astro
│   │   └── PrintButton.astro
│   ├── pages/
│   │   ├── index.astro              10 秒摘要卡 hero
│   │   ├── about.astro
│   │   ├── projects/{index,[...slug]}.astro
│   │   ├── publications.astro
│   │   ├── awards.astro
│   │   ├── now.astro                新
│   │   └── print.astro              新 — 单页 A4 简历
│   └── styles/{global,print}.css
├── public/
│   ├── cv.pdf                       82 KB
│   ├── qr.{svg,png}
│   ├── og-default.{svg,png}
│   ├── favicon.svg
│   └── robots.txt
└── tests/
    ├── BASELINE.md
    ├── static/workflows.test.mjs    YAML 校验
    └── e2e/*.spec.ts                14 个测试文件 / 330 用例
```

---

## 7. 一句话总结

**面向纸质简历 QR 扫码场景优化的个人主页，7 页全 Lighthouse 100，330 e2e 测试绿，CI/CD 就绪，零外部字体依赖，A4 PDF + 1024px QR 一键生成。**
