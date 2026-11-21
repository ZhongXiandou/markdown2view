import { useMemo } from 'react'
import type { ToolbarItem } from '@/components/layout/PreviewToolbar'
import { UI_LABELS } from '@/lib/uiLabels'
import { Button } from '@/components/ui/Button'
import { Play, RotateCcw, Book, ImageIcon, Package, Download, Printer, Presentation, Clipboard, Wrench } from '@/components/ui/Icon'
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
  onCopyWechat: () => void
  onExportPng: () => void
  onExportPdf: () => void
  onExportPptx: () => void
  onExportPptxEditable: () => void
}

/**
 * 用 useMemo 聚合 HTML 预览区的工具栏配置，避免 render 阶段 push 数组。
 * left 为准备类操作（指令库、播放、翻页），right 为工具与输出（次要项收进菜单）。
 */
export function useHtmlToolbar(opts: UseHtmlToolbarOptions): { left: ToolbarItem[]; right: ToolbarItem[] } {
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
    onCopyWechat,
    onExportPng,
    onExportPdf,
    onExportPptx,
    onExportPptxEditable,
  } = opts

  const hasPagination = pages.length > 1 || expectedPageCount > 1
  const pageCount = Math.max(pages.length, expectedPageCount)
  const hasPages = pages.length > 0 || expectedPageCount > 1

  return useMemo(() => {
    const L = UI_LABELS.toolbar
    const left: ToolbarItem[] = [
      {
        id: 'promptLibrary',
        icon: <Book size={14} />,
        label: L.promptLibrary.label,
        tooltip: L.promptLibrary.tooltip,
        onClick: onOpenPromptLibrary,
        variant: 'outline',
      },
      {
        id: 'fullscreen',
        icon: <Play size={14} />,
        label: L.fullscreen.label,
        tooltip: L.fullscreen.tooltip,
        onClick: onFullscreen,
      },
    ]

    if (hasPagination) {
      left.push({
        id: 'pagination',
        label: '分页控制',
        node: (
          <div className="flex items-center gap-0.5 px-1">
            <Button onClick={() => onChangePage(-1)} disabled={currentPage === 0} className="px-2" aria-label="上一页">◀</Button>
            <span className="text-[12px] text-slate-500 font-medium px-1.5 tabular-nums">
              {currentPage + 1} / {pageCount}
            </span>
            <Button onClick={() => onChangePage(1)} disabled={currentPage >= pageCount - 1 || pages.length === 0} className="px-2" aria-label="下一页">▶</Button>
          </div>
        ),
      })
    }

    const noPages = exporting || pages.length === 0
    const right: ToolbarItem[] = [
      {
        id: 'tools',
        icon: <Wrench size={14} />,
        label: '工具',
        menu: [
          { id: 'uploadImage', icon: <ImageIcon size={14} />, label: uploading ? '上传中…' : L.uploadImage.label, hint: L.uploadImage.tooltip, onClick: onUploadImage, disabled: uploading },
          { id: 'refresh', icon: <RotateCcw size={14} />, label: '刷新预览', hint: L.refresh.tooltip, onClick: onRefresh },
          'separator',
          { id: 'allowScripts', label: L.allowScripts.label, hint: L.allowScripts.tooltip, checked: allowScripts, onClick: () => onToggleAllowScripts(!allowScripts) },
        ],
      },
      {
        id: 'exportMore',
        icon: <Download size={14} />,
        label: exporting ? '导出中…' : '导出',
        menu: [
          ...(hasPages
            ? [
                { id: 'exportCurrentPage', icon: <ImageIcon size={14} />, label: L.exportCurrentPage.label, hint: L.exportCurrentPage.tooltip, onClick: onExportCurrentPage, disabled: noPages },
                { id: 'exportZip', icon: <Package size={14} />, label: L.exportZip.label, hint: L.exportZip.tooltip, onClick: onExportZip, disabled: noPages },
              ]
            : [{ id: 'exportPng', icon: <ImageIcon size={14} />, label: L.exportPng.label, hint: L.exportPng.tooltip, onClick: onExportPng, disabled: exporting }]),
          'separator' as const,
          { id: 'exportPptx', icon: <Presentation size={14} />, label: L.exportPptx.label, hint: L.exportPptx.tooltip, onClick: onExportPptx, disabled: exporting },
          { id: 'exportPptxEditable', icon: <Presentation size={14} />, label: L.exportPptxEditable.label, hint: L.exportPptxEditable.tooltip, onClick: onExportPptxEditable, disabled: exporting },
          'separator' as const,
          { id: 'copyWechat', icon: <Clipboard size={14} />, label: L.copyWechat.label, hint: L.copyWechat.tooltip, onClick: onCopyWechat, disabled: exporting },
          { id: 'exportSource', icon: <Download size={14} />, label: L.exportSource.label, hint: L.exportSource.tooltip, onClick: onExportSource },
        ],
      },
      {
        id: 'exportPdf',
        icon: <Printer size={14} />,
        label: L.exportPdf.label,
        tooltip: L.exportPdf.tooltip,
        onClick: onExportPdf,
        disabled: exporting,
        variant: 'primary',
        className: 'shadow-sm',
      },
    ]

    return { left, right }
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
    onCopyWechat,
    onExportPng,
    onExportPdf,
    onExportPptx,
    onExportPptxEditable,
    onChangePage,
  ])
}
