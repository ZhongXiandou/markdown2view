# Mermaid 渲染功能设计

- **日期**：2026-06-18
- **分支**：`feat/mermaid-rendering`
- **范围**：① 新增 Mermaid 代码块 → 流程图渲染；② MathJax 加载方式从 CDN 迁移到本地打包 + dynamic import 懒加载
- **不在范围**：Article（公众号）模式的 mermaid 支持——本次降级为代码块，留待后续单独评估

---

## 1. 目标与约束

### 1.1 核心目标

把 ` ```mermaid ` 代码块渲染为流程图（及 mermaid 支持的其他图类型），作为**原子内容块**集成进 A4 文档与长图文（Card）两个渲染场景。

### 1.2 硬约束（用户明确）

1. mermaid 图作为整块，**永不跨页**。
2. **A4 文档**：图最宽、最高 + 一行说明文字，合计不超过一页。
3. **长图文（Card）**：图不超过单页。
4. **离线可用**：渲染库必须本地打包，不依赖外部 CDN（与项目 PWA 离线目标一致）。
5. **失败降级**：语法错误或渲染失败时，降级为代码块 + 错误提示行。
6. **说明文字**：与图片说明文字处理一致——复用现有 caption 机制，不引入新语法。
7. **缩放策略**：mermaid 自适应优先，CSS transform:scale 兜底。
8. **尺寸行为**：图低于可用区时按自然尺寸水平居中显示，**不强制撑满**；仅当超出时才缩放。

---

## 2. 总体架构与渲染管线

完全复刻现有 MathJax 的「收集 → 预渲染 → 解析替换」三段式异步管线，把 mermaid 适配成**输出自包含 HTML 字符串**的纯函数，让 A4 / Card 两个场景零修改复用渲染层。

### 2.1 管线

```
用户输入 markdown（含 ```mermaid 块）
   │
   ├─ collectMermaidDiagrams(md)
   │     扫描所有 mermaid 代码块 → [{ key, source }]
   │
   ├─ preRenderMermaid(diagrams, containerWidth)
   │     对每段源码：offscreen DOM 容器 → mermaid.render(id, source, host)
   │     → 取 outerHTML → Map<key, { svg, error? }>
   │     （失败项存 error）
   │
   └─ parseMarkdown(md, t, formulaMap, mermaidMap)
         遇到 ```mermaid 块：
           - mermaidMap 有 svg → 包成 <section data-block="mermaid">
           - 有 error 或无 map → 降级为 mermaid-error section + renderCodeBlock
```

### 2.2 入口收敛

`parseMarkdownAsync(md, t, options?)` 成为唯一推荐入口，内部串联 collect / preRender / parse 三步。现有 A4（`pagedContent.ts`）、Card（`cardModel.ts`）都改走 `parseMarkdownAsync`。

### 2.3 为什么这样设计

- mermaid 需要 DOM，但**只在预渲染阶段**用一次 offscreen 容器，输出 SVG 字符串后立即销毁。最终 HTML 是纯字符串，与 MathJax 输出物性质一致。
- 两模式共享渲染层 = 长图文模块自动同步，无需为 Card 写任何 mermaid 特殊代码。

---

## 3. 渲染器实现

### 3.1 新增 `src/engine/utils/mermaidRenderer.ts`

镜像 `mathRenderer.ts` 的懒加载 + 单次渲染模式。

**懒加载**（`ensureMermaid`）：

```typescript
let mermaidReady: Promise<Mermaid> | null = null

function ensureMermaid() {
  if (mermaidReady) return mermaidReady
  mermaidReady = import('mermaid').then(m => {
    const mermaid = m.default
    mermaid.initialize({
      startOnLoad: false,
      theme: 'neutral',          // 中性主题，适配 A4 正式文档与卡片
      securityLevel: 'strict',   // 安全：禁用 mermaid 源码中的 html 标签
      flowchart: { useMaxWidth: true },  // 让 mermaid 自适应容器宽度
    })
    return mermaid
  })
  return mermaidReady
}
```

- `import('mermaid')`：dynamic import → Vite 自动拆独立 chunk → PWA `app-chunks`（NetworkFirst）缓存 → 离线可用
- `useMaxWidth: true` + 调用方传入的真实 `containerWidth`：让 mermaid 内部布局按真实可用宽排版，这是"mermaid 自适应"层
- `securityLevel: 'strict'`：导出/复制场景的安全底线
- `theme: 'neutral'`：中性灰黑，与 code block 深色、MathJax `#333` 正文色协调

**单图渲染**（`renderMermaidDiagram`）：

```typescript
export async function renderMermaidDiagram(
  source: string,
  containerWidth: number,
): Promise<{ svg: string; error?: string }> {
  const mermaid = await ensureMermaid()
  const host = document.createElement('div')
  host.style.cssText =
    `position:absolute;left:-9999px;top:0;width:${containerWidth}px;visibility:hidden`
  document.body.appendChild(host)
  try {
    const id = `m2v-mermaid-${Math.random().toString(36).slice(2, 10)}`
    const { svg } = await mermaid.render(id, source, host)  // mermaid v11 API
    return { svg }
  } catch (e) {
    return { svg: '', error: (e as Error)?.message || '图表渲染失败' }
  } finally {
    host.remove()
  }
}
```

- offscreen 容器用完即移除，不污染主 DOM
- 渲染器是引擎层纯函数，`containerWidth` 由调用方传入（不耦合具体模式）

### 3.2 `containerWidth` 取值（调用方传入）

| 场景 | containerWidth |
|---|---|
| A4 | `pageWidth - marginLeft - marginRight`（默认 794 - 64×2 = 666） |
| Card | `ASPECTS[aspect].w - 2×PAD_X`（3:4 → 360 - 60 = 300） |
| Article（本次不改） | 不传 mermaidMap，走降级路径，无需 containerWidth |

> 这意味着 `parseMarkdownAsync` 需要新增 `containerWidth` 参数。不同场景容器宽不同，mermaid 内部布局必须知道真实宽，否则换行点全错。该参数可选，默认 `578`（与原 Article 宽一致），减少对未迁移调用点的破坏性。

### 3.3 MathJax 迁移（CDN → 本地打包 + 懒加载）

只动 `mathRenderer.ts` 的 `loadMathJax`，外部行为零变化：

```typescript
function loadMathJax(): Promise<void> {
  if (mathJaxReady) return mathJaxReady
  mathJaxReady = new Promise<void>((resolve, reject) => {
    import('mathjax').then(() => {
      // mathjax 包导入后 window.MathJax 已按注入配置初始化
      const check = setInterval(() => {
        if ((window as any).MathJax?.startup?.adaptor) {
          clearInterval(check)
          resolve()
        }
      }, 50)
    }).catch(reject)
  })
  return mathJaxReady
}
```

- `renderMath()` 签名与现有清洗逻辑（`xlink:href → href`、`currentColor → #333`、`display:inline`）不变
- PWA 配置中 `cdn-cache` 规则保留（无害，防遗留调用），`app-chunks` 自动覆盖 mathjax 拆出的 chunk

---

## 4. HTML 输出结构

### 4.1 成功时

```html
<section data-block="mermaid" data-mermaid-key="__MERMAID_0__" style="
  max-width: 100%;
  margin: 16px auto;
  text-align: center;
  break-inside: avoid;
">
  <div class="m2v-mermaid-figure" style="
    display: inline-block;
    max-width: 100%;
    max-height: var(--m2v-mermaid-max-height, none);
    overflow: hidden;
  ">
    {svgHtml}  <!-- mermaid 原始 SVG，保留其 width/height/viewBox -->
  </div>
</section>
```

- `max-width:100%` 挂在外层与内层：SVG 比容器窄时按原宽，宽时等比缩到容器宽
- `max-height` 用 CSS 变量 `--m2v-mermaid-max-height`：默认不设上限（图矮就矮），各模式按需注入
- `break-inside: avoid`：原子块，Paged.js 不在内部插分页符

### 4.2 失败时（降级）

```html
<section data-block="mermaid-error" style="
  background: rgb(254,242,242);
  border-left: 3px solid rgb(220,80,80);
  padding: 10px 14px;
  margin: 14px 0;
  font-size: 12.5px;
  color: rgb(120,30,30);
">图表渲染失败：{error.message}</section>
{renderCodeBlock(source, 'mermaid')}
```

---

## 5. 分页 / 缩放 / 居中机制

### 5.1 两套分页路径与时序

A4 与 Card 各有两条独立的分页路径，mermaid 必须在两条路径上都正确工作：

**A4 文档（两条路径）：**
- **预览/PDF 路径**：`buildPagedContentHtml(blocks)` → 逐块调 `parseMarkdown` 拼成 HTML → 送入 iframe → Paged.js 按 CSS `break-inside` 分页。**不经过 useBlockHeights**，分页完全由 Paged.js 在 iframe 内完成。
- **离线/DOCX 路径**：`splitMarkdownBlocks` → `paginateDocumentBlocks(blocks, settings, actualHeights?)` → 按估算/实测高度切片。`actualHeights` 当前未接入 DOM 实测（导出时可不传，走估算）。

**Card 长图文（两条路径）：**
- **测量路径**：`useBlockHeights` 对隐藏容器逐块调 `parseMarkdown` 实测高度。
- **展示路径**：`buildContentCard(parseMarkdown(page.markdown))`。

