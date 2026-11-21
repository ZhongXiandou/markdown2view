# DESIGN.md — markdown2view 设计系统

> 本文件是 markdown2view 界面视觉决策的 single source of truth。
> 任何 AI 代理或开发者在本仓库做 UI 工作，**必须先读本文件**，并复用其中定义的 token 与组件模式，不得擅自发明新的颜色、间距、圆角或字体值。
> 设计取向：**优雅为主 + 现代点缀**。详见 §1。

---

## 1. 视觉主题与气质 (Visual Theme & Atmosphere)

**产品定位**：纯前端的 Markdown / HTML 多场景渲染与导出工作台。内容（预览产物）是主角，应用外壳（chrome）是配角——外壳必须**让位**于内容，保持克制、退让、不抢戏。

**目标气质**（与 `design-system` skill 描述一致）：
- **focused**：聚焦内容渲染与导出动作
- **structured**：信息密度适中，工具栏按上下文模块化
- **gentle**：留白充足，呼吸感优先，避免局促
- **premium but restrained**：高级但不浮夸

**取向取舍**：优雅为主（留白、温润、编辑性）+ 现代点缀（等宽数字、精确圆角）。**拒绝**霓虹、毛玻璃、夸张渐变、Emoji、极致动效——这些会破坏克制气质并威胁导出稳定性。

**参照系**：Linear（精确克制）、Vercel（黑白精确）、Notion / Claude（温润留白、编辑性）、Resend（等宽点缀）。

---

## 2. 色彩系统 (Color Palette & Roles)

### 2.1 中性色：slate 冷调体系

全站统一使用 Tailwind **slate** 体系（偏冷蓝中性色），**禁止**与 `gray`（偏暖灰）混用。

| Token 角色 | Tailwind 类 | Hex | 用途 |
|-----------|-------------|-----|------|
| 文字-强 | `text-slate-800` | `#1f2937` | 标题、主文字 |
| 文字-中 | `text-slate-600` | `#475569` | 正文、按钮文字 |
| 文字-弱 | `text-slate-500` | `#64748b` | 次要说明、图标 |
| 文字-极弱 | `text-slate-400` | `#94a3b8` | 占位、禁用提示 |
| 边框 | `border-slate-200` | `#e2e8f0` | 卡片、分隔线、输入框边 |
| 边框-浅 | `border-slate-100` | `#f1f5f9` | 弱分隔（弹窗内分组） |
| 表面-白 | `bg-white` | `#ffffff` | 卡片、输入框、抽屉 |
| 表面-浅 | `bg-slate-50` | `#f8fafc` | 工具栏底、悬停态、容器 |
| 表面-灰 | `bg-slate-100` | `#f1f5f9` | 编辑/预览分栏背景、分段控件底 |
| 表面-深 | `bg-slate-800` | `#1e293b` | Tooltip、Toast |

### 2.2 主题强调色：CSS 变量 `--accent`

唯一的主强调色，运行时可切换（默认绿色）。**所有**强调用法必须引用变量，不得硬编码具体色值或 `blue`。

```css
:root {
  --accent: #27ae60;       /* 主题色，store 运行时写入 */
  --accent-soft: color-mix(in srgb, var(--accent) 8%, transparent);  /* 选中态浅底 */
}
```

| 角色 | 写法 | 场景 |
|------|------|------|
| 强调文字 | `text-[var(--accent)]` | 选中 tab 文字、链接、图标高亮 |
| 强调底 | `bg-[var(--accent)]` | 主按钮、logo |
| 强调边框 | `border-[var(--accent)]` | 选中卡片 |
| 选中浅底 | `bg-[var(--accent)]/5` | 选项卡选中态背景 |
| focus 环 | `focus-visible:ring-[var(--accent)]/30` | 输入控件键盘聚焦 |

**预设主题色板**（`@engine/composables/useTheme` 的 `THEMES`）：

| 名称 | accent | dark |
|------|--------|------|
| 翠绿（默认） | `#27ae60` | `#1e8449` |
| 海蓝 | `#2980b9` | `#1f618d` |
| 紫罗兰 | `#8e44ad` | `#6c3483` |
| 砖红 | `#c0392b` | `#922b21` |
| 琥珀 | `#d68910` | `#9c640c` |

### 2.3 语义色（仅限特定场景，不可滥用）

| 角色 | 用法 | 场景 |
|------|------|------|
| 警告 | `text-amber-600` / `bg-amber-50` / `border-amber-100` | 安全提示、注意事项 |
| 危险 | `text-red-600` | 删除等破坏性操作（当前无） |

> ⚠️ **禁止**用 `blue-*`、`emerald-*` 等语义外的具体色作为 UI 强调。强调一律走 `var(--accent)`。

### 2.4 对比度

