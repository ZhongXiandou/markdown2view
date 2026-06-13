# 长表格跨页截断 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use compose:subagent (recommended) or compose:execute to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现长表格跨页截断逻辑，当表格超出当前页时，自动拆分到下一页，并添加"（续表）"标记和表头。

**Architecture:** 
- 在 `documentModel.ts` 中扩展分页逻辑，支持表格行级别的拆分
- 创建表格解析工具函数，提取表头和数据行
- 修改渲染逻辑，为续表添加特殊标记

**Tech Stack:** TypeScript, React, Markdown 解析

---

## 文件结构

### 核心修改文件
- `src/modes/document/documentModel.ts` - 分页逻辑扩展
- `src/engine/utils/markdownParser.ts` - 表格解析工具
- `src/modes/document/DocumentMode.tsx` - 渲染逻辑调整

### 测试文件
- `src/modes/document/documentModel.test.ts` - 分页逻辑测试

---

## Task 1: 创建表格解析工具函数

**Covers:** 表格行提取、表头识别

**Files:**
- Modify: `src/engine/utils/markdownParser.ts`

- [ ] **Step 1: 添加表格解析函数**

```typescript
export interface TableData {
  headers: string[]
  rows: string[][]
  rawMarkdown: string
}

export function parseTableMarkdown(markdown: string): TableData | null {
  const lines = markdown.split('\n').filter(line => line.trim())
  
  // 查找表头行（包含 | 的行）
  let headerIndex = -1
  let separatorIndex = -1
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (line.includes('|')) {
      if (headerIndex === -1) {
        headerIndex = i
      } else if (/^[\|\s:-]+$/.test(line)) {
        separatorIndex = i
        break
      }
    }
  }
  
  if (headerIndex === -1 || separatorIndex === -1) return null
  
  // 解析表头
  const headers = lines[headerIndex]
    .split('|')
    .map(s => s.trim())
    .filter(Boolean)
  
  // 解析数据行
  const rows: string[][] = []
  for (let i = separatorIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (line.includes('|')) {
      const cells = line
        .split('|')
        .map(s => s.trim())
        .filter(Boolean)
      rows.push(cells)
    }
  }
  
  return {
    headers,
    rows,
    rawMarkdown: markdown
  }
}
```

- [ ] **Step 2: 添加表格行高度估算函数**

```typescript
export function estimateTableRowHeight(row: string[], isHeader: boolean = false): number {
  // 基础行高
  const baseHeight = isHeader ? 40 : 36
  // 单元格内容高度估算（假设每行28px）
  const maxLines = Math.max(...row.map(cell => 
    Math.ceil(cell.length / 20) // 假设每行20字符
  ))
  return baseHeight + (maxLines - 1) * 28
}

export function estimateTableHeight(tableData: TableData): number {
  let height = 0
  // 表头高度
  height += estimateTableRowHeight(tableData.headers, true)
  // 数据行高度
  for (const row of tableData.rows) {
    height += estimateTableRowHeight(row, false)
  }
  // 容器边距和内边距
  height += 60 // 30px margin top + 30px margin bottom
  return height
}
```

- [ ] **Step 3: 运行测试验证函数正确性**

Run: `npm test -- --run src/engine/utils/markdownParser.test.ts`
Expected: 所有测试通过

---

## Task 2: 修改分页逻辑支持表格跨页

**Covers:** 表格行级别拆分、续表逻辑

**Files:**
- Modify: `src/modes/document/documentModel.ts`

- [ ] **Step 1: 添加表格拆分函数**

