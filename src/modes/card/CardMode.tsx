import { useEffect, useMemo, useRef, useState } from "react";
import { useScrollSync } from "@/lib/useScrollSync";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { copyText } from "@/lib/clipboard";
import { buildCardAiGuide } from "@/lib/aiGuide";
import { downloadBlob, elementToBlob } from "@/lib/exportImage";
import { downloadAsZip, type ZipEntry } from "@/lib/export/zipDownload";
import { parseMarkdown, collectMermaidDiagrams, preRenderMermaid, type ThemeColors } from "@engine";
import { useEditorDocSync } from "@/lib/useEditorDocSync";
import {
  ASPECTS,
  XHS,
  PAD_X,
  buildContentCard,
  buildCover,
  type XhsAspect,
} from "@/engine/utils/xhsCards";
import { createCardModel, type CardPlatform } from "./cardModel";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { FontSelect } from "@/components/ui/FontSelect";
import { useStore } from "@/lib/store";
import { getFontFamilyCss } from "@/lib/fonts";
import { UI_LABELS } from "@/lib/uiLabels";
import {
  PreviewToolbar,
  type ToolbarItem,
} from "@/components/layout/PreviewToolbar";
import { CustomPromptPopover } from "@/components/layout/CustomPromptPopover";
import { exportMarkdownSource } from '@/lib/exportSource'
import { useBlockHeights } from '@/lib/useBlockHeights'
import { useExportAction } from '@/lib/useExportAction'
import { UserGuidePopover } from '@/components/ui/UserGuidePopover'
import { ModeLayout } from '@/components/layout/ModeLayout'
import { Sparkles, Download, Clipboard, ImageIcon, Package } from '@/components/ui/Icon'

interface CardModeProps {
  markdown: string;
  setMarkdown: (markdown: string) => void;
  colors: ThemeColors;
  platform: CardPlatform;
  onToast: (message: string) => void;
}

interface PreviewCard {
  id: string;
  label: string;
  kind: "cover" | "content";
  html: string;
}

function fileSafe(name: string) {
  return (name || "card").replace(/[\\/:*?"<>|]/g, "_").slice(0, 40);
}

export function CardMode({
  markdown,
  setMarkdown,
  colors,
  platform,
  onToast,
}: CardModeProps) {
  const [aspect, setAspect] = useState<XhsAspect>("3:4");
  const [exporting, , runExport] = useExportAction(onToast);
  const cardFont = useStore((s) => s.cardFont);
  const setCardFont = useStore((s) => s.setCardFont);
  const guideTrigger = useStore((s) => s.guideTrigger.card);
  const [authorName, setAuthorName] = useState("Pintley Tasia");
  const cardRefs = useRef<Record<string, HTMLElement | null>>({});
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  const editorScrollerRef = useRef<HTMLElement | null>(null);
  const previewScrollRef = useRef<HTMLDivElement>(null);
  const [editorReady, setEditorReady] = useState(0);

  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const el = previewScrollRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect;
      setContainerWidth(rect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const measuringRef = useRef<HTMLDivElement>(null);

  useScrollSync(editorScrollerRef, previewScrollRef, [editorReady]);

  const size = ASPECTS[aspect];
  // 给四周留出均匀的呼吸感：卡片总高 - 页脚高度(44) - 顶部留白(32) - 底部留白(24)
  const pixelBudget = size.h - 44 - 32 - 24;

  const cardScale = containerWidth > 0
    ? Math.min(1, (containerWidth - 40) / size.w)
    : 1;

  // store ↔ 编辑器双向同步（防抖回写 + 外部变更信号）
  const {
    localValue: localMarkdown,
    debouncedValue: debouncedMarkdown,
    setLocalValue: setLocalMarkdown,
    externalVersion,
  } = useEditorDocSync(markdown, setMarkdown);

  // mermaid 预渲染：与 A4 同构
  const [mermaidMap, setMermaidMap] = useState<Map<string, { svg: string; error?: string }> | undefined>(undefined)
  useEffect(() => {
    const diagrams = collectMermaidDiagrams(debouncedMarkdown)
    if (diagrams.length === 0) {
      setMermaidMap(undefined)
      return
    }
    const width = ASPECTS[aspect].w - 2 * PAD_X
    let cancelled = false
    preRenderMermaid(diagrams, width).then((map) => {
      if (!cancelled) setMermaidMap(map)
    })
    return () => { cancelled = true }
  }, [debouncedMarkdown, aspect])

  const [actualHeights] = useBlockHeights(measuringRef, [
    debouncedMarkdown,
    aspect,
    colors,
  ]);

  const model = useMemo(
    () =>
      createCardModel(
        debouncedMarkdown,
        aspect,
        platform,
        Object.keys(actualHeights).length ? actualHeights : undefined,
        pixelBudget,
      ),
    [debouncedMarkdown, aspect, platform, actualHeights, pixelBudget],
  );

  const finalBrand = authorName || model.meta.brand;

  const cards = useMemo<PreviewCard[]>(() => {
    const total = Math.max(1, model.pages.length);
    return [
      {
        id: "cover",
        label: "封面图",
        kind: "cover",
        html: buildCover(
          { ...model.meta, brand: finalBrand },
          aspect,
          colors,
          getFontFamilyCss(cardFont),
        ),
      },
      ...model.pages.map((page, index) => ({
        id: page.id,
        label: `内容图 ${index + 1}`,
        kind: "content" as const,
        html: buildContentCard(
          parseMarkdown(page.markdown, colors, undefined, mermaidMap, onToast),
          aspect,
          index + 1,
          total,
          finalBrand,
          colors,
          getFontFamilyCss(cardFont),
        ),
      })),
    ];
  }, [model, aspect, colors, cardFont, mermaidMap]);

  const exportOne = (card: PreviewCard, index: number) => {
    const node = cardRefs.current[card.id];
    if (!node) {
      onToast("卡片尚未渲染完成");
      return;
    }

    runExport(async () => {
      const container = cardsContainerRef.current;
      const prevZoom = container ? container.style.zoom : '';
      if (container) container.style.zoom = '1';
      try {
        const blob = await elementToBlob(node, {
          scale: 3,
          backgroundColor: card.kind === "cover" ? XHS.bg : "#ffffff",
        });
        const prefix = "card";
        downloadBlob(
          blob,
          `${prefix}-${String(index + 1).padStart(2, "0")}-${fileSafe(model.meta.title)}.png`,
        );
        return `已导出 ${card.label}`;
      } finally {
        if (container) container.style.zoom = prevZoom;
      }
    });
  };

  const exportAll = () => {
    runExport(async () => {
      const container = cardsContainerRef.current;
      const prevZoom = container ? container.style.zoom : '';
      if (container) container.style.zoom = '1';
      try {
        for (let i = 0; i < cards.length; i += 1) {
          const node = cardRefs.current[cards[i].id];
          if (!node) throw new Error(`${cards[i].label} 尚未渲染完成`);
          const blob = await elementToBlob(node, {
            scale: 3,
            backgroundColor: cards[i].kind === "cover" ? XHS.bg : "#ffffff",
          });
          const prefix = "card";
          downloadBlob(
            blob,
            `${prefix}-${String(i + 1).padStart(2, "0")}-${fileSafe(model.meta.title)}.png`,
          );
        }
        return `已导出 ${cards.length} 张图片`;
      } finally {
        if (container) container.style.zoom = prevZoom;
      }
    });
  };

  const exportZip = () => {
    runExport(async () => {
      const container = cardsContainerRef.current;
      const prevZoom = container ? container.style.zoom : '';
      if (container) container.style.zoom = '1';
      try {
        const entries: ZipEntry[] = [];
        for (let i = 0; i < cards.length; i++) {
          const node = cardRefs.current[cards[i].id];
          if (!node) throw new Error(`${cards[i].label} 尚未渲染完成`);
          const blob = await elementToBlob(node, {
            scale: 3,
            backgroundColor: cards[i].kind === "cover" ? XHS.bg : "#ffffff",
          });
          entries.push({
            filename: `card-${String(i + 1).padStart(2, "0")}-${fileSafe(model.meta.title)}.png`,
            blob,
          });
        }
        const zipName = `${fileSafe(model.meta.title) || "cards"}.zip`;
        await downloadAsZip(entries, zipName);
        return `已打包 ${entries.length} 张图片`;
      } finally {
        if (container) container.style.zoom = prevZoom;
      }
    });
  };

  const copyCaption = async () => {
    const ok = await copyText(model.caption);
    onToast(ok ? "已复制发布文案" : "复制失败，请重试");
  };

  const handleCopyGuide = async () => {
    const ok = await copyText(buildCardAiGuide(aspect));
    onToast(ok ? "已复制图文卡片排版指令，可发给 AI 使用" : "复制失败，请重试");
  };

  const toolbarActions: ToolbarItem[] = [
    {
      id: "copyGuide",
      icon: <Sparkles size={14} />,
      label: "复制排版指令",
      tooltip: "复制图文卡片排版 AI 指令",
      onClick: handleCopyGuide,
    },
    {
      id: "customPrompt",
      label: "自定义指令",
      node: <CustomPromptPopover mode="card" onToast={onToast} />,
    },
    "separator",
    {
      id: 'exportSource',
      icon: <Download size={14} />,
      label: UI_LABELS.toolbar.exportSource.label,
      tooltip: '导出为 .md 文件',
      onClick: () => {
        const title = fileSafe(model.meta.title) || 'card'
        exportMarkdownSource(debouncedMarkdown, `${title}.md`)
      },
    },
    {
      id: "copyCaption",
      icon: <Clipboard size={14} />,
      label: "复制文案",
      tooltip: "复制生成的小红书发布文案",
      onClick: copyCaption,
      disabled: !model.caption,
    },
    "separator",
    {
      id: "exportAll",
      icon: <ImageIcon size={14} />,
      label: "下载单图",
      tooltip: "逐张下载所有生成的图片",
      onClick: exportAll,
      disabled: exporting || !cards.length,
    },
    {
      id: "exportZip",
      icon: <Package size={14} />,
      label: exporting ? "打包中…" : UI_LABELS.toolbar.exportZip.label,
      tooltip: UI_LABELS.toolbar.exportZip.tooltip,
      onClick: exportZip,
      disabled: exporting || !cards.length,
      variant: "primary",
    },
  ];

  const toolbarLeftContent = (
    <>
      <label className="flex items-center gap-1.5 text-[12px] text-slate-500 shrink-0">
        作者名
        <Input
          value={authorName}
          placeholder={model.meta.brand}
          onChange={(e) => setAuthorName(e.target.value)}
          className="w-24"
        />
      </label>
      <Select
        value={aspect}
        onChange={(e) => setAspect(e.target.value as XhsAspect)}
        aria-label="选择卡片比例"
        title="选择卡片比例"
      >
        <option value="3:4">3:4比例</option>
        <option value="9:16">9:16比例</option>
      </Select>
      <FontSelect value={cardFont} onChange={setCardFont} />
    </>
  );

  return (
    <>
      <ModeLayout
        previewClassName="bg-slate-100"
        editor={
          <CodeEditor
            value={localMarkdown}
            onChange={setLocalMarkdown}
            externalVersion={externalVersion}
            mode="card"
            onScrollerReady={(el) => {
              editorScrollerRef.current = el;
              setEditorReady((n) => n + 1);
            }}
            onToast={onToast}
          />
        }
        toolbar={
          <PreviewToolbar
            leftContent={toolbarLeftContent}
            actions={toolbarActions}
            className="shrink-0"
          />
        }
        preview={
          <div
            ref={previewScrollRef}
            className="flex-1 overflow-auto flex flex-col gap-4 px-5 py-5"
          >
            <aside className="mx-auto w-full max-w-[480px] rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-[13px] leading-6 text-blue-800">
              当前分页图文适合快速生成清晰、统一的多页卡片；如果需要更强的品牌风格、复杂版式或活动海报，可以切换到自由画布使用“小红书多页图文”风格深度生成。
            </aside>
            <aside className="group relative mx-auto w-full max-w-[480px] rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-xs font-semibold text-slate-400">
                  发布文案
                </div>
                <button
                  onClick={copyCaption}
                  disabled={!model.caption}
                  className="text-xs font-medium text-[var(--accent)] opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-0"
                >
                  复制
                </button>
              </div>
              <pre className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                {model.caption ||
                  "从 frontmatter 或 <title> 中补充 title / summary / chips 后，这里会生成可复制文案。"}
              </pre>
            </aside>

            <div
              ref={cardsContainerRef}
              className="flex flex-col items-center gap-6 pb-12"
              style={{
                zoom: cardScale < 1 ? cardScale : undefined,
              }}
            >
              {/* 隐藏测量容器 */}
              <div
                ref={measuringRef}
                className="social-card-render"
                style={{
                  position: "absolute",
                  visibility: "hidden",
                  top: -9999,
                  width: size.w,
                  boxSizing: "border-box",
                  padding: "32px 30px 0",
                  fontSize: 15,
                  lineHeight: 1.8,
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  fontFamily: getFontFamilyCss(cardFont),
                }}
              >
                {model.rawBlocks?.map((block, i) => (
                  <section
                    key={`block-${i}`}
                    data-block-id={`block-${i}`}
                    dangerouslySetInnerHTML={{
                      __html: parseMarkdown(block, colors, undefined, mermaidMap, onToast),
                    }}
                  />
                ))}
              </div>

              {cards.map((card, index) => (
                <div
                  key={card.id}
                  className="group relative shadow-md transition-shadow hover:shadow-lg"
                  style={{ width: size.w, height: size.h }}
                >
                  <div
                    ref={(el) => {
                      cardRefs.current[card.id] = el;
                    }}
                    className="h-full w-full overflow-hidden rounded-md bg-white"
                    dangerouslySetInnerHTML={{ __html: card.html }}
                  />

                  {/* 悬浮下载按钮 */}
                  <button
                    onClick={() => exportOne(card, index)}
                    disabled={exporting}
                    className="absolute -right-3 -bottom-3 flex h-8 items-center justify-center gap-1 rounded-full border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 opacity-0 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900 group-hover:opacity-100 disabled:opacity-0"
                    title={`下载${card.label}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    下载
                  </button>
                </div>
              ))}
            </div>
          </div>
        }
      />
      <UserGuidePopover
        guideKey="m2v-card-guide-seen"
        forceOpenTrigger={guideTrigger}
        title="图文卡片 使用指引"
        subtitle="利用 AI 创作指令，轻松打造高颜值小红书等多页社交知识卡片"
        steps={[
          {
            icon: 'copy',
            title: '复制排版指令',
            shortDesc: '点击「复制排版指令」，获取包含多页卡片分隔语法与爆款文案框架的 AI 提示词。',
          },
          {
            icon: 'ai',
            title: '发给 AI 创作/精简内容',
            shortDesc: '将指令与内容想法发给 AI，让其精炼文字并输出适合多卡片分割的 Markdown。',
          },
          {
            icon: 'export',
            title: '回填内容并打包下载',
            shortDesc: '粘贴 Markdown 到编辑器，自动切割卡片后可复制文案并打包下载 PNG。',
          },
        ]}
      />
    </>
  );
}
