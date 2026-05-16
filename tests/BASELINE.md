# Baseline Test Report

Date: 2026-05-17
Build: Astro 6 static site, 5 pages
Environment: local preview (`npm run preview`, port 4321)

---

## Lighthouse CI Scores (mobile emulation, 1 run per page)

| Page          | Performance | Accessibility | Best Practices | SEO  |
|---------------|-------------|---------------|----------------|------|
| `/`           | 100         | 91            | 100            | 100  |
| `/about`      | 100         | 91            | 100            | 100  |
| `/projects`   | 100         | 91            | 100            | 100  |
| `/publications` | 100       | 91            | 100            | 100  |
| `/awards`     | 100         | 91            | 100            | 100  |

All pages pass performance/BP/SEO at 100. Accessibility is 91 across the board.

### Accessibility Gap (a11y = 91)

Single failing audit: **`color-contrast`** — background and foreground colors do not have a sufficient contrast ratio.

Affected elements: muted ink color (`--color-ink-muted`) against the page background fails WCAG AA contrast threshold. This applies to nav links, section labels ("§ 01"), and metadata text uniformly across all pages.

---

## Playwright E2E Results

Run: `npm run test:e2e`
Total: **117 passed, 0 failed** (3 projects × mobile/tablet/desktop, all Chromium)

### Test breakdown by spec

| Spec | Tests | Result |
|------|-------|--------|
| `smoke.spec.ts` | 45 | All pass |
| `mobile.spec.ts` | 15 | All pass |
| `print.spec.ts` | 9 | All pass |
| `seo.spec.ts` | 48 | All pass (og: tags soft-warned, not hard-failed) |

### Known gaps captured as soft warnings (not failures)

All pages are missing Open Graph meta tags (`og:title`, `og:description`, `og:image`).
Logged as `[SEO warn]` in test output. Tracked for Phase 1 remediation.

Pages missing `<meta name="description">`: `/projects`, `/publications`, `/awards`
(These pages exist in source but Base.astro `description` prop was not passed.)

---

## Top 3 Issues to Fix First

### 1. Missing Open Graph / Social meta tags (all pages)
`og:title`, `og:description`, `og:image` are absent site-wide. When the CV link is shared on WeChat, LinkedIn, or Twitter, no card preview renders. This is the highest-impact SEO/social gap given the professional CV use case. Fix: add OG meta block to `Base.astro` layout using the existing `title` and `description` props.

### 2. Color contrast failure (Accessibility = 91, all pages)
`--color-ink-muted` (used for nav items, section labels, metadata text) fails WCAG AA contrast against the `--color-bg` background. Fix: darken `--color-ink-muted` slightly in `global.css` — likely from its current value to ~`#6b6b6b` or darker to hit 4.5:1 ratio. This would bring a11y to 100 across all pages.

### 3. Missing `<meta name="description">` on 3 pages
`/projects`, `/publications`, `/awards` pages don't pass a `description` prop to `Base.astro`, so no `<meta name="description">` is rendered. Affects SEO snippet text in search results. Fix: add a one-line description string to each page's `<Base>` call.

---

## Infrastructure Files Created

- `playwright.config.ts` — 3 Chromium projects (mobile 375×667, tablet 768×1024, desktop 1280×800)
- `lighthouserc.json` — 5 URLs, mobile emulation, warn thresholds (perf≥0.85, a11y/bp/seo≥0.9)
- `tests/e2e/smoke.spec.ts` — page load, title, nav presence
- `tests/e2e/mobile.spec.ts` — no horizontal overflow, font size, touch targets, hamburger menu
- `tests/e2e/print.spec.ts` — nav/footer hidden, h2 print color
- `tests/e2e/seo.spec.ts` — title, description, og:title, sitemap

## npm scripts added

```
npm run test:e2e       # Playwright (all 3 viewports)
npm run test:e2e:ui    # Playwright interactive UI
npm run test:lh        # Lighthouse CI
npm run test:all       # e2e + lh
```
