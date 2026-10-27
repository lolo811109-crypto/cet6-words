# 网站改动方案：学习路线 + 每日三件小事

> 原则：不接 AI、不注册登录，数据全部存在浏览器 localStorage（沿用现有 `word-atlas:*` 存储与备份/恢复）。本文只是方案，未改动、未部署网站。

## 一、现状（读过代码后）
- 技术栈：Vite + React 19 + TypeScript，hash 路由（`src/lib/router.ts`：today / atlas / learn / practice / me / about）。
- 进度存储：`src/store/store.ts` 的 `Progress`（cards 记忆卡、days 每日统计、mistakes 错词列表）和 `Settings`（含 `dailyNew` 每日新词数，默认 10），已写入 localStorage，并支持导出/导入备份。
- 「你的星空」在 `src/pages/Me.tsx`（连续天数、已点亮、长期记住、正确率）；星图引擎在 `src/galaxy/`。
- 首页是 `src/pages/Today.tsx`，学习流程在 `Learn.tsx`、`Practice.tsx`。

## 二、学习路线
- 可选路线：**冲刺30天**（约 71 词/天）、**稳扎稳打60天**（约 36 词/天）、**自定义**（选考试前天数）。2118 词按难度/词频顺序切成每天一批。
- 改动：
  - `store.ts`：`Progress` 加 `route?: { id: "sprint30"|"steady60"|"custom"; start: string; days: number; done: string[] }`，并更新 `sanitizeProgress`（旧数据兼容）。
  - 新增 `src/store/route.ts`：根据开始日期算“今天第几天、今天这批词 id”，落后时把未完成批次顺延。
  - `Onboarding.tsx` 加一步“选路线”；`Today.tsx` 顶部显示“第 N/30 天 · 今日 71 词”和进度条（可复用 `ui/Ring.tsx`）；学完自动打勾。
  - `Learn.tsx` 取新词时优先用路线当天的那批，`dailyNew` 跟随路线。
- 工作量：约 1.5–2 天。

## 三、每日三件小事
1. 背 20 个新词（读 `days[今天].n ≥ 20`，开路线时按路线数量）
2. 复习 10 个错词（从 `mistakes` 取 10 个做一轮小测，复用 `Practice.tsx`）
3. 用今天的词造一句话（文本框，只做本地保存；简单检查句子里含今天的词，不评分、不接 AI）
- 三件全完成 → 在「你的星空」点亮一颗“任务星”，连续完成形成星座。
- 改动：
  - `DayStat` 加 `tasks?: { learn: boolean; review: boolean; sentence?: string }`。
  - 新增 `src/ui/DailyTasks.tsx` 卡片，放在 `Today.tsx` 首屏。
  - `Me.tsx` 统计条加“任务星 N 颗”；`galaxy/Galaxy.tsx`（或 `layout.ts`）加一层任务星（不加光晕粒子，和现有风格一致）。
  - 造句列表可在 `Me.tsx` 里回看（“我的句子本”）。
- 工作量：约 1.5 天。

## 四、合计与顺序
- 总计约 3–4 天（含测试 `store.test.ts` 补用例、手机端适配）。
- 建议顺序：先上「每日三件小事」（改动小、见效快），再上「学习路线」。
- 风险：老用户数据要兼容（sanitize 默认值）；localStorage 换手机/清缓存会丢，提示用户用“导出备份”。