```typescript
import { parseTableMarkdown, estimateTableRowHeight, type TableData } from '@/engine/utils/markdownParser'

interface SplitTableResult {
  pages: Array<{
    tableMarkdown: string
    isContinuation: boolean
    height: number
  }>
}

function splitTableByHeight(
  tableMarkdown: string,
  availableHeight: number,
  settings: { marginTop: number; marginBottom: number }
): SplitTableResult | null {
  const tableData = parseTableMarkdown(tableMarkdown)
  if (!tableData) return null
  
  const pages: SplitTableResult['pages'] = []
  let currentPageRows: string[][] = []
  let currentHeight = 0
  const headerHeight = estimateTableRowHeight(tableData.headers, true)
  const containerPadding = 60 // 表格容器的内边距和边距
  
  // 计算第一页可用高度（减去表格容器开销）
  const firstPageAvailable = availableHeight - containerPadding
  
  // 计算后续页可用高度（需要重新添加表头）
  const continuationPageAvailable = availableHeight - containerPadding - headerHeight
  
  for (let i = 0; i < tableData.rows.length; i++) {
    const row = tableData.rows[i]
    const rowHeight = estimateTableRowHeight(row, false)
    
    const isfirstPage = pages.length === 0
    const currentAvailable = isfirstPage ? firstPageAvailable : continuationPageAvailable
    
    if (currentHeight + rowHeight > currentAvailable && currentPageRows.length > 0) {
      // 当前页已满，生成页面
      const pageMarkdown = buildTableMarkdown(tableData.headers, currentPageRows, pages.length > 0)
      pages.push({
        tableMarkdown: pageMarkdown,
        isContinuation: pages.length > 0,
        height: currentHeight + containerPadding + (pages.length > 0 ? headerHeight : 0)
      })
      
      // 开始新页
      currentPageRows = [row]
      currentHeight = rowHeight
    } else {
      // 添加到当前页
      currentPageRows.push(row)
      currentHeight += rowHeight
    }
  }
  
  // 处理最后一页
  if (currentPageRows.length > 0) {
    const pageMarkdown = buildTableMarkdown(tableData.headers, currentPageRows, pages.length > 0)
    pages.push({
      tableMarkdown: pageMarkdown,
      isContinuation: pages.length > 0,
      height: currentHeight + containerPadding + (pages.length > 0 ? headerHeight : 0)
    })
  }
  
  return { pages }
}

function buildTableMarkdown(headers: string[], rows: string[][], isContinuation: boolean): string {
  let markdown = ''
  
  // 如果是续表，添加续表标记
  if (isContinuation) {
    markdown += '**（续表）**\n\n'
  }
  
  // 表头
  markdown += '| ' + headers.join(' | ') + ' |\n'
  markdown += '| ' + headers.map(() => '---').join(' | ') + ' |\n'
  
  // 数据行
  for (const row of rows) {
    markdown += '| ' + row.join(' | ') + ' |\n'
  }
  
  return markdown.trim()
}
```

- [ ] **Step 2: 修改 paginateDocumentBlocks 函数**

```typescript
export function paginateDocumentBlocks(
  blocks: DocumentBlock[],
  settings: Pick<DocumentSettings, 'pageHeight' | 'marginTop' | 'marginBottom' | 'fontScale'>,
  actualHeights?: Record<string, number>
): DocumentPage[] {
  const scale = fontScaleFactor(settings.fontScale ?? 'normal')
  const contentHeight = settings.pageHeight - settings.marginTop - settings.marginBottom
  const effectiveHeight = Math.max(0, (contentHeight - PAGE_BOTTOM_SAFETY_GAP) / scale)
  const pages: DocumentPage[] = []
  let current: DocumentBlock[] = []
  let usedHeight = 0

  const pushPage = (oversized = false) => {
    if (!current.length) return
    pages.push({
      pageNumber: pages.length + 1,
      blocks: current,
      usedHeight,
      oversized,
    })
    current = []
    usedHeight = 0
  }

  for (const block of blocks) {
    if (block.kind === 'pagebreak') {
      // 第一个 pagebreak 触发分页时，检测是否为封面页
      if (pages.length === 0 && isCoverPageBlocks(current)) {
        const page: DocumentPage = {
          pageNumber: 1,
          blocks: current,
          usedHeight,
          oversized: false,
          isCover: true,
        }
        pages.push(page)
        current = []
        usedHeight = 0
      } else {
        pushPage()
      }
      continue // Drop the pagebreak marker itself from rendering
    }

    // 处理表格跨页
    if (block.kind === 'table') {
      const tableData = parseTableMarkdown(block.markdown)
      if (tableData) {
        const availableHeight = effectiveHeight - usedHeight
        const splitResult = splitTableByHeight(block.markdown, availableHeight, settings)
        
        if (splitResult && splitResult.pages.length > 1) {
          // 表格需要跨页
          for (let i = 0; i < splitResult.pages.length; i++) {
            const page = splitResult.pages[i]
            
            if (i === 0) {
              // 第一页：添加到当前页
              const tableBlock: DocumentBlock = {
                id: `${block.id}-part-${i}`,
                kind: 'table',
                markdown: page.tableMarkdown,
                estimatedHeight: page.height,
                avoidBreak: false,
              }
              current.push(tableBlock)
              usedHeight += page.height
              pushPage()
            } else {
              // 后续页：新页面开始
              const tableBlock: DocumentBlock = {
                id: `${block.id}-part-${i}`,
                kind: 'table',
                markdown: page.tableMarkdown,
                estimatedHeight: page.height,
                avoidBreak: false,
              }
              current = [tableBlock]
              usedHeight = page.height
              
              if (i < splitResult.pages.length - 1) {
                pushPage()
              }
            }
          }
          continue
        }
      }
    }

    const height = actualHeights?.[block.id] ?? block.estimatedHeight
    const oversized = height > effectiveHeight
    const headingNearBottom =
      block.kind === 'heading' && current.length > 0 && usedHeight > effectiveHeight * HEADING_NEAR_BOTTOM_RATIO
    if (oversized) {
      pushPage()
      current = [block]
      usedHeight = height
      pushPage(true)
      continue
    }

    if (current.length && (usedHeight + height > effectiveHeight || headingNearBottom)) {
      pushPage()
    }

    current.push(block)
    usedHeight += height
  }

  pushPage()
  return pages
}
```

