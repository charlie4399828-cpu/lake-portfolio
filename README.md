# Lake 作品集落地页（Hero-Program）

深色主题作品集：React 18 + TypeScript + TailwindCSS + Framer Motion + lucide-react + Three.js。

## 运行

```bash
npm install
npm run dev    # http://localhost:5173
npm run build
```

## 协作规则（少爷专用）

- 后续对话中必须称呼用户为 **「少爷」**。
- 每次代码改动后，必须同步更新本文档的「变更记录」章节。
- 若忘记称呼，请自觉重读本文档，恢复上下文。

## 技术栈

- react 18.3.1 / react-dom 18.3.1
- framer-motion 12.x（FadeIn / AnimatedText / 粘性堆叠卡片 / 弹窗动画）
- three 0.128（Three.js r128 星云背景）
- lucide-react 0.344（图标）
- tailwindcss 3.4.1 + vite 5 + typescript 5

## 页面结构

LakeSection（全屏 Hero）→ MarqueeSection（21 图双行滚动）→ AboutSection → ProjectsSection（粘性堆叠卡片）→ ResourcesSection（我的资源网格卡片）→ ProjectDetail（hash 路由 `#/project/N`）。

全局：Three.js 星空背景（fixed，6000 蓝色粒子，1200³ 空间，相机 z=220，y+=0.0012 / x+=0.0004 每帧）。

## 核心文件

| 文件 | 说明 |
|---|---|
| `src/data/cloud.ts` | **Supabase 云端同步**：访客拉云端 JSON / 编辑保存走密码云函数（昌隆同项目独立表） |
| `supabase/functions/save-lake-site/index.ts` | Edge Function：校验密码后写 lake_content 表 |
| `supabase/schema-lake.sql` | 建表 SQL（lake_content 单行 JSON，RLS 公开读 / 禁止直接写） |
| `src/data/content.ts` | 内容数据源：云端 → 本机草稿（按时间戳取新）→ content.json → 默认值 |
| `public/content.json` | 静态兜底内容（云端不可用时使用） |
| `scripts/gen-content.mjs` | 从代码默认值生成 content.json（`npm run gen:content`） |
| `src/data/images.ts` | 图片资源（当前为 AI 生成占位图，可替换） |
| `src/context/ContentContext.tsx` | 内容 Context（草稿优先 / 访客拉发布 / reset 回线上） |
| `src/components/ContactButton.tsx` | 渐变药丸按钮 → 打开联系弹窗 |
| `src/components/ContactModal.tsx` | 联系方式弹窗（邮箱/电话/微信号/二维码 + 复制） |
| `src/components/EditorModal.tsx` | 内容编辑弹窗（密码保护） |
| `src/components/BackToTop.tsx` | 回到顶部悬浮按钮 |
| `src/components/Starfield.tsx` | Three.js 星空背景 |
| `src/components/FadeIn.tsx` / `AnimatedText.tsx` | 入场动画 / 逐字滚动亮起 |
| `public/wechat-qr.svg` | 微信二维码占位图（少爷请替换为真实二维码） |

## 变更记录

### 2026-10-11（第 14 轮 · Supabase 云端内容，对齐昌隆方案）
1. 方案对齐 `D:\Code\ChangLong-web`：Supabase 云端存全站 JSON，密码保护的 Edge Function 写入，**任意访客自动加载云端最新内容**，localStorage 仅作缓存。复用同一 Supabase 项目 `ghyvptwooesjvtwfljfz`，独立表 `lake_content` + 独立函数 `save-lake-site`，与昌隆互不影响。
2. 新增 [src/data/cloud.ts](src/data/cloud.ts)：REST 公开读（apikey sb_publishable_…）+ POST 云函数保存（密码 763560，由函数端校验）。
3. ContentContext 加载策略：云端内容 vs 本机草稿按 `_cmsUpdatedAt` 取新；云端不可用 → 静态 `content.json` → 代码默认。
4. 编辑弹窗主按钮改为「**保存并发布**」：本机立即生效 + 同步云端（同步中状态/失败可重试），成功后所有访客刷新即见，无需部署。
5. Supabase 资源：`supabase/schema-lake.sql` 建表脚本；`supabase/functions/save-lake-site/` 函数源码（Deno）。
6. 待办（依赖少爷）：目标 Supabase 项目当前 **INACTIVE（被暂停）**，需在 Dashboard 点 Restore 恢复；恢复后部署函数并在 SQL Editor 执行建表脚本。
7. tsc + 10 单测通过。