所有正文文字组合须达 **WCAG AA（4.5:1）**。`slate-500`(#64748b) on white = 4.6:1 ✓；`slate-400` 仅用于非必要阅读的占位/装饰。

---

## 3. 字体系统 (Typography)

### 3.1 字体族

| 角色 | 字体栈 | 用途 |
|------|--------|------|
| 无衬线（正文/控件） | `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif` | 全部 UI 文字、按钮、工具栏 |
| 等宽（点缀） | `ui-monospace, 'SF Mono', 'Cascadia Code', Menlo, Consolas, monospace` | 页码、计数、状态、文件大小、技术性数字 |

**等宽点缀规则**：仅用于「技术性数字 / 计数」，如「共 12 页」「5 / 8」「1.2 KB」。**不**用于正文、标题、按钮文字。

**衬线标题（探索项，暂不实施）**：未来若引入编辑性衬线标题，仅限应用标题与次级标题，正文与控件保持无衬线。需先解决字体本地化（见 `项目优化审查报告.md`），不得引用海外 CDN。

### 3.2 字号层级（应用 chrome）

| 层级 | 字号 | 字重 | 用途 |
|------|------|------|------|
| 应用标题 | `text-[17px]` | `font-bold` | 顶栏 markdown2view |
| 选项卡 | `text-[13px]` | `font-semibold` | ModeTabs |
| 正文/按钮 | `text-[13px]` / `text-sm` | `font-medium` | 工具栏、按钮、输入 |
| 次级说明 | `text-[12px]` | `font-medium` | 表单 label、提示 |
| 极弱标注 | `text-[11px]` | `font-bold uppercase tracking-wider` | 抽屉分组标题 |

**层级约束**：应用 chrome 内标题层级 ≤ 3 级（应用标题 / 模式标题 / 次级）。

---

## 4. 间距与布局 (Layout & Spacing)

### 4.1 间距尺度（Tailwind 4px 基准）

优先使用：`1(4px) · 1.5(6px) · 2(8px) · 2.5(10px) · 3(12px) · 4(16px) · 5(20px) · 6(24px)`。

避免使用 `7`、`9`、`11` 等非标准刻度，保证节奏统一。

### 4.2 关键容器尺寸

| 元素 | 尺寸 | 说明 |
|------|------|------|
| 顶栏高度 | `h-14`（56px） | 主导航 |
| 移动端 tab | `py-3` | 编辑/预览切换 |
| 工具栏纵向 | `py-2.5`（上下 10px） | 编辑器/预览工具栏 |
| 工具栏左右 | `px-5`（20px） | 桌面端；移动端 `px-4` |
| 按钮高度 sm | `h-8`（32px） | 工具栏按钮 |
| 按钮高度 md | `h-9`（36px） | 主操作按钮 |
| 触摸目标 | ≥ 44×44px | 移动端按钮实际点击区 |

### 4.3 响应式断点（基于 headerWidth，非 CSS 断点）

顶栏内容按 `headerWidth`（ResizeObserver 实测）渐进折叠：
- `< 960`：收进移动端抽屉，显示汉堡菜单
- `≥ 960`：显示顶栏完整布局
- `≥ 1300`：显示文字标签（图床设置/恢复示例）
- `≥ 1450`：显示完整外链文字

**CSS 媒体断点**（内容区）：`md (768px)` 为编辑/预览双栏 ↔ 单栏切换点。

---

## 5. 组件样式 (Component Stylings)

### 5.1 按钮 (Button)

三个变体，全部 `rounded-md`、`transition-colors`、`cursor-pointer`：

```tsx
// 主按钮：主题色实底
variant="primary"
// bg-[var(--accent)] text-white hover:opacity-90 shadow-sm

// 描边按钮
variant="outline"
// border border-slate-200 bg-white text-slate-700 hover:bg-slate-50

// 幽灵按钮（工具栏默认）
variant="ghost"
// bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900
```

**焦点态（补齐项）**：`focus-visible:ring-2 focus-visible:ring-[var(--accent)]/30 focus-visible:ring-offset-1`。

### 5.2 图标按钮 (IconButton)

工具栏内纯图标按钮统一形态：

```tsx
className="flex items-center justify-center rounded p-1.5 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer text-slate-600"
// 图标尺寸：18×18 容器，内部 SVG 14–15px
```

**图标一律用线性 SVG**（stroke 风格，strokeWidth 2–2.5）。**禁止 Emoji**（见 §8 Don'ts）。

### 5.3 输入控件 (Input / Select)

```tsx
// Input
className="h-8 rounded-md border border-slate-200 bg-white px-2.5 text-[13px] text-slate-700 outline-none transition-colors focus:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]/30 disabled:bg-slate-50 disabled:opacity-50"

// Select 同上，px-2 py-0
```

### 5.4 分段控件 (SegmentedControl / ModeTabs)

```tsx
// 容器
className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 border border-slate-200/60"
// 选中项
className="bg-white text-[var(--accent)] shadow-sm"
// 未选中
className="text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
```

### 5.5 模态框 (Modal)

```tsx
// 遮罩
className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs"
// 面板
className="w-full max-w-lg rounded-xl border border-slate-100 bg-white p-6 shadow-2xl"
```

### 5.6 Tooltip / Toast

- Tooltip：`bg-slate-800 text-white text-[12px] rounded-md shadow-lg`，`top`/`bottom` 两种。
- Toast：`bg-gray-900/90 → 改为 bg-slate-800/90`（统一色相），`text-white text-sm rounded-lg shadow-lg`，底部居中 2.2s 自动消失。

### 5.7 复选框 (Checkbox)

```tsx
// 跟随主题色，禁止硬编码 blue
<input type="checkbox" className="accent-[var(--accent)] cursor-pointer" />
```

### 5.8 主题色板选中态

统一用**双层投影**写法（已是 MobileDrawer 的既有正确实现，AppHeader 需对齐）：

```tsx
style={{
  background: t.accent,
  boxShadow: accent === t.accent
    ? '0 0 0 2px #fff, 0 0 0 4px var(--accent)'
    : 'none',
}}
```

---

## 6. 深度与投影 (Depth & Elevation)

采用**多层柔投影**替代单层硬阴影，提升质感：

| 层级 | 写法 | 用途 |
|------|------|------|
| 极浅 | `shadow-xs` | 选中卡片内描边感 |
| 浅 | `shadow-sm` | 按钮、选中 tab、logo |
| 中 | `shadow-lg` | Tooltip、Toast |
| 深 | `shadow-2xl` | 模态框、抽屉 |
| 自定义柔投影 | `0 1px 2px rgba(0,0,0,.04), 0 4px 12px rgba(0,0,0,.06)` | phone-frame、内容卡片（替代单层） |

**分隔线**优先用更浅的 `border-slate-200`（或半透明），避免过硬的视觉切割。

---

## 7. 动效 (Motion)

**克制原则**：以 `transition-colors`（200ms）为主，不做全局动效。

- 悬停反馈：颜色过渡（已普遍）
- 抽屉/弹窗入场：`animate-fade-in`（200ms）/ `animate-slide-in-right`（250ms cubic-bezier）
- 骨架屏：A4 用 `document-breathe`（呼吸），自由画布用 `canvas-shimmer`（光泽扫过）——两种加载态需可区分
- 主按钮按压：可选 `active:scale-[.98]`（谨慎，仅主 CTA）
- **禁止**：弹簧动画、视差、自动播放的装饰动效

---

## 8. Do's and Don'ts

### ✅ Do
- 中性色统一用 slate 体系
- 强调色一律走 `var(--accent)`，支持主题切换
- 图标用线性 SVG（stroke 风格）
- 复用既有 UI 原语（Button / Input / Select / Tooltip / PreviewToolbar）
- 工具栏按模式上下文模块化，不在顶栏堆全部按钮
- 保持留白呼吸感，宁松勿紧
- 交互元素补齐 `focus-visible` 焦点环

### ❌ Don't
- **混用 gray 与 slate**（不同色相，同屏显脏）
- **硬编码 blue / emerald 等具体色作强调**（必须走主题变量）
- **用 Emoji 作 UI 图标**（渲染不一致、土味；但 `src/engine/**` 与 `src/data/**` 的内容产物 Emoji 是用户产出物的一部分，**不在本规范约束内**）
- 用霓虹、毛玻璃、夸张渐变、极致动效
- 在 chrome 引入深色模式（白底内容预览会割裂）
- 引用海外 CDN 字体（违反资源原则）
- 重构未坏的相邻代码（手术刀原则）

---

## 9. 响应式行为 (Responsive)

| 断点 | 行为 |
|------|------|
| `headerWidth < 960` | 顶栏→汉堡菜单 + 右侧抽屉；内容区单栏（编辑/预览 tab 切换） |
| `headerWidth ≥ 960` | 顶栏完整；内容区桌面双栏 |
| `md (768px)` CSS | 编辑/预览 `grid-cols-1 ↔ grid-cols-2` 切换 |
| 移动端触摸目标 | ≥ 44×44px（按钮可通过 padding 补足） |
| 横屏播放 | `@media (orientation: portrait)` 下 iframe 旋转 90°（既有逻辑，勿动） |

---

## 10. Agent 提示速查 (Agent Prompt Guide)

**快速配色**：中性色 slate / 强调 `var(--accent)` / 警告 amber / 危险 red。无 blue、无 emerald、无 gray（作为背景）。

**做按钮**：复用 `@/components/ui/Button`，三变体（primary/outline/ghost），尺寸 sm/md。

**做图标**：线性 SVG，14–16px，strokeWidth 2–2.5，currentColor。放在图标按钮里用 `p-1.5 hover:bg-slate-200`。

**做工具栏**：编辑器侧用 `EditorToolbar`；预览侧用 `PreviewToolbar`（`actions: ToolbarItem[]`），不要在顶栏堆按钮。

**改颜色前**：先确认是中性（slate）、强调（var(--accent)）还是语义（amber/red）。拿不准就看本文件 §2。

---

## 附：本文件的应用范围

- **约束范围**：`src/components/**`、`src/modes/**` 的应用 chrome，以及 `src/index.css` 的全局样式。
- **不约束**：`src/engine/**`（渲染引擎，输出是公众号/文档内容产物）、`src/data/demo*` 与 `src/data/designPrompts/**`（示例与风格模板，属用户产出物）。这些区域的 Emoji、字体、色彩服务于最终成品，有独立的排版规范。