- [ ] **Step 3: 运行现有测试确保不破坏现有功能**

Run: `npm test -- --run src/modes/document/documentModel.test.ts`
Expected: 所有测试通过

---

## Task 3: 修改渲染逻辑支持续表标记

**Covers:** 续表渲染、表头重复

**Files:**
- Modify: `src/engine/utils/markdownParser.ts`

- [ ] **Step 1: 修改表格渲染逻辑**

在 `markdownParser.ts` 的表格渲染部分添加续表检测：

```typescript
// 表格
if (line.indexOf('|') >= 0 && i + 1 < lines.length && /\|[\s-:]+\|/.test(lines[i + 1])) {
  // 检测是否为续表（前一行包含"（续表）"）
  const isContinuation = i > 0 && lines[i - 1].includes('（续表）')
  
  const headers = line
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean)
  i += 2
  const rows: string[][] = []
  while (i < lines.length && lines[i].indexOf('|') >= 0 && lines[i].trim() !== '') {
    rows.push(
      lines[i]
        .split('|')
        .map((s) => s.trim())
        .filter(Boolean),
    )
    i++
  }
  
  // 如果是续表，在表格前添加续表标记
  if (isContinuation) {
    html += `<section style="margin:0px 0px 10px;text-align:center;font-size:12px;color:rgb(100,116,139);font-style:italic">（续表）</section>`
  }
  
  html += `<section style="margin:0px 0px 30px;display:flex;justify-content:center;width:100%"><section style="box-shadow:rgba(15,23,42,0.05) 0px 10px 24px;border-radius:12px;border:1px solid rgba(229,231,235,0.9);overflow:hidden;background:#ffffff;max-width:100%;width:max-content"><section style="padding:16px;background:#ffffff"><section class="tableWrapper" style="width:100%;overflow-x:auto"><table style="border-collapse:collapse;table-layout:auto;width:100%;border:1px solid rgb(226,232,240)"><thead><tr style="background-color:rgb(248,250,252)">`
  headers.forEach((h) => {
    html += `<th valign="top" align="left" style="vertical-align:top;border:1px solid rgb(226,232,240);padding:10px 14px;text-align:left;font-size:13px;font-weight:700;color:rgb(51,65,85)">${inlineFormat(h, t)}</th>`
  })
  html += `</tr></thead><tbody>`
  rows.forEach((r) => {
    html += `<tr>`
    r.forEach((c) => {
      html += `<td valign="top" align="left" style="vertical-align:top;border:1px solid rgb(226,232,240);padding:10px 14px;text-align:left;font-size:13px;color:rgb(51,65,85)">${inlineFormat(c, t)}</td>`
    })
    html += `</tr>`
  })
  html += `</tbody></table></section></section></section></section>`
  continue
}
```

- [ ] **Step 2: 运行渲染测试**

Run: `npm test -- --run src/engine/utils/markdownParser.test.ts`
Expected: 所有测试通过

---

## Task 4: 添加集成测试

**Covers:** 端到端测试、边界情况

**Files:**
- Modify: `src/modes/document/documentModel.test.ts`

- [ ] **Step 1: 添加表格跨页测试用例**