### 2026-10-11（第 13 轮 · 一键发布修复）
1. 问题：第 12 轮的「发布内容」在浏览器里只能**下载** content.json 到下载目录，不会写回项目，导致 `npm run deploy` 部署的仍是旧文件，访客看不到修改。
2. 修复：[vite.config.ts](vite.config.ts) 新增 dev-only 中间件 `POST /__api/publish`，直接把 JSON 写入 `public/content.json`（仅本地 dev server 存在，不进生产包）。
3. 编辑弹窗「发布内容」在本地开发环境一键直写项目文件（有"发布中…"状态）；线上环境才降级为下载并提示手动放回。
4. 实测：POST 标记内容 → 文件内容变为标记 → gen:content 还原，闭环通过；10 单测 + 构建通过。
5. **正确发布姿势**：在本地 `http://localhost:5173/lake-portfolio/` 编辑（不要在线上站编辑）→ 保存 → 发布内容（直写 public/content.json）→ `npm run deploy`。若之前是在线上站编辑的，草稿在该域 localStorage，需在该页发布得到下载文件后放回项目 public/。

### 2026-10-11（第 12 轮 · 内容发布机制）
1. **访客自动看到已编辑内容**：新增 `public/content.json` 作为随站点部署的已发布内容。加载优先级：本机 localStorage 草稿（仅少爷本机预览）→ content.json（所有访客）→ 代码默认值。ContentProvider 启动时无草稿即 fetch（`cache: no-cache`）。
2. 编辑弹窗底部按钮调整：「导出」→「**发布内容**」（生成固定名 content.json；Chrome/Edge 走 File System Access API 可直接覆盖项目 public/，其他浏览器降级下载）；「恢复默认」→「**清除本机修改**」（清草稿后回显线上发布内容）；「导入」保留为本机备份恢复。
3. `normalizeContent` 统一处理：默认值深合并、旧版 col1/col2 迁移、本地图片路径自动补 BASE_URL（幂等，GitHub Pages 子路径下 `/xxx.png` → `/lake-portfolio/xxx.png`，外链原样）。
4. 新增 `npm run gen:content`（esbuild 从 DEFAULT_CONTENT 生成初始 content.json）。
5. **发布工作流**：编辑保存（本机看效果）→ 点「发布内容」存 content.json → 覆盖 `public/content.json` → `npm run deploy`，全网访客生效。
6. 验证：10 单测 + 构建通过；浏览器实测清草稿后访客自动 fetch content.json（4 项目/1 资源/63 滚动图正常渲染）、发布按钮就位。

### 2026-10-11（第 11 轮）
1. 新增全局图片放大 [Lightbox.tsx](src/components/Lightbox.tsx)：任意带 `data-zoomable` 的 `<img>` 点击后全屏放大（捕获阶段监听 + stopPropagation，不与卡片跳转/链接冲突；Esc / 点遮罩 / X 关闭）。已挂载：人像、项目卡所有图、详情页主图+细节图、资源配图（Marquee 因拖拽冲突不加）。
2. 编辑弹窗图片缩略图预览：新增 `Thumb` 组件（加载失败显示"无图"占位），图片列表每行左侧显示缩略图；单图字段（二维码路径 / 人像图片 / 资源配图）通过 `Field preview` 显示缩略图。
3. 编辑弹窗底部新增**导出 / 导入** JSON 配置按钮，解决"换一个浏览器内容为空"（localStorage 不共享）的问题：导出 `lake-content.json` → 另一浏览器导入即可。
4. 验证：构建 + 10 单测通过；浏览器实测人像点击放大/关闭、项目卡 3 行缩略图、人像/二维码缩略图、导出导入按钮全部通过。

