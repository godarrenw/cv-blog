# 内容补充速查

后续要加项目、论文、报告、荣誉时，按下面的模板新建文件即可，push 后 1 分钟内自动上线。

## 项目 (Projects)

**位置:** `src/content/projects/{slug}.mdx`
**封面图:** 放到 `public/projects/{slug}.png` (或 .jpg/.webp)，cover 字段填 `/projects/{slug}.png`

```mdx
---
title: 项目标题
summary: 一句话摘要（60 中文字以内）。
year: 2026
tags: ["关键词1", "关键词2", "关键词3"]
cover: /projects/my-project.png         # 可选
repo: https://github.com/godarrenw/xxx  # 可选
demo: https://demo.example.com           # 可选
featured: true                            # 是否上首页精选 (取前 3)
order: 1                                  # 首页排序（数字越小越靠前）
---

正文 Markdown。可以分多段，加列表、代码块、图片等。

## 子标题

正文段落。

![图说](/projects/my-project-arch.png)
```

## 论文 (Publications)

**位置:** `src/content/publications/{slug}.md`

```yaml
---
title: 论文标题
authors: Zhu Yizhang, Coauthor A, Coauthor B
venue: NeurIPS Workshop / IEEE TII / arXiv preprint
year: 2026
pdf: /pubs/my-paper.pdf      # 可选, 把 PDF 放 public/pubs/
doi: 10.1109/xxx              # 可选
bibtex: /pubs/my-paper.bib    # 可选
status: published             # published / accepted / submitted / in-prep
---

可选: 摘要、引用提示等正文。
```

## 报告 (Talks)

**位置:** `src/content/talks/{slug}.md`

```yaml
---
title: 报告题目
event: 会议名 / 学术沙龙
date: 2026-06-15
location: 深圳
slides: /talks/my-slides.pdf  # 可选
video: https://...             # 可选
---
```

## 荣誉 (Awards)

**位置:** `src/content/awards/{slug}.md`

```yaml
---
title: 国家奖学金
issuer: 教育部
year: 2025
note: 排名前 2%（可选）
---
```

---

## 部署

每次写完只需：
```sh
git add -A && git commit -m "content: add xxx" && git push
```

Cloudflare Pages 不会自动构建（当前是手动 wrangler 部署模式），需要再跑：
```sh
npm run build && npx wrangler pages deploy dist --project-name cv-blog --branch main
```

要打开自动构建：去 Cloudflare Dashboard → cv-blog → Settings → Builds & deployments → Connect to Git → 选 `godarrenw/cv-blog`。配置：
- Framework: Astro
- Build command: `npm run build`
- Output: `dist`
- Node version env: `NODE_VERSION=22`

接好后 push 就自动上线，不用手动 wrangler。
