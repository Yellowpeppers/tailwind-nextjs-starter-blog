# NeuroHacks Lab 多语言建设方案

## 1. 现状评估

- **默认语言是英文。** `data/siteMetadata.js` 与 `app/layout.tsx` 指定 `language: 'en-us'`，Open Graph、`<html lang>`、`siteMetadata.description` 等也全部为英文。
- **已有字典与零散中文落地。** `data/locale/dictionary.ts`、`components/HomeContent.tsx`、`app/focuslab/FocusLabDashboard.tsx` 等文件已经准备了 `en/zh` 句柄，并通过 `LanguageContext` 控制前端文案，但只是客户端切换。
- **缺失路由级多语言能力。** `next.config.js` 未配置 `i18n`，`app` 目录没有 `[locale]` 动态层，浏览器地址始终是英语 URL，也没有 `hreflang`、`alternate` 等 SEO 信号。
- **内容层尚未区分语言。** Contentlayer 的文章、作者 frontmatter 没有 `locale` 字段，也没有按照语言进行目录划分，导致中文/英文文章混在一起，搜索引擎无法只抓取中文版本。
- **用户体验限制：** 现在的切换按钮只是在客户端换字典（不改 URL、不持久化服务器渲染），因此：
  - 搜索引擎只会看到默认的英文文案。
  - 进入特定页面（如 `/focuslab`、`/test`）时无法直接访问中文版本。
  - Share 链接无法保证语言，影响传播。

## 2. 目标与成功标准

1. **URL 层面的多语言：** 为至少 `en`（默认）和 `zh`（中文）提供独立路径，如 `/en/...`、`/zh/...` 或 `neurohackslab.com/zh/...`，并保留无前缀时自动跳转默认语言。
2. **SSR 可见的翻译：** 所有首屏关键内容（首页、ADHD 测试、Focus Lab、隐私、博客列表等）在服务器渲染时就输出对应语言，确保搜索可见性。
3. **SEO 完整度：** 输出 `hreflang`、语言版 sitemap、`<html lang>`、结构化数据语言字段等，中文关键词可在国内/国际搜索引擎中被索引。
4. **内容编辑流程：** 能够独立维护不同语言的文案/文章（Contentlayer frontmatter + Markdown），本地开发时可以容易地切换和校对。
5. **体验一致：** 交互组件（Focus Lab、Test）保持功能无回归，语言切换会更新 UI 状态且记忆用户偏好。

## 3. 技术方案

### 3.1 路由与配置

1. **开启 Next.js i18n：** 最初通过 `next.config.js` 启用，但与强制 `/en` 路径的自定义 middleware 产生重定向循环，已回退至“纯 middleware + app/[lang]”方案（Next 内置 i18n 关闭）。
2. **App Router 重构：** ✅ 已完成（`app/[lang]` 动态路由 + `LanguageProvider` 接收 `locale`，`html lang`/`hreflang` 同步）
   - 将根目录变为 `app/[locale]/layout.tsx`、`app/[locale]/page.tsx` 等，通过 `generateStaticParams` 预渲染两种语言。
   - 在 `app/[locale]/layout.tsx` 中设置 `<html lang={locale}>`，并把语言参数注入 `LanguageProvider`（或新的 `TranslationProvider`）。
3. **语言切换 URL 化：** ✅ 已完成（`LanguageSwitch` 依据当前路径与 query 拼接另一语言 URL，并落盘到上下文）。

### 3.2 翻译资源加载

1. **按语言拆分字典：** ⚠️ 待办——目前仍集中在 `data/locale/dictionary.ts`，可在下一阶段拆分为 `data/locale/{lang}.ts` 并采用动态导入以减轻 bundle。
2. **上下文策略：**
   - 服务器组件（如首页 `page.tsx`）在 `async` 函数中拉取 `t`，通过 props 传递给子组件。
   - 客户端组件（Focus Lab 等）继续使用 `LanguageContext`，但默认值由路由传入，并在 `useEffect` 中监听 URL 语言。
   - ✅ 首页、Guides、Tags、Privacy 等服务器组件已经通过 `getDictionary` 注入文案，Focus Lab/Test 仍使用上下文保持交互体验。
3. **回退机制：** 没有翻译时可自动回退到英文，保证页面不会渲染空白。（✅ `lib/posts.ts` 提供 `getLocalizedPosts`，`ListLayout`/`tag-data` 会在中文缺失时回退到英文内容并给出同一 URL 结构。）

### 3.3 内容层与数据

