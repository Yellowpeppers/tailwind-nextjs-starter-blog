# NeuroHacks Lab SEO 优化方案

> 目标：强化关键着陆页的可抓取性、元数据一致性与结构化数据，提升 Google/Bing 收录和展示质量。

## 现状诊断

1. **Canonical/Open Graph URL 统一指向 `./`**  
   多数页面（列表、标签、隐私政策等）继承 `app/layout.tsx` 中的相对 canonical，搜索引擎无法区分唯一 URL。
2. **核心转化页缺少独立 metadata 与结构化数据**  
   ADHD Test 页面为 client 组件无法导出 `metadata`，Focus Lab 仅有标题/描述且无 `SoftwareApplication` Schema。
3. **站点地图与 RSS 覆盖面不足**  
   `app/sitemap.ts` 仅列出部分静态路由，RSS 只输出 Guides，导致辅助工具页难以纳入抓取节奏。

## 优化任务拆解

| 编号 | 任务                                                                                                         | 影响范围                                            | 状态      |
| ---- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------- | --------- |
| T1   | 重构 `genPageMetadata`，接受 `path` 并生成绝对 canonical/openGraph URL；更新所有调用方                       | 全站静态页面（/guides, /tags, /privacy, /about 等） | ✅ 已完成 |
| T2   | 将 `/test` 页面拆分为 Server + Client 组件，补充 metadata、FAQ/Quiz JSON-LD                                  | `/test`                                             | ✅ 已完成 |
| T3   | 扩展 Focus Lab metadata（canonical、og:image、keywords）并注入 `SoftwareApplication` Schema                  | `/focuslab`                                         | ✅ 已完成 |
| T4   | 更新 `app/sitemap.ts`（新增 privacy、tools/\* 等）及 `scripts/rss.mjs`（防止空列表错误、保持 tag feed 完整） | 站点地图 & RSS                                      | ✅ 已完成 |
| T5   | 将 `FocusLabDashboard` 改为 `next/dynamic` 懒加载，减轻首屏主线程压力                                        | `/focuslab`                                         | ✅ 已完成 |
| T6   | CSP 白名单加入 `https://va.vercel-scripts.com`，消除 Lighthouse 的 Vercel Analytics 阻断报错                 | `/focuslab` + 全站脚本加载                          | ✅ 已完成 |
| T7   | 为 Focus Lab 的图标按钮补充 aria-label（含中英文），通过 Lighthouse 无障碍检查                               | `/focuslab`                                         | ✅ 已完成 |

## 完成标准

- 所有静态页面在 HTML `<head>` 中呈现唯一 canonical，OG/Twitter `url` 指向同一地址。
- `/test`、`/focuslab` 在 Lighthouse “结构化数据” 检查中可见新增 Schema。
- `npm run build` 会生成覆盖新增路由的 `sitemap.xml` 与 RSS，不报错。
- 文档更新后，Search Console 可提交新的 sitemap 以触发重新抓取。

## Focus Lab Lighthouse 反馈

- **减少 JavaScript / 未使用 JavaScript**：当前 Dashboard 仍需一次性加载噪音面板、番茄钟、多巴胺菜单等 client 组件约 400KiB。`FocusLabLazy` 已拆出主 chunk，进一步拆分子组件会在“深度性能拆分”待办中处理。
- **阻止 bfcache**：Lighthouse 在 `localhost` 下因 `cache-control: no-store` 与 WebSocket（Next dev server）判定无法回填，生产静态部署不会复现，无需额外操作。
- **缺少 meta 描述**：`app/focuslab/page.tsx` 已通过 `genPageMetadata` 输出描述，实测 `npm run build && npm run start` 时页面源代码存在 `<meta name="description">`，视为 dev 模式误报。
- **Content Security Policy**：新增 `https://va.vercel-scripts.com` 到 `script-src`，使 Vercel Analytics 能注入而不触发行级错误。
- **按钮无可访问名称**：Brain Dump 添加/删除按钮、提示关闭按钮等均补上 `aria-label` 并同步中英文翻译，屏幕阅读器不再读出“按钮”。

## 下一步计划

**近期需验证**

1. 运行 `npm run build` 并复查 Lighthouse / Search Console，确认 canonical、Schema 以及懒加载后的 Focus Lab 都被正确识别。
2. 更新 Search Console 中的 sitemap 提交记录，跟踪新的抓取与索引日志。

**后续待办（较大改动）**

1. 双语落地：规划 `/zh` 等独立路由，输出 `alternates.languages` 与 hreflang，彻底消除页面混用语言的问题。
2. 深度性能拆分：继续把 `/test`、`/focuslab` 的子组件（噪音、番茄钟、AI Task 等）拆成按需 chunk，并结合 `prefers-reduced-motion`/Intersection Observer 进一步降低 TBT/INP。
3. 监控调整：结合 GA4 / Search Console 数据，定期评估关键词表现、内部链路与用户行为，按月迭代内容与结构。
