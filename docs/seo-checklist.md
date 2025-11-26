# Quiet ADHD SEO 工作计划 Checklist

## 1. 基础设置（Week 1）
- [ ] 确认站点地图 `public/sitemap.xml` 已重新生成并提交至 GSC。
- [ ] 复查 `robots.txt`，确保 `/search.json` 与静态资源可被抓取。
- [x] 在 GA4 中创建自定义事件 `quiet_toolkit_download`，映射为转化目标。（CTA 已触发 `gtag('event', 'quiet_toolkit_download')`）
- [ ] 建立 Bing Webmaster + IndexNow（降低新文章收录延迟）。

## 2. 关键词与内容集群（Week 1-2）
- [ ] 为 “Quiet Desk / Quiet Toolkit / Body Doubling / ADHD Routine / Classroom Sensory” 建立 5 个主题集群卡片（关键词、意图、竞争对手）。
- [x] 将每个 MDX Frontmatter 内新增 `seoKeywords` 字段，保持 3–5 个语义关键词。
- [ ] 在 `data/tags`（或 Tags 页）添加新的聚合标签：`Quiet Desk`, `Morning Systems`, `Classroom Toolkit`。

## 3. 页面优化动作（Week 2-3）
- [x] 为文章 #1 添加 FAQ Schema（基于 Markdown FAQ 区块）并验证 Rich Results。
- [ ] 统一 `summary` 字段长度 150–160 字，含核心关键词 + 行动句。
- [ ] 构建“Quiet Toolkit”专题页，聚合所有相关内链。
- [ ] 每篇文内至少 3 条内部链接：前文、相关文章、CTA 页。
- [ ] 设置出站链接规范：引用研究或产品时加 `rel="sponsored"`（如联盟链接）。

## 4. CTA 与转化（Week 3）
- [ ] 设计统一的“Quiet Toolkit”表单组件，支持 UTM 参数。
- [ ] 在 CTA 后加入 3 个信任要素（科研背景、用户反馈、隐私声明）。
- [ ] 建立 A/B 标题测试列表（痛点 vs 结果）并记录 GA4 UTM。

## 5. 分发与外链（Week 4+）
- [ ] 安排 2 篇客座/引用投稿（LinkedIn Newsletter、Medium）指向 Quiet Toolkit 页。
- [ ] 联系 3 位 ADHD 工具类通讯作者交换资源链接。
- [ ] 为 Reddit/Discord 社区准备精简版 Quiet Desk Audit（非推广，侧重价值）。

## 6. 监测与复盘（持续）
- [ ] 每周记录：关键词排名（Top 20）、点击、展示、Toolkit 下载数。
- [ ] 每月复盘：哪类内容带来最高停留 + 转化，决定下一批主题。
- [ ] 每季度清理过期链接或不可用产品，保持页面可信度。