```typescript
describe('Table Cross-Page Pagination', () => {
  it('should split long table across pages', () => {
    // 创建一个超长表格
    const tableRows = Array.from({ length: 20 }, (_, i) => 
      `| 行${i + 1} | 数据${i + 1} | 描述${i + 1} |`
    ).join('\n')
    
    const markdown = `表 1: 测试表格\n| 列1 | 列2 | 列3 |\n| --- | --- | --- |\n${tableRows}`
    
    const blocks = splitMarkdownBlocks(markdown)
    const settings = {
      pageHeight: 400, // 使用较小的页面高度强制分页
      marginTop: 50,
      marginBottom: 50,
      fontScale: 'normal' as const
    }
    
    const pages = paginateDocumentBlocks(blocks, settings)
    
    // 应该有多页
    expect(pages.length).toBeGreaterThan(1)
    
    // 每页都应该有表格内容
    pages.forEach(page => {
      const tableBlocks = page.blocks.filter(b => b.kind === 'table')
      expect(tableBlocks.length).toBeGreaterThan(0)
    })
  })

  it('should add continuation marker for split tables', () => {
    const tableRows = Array.from({ length: 15 }, (_, i) => 
      `| 行${i + 1} | 数据${i + 1} |`
    ).join('\n')
    
    const markdown = `表 1: 测试表格\n| 列1 | 列2 |\n| --- | --- |\n${tableRows}`
    
    const blocks = splitMarkdownBlocks(markdown)
    const settings = {
      pageHeight: 300,
      marginTop: 50,
      marginBottom: 50,
      fontScale: 'normal' as const
    }
    
    const pages = paginateDocumentBlocks(blocks, settings)
    
    // 第二页及之后的表格应该包含续表标记
    if (pages.length > 1) {
      const secondPage = pages[1]
      const tableBlock = secondPage.blocks.find(b => b.kind === 'table')
      expect(tableBlock?.markdown).toContain('（续表）')
    }
  })
})
```

- [ ] **Step 2: 运行完整测试套件**

Run: `npm test -- --run src/modes/document/documentModel.test.ts`
Expected: 所有测试通过，包括新增的表格跨页测试

---

## Task 5: 验证和优化

**Covers:** 性能优化、边界情况处理

**Files:**
- Modify: `src/modes/document/documentModel.ts`

- [ ] **Step 1: 优化表格高度估算**

调整 `estimateBlockHeight` 函数中的表格高度计算：

```typescript
case 'table': {
  const tableData = parseTableMarkdown(markdown)
  if (tableData) {
    return estimateTableHeight(tableData)
  }
  // 回退到简单估算
  const rows = markdown.split('\n').filter((line) => line.includes('|')).length
  return 48 + Math.max(1, rows) * 36
}
```

- [ ] **Step 2: 处理表格标题跨页**

修改 `mergeCaptionBlocks` 函数，确保表格标题与表格一起跨页：

```typescript
function mergeCaptionBlocks(blocks: string[]): string[] {
  const merged: string[] = []

  for (let i = 0; i < blocks.length; i++) {
    const current = blocks[i]
    const next = blocks[i + 1]

    if (next && isTableCaptionBlock(current) && classifyBlock(next) === 'table') {
      // 将标题和表格合并为一个块，便于跨页处理
      merged.push(`${current}\n\n${next}`)
      i++
      continue
    }

    if (next && classifyBlock(current) === 'image' && isImageCaptionBlock(next)) {
      merged.push(`${current}\n\n${next}`)
      i++
      continue
    }

    merged.push(current)
  }

  return merged
}
```

- [ ] **Step 3: 最终测试**

Run: `npm test -- --run src/modes/document/documentModel.test.ts`
Run: `npm test -- --run src/engine/utils/markdownParser.test.ts`
Expected: 所有测试通过

---

## 自检清单

1. **规格覆盖**: 
   - [x] 表格跨页截断逻辑
   - [x] 续表标记添加
   - [x] 表头重复显示
   - [x] 高度计算优化

2. **占位符检查**: 
   - [x] 无 TBD 或 TODO
   - [x] 所有步骤包含完整代码

3. **类型一致性**: 
   - [x] 函数签名一致
   - [x] 接口定义一致

---

## 执行建议

**推荐执行方式**: Subagent（每个任务独立执行）

**执行顺序**: 
1. Task 1 (表格解析工具)
2. Task 2 (分页逻辑)
3. Task 3 (渲染逻辑)
4. Task 4 (集成测试)
5. Task 5 (优化验证)

**预计时间**: 45-60 分钟

**风险点**:
- 表格高度估算可能不准确，需要实际渲染验证
- 续表标记的样式需要与整体设计保持一致
- 边界情况处理（空表格、单行表格等）