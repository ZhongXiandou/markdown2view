# markdown2view 🚀

一个**纯前端、零后端**的「Markdown / HTML 多场景排版与导出工作台」。
把同一份内容渲染为面向不同受众的成品形态，并一键复制或导出（富文本 / 高清图片 / 打印 PDF / 批量打包 ZIP）。

> 💡 **设计初衷**：免去繁琐的后端依赖与服务部署，利用浏览器原生的渲染能力、排版实测技术和沙箱机制，实现极致的内容分发与设计自由。
> 
> 规划与规范文档：[`docs/技术架构设计.md`](./docs/技术架构设计.md)、[`docs/技术路线图.md`](./docs/技术路线图.md)、[`docs/代码与提交规范.md`](./docs/代码与提交规范.md)

---

## ✨ 核心亮点与四大排版模式

### 1. 🖨️ A4 规范文档模式 (A4 Document)
- **纯前端智能分页**：内置高度实测机制，结合 `ResizeObserver` 及图片 `load` 监听，实时精确计算 A4 页面物理高度并进行平滑跨页分页。
- **封面页等距分布**：首页仅含标题和信息表格时，自动垂直等距分布（标题到页眉、标题到表格、表格到页脚间距相等）。
- **自定义页眉页脚**：支持设置页码、标题、首行缩进及字体倍率。
- **完美跨页导出**：直接调用浏览器打印机制或客户端 PDF 生成，避免图片被截断。

### 2. 📝 长图文排版模式 (WeChat Longform)
- **公众号无损渲染**：支持自定义组件（`<steps>` 步骤条、`<timeline>` 时间线、`<compare>` 对比卡、`<slider>` 轮播图等）并直接复用公众号排版引擎。
- **一键复制富文本**：完美兼容微信公众平台、知乎、头条等图文编辑器。
- **本地性能优化**：通过输入防抖 (Debounce) 和状态解耦，保证万字长文编辑依旧流畅不卡顿。

### 3. 📷 分页图文卡片模式 (Social Cards)
- **多尺寸卡片生成**：支持 `3:4` 与 `9:16` 比例卡片，带自动序号、作者角标与品牌 Logo。
- **配图与文案一键复制**：从 Frontmatter 提取 metadata 智能生成社交平台发布文案。
- **批量导出**：支持打包 ZIP 下载所有生成卡片，或逐张下载高清 PNG。

### 4. 🎨 HTML 可视化自由画布 (HTML Visualize)
- **沙箱隔离渲染**：内置基于 `iframe` 容器的隔离机制，防止样式污染，支持导入 Tailwind Play CDN 等外部样式。
- **网页 PPT 专属呈现**：吸收 `guizang-ppt-skill` 的设计精髓，支持生成带有 WebGL 背景、极致字号对比的「电子杂志风格」和「瑞士国际主义风格」横向翻页网页 PPT（键盘/手势切换）。
- **统一指令库与预设方案**：全模式打通 AI 提示词库持久化存储，将晦涩的系统指令对用户隐匿，提供极其清爽的“一键复制去生成”体验。
- **高清导出与性能极限优化**：基于 `MutationObserver` 的高稳定度导出流（现代截图与 PDF）；利用精确的 `manualChunks` 与组件懒加载机制，避免核心大包冗余阻塞，提供秒级的冷热启动速度。

---

## 🛠️ 技术栈

- **前端框架**：React 18 + TypeScript + Vite
- **编辑器内核**：CodeMirror 6（支持 Markdown 语法高亮与流畅输入）
- **状态管理**：Zustand (内置 `persist` 中间件，自动本地持久化)
- **排版与样式**：Tailwind CSS v4 + Vanilla CSS
- **导出技术**：html2canvas + jsPDF (完全运行在浏览器端，零网络传输，隐私安全)

---

## 📦 环境要求

- **Node.js** ≥ 20（推荐 v24）
- **pnpm** ≥ 10（包管理器）

```bash
# 若未安装 pnpm
npm install -g pnpm
```

---

## ⚡ 快速开始