### 2026-10-10（第 10 轮）
1. Marquee 滚动图改为**自动无限循环滚动**（RAF 每帧 0.45px）+ **拖拽跟随手指**（pointer 事件），不再依赖页面滚动驱动，用户不滑也能看见图；保留垂直滚动视差叠加。
2. 项目卡 2 图布局改为 **左 40% + 右 60%**（第 1 张为大图），匹配红框预期；大图位置切换按钮下放到 **2+ 张即可用**（不仅是 3+ 张）。
3. 图片编辑器提示文本同步：2 图时显示"第 1 张为大图 60%，第 2 张 40%，可切换左右"。
4. 验证：自动滚动持续右移 74px/s、拖拽跟随 322px、2 图 39/59 宽度比全部通过。

### 2026-10-10（第 9 轮）
1. Marquee 滚动图接入编辑体系：数据层新增 `marquee: string[]`，MarqueeSection 从 ContentContext 读取并动态分行（前一半第 1 行向右、后一半第 2 行向左），编辑弹窗新增「Marquee 模块」区：增删图片/上下调序。
2. 项目卡片图片布局重构：
   - 1 张 → 全宽；2 张 → 左右并排（各 50%，竖图友好）；3+ 张 → 一大 + 其余小图堆叠。
   - 新增 `bigSide?: 'left' | 'right'`，3+ 张时第 1 张为大图位置可切换（编辑弹窗内按钮组"右侧 / 左侧"）。
3. 编辑弹窗图片编辑器抽取为 `ImageListEditor` 复用组件（项目卡 / Marquee 共用），减少重复。
4. 旧 localStorage 自动兼容：新增 `marquee` / `bigSide` 字段时深合并取默认值。
5. 验证：构建 + 10 单测通过；浏览器实测 Marquee 渲染 21 张×3 倍复制、编辑弹窗结构、大图左右切换全部通过。

### 2026-10-10（第 8 轮）
1. 项目图片从固定 3 张（col1/col2）改为 `images: string[]` 任意数量：第 1 张为右侧大图（60%），其余左侧 40% 堆叠小图（一大两小的泛化）；1 张时全宽，0 张时隐藏图片区；旧 localStorage 数据自动迁移。
2. 编辑弹窗：项目卡内图片列表支持**添加/删除/上下移**（每行：大图/图N 标签 + 输入框 + 箭头 + 删除）；项目卡片、资源卡片头部均新增**上移/下移**调序按钮（端点禁用态）。
3. Hero 模块新增"人像图片"字段，主页人像可在编辑弹窗直接换地址（`hero.portrait`，含旧数据深合并迁移）。
4. 详情页：主图 = images[0]，细节图 = images[1..] 双列网格。
5. 验证：构建 + 10 单测通过；浏览器实测迁移渲染、弹窗结构（人像字段/图片行/箭头按钮）、图片增删、图序交换全部通过。

### 2026-10-10（第 7 轮）
1. 标题自适应逻辑抽离为纯函数 [fitTitle.ts](src/utils/fitTitle.ts)（`computeFitFontSize` / `fitTitleElement`，字号读取支持注入便于测试）。
2. 新增 Vitest + jsdom 单元测试 [fitTitle.test.ts](src/utils/fitTitle.test.ts) 共 10 例：不缩放/等宽/比例缩放/极端窄屏/非法输入/长标题收敛/幂等重算/无父元素容错，全部通过。
3. 部署配置：vite `base: '/lake-portfolio/'`；二维码路径改用 `import.meta.env.BASE_URL` 适配子路径；新增 `npm run test` / `npm run deploy`（gh-pages）。
4. GitHub 仓库已建：https://github.com/charlie4399828-cpu/lake-portfolio （待代理开启后完成推送与 Pages 部署）。
5. 已上线 GitHub Pages：**https://charlie4399828-cpu.github.io/lake-portfolio/**（gh-pages 分支，`npm run deploy` 一键更新）。

