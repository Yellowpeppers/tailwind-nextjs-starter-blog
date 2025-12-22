# FocusLab 重构计划（性能 + 动效）

分支：`focuslab-refactor-plan`  
目的：为 Dashboard 提供更好的性能、可维护性和动效/皮肤扩展能力。

## 路线图与状态

- [x] 路由拆分：`/focus-lab`（Landing）与 `/focus-lab/app`（Dashboard），重型弹窗/图表 `next/dynamic` 懒加载。**进度**：已新增 `/focuslab/app` 路由；Landing 改为跳转，不再在同页加载 Dashboard；Dashboard 仍采用动态导入。
- [x] 布局替换：引入成熟网格（优先 `react-grid-layout`），设定 max-width + 栅格列宽 clamp + min-width，桌面/平板/移动三套预设。**进度**：Dashboard 已改用 `react-grid-layout`，布局读写统一到 settings（带 debounce）；新增防御逻辑避免拖拽/隐藏导致布局丢失或堆叠，显示/隐藏通过 hidden_cards 集合管理；移动端继续堆叠布局。
- [x] 卡片外壳：提炼 `CardShell`（Header/Actions/Body slots + motion variants + 主题 tokens），迁移现有卡片；动效通过 `animationPreset`/`motionEnabled` 配置。**进度**：已统一为 `CardShell` 组件，接入主题 token 与动效预设，并在设置新增动效开关/预设切换；同步更新首页视觉快照并通过 E2E。
- [ ] 数据层统一：React Query/SWR 封装 Supabase，IDB 缓存（localforage）+ BroadcastChannel，同步节流/批量提交；统一 CRUD/sync 模块，删除策略改软删/延迟清理。**进度**：Focus Station、ToDo、Brain Dump、Dopamine 均接入 IndexedDB + BroadcastChannel + 本地时间戳回填，保持 Supabase 同步与多标签一致性；软删/节流/批量提交待补。
- [ ] 动效与弹窗：`useCelebration`（烟花/奖励）按事件触发，重动画分片加载；Modals 统一到 `components/focus-lab/modals/*`。**进度**：新增 `useCelebration` 并接入目标达成奖励触发；弹窗归一与重动画分片待处理。
- [ ] 迁移体验：迁移完成刷新查询而非整页 reload，展示去重/合并策略；移动端堆叠布局验证。
- [ ] 验收与测试：功能回归（卡片 CRUD/拖拽/云同步/语言主题/弹窗）、性能对比（首屏 JS 体积、TTI、拖拽/输入流畅度）。

## 说明

- 先瘦首屏和布局，再抽卡片外壳与数据层，最后接入动效。每个阶段完成后在此文档勾选并补充要点/风险。

## 烟花特效

- 参考这个网址：https://21st.dev/community/components/magicui/confetti/default

## Sidebar侧边栏

- 参考这个网址：https://21st.dev/community/components/aceternity/sidebar/default