```bash
# 1. 克隆并安装依赖
pnpm install

# 2. 启动开发服务器（热更新，默认 http://localhost:5173）
pnpm dev

# 3. 静态类型检查
pnpm typecheck

# 4. 生产环境构建（输出至 dist/ 目录）
pnpm build

# 5. 本地预览生产构建产物
pnpm preview
```

> 💡 **Esbuild 权限提示**：`package.json` 已配置 `pnpm.onlyBuiltDependencies: ["esbuild"]`。若首次启动遇到 esbuild 被拦截，运行 `pnpm rebuild esbuild` 即可。

---

## 📏 开发与提交规范

> 完整规范详见 [`docs/代码与提交规范.md`](./docs/代码与提交规范.md)，以下为核心要点。

### 开发命令速查

```bash
pnpm dev          # 启动开发服务器（热更新）
pnpm typecheck    # TypeScript 静态类型检查
pnpm test         # 运行全部单元测试（Vitest）
pnpm build        # 生产构建（= typecheck + vite build）
```

### 提交前检查清单

每次提交前**必须**确保以下三项全部通过：

1. `pnpm typecheck` — 无类型错误
2. `pnpm test` — 全部测试通过
3. `pnpm build` — 构建成功且无异常体积膨胀

### Git Commit 规范（Angular Convention）

```
<type>(<scope>): <subject>

<body>  // 可选，说明"为什么"而非"做了什么"
```

**Type 类型**：`feat` / `fix` / `docs` / `style` / `refactor` / `perf` / `test` / `build` / `chore`

**示例**：
```
feat(article): 增加长图文模式的一键去重功能

为工具栏增加了去重按钮，使用基于正则匹配的方式过滤重复段落。
```

### 代码风格要点

- **中文注释**：业务逻辑、避坑指南用中文；变量名/函数名按英文技术惯例
- **简单优先**：不做过度抽象，不为"可能的未来"写代码
- **手术刀修改**：只触碰必须改动的部分，不顺手重构未坏掉的代码
- **构建体积保护**：大型 SDK 必须 `await import()` 按需加载，禁止顶部静态导入

---

## 📂 目录结构

```
src/
├── engine/                # 框架无关渲染引擎（包含自定义 Markdown 语法解析）
│   ├── utils/             # markdownParser / inlineFormat / math 等核心解析器
│   ├── editor-components/ # title / steps / timeline / slider 等微信排版组件
│   └── composables/       # 全局主题配置与类型定义
├── components/
│   ├── editor/            # CodeMirror 6 编辑器 React 封装
│   ├── layout/            # 核心全局组件（ModeTabs / PreviewToolbar 抽象统一操作栏 / CustomPromptPopover）
│   └── ui/                # Toast / Button 等通用 UI 元件
├── modes/
│   ├── document/          # A4 文档排版工作台
│   ├── article/           # 长图文工作台
│   ├── card/              # 分页图文卡片排版工作台
│   └── html/              # HTML 自由画布可视化工作台
├── lib/                   # store (Zustand) / exportImage (高清截图) / 滚动联动等通用逻辑
├── data/                  # 示例数据（包含 demoArticle / demoHtml / AI Prompt 指令集）
├── App.tsx                # 模式切换主入口
└── main.tsx
```

---

## 🤝 开源参考与设计致敬

| 项目 | 协议 | 借鉴与致敬内容 |
| :--- | :--- | :--- |
| [r-markdown](https://github.com/RobocopMao/r-markdown) | MIT（声明） | 移植了微信公众号渲染引擎的核心解析逻辑、多款排版组件以及主题配色方案。 |
| [html-anything](https://github.com/nexu-io/html-anything) | Apache-2.0 | 启发了 HTML 可视化画布中基于 `iframe` 容器的安全隔离设计与导出层架构。 |
| [guizang-ppt-skill](https://github.com/op7418/guizang-ppt-skill) | AGPL-3.0 | 自由画布中「电子杂志」「瑞士国际主义」的风格参考，以及网页 PPT 主题节奏、标准图片比例、版式校验等经验启发。本项目仅做设计经验与提示词层面的转译吸收，未并入其模板源码。 |

---

## 📄 开源协议

[MIT License](./LICENSE)

