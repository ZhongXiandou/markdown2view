<div align="center">

<img src="public/favicon.svg" width="120" height="120" alt="markdown2view" />

# markdown2view

**纯前端、零后端** 的 Markdown / HTML 多场景排版与导出工作台。

通过使用本工作台既定的渲染方式，与外部 AI 协作，快捷将内容渲染为 **A4 正式文档 · 公众号长图文 · 小红书图文卡片 · 风格化 HTML 画布**，
并导出为富文本 / 高清 PNG / 矢量 PDF / Word (.docx) / PPT (.pptx) / 批量 ZIP。

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06b6d4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-installable-purple?logo=pwa&logoColor=white)](https://vite-pwa-org.netlify.app/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

[🌐 在线体验](https://md.beeeffy.com) · [📖 技术架构](./docs/技术架构设计.md) · [🛣️ 路线图](./docs/技术路线图.md) · [🎨 设计系统](./DESIGN.md)

</div>

---

> **设计初衷**：免去后端依赖与服务部署，利用浏览器原生渲染、W3C 排版规范与沙箱机制，实现极致的内容分发与设计自由。所有数据仅存于浏览器本地，**不上传任何内容到第三方服务器**；图床密钥默认不落盘，如需持久化通过口令加密存储。

## 📸 效果预览

| 模式 | 效果预览 |
|:---:|:---:|
| **A4 文档** | ![A4 文档](docs/screenshots/document.png) |
| **公众号长图文** | ![长图文](docs/screenshots/article.png) |
| **小红书卡片** | ![卡片](docs/screenshots/card.png) |
| **HTML 画布** | ![画布](docs/screenshots/html.png) |

<details>
<summary><strong>📖 目录</strong></summary>

- [markdown2view](#markdown2view)
  - [📸 效果预览](#-效果预览)
  - [✨ 核心亮点](#-核心亮点)
    - [🖨️ A4 规范文档](#️-a4-规范文档)
    - [📝 长图文排版](#-长图文排版)
    - [📷 小红书图文卡片](#-小红书图文卡片)
    - [🎨 HTML 可视化自由画布](#-html-可视化自由画布)
  - [🔧 更多能力](#-更多能力)
  - [🛠️ 技术栈](#️-技术栈)
  - [📦 快速开始](#-快速开始)
  - [📏 开发与提交规范](#-开发与提交规范)
  - [📂 目录结构](#-目录结构)
  - [🤝 开源参考与致谢](#-开源参考与致谢)
  - [📌 补充说明](#-补充说明)
  - [📄 开源协议](#-开源协议)

</details>

---

## ✨ 核心亮点

> 四大模式共享同一套 **内容解析基础设施**与「渲染规则 → AI 指令 → 外部 AI 生成 → 回填系统」的离线工作流，让同一份 Markdown 源文件在不同受众场景下产出风格迥异的成品。

### 🖨️ A4 规范文档

- **Paged.js 物理分页**：基于 W3C Paged Media 规范，在 iframe 沙箱中进行真实分页计算，支持自动换页、跨页防孤立标题。
- **长表格优雅跨页**：自动在分页处拆分表格，续表补齐 `thead` 表头并标注"（续表）"。
- **`<page-break/>` 手动分页**：在 Markdown 中插入分页符，精确控制封面、附录、章节起始位置。
- **封面页等距分布**：首个 `<page-break/>` 前仅含标题与表格时，自动识别为封面页并垂直等距排版。
- **自定义页眉页脚**：支持左/右分栏、`{page}/{total}` 页码变量、首行缩进、字体倍率等。
- **矢量 PDF 导出**：调用浏览器原生打印，输出可选中/可搜索的矢量文本 PDF，体积仅几十 KB。
- **Word (.docx) 导出**：基于 `docx` 库直接构建 OOXML，支持公式 SVG 嵌入、封面页、页眉页脚、表格跨页表头重复，完全独立于预览渲染管线。

> ⚠️ **已知问题**：Paged.js v0.4.3 在极少数跨页位置可能丢失 2~3 行文字（[上游 Issue #167](https://github.com/pagedjs/pagedjs/issues/167)），待 0.5.0 正式版发布后跟进升级。

### 📝 长图文排版

- **公众号无损渲染**：内置 `<steps>` 步骤条、`<timeline>` 时间线、`<compare>` 对比卡、`<slider>` 轮播图等自定义组件，直接复用公众号排版引擎。
- **双公式引擎**：支持 MathJax 与 KaTeX，内置前缀及上下文校验，防止长句题注被误判。
- **Mermaid 流程图**：` ```mermaid ` 代码块自动渲染为流程图，集成于长图文与 A4 文档双模式。
- **一键复制富文本**：兼容微信公众平台、知乎、头条等编辑器，排版不丢失。
- **本地性能优化**：输入防抖 + 状态解耦，万字长文编辑流畅不卡顿。

### 📷 小红书图文卡片

- **多尺寸生成**：面向小红书发布场景，支持 3:4 与 9:16 比例，自动序号、作者角标与品牌 Logo。
- **物理分页支持**：同样支持 `<page-break/>` 强行换页。
- **配图与文案一键复制**：从 Frontmatter 提取 metadata 智能生成小红书发布文案。
- **非阻塞批量导出**：异步打包为 ZIP 下载，或逐张导出高清 PNG，`fflate` Web Worker 压缩不阻塞界面。

### 🎨 HTML 可视化自由画布

- **沙箱隔离渲染**：`iframe` 容器隔离样式，支持导入 Tailwind CDN 等外部样式；默认禁用脚本执行，用户可手动开启。
- **网页 PPT 呈现**：支持生成「电子杂志风格」「瑞士国际主义风格」横向翻页网页 PPT（键盘/手势切换）。
- **统一指令库**：内置幻灯片、简历、报告、海报、仪表盘、社媒多页图等场景预设，一键复制 AI 指令去生成。
- **高清导出**：基于 `MutationObserver` 的稳定截图流，支持单页 PNG / PDF 导出与多页 ZIP 打包。
- **PPT 导出（全图版）**：逐页高清截图嵌入 `pptxgenjs` 幻灯片背景，视觉 100% 保真，适配任意复杂布局。
- **PPT 导出（可编辑版）**：解析 DOM 叶子节点映射为原生文本框/图片，导出后可编辑文字与调整布局（实验性）。

---

## 🔧 更多能力

| 能力 | 说明 |
|:---|:---|
| **多图床支持** | 本地 / SM.MS / 阿里云 OSS / 腾讯云 COS，图片粘贴即上传并自动回填 URL |
| **加密保险箱** | 图床密钥默认不落盘；如需持久化，通过口令加密存储于 SecureVault |
| **自定义字体** | A4 文档与卡片模式支持宋体 / 仿宋 / 黑体一键切换 |
| **主题色切换** | 5 款预设主题色（翠绿/海蓝/紫罗兰/砖红/琥珀），全局 CSS 变量驱动 |
| **AI 指令闭环** | 「渲染规则 → AI 指令 → 用户操作 → 外部 AI」完整闭环，修改规则自动同步指令 |
| **智能示例同步** | `DEMO_VERSION` 增量更新机制，系统升级时仅刷新未被用户编辑的示例 |
| **PWA 离线可用** | 基于 `vite-plugin-pwa`，支持桌面安装、离线访问与自动更新 |
| **浏览器兼容检测** | 自动检测浏览器能力，不兼容时弹窗警告并给出建议 |
| **响应式适配** | 桌面双栏 / 平板单栏 / 移动端抽屉导航，基于 `ResizeObserver` 渐进折叠 |

---

## 🛠️ 技术栈

| 领域 | 技术选型 |
|:---|:---|
| 框架 | React 18 + TypeScript + Vite 5 |
| 编辑器 | CodeMirror 6（解决 IME 输入法丢字，`useMemo` 缓存避免万字卡顿） |
| 状态管理 | Zustand v5 + `persist` 本地持久化 |
| 样式 | Tailwind CSS v4 + Vanilla CSS |
| 排版引擎 | 自研纯 TS 引擎（移植自 r-markdown），含 KaTeX / MathJax / Mermaid / highlight.js |
| A4 分页 | Paged.js v0.4.3（iframe 沙箱内运行） |
| 导出 | modern-screenshot（PNG）/ 浏览器原生打印（PDF）/ docx（Word）/ pptxgenjs（PPT）/ fflate（ZIP） |
| 构建优化 | `manualChunks` 分包 + 云存储 SDK 动态导入 + 模式级懒加载 |

> 📐 完整架构设计详见 [`docs/技术架构设计.md`](./docs/技术架构设计.md)；路线图详见 [`docs/技术路线图.md`](./docs/技术路线图.md)。

---

## 📦 快速开始

**环境要求**：Node.js ≥ 20（推荐 v24）· pnpm ≥ 10

```bash
# 安装依赖
pnpm install

# 启动开发服务器（http://localhost:5173）
pnpm dev

# 类型检查
pnpm typecheck

# 运行测试
pnpm test

# 生产构建
pnpm build

# 预览构建产物
pnpm preview
```

> 💡 首次启动若遇 esbuild 被拦截，运行 `pnpm rebuild esbuild` 即可。

---

## 📏 开发与提交规范

> 完整规范详见 [`docs/代码与提交规范.md`](./docs/代码与提交规范.md)。

**提交前三项检查**：

```bash
pnpm typecheck    # 1. 无类型错误
pnpm test         # 2. 全部测试通过
pnpm build        # 3. 构建成功且无异常体积膨胀
```

**Commit 格式**（Angular Convention）：`<type>(<scope>): <subject>`

Type：`feat` / `fix` / `docs` / `style` / `refactor` / `perf` / `test` / `build` / `chore`

**代码风格**：中文注释 · 简单优先 · 手术刀修改 · 大型 SDK 按需加载 · 指令与渲染规则同步。

---

## 📂 目录结构

```
src/
├── engine/                # 框架无关渲染引擎（Markdown 解析 / 自定义组件 / 公式 / 代码高亮）
├── components/
│   ├── editor/            # CodeMirror 6 编辑器封装
│   ├── layout/            # 全局布局（AppHeader / ModeTabs / MobileDrawer）
│   └── ui/                # Button / Toast / Tooltip / ErrorBoundary 等通用 UI
├── modes/
│   ├── document/          # A4 文档排版（Paged.js 分页 + Word 导出）
│   ├── article/           # 长图文排版（公众号引擎 + 富文本复制）
│   ├── card/              # 分页图文卡片（多尺寸 + ZIP 批量导出）
│   └── html/              # HTML 自由画布（iframe 沙箱 + 指令库）
├── lib/                   # Zustand store / 导出层 / 图床 / 安全 / 通用 hooks
├── data/                  # 示例数据 + AI Prompt 指令集
├── App.tsx                # 模式切换主入口
└── main.tsx
```

---

## 🤝 开源参考与致谢

| 项目 | 协议 | 借鉴内容 |
|:---|:---|:---|
| [r-markdown](https://github.com/RobocopMao/r-markdown) | MIT | 公众号渲染引擎核心、自定义排版组件、主题配色方案 |
| [html-anything](https://github.com/nexu-io/html-anything) | Apache-2.0 | iframe 沙箱隔离设计与导出层架构 |
| [guizang-ppt-skill](https://github.com/op7418/guizang-ppt-skill) | AGPL-3.0 | 「电子杂志」「瑞士国际主义」风格参考与网页 PPT 节奏启发（仅转译设计经验，未并入模板源码） |

---

## 📌 补充说明

<details>
<summary><strong>AI 生成 HTML 的外链资源原则</strong></summary>

考虑到中国境内网络环境，外部 AI 生成 HTML 时应遵循：
- **中文内容**：不得引用海外 CDN（unpkg / jsdelivr / Google Fonts 等），优先系统内置字体栈与内联样式。
- **英文内容**：可酌情使用海外 CDN，但非必要不推荐。

</details>

<details>
<summary><strong>项目语言</strong></summary>

本项目以中文优先，暂未支持多语言国际化（i18n）。所有项目文档、AI 提示词均以中文编写。

</details>

---

## 📄 开源协议

[MIT License](./LICENSE)