**mermaid 的时序要点**：因为 mermaid 渲染是异步的（`parseMarkdownAsync`），而上面所有 `parseMarkdown` 调用点都是同步的，所以必须把**这些调用点改为 async**，或在调用前预渲染好 mermaidMap 再传入同步的 `parseMarkdown`。

**采用后者**（影响最小）：保留 `parseMarkdown(md, t, formulaMap?, mermaidMap?)` 同步签名，新增 `mermaidMap` 第 4 参数；各调用点先 `await preRenderMermaid(collectMermaidDiagrams(md), containerWidth)` 拿到 map，再调同步 `parseMarkdown`。`parseMarkdownAsync` 内部封装这两步。

`estimatedHeight` 给保守默认值 `280px`（离线路径用，实际不影响预览）。

### 5.2 A4 模式（双层保障）

1. **估算层**（`documentModel.ts`）：`estimateBlockHeight` 对 `kind === 'mermaid'` 返回 `280`。`splitMarkdownBlocks` 现有逻辑 `avoidBreak: kind !== 'paragraph'` 自动让 mermaid 为 `true`（原子块）。
2. **预渲染层**（`pagedContent.ts` 的 `renderBlock`）：调 `parseMarkdown(block.markdown, colors, undefined, mermaidMap)` 前，需先有 mermaidMap。因 `buildPagedContentHtml` 是同步函数，改为接收预构建好的 mermaidMap 参数（由 DocumentMode 在 useMemo 中异步预渲染后传入）。
3. **Paged.js CSS**（`pagedPageCss.ts`）注入：
3. **Paged.js CSS**（`pagedPageCss.ts`）注入：
   ```css
   .document-content section[data-block="mermaid"] {
     break-inside: avoid;
     page-break-inside: avoid;
   }
   .document-content .m2v-mermaid-figure {
     max-height: var(--m2v-mermaid-max-height);
     transform: scale(var(--m2v-mermaid-scale, 1));
     transform-origin: top center;
   }
   ```
4. **缩放兜底**（`usePagedPreview.ts` 渲染完成后）：
   - **可用高** = `pageHeight - marginTop - marginBottom - headerHeight - footerHeight`（取自 `DocumentSettings`，与 `paginateDocumentBlocks` 的 `contentHeight` 同源）
   - **说明行高** ≈ 36px（caption 行高，与现有 caption 排版一致）
   - 遍历 mermaid 块：若 `offsetHeight > 可用高 - 说明行高`，计算 `scale = (可用高 - 36) / offsetHeight`（clamp 到 `[0.3, 1]`，避免极端小图），写入该块的 `--m2v-mermaid-scale` 和 `--m2v-mermaid-max-height: ${可用高 - 36}px`
5. **说明文字**：用户在 mermaid 块前写 caption（与图片一致），A4 模式已有的 `mergeCaptionBlocks` + `document-caption` 居中样式自动生效，**不为 mermaid 写专门的说明文字逻辑**。

### 5.3 Card 模式（零特殊代码）

- Card 共享 `parseMarkdownAsync`，mermaid 块输出结构一致
- `pixelBudget` 分页逻辑不变：实测 mermaid 高 + 其他块高 > budget 翻页；图超 budget 时用 `--m2v-mermaid-max-height` + scale 兜底
- Card 隐藏测量容器（`CardMode.tsx:414-441`）渲染入口改 `parseMarkdownAsync`
- 居中：`xhsCards.ts` 内容区已有 `text-align` 继承，mermaid 块的 `margin:0 auto; text-align:center` 直接生效

### 5.4 Article 模式（本次不改）

Article 用 `parseMarkdown` 同步路径，mermaid 在 Article 里会走降级代码块（未传 mermaidMap）。公众号编辑器对 SVG 兼容性差，mermaid 复制进去易丢样式，留待后续单独评估。

---

## 6. 接入点改动清单

