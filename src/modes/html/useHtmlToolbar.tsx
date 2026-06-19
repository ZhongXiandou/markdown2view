import { useMemo } from 'react'
import type { ToolbarItem } from '@/components/layout/PreviewToolbar'
import { UI_LABELS } from '@/lib/uiLabels'
import { Button } from '@/components/ui/Button'
import { Play, RotateCcw, Book, ImageIcon, Package, Download, Printer, Presentation } from '@/components/ui/Icon'
import type { PageInfo } from '@/lib/multipage'

interface UseHtmlToolbarOptions {
  pages: PageInfo[]
  currentPage: number
  expectedPageCount: number
  exporting: boolean
  uploading: boolean
  allowScripts: boolean
  onFullscreen: () => void
  onRefresh: () => void
  onOpenPromptLibrary: () => void
  onUploadImage: () => void
  onToggleAllowScripts: (checked: boolean) => void
  onChangePage: (delta: number) => void
  onExportCurrentPage: () => void
  onExportZip: () => void
  onExportSource: () => void
  onExportPng: () => void
  onExportPdf: () => void
  onExportPptx: () => void
  onExportPptxEditable: () => void
}

/**
 * 用 useMemo 聚合 HTML 预览区的工具栏配置，避免 render 阶段 push 数组。
 */
export function useHtmlToolbar(opts: UseHtmlToolbarOptions): ToolbarItem[] {
  const {
    pages,
    currentPage,
    expectedPageCount,
    exporting,
    uploading,
    allowScripts,
    onFullscreen,
    onRefresh,
    onOpenPromptLibrary,
    onUploadImage,
    onToggleAllowScripts,
    onChangePage,
    onExportCurrentPage,
    onExportZip,
    onExportSource,
    onExportPng,
    onExportPdf,
    onExportPptx,
    onExportPptxEditable,
  } = opts

  const hasPagination = pages.length > 1 || expectedPageCount > 1
  const pageCount = Math.max(pages.length, expectedPageCount)
  const hasPages = pages.length > 0 || expectedPageCount > 1

  return useMemo(() => {
    const items: ToolbarItem[] = [
      {
        id: 'fullscreen',
        icon: <Play size={14} />,
        label: UI_LABELS.toolbar.fullscreen.label,
        tooltip: UI_LABELS.toolbar.fullscreen.tooltip,
        onClick: onFullscreen,
      },
      {
        id: 'refresh',
        icon: <RotateCcw size={14} />,
        label: UI_LABELS.toolbar.refresh.label,
        tooltip: UI_LABELS.toolbar.refresh.tooltip,
        onClick: onRefresh,
      },
    ]

    if (hasPagination) {
      items.push({
        id: 'pagination',
        label: '分页控制',
        node: (
          <div className="flex items-center gap-0.5 px-1">
            <Button onClick={() => onChangePage(-1)} disabled={currentPage === 0} className="px-2">◀</Button>
            <span className="text-[12px] text-slate-500 font-medium px-1.5 tabular-nums">
              {currentPage + 1} / {pageCount}
            </span>
            <Button onClick={() => onChangePage(1)} disabled={currentPage >= pageCount - 1 || pages.length === 0} className="px-2">▶</Button>
          </div>
        ),
      })
    }

    items.push('separator')
    items.push({
      id: 'promptLibrary',
      icon: <Book size={14} />,
      label: UI_LABELS.toolbar.promptLibrary.label,
      tooltip: UI_LABELS.toolbar.promptLibrary.tooltip,
      onClick: onOpenPromptLibrary,
      variant: 'primary',
      className: 'shadow-sm',
    })
    items.push('separator')
    items.push({
      id: 'uploadImage',
      icon: <ImageIcon size={14} />,
      label: uploading ? '上传中…' : UI_LABELS.toolbar.uploadImage.label,
      tooltip: UI_LABELS.toolbar.uploadImage.tooltip,
      onClick: onUploadImage,
      disabled: uploading,
    })
    items.push({
      id: 'allowScripts',
      label: '互动脚本控制',
      tooltip: UI_LABELS.toolbar.allowScripts.tooltip,
      node: (
        <label className="flex items-center gap-1.5 text-[12px] text-slate-600 hover:text-slate-900 cursor-pointer select-none px-1">
          <input
            type="checkbox"
            checked={allowScripts}
            onChange={(e) => onToggleAllowScripts(e.target.checked)}
            className="rounded border-slate-300 accent-[var(--accent)] cursor-pointer"
          />
          {UI_LABELS.toolbar.allowScripts.label}
        </label>
      ),
    })
    items.push('separator')

    if (hasPages) {
      items.push({
        id: 'exportCurrentPage',
        icon: <ImageIcon size={14} />,
        label: UI_LABELS.toolbar.exportCurrentPage.label,
        tooltip: UI_LABELS.toolbar.exportCurrentPage.tooltip,
        onClick: onExportCurrentPage,
        disabled: exporting || pages.length === 0,
      })
      items.push({
        id: 'exportZip',
        icon: <Package size={14} />,
        label: exporting ? '打包中…' : UI_LABELS.toolbar.exportZip.label,
        tooltip: UI_LABELS.toolbar.exportZip.tooltip,
        onClick: onExportZip,
        disabled: exporting || pages.length === 0,
      })
    }

    items.push({
      id: 'exportSource',
      icon: <Download size={14} />,
      label: UI_LABELS.toolbar.exportSource.label,
      tooltip: UI_LABELS.toolbar.exportSource.tooltip,
      onClick: onExportSource,
    })

    if (!hasPages) {
      items.push({
        id: 'exportPng',
        icon: <ImageIcon size={14} />,
        label: exporting ? '导出中…' : UI_LABELS.toolbar.exportPng.label,
        tooltip: UI_LABELS.toolbar.exportPng.tooltip,
        onClick: onExportPng,
        disabled: exporting,
      })
    }

    items.push({
      id: 'exportPdf',
      icon: <Printer size={14} />,
      label: UI_LABELS.toolbar.exportPdf.label,
      tooltip: UI_LABELS.toolbar.exportPdf.tooltip,
      onClick: onExportPdf,
      disabled: exporting,
      variant: 'primary',
      className: 'shadow-sm',
    })

    items.push({
      id: 'exportPptx',
      icon: <Presentation size={14} />,
      label: exporting ? '导出中…' : UI_LABELS.toolbar.exportPptx.label,
      tooltip: UI_LABELS.toolbar.exportPptx.tooltip,
      onClick: onExportPptx,
      disabled: exporting,
      variant: 'primary',
      className: 'shadow-sm',
    })

    items.push({
      id: 'exportPptxEditable',
      icon: <Presentation size={14} />,
      label: exporting ? '导出中…' : UI_LABELS.toolbar.exportPptxEditable.label,
      tooltip: UI_LABELS.toolbar.exportPptxEditable.tooltip,
      onClick: onExportPptxEditable,
      disabled: exporting,
    })

    return items
  }, [
    hasPagination,
    pageCount,
    hasPages,
    currentPage,
    pages.length,
    exporting,
    uploading,
    allowScripts,
    onFullscreen,
    onRefresh,
    onOpenPromptLibrary,
    onUploadImage,
    onToggleAllowScripts,
    onExportCurrentPage,
    onExportZip,
    onExportSource,
    onExportPng,
    onExportPdf,
    onExportPptx,
    onExportPptxEditable,
    onChangePage,
  ])
}
