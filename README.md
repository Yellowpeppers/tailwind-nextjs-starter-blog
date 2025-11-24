# NeuroHacks Lab

“Quiet Lab + Soft Tech” 内容站点，聚焦 ADHD/神经多样性人群的实用工具、低噪感统物件与工作流程。项目基于 Tailwind Next.js Starter Blog（二次改造）并引入品牌文档，方便持续扩写与多作者协作。

## 站点定位
- 受众：成人 ADHD、教育工作者、感统需求用户。
- 语气：证据导向、温柔无评判、提供可落地系统，不卖焦虑。
- 栏目：Guides（方法论）、Tools（模板/工具集合）、Topics（标签索引）、About（团队介绍）。

详细品牌语言、视觉与内容规范见 `docs/site-creative-brief.md`、`docs/template-cleanup-checklist.md` 与 `docs/content-roadmap.md`。

## 技术栈
- Next.js 15（App Router + React 19）
- Tailwind CSS 4 / PostCSS
- Contentlayer 2（MDX 内容）
- Pliny（搜索、分析、RSS 等配套）

## 本地开发
1. 推荐 Node.js ≥ 18 且启用 Corepack：
   ```bash
   corepack enable
   corepack prepare yarn@3.6.1 --activate
   ```
2. 安装依赖并运行：
   ```bash
   yarn install
   yarn dev
   ```
3. 访问 http://localhost:3000 验证页面。
4. 构建前运行：
   ```bash
   yarn build
   ```

## 目录速览
- `app/`：App Router 页面（首页、Blog、Tags、Projects/Tools、About）。
- `components/`、`layouts/`：UI 与布局组件。
- `data/`：站点配置、导航、作者信息、MDX 文章。
- `public/static/images/`：Logo、OG 图、文章图像（例如 `quiet-fidget-toys/`）。
- `docs/`：品牌简报、模板清理清单、内容路线图（新增）。

## 内容与品牌待办
- [ ] `data/projectsData.ts` 添加工具/模板条目或暂时隐藏 Projects 页面。
- [ ] `public/static/images/twitter-card.png`、`public/static/favicons/*` 按新 Logo 重新导出。
- [ ] `data/siteMetadata.js` 中的社交链接、Analytics、Newsletter/Giscus 在上线前补齐真实配置。
- [ ] 根据 `docs/content-roadmap.md` 发布下一批文章（如 study system、desk setup、body doubling 等）。

## 部署
1. 运行 `yarn build` 确认 Contentlayer 产物正常。
2. 将仓库连接到 Vercel（或自选平台），默认 GA4 ID 为 `G-SHQD9JY8DJ`，如需切换请设置 `NEXT_PUBLIC_GA_ID` 环境变量，并按需补充 Buttondown、Umami、Giscus 等服务。
3. 部署后检查 OG Card、favicon、站点导航与订阅 CTA 是否符合最新品牌规范。