| 文件 | 改动 |
|---|---|
| `src/engine/utils/mermaidRenderer.ts` | **新增**：`ensureMermaid` + `renderMermaidDiagram` |
| `src/engine/utils/markdownParser.ts` | mermaid 代码块分支：检测 `lang === 'mermaid'`，从 mermaidMap 取 SVG 或降级；新增 `collectMermaidDiagrams` + `preRenderMermaid`；`parseMarkdown` 新增第 4 参数 `mermaidMap`；`parseMarkdownAsync` 新增 `containerWidth` 参数并串联预渲染 |
| `src/engine/utils/mathRenderer.ts` | `loadMathJax`：CDN script → `import('mathjax')` |
| `src/engine/index.ts` | 导出 `collectMermaidDiagrams` / `preRenderMermaid` / `renderMermaidDiagram` |
| `src/modes/document/paged/pagedContent.ts` | `buildPagedContentHtml` 新增 `mermaidMap` 参数，传给内部 `parseMarkdown`；保留原有 normalize/caption 逻辑 |
| `src/modes/document/DocumentMode.tsx` | 新增异步预渲染 mermaidMap 的 useMemo（配合 `useEffect` + state），传入 `buildPagedContentHtml` |
| `src/modes/document/paged/usePagedPreview.ts` | 渲染完成后遍历 iframe 内 mermaid 块做缩放兜底 |
| `src/modes/document/paged/pagedPageCss.ts` | 注入 mermaid 块的 break-inside / max-height / scale CSS |
| `src/modes/document/documentModel.ts` | `estimateBlockHeight` 加 `mermaid` 分支 |
| `src/engine/blockParser/classifyBlock.ts` | 识别 mermaid → `kind: 'mermaid'` |
| `src/engine/blockParser/types.ts` | `DocumentBlockKind` 增加 `'mermaid'` |
| `src/modes/card/CardMode.tsx` | 两处 `parseMarkdown` 调用点（展示卡片 `:151`、测量容器 `:437`）改为接收预渲染好的 mermaidMap；新增异步预渲染逻辑 |
| `src/modes/card/cardModel.ts` | `estimateBlockUnits` 加 mermaid 分支 |
| `vite.config.ts` | manualChunks 可选加 `'mermaid'`（让 Vite 把 mermaid 拆成独立 chunk） |
| `package.json` | 新增 `mermaid`、`mathjax` 依赖 |

---

## 7. 测试策略

### 7.1 单元测试（Vitest，沿用现有 `*.test.ts` 模式）

| 测试文件 | 覆盖点 |
|---|---|
| `src/engine/utils/mermaidRenderer.test.ts` | `ensureMermaid` 懒加载幂等性；合法 flowchart / sequence / pie 渲染出含 `<svg` 的字符串；非法语法返回 `{svg:'', error:非空}`；offscreen 容器渲染后被移除（DOM 干净） |
| `src/engine/utils/markdownParser.test.ts`（扩充） | 含 ```mermaid 块的 md 在传入 mermaidMap 后正确替换占位符；不传 mermaidMap 时降级为代码块；失败项降级为 mermaid-error section + 代码块 |
| `src/modes/document/documentModel.test.ts`（扩充） | `estimateBlockHeight` 对 mermaid 返回 280；`classifyBlock` 识别 mermaid |
| `src/modes/card/cardModel.test.ts`（扩充） | `estimateBlockUnits` 对 mermaid 的估算值 |

> mermaid 渲染依赖 DOM，单测用 jsdom 环境（`vitest.config.ts` 已配置）。mermaid 库本身不 mock——测真实渲染输出，验证 SVG 自包含性。

### 7.2 手工验证清单

- A4：小流程图（矮）与正文共页且水平居中；大流程图独占一页且 scale 缩放后不溢出；说明文字以 caption 样式显示在图下方居中
- Card：流程图不超单页；缩放兜底生效
- 失败降级：故意写错语法，显示红色提示条 + 源码代码块
- 离线：DevTools 断网后刷新，mermaid 与数学公式仍正常渲染
- MathJax 迁移无回归：现有含公式文档渲染结果与迁移前一致

---

## 8. 风险点与对策

1. **mermaid 包体积**（最大风险）：mermaid 完整打包约 1MB+（gzipped）。Vite 默认拆独立 chunk，首屏不加载，但首次写 mermaid 时有明显解析延迟（~300-800ms）。
   - **对策**：接受（与 MathJax 首次加载同性质）；后续若体验不佳，可按需引入 mermaid 子图类型（flowchart / sequence 等单独 import）。

2. **mermaid v11 API 差异**：`mermaid.render(id, source, container)` 是 v10+ 签名。
   - **对策**：`package.json` 锁定 `mermaid: "^11"`，单测覆盖渲染调用。

3. **offscreen DOM 与 A4 iframe 的交互**：A4 用 iframe 跑 Paged.js，但 mermaid 预渲染发生在主文档（`parseMarkdownAsync` 在主线程执行，输出字符串后才送入 iframe）。
   - **已规避**：渲染器只依赖主文档 `document`，输出纯字符串；iframe 只接收最终 HTML，不感知 mermaid 库。

4. **containerWidth 改动面**：`parseMarkdownAsync` 新增参数，所有调用点需同步更新。
   - **对策**：参数可选，默认 `578`（与原 Article 宽一致），减少破坏性；A4 / Card 调用点显式传入。

5. **MathJax 迁移回归**：本地 `mathjax` npm 包与 CDN `tex-svg.js` 在 SVG 输出上可能有细微差异（字体路径、命名空间）。
   - **对策**：迁移后用现有含公式文档做视觉对比验证；保留 `renderMath` 内的清洗逻辑不变。