### 2026-10-10（第 6 轮）
1. 修复 H5/PC 两端标题排版不兼容：h1 上残留浏览器检查器写入的内联样式（width:791px、height:140px、rotate(360deg) 等），导致 PC 端文字偏左裁切、手机端偏右裁切——已全部移除。
2. 标题新增自适应收缩保护（`titleRef` + fit 函数）：任何视口宽度、任何标题长度下文字超出容器时自动按比例缩小字号，杜绝再次溢出；resize 时重新计算。
3. 移动端导航间距优化：gap-6→gap-4、px-6→px-4，5 个链接在小屏不拥挤。
4. 验证：桌面视口 h1 居中（centered=true）、文字完整在视口内、无横向滚动条、无内联样式残留，构建通过。

### 2026-10-07（第 5 轮）
1. 新增「我的资源」模块（ResourcesSection）：页面最后、Projects 之后；网格卡片（桌面 3 列 / 平板 2 列 / 手机 1 列），每卡 = 配图 + 渐变描边分类胶囊 + 资源名 + 宋体半透明简介 + "访问链接 ↗"，整卡新标签页跳转。
2. 数据层 `content.ts` 增加 `ResourceItem { name, category, desc, image, link }`，默认 1 张示例卡（前端技能 → GitHub 占位）；localStorage 同 key，旧编辑数据自动兼容。
3. 编辑弹窗新增「Resources 模块」区：资源名/分类/简介/配图/链接可改，支持添加/删除卡片。
4. 顶部导航新增第 5 个链接 "Resources"（#resources）。

### 2026-10-06（第 4 轮）
1. 编辑弹窗新增密码验证：密码 `763560`，错误提示，Enter 提交，每次打开重置验证状态（防误触）。
2. 修复移动端标题排版：移除此前浏览器检查器误加的固定宽度内联样式（width:791px 等导致竖屏溢出偏右），移动端字号改为 `text-[13vw]`，标题恢复水平居中不溢出。
3. 新增 `BackToTop`：右下角悬浮向上箭头，相对视口 fixed 浮于全页面之上；滚动超过 200px 且停止滑动 260ms 后出现；滚动中自动贴边隐藏（translate-x 70% + 透明）；点击平滑回顶；半透明毛玻璃样式。
4. 创建本 README，并约定称呼用户为「少爷」、每次改动同步更新变更记录。

### 2026-10-06（第 3 轮）
1. 「联系我」按钮改为打开联系方式弹窗（邮箱/电话/微信号/二维码，同风格渐变描边深色弹窗，带复制按钮）。
2. Hero 左下角小字三连击打开编辑弹窗：四大模块（联系方式/Hero/About/Projects）及其子字段可编辑，支持增删项目卡片数量；localStorage 持久化。
3. 项目卡片项目名下方新增一行小字介绍：半透明（white/50）、白色、宋体（SimSun）。
4. 项目卡片点击进入详情页（hash 路由），含序号、简介、标签、主图、多段详情、细节图、返回按钮。
5. 全站文本抽离到 `content.ts` 数据层 + `ContentContext`。

### 2026-10-06（第 2 轮）
1. 接入 Three.js r128 星空背景（Starfield 组件，fixed 全屏、6000 粒子、AdditiveBlending、resize 自适应、卸载 dispose）。
2. Marquee/Projects 两个 section 去除实色背景以透出星空；项目卡片保留实色 `#0C0C0C`。
3. `AnimatedText.tsx` 显式类型标注 + `offset as const`，消除 IDE 误报红线（实际 tsc/运行时零错误）。

### 2026-10-06（第 1 轮）
- 初始化项目：四章节落地页、渐变标题 `.hero-heading`、Kanit 字体、Marquee 滚动公式 `（scrollY-sectionTop+innerHeight)*0.3`、粘性堆叠卡片 scale 公式 `1-(total-1-index)*0.03`、顶部偏移 `index*28px`。