1. **Contentlayer 扩展：** ✅ 已为全部 `guides/*.mdx` 添加 `locale` 字段，`contentlayer.config.ts` 计算 `app/tag-data.json` 时也按语言归档。
2. **列表过滤：** ✅ `app/[lang]/guides`、`/tags`、首页博客区与 sitemap 均依据 `locale` 过滤内容，若无对应语言则回退默认英文。
3. **作者/FAQ 等 MDX：** ✅ About 页读取 `default.mdx/default-zh.mdx`，FAQ、工具页、Focus Lab/Test 统一走字典渲染。

### 3.4 SEO 与基础设施

1. **`generateMetadata`/`metadata` 更新：** 根据语言输出 title/description/keywords，设置 `alternates.languages = { en: '/en', zh: '/zh' }`。✅ 已完成
2. **Sitemap & Robots：** 更新 `app/sitemap.ts`，为每个路由生成双语言入口，在 `robots.txt` 中注明默认语言策略。✅ 已完成
3. **`hreflang` & canonical：** 在布局或 `generateMetadata` 中统一注入 `link rel="alternate" hreflang="...">` 标签。✅ 已完成
4. **分析与埋点：** 若需区分语言，在 GA/Clarity 中传递 `locale` 维度，方便统计。

### 3.5 交互模块兼容

1. **Focus Lab / 测试体验：** 这些是客户端组件，需确保
   - 初始化语言来自 URL（而非 `localStorage`），`localStorage` 只做记忆。
   - 多语言 content（如多巴胺菜单默认项）根据 `locale` 加载正确数组，并在语言切换时同步 UI。
2. **Edge 功能 / API：** 若后续提供服务端 API（如 AI 任务拆解），需要把 `Accept-Language` 或 `locale` 参数向下传递，便于生成对应文本。

## 4. 任务拆解与优先级

1. **阶段 0：准备**
   - 确认首批需要完整翻译的页面与内容。
   - 建立术语表，锁定 SEO 关键词（中文/英文）。
2. **阶段 1：框架改造（约 0.5~1 天）**
   - 配置 `i18n`。
   - 构建 `app/[locale]` 路由，迁移现有 `layout.tsx`/`page.tsx`。
   - 改造 `LanguageProvider` 使其接受 `locale` prop。
3. **阶段 2：核心页面翻译（约 1~2 天）**
   - 首页、Focus Lab、ADHD 测试入口等使用新的 `getDictionary`。
   - LanguageSwitch 切换 URL。
   - 更新 `Header/Footer` 导航。
   - ✅ 当前首页 Hero/Resource Hub、Focus Lab、Test、Privacy、Guides/Tags 已完成多语言渲染与 URL 同步。
4. **阶段 3：功能模块与动态内容（约 2 天）**
   - Focus Lab 客户端组件、测试问卷、FAQ、表单等全部接入字典。
   - Contentlayer 文章增加 `locale` 过滤。
   - 微工具页（如 `/tools/dopamine-menu`、`/tools/noise`）接入多语言路由与翻译。✅ 已完成
5. **阶段 4：SEO & 运维（约 0.5 天）**
   - `sitemap.ts`、`robots.ts`、`generateMetadata`、`app/robots.ts` 等多语言更新。
   - 校验 `hreflang`、`canonical`、`alternate`，并更新分析工具。
6. **阶段 5：QA 与发布（约 0.5 天）**
   - 本地/预览环境测试两种语言的所有主要流程。
   - 手工检查 Lighthouse i18n 提示、Open Graph 预览、schema。

> **总工期估算：** 约 4~5 个工作日（取决于翻译产出速度）。若只有你一人，建议分两周完成：第一周完成框架与首页翻译，第二周覆盖内容与 QA。

## 5. 资源与成本建议

- **翻译资源：** 初期可自行翻译重点页面，其余可结合术语表 + GPT 起草 + 人工润色。若要同时上线较多长文，建议寻求兼职译者。
- **测试投入：** 需在桌面/移动浏览器各跑一遍，以确保路由、语言记忆、深色模式与 SEO 标签无误。
- **后续扩展：** 方案支持再添加语言（如 `ja`、`de`），仅需在 `locales` 列表中增加并提供相应字典与内容即可。

### 未完事项（下一步）

- 拆分 `data/locale/dictionary.ts` 为懒加载字典，避免客户端一次性打包所有语言。
- 文章正文及 SEO 长描述仍是英文，可在内容翻译后为 `locale: 'zh'` 的条目单独生成路径。
- 阶段 5 QA：待跑通全站两种语言的手动测试，并在文档中记录检查清单。
- 扩展更多语言（如 `ja`、`es`）：在 `lib/i18n.ts` 与字典中登记语言代码，补充翻译，并确保 `LanguageSwitch`/sitemap/middleware` 支持新 locale。

---

该计划完成后，可按阶段提交 PR，确保每个阶段都可独立发布并快速回滚。如需进一步拆分任务或编写执行 checklist，可在本文件基础上追加子文档。
