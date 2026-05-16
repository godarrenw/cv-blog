# cv-blog — 朱奕樟个人简历博客

基于 Astro 6 + Tailwind v4 + MDX 的静态站点。白底 + 中大绿 (#006847) 主题，支持浏览器直接打印为 A4 简历 PDF。

## 本地开发

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # 输出到 dist/
npm run preview  # 本地预览构建产物
```

## 内容维护

| 类型 | 路径 | schema |
| --- | --- | --- |
| 项目 | `src/content/projects/*.mdx` | `title, summary, year, tags[], cover?, repo?, demo?, featured?, order?` |
| 论文 | `src/content/publications/*.md` | `title, authors, venue, year, pdf?, doi?, bibtex?, status` |
| 报告 | `src/content/talks/*.md` | `title, event, date, location?, slides?, video?` |
| 荣誉 | `src/content/awards/*.md` | `title, issuer, year, note?` |

新增一个项目：在 `src/content/projects/` 下新建 `xxx.mdx`，frontmatter 写元数据，正文用 Markdown。

`featured: true` 的项目会出现在首页"精选项目"区。

## 打印为 PDF

打开任意页面（推荐 `/`），按 **Ctrl/Cmd + P**，选择"另存为 PDF"，纸张 A4。导航、页脚、卡片悬浮效果会被 `src/styles/print.css` 自动隐藏，章节标题保留中大绿色下划线。

或点击页面顶部的 "CV" 按钮 / 首页的 "下载 CV PDF" 按钮触发打印对话框。

## 部署到 Cloudflare Pages

1. 推送代码到 GitHub（仓库名建议 `cv-blog` 或 `zhuyizhang0.github.io-source`）
2. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
3. 选择仓库，构建配置：
   - Framework preset: `Astro`
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Node version: `22`（在 Environment variables 添加 `NODE_VERSION=22`）
4. **Save and Deploy**。后续 `git push main` 自动构建上线。
5. 在 **Custom domains** 绑定自定义域名（可选）。

修改 `astro.config.mjs` 里的 `site` 为线上域名后重新部署，sitemap 会更新。

## 主题色

定义在 `src/styles/global.css` 的 `@theme` 中：

```css
--color-sysu-green: #006847;
--color-sysu-green-50: #e8f3ee;
--color-ink: #1f2937;
```

要改主色：改这三个 token，全站联动。

## 目录结构

```
src/
├── content.config.ts        集合 schema
├── content/                 Markdown/MDX 内容
├── layouts/Base.astro       全局布局
├── components/              Nav / Footer / ProjectCard / PubItem / PrintButton
├── pages/                   路由
│   ├── index.astro
│   ├── about.astro
│   ├── projects/
│   │   ├── index.astro
│   │   └── [...slug].astro
│   ├── publications.astro
│   └── awards.astro
└── styles/                  global.css + print.css
```

## QR 码用于纸质简历

PNG 高清版位于 `public/qr.png` (1024×1024)，SVG 矢量位于 `public/qr.svg`。
两者都指向 https://cv-blog.pages.dev。

打印用：直接把 `public/qr.png` 拖到 Word/InDesign 即可。
线上引用：`<img src="/qr.svg" />`。

域名变更后重新生成：编辑 `scripts/generate-qr.mjs` 顶部 URL 常量，然后 `npm run qr`。

## GitHub Actions 自动部署

`.github/workflows/deploy.yml` 在每次推送到 `main` 分支时自动执行：构建 → E2E 测试（门禁）→ 部署到 Cloudflare Pages。

### 配置 GitHub Secrets

在 GitHub 仓库 → **Settings → Secrets and variables → Actions → New repository secret** 中添加以下两个 secret：

| Secret 名称 | 获取方式 |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | Cloudflare Dashboard → My Profile → **API Tokens** → **Create Token** → 选择 "Edit Cloudflare Workers" 模板（包含 Pages 权限）→ 创建并复制 |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Dashboard 任意 Zone 概览页右侧，或运行 `npx wrangler whoami` 查看。当前值：`890302dd848f7702b490d8a2bed9de73` |

### 工作流步骤说明

1. `actions/checkout@v4` — 拉取代码
2. `actions/setup-node@v4` (Node 22 + npm 缓存) — 环境准备
3. `npm ci` — 安装依赖
4. `npm run build` — Astro 构建输出到 `dist/`
5. Playwright 安装 + `npm run test:e2e` — **阻塞门禁**，E2E 失败则不部署
6. `cloudflare/wrangler-action@v3` — 部署 `dist/` 到 Pages 项目 `cv-blog`

### 手动触发

除 push 外，也可在 GitHub → **Actions → Deploy to Cloudflare Pages → Run workflow** 手动触发。

## 域名迁移 zhuyzh.cn

`zhuyzh.cn` 当前绑定在旧项目 `my-website`（VitePress）。要切换到 `cv-blog`，有两种方式：

> **背景**：Cloudflare Pages 不允许同一域名同时绑两个项目，因此必须先从旧项目解绑，再绑到新项目。

### A. 脚本迁移（需要 API Token）

1. 创建 API Token：
   - 打开 <https://dash.cloudflare.com/profile/api-tokens>
   - **Create Token** → 选择 **"Edit Cloudflare Workers"** 模板
   - Account Resources 选择你的账号 → **Continue to summary → Create Token**
   - 复制生成的 token（只显示一次）

   > 注意：`wrangler whoami` 使用的 OAuth token 无法直接调用 REST API，需单独创建 API token。

2. 运行脚本：
   ```sh
   export CLOUDFLARE_API_TOKEN=<粘贴你的token>
   bash scripts/migrate-domain.sh
   ```

3. 等 1–2 分钟，访问 <https://zhuyzh.cn> 验证。

### B. Dashboard 手动操作（推荐，无需 token）

1. 打开 <https://dash.cloudflare.com/?to=/:account/pages>
2. 进入 **`my-website`** 项目 → **Custom domains** → 找到 `zhuyzh.cn` → **Remove**
3. 进入 **`cv-blog`** 项目 → **Custom domains** → **Set up a custom domain** → 输入 `zhuyzh.cn` → **Activate domain**
4. DNS 自动更新（同账号同 zone），1–2 分钟生效，无需手动改 DNS 记录。

迁移完成后，建议更新 `astro.config.mjs` 中的 `site` 字段为 `https://zhuyzh.cn` 并重新部署，sitemap 和 canonical URL 会自动更新。
