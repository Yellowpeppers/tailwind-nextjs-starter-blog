# 模板遗留项与品牌替换清单

## 必改元数据
- `data/siteMetadata.js`：确认 `title/description/siteUrl/siteRepo/headerTitle` 与品牌一致；替换社交链接（mastodon/x/linkedin/instagram 为空的填真实/或删）；`siteLogo`、`socialBanner` 指向新资产；`language` 与 `locale` 设定。
- `data/headerNavLinks.ts`：改为最终导航（例如 Guides/Reviews/Tools/Tags/About）。
- `data/authors/default.mdx`：头像路径、作者名/头衔，如有团队成员再新增文件。
- `app/layout.tsx` 内的 favicon 路径已指向 `/static/favicons/*`，但内容仍是默认图标，需要替换实际文件。

## 品牌与商标设计（方向建议）
- Logo：考虑 “NH” 单线条连体字，辅以一条轻微波形（暗示神经信号/注意力波动）；或使用圆角六边形包裹圆点轨迹。
- 色彩：主色建议 #0EA5E9（冷静蓝）+ #0F172A（深底）+ 暖米色 #F5EBDD 作平衡；标签/链接可少量点缀紫色 #7C3AED。
- 社交卡片：`public/static/images/twitter-card.png`、`siteMetadata.socialBanner`、OpenGraph 预览图需要替换成新版品牌（建议包含标题、标语、域名、Logo）。
- Logo 文件：`data/logo.svg`（当前是默认蓝色梯度），`public/static/images/logo.png` 也要更新。
- Favicon：替换 `/public/static/favicons/*`，保持齐全尺寸（16/32/apple-touch-icon/safari-pinned-tab）。

## 内容与功能开关
- Newsletter：`siteMetadata.newsletter.provider` 现在是 `buttondown`，需在 `.env` 配置对应 key；如暂不用，设为空关闭组件。
- 评论：`giscus` 环境变量为空会导致评论挂载失败；确认 repo/category 后再启用，否则临时设 `provider: ''` 关闭。
- Analytics：`umami` id env 未填；决定是否用 Umami/Google/其他并更新 CSP。
- `data/projectsData.ts`：目前为空，若无项目展示可隐藏入口或添加待测工具集合。
- README：仍是模板描述，需改成项目介绍（品牌说明、运行方式、内容指南）。
- 博文：`data/blog/best-quiet-fidget-toys.mdx` 含 “Insert Amazon Link” 占位；发布前插入真实链接或去掉占位文本；检查日期 `2025-11-21` 是否符合预期。
- 标签页：`app/tag-data.json` 由 Contentlayer 生成，但发布新标签后记得跑 `yarn build` 以刷新。

## 体验/可访问性
- 站点导航与页脚：确认导航条目顺序、页脚版权和社交链接是否匹配品牌；如有隐私条款/免责声明需加链接。
- 图片替换后补充 `alt` 描述，尤其是测评截图和社交卡片。
- 颜色对比度：若采用新的色板，检查按钮/文本对比达到 WCAG AA。

## 代码与依赖
- 当前字体 `Space Grotesk`（见 `app/layout.tsx`），若要换字体需同步更新 `--font-space-grotesk` 变量名和全局 class。
- Tailwind v4 使用 `@tailwindcss/postcss`，无 `tailwind.config` 文件；若要自定义主题颜色/阴影，需要新建配置并在 `postcss` 流程中引用。
