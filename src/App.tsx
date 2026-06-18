import { Suspense, lazy, useEffect, useState, useCallback } from "react";
import { useStore, useContentStore, type DemoContents } from "@/lib/store";
import type { RenderMode } from "@/lib/store";
import { Toast, type ToastState } from "@/components/ui/Toast";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { AppHeader } from "@/components/layout/AppHeader";
import { MobileDrawer } from "@/components/layout/MobileDrawer";
import { SettingsModal } from "@/components/editor/SettingsModal";
import { PrivacyModal } from "@/components/layout/PrivacyModal";
import { BrowserCompatDialog } from "@/components/ui/BrowserCompatDialog";

import { DEMO_ARTICLE } from "@/data/demoArticle";
import { DEMO_DOCUMENT } from "@/data/demoDocument";
import { DEMO_CARD } from "@/data/demoCard";
import { DEMO_HTML } from "@/data/demoHtml";

const ArticleMode = lazy(() =>
  import("@/modes/article/ArticleMode").then((m) => ({
    default: m.ArticleMode,
  })),
);
const DocumentMode = lazy(() =>
  import("@/modes/document/DocumentMode").then((m) => ({
    default: m.DocumentMode,
  })),
);
const CardMode = lazy(() =>
  import("@/modes/card/CardMode").then((m) => ({ default: m.CardMode })),
);
const HtmlMode = lazy(() =>
  import("@/modes/html/HtmlMode").then((m) => ({ default: m.HtmlMode })),
);

function ModeLoading() {
  return (
    <main className="flex min-h-0 flex-1 items-center justify-center bg-slate-50 text-sm text-slate-400">
      正在加载工作台...
    </main>
  );
}

function ModeErrorFallback() {
  return (
    <main className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 bg-slate-50 text-sm text-slate-500">
      <span>渲染模块出现异常</span>
      <button
        onClick={() => window.location.reload()}
        className="rounded-md border border-slate-200 bg-white px-4 py-1.5 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
      >
        刷新页面
      </button>
    </main>
  );
}

// 各模式最新示例内容集合（模块级常量，引用稳定），供版本同步与恢复示例使用。
const DEMOS: DemoContents = {
  article: DEMO_ARTICLE,
  document: DEMO_DOCUMENT,
  card: DEMO_CARD,
  html: DEMO_HTML,
};

// 多场景渲染工作台：长图文 / A4 文档 / 小红书卡片 / HTML 可视化。
export default function App() {
  const articleMarkdown = useContentStore((s) => s.articleMarkdown);
  const setArticleMarkdown = useContentStore((s) => s.setArticleMarkdown);
  const documentMarkdown = useContentStore((s) => s.documentMarkdown);
  const setDocumentMarkdown = useContentStore((s) => s.setDocumentMarkdown);
  const cardMarkdown = useContentStore((s) => s.cardMarkdown);
  const setCardMarkdown = useContentStore((s) => s.setCardMarkdown);
  const html = useContentStore((s) => s.html);
  const setHtml = useContentStore((s) => s.setHtml);
  const syncDemoContent = useContentStore((s) => s.syncDemoContent);
  const restoreDemo = useContentStore((s) => s.restoreDemo);
  const contentHydrated = useContentStore((s) => s.hasHydrated);

  const colors = useStore((s) => s.colors);
  const accent = useStore((s) => s.accent);
  const setTheme = useStore((s) => s.setTheme);
  const mode = useStore((s) => s.mode);
  const setMode = useStore((s) => s.setMode);
  const platform = useStore((s) => s.platform);
  const setPlatform = useStore((s) => s.setPlatform);
  const documentSettings = useStore((s) => s.documentSettings);
  const updateDocumentSettings = useStore((s) => s.updateDocumentSettings);
  const triggerGuide = useStore((s) => s.triggerGuide);
  const appHydrated = useStore((s) => s.hasHydrated);
  const hasHydrated = contentHydrated && appHydrated;

  // 图床设置弹窗状态
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  // 隐私说明弹窗状态
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  // 移动端侧边菜单抽屉状态
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // 导航栏宽度（用于判断是否自动关闭抽屉）
  const [headerWidth, setHeaderWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 1200,
  );

  // 统一 Toast 反馈
  const [toast, setToast] = useState<ToastState | null>(null);
  const showToast = useCallback((message: string) => setToast({ message, key: Date.now() }), []);

  const handleWidthChange = useCallback((w: number) => setHeaderWidth(w), []);

  // 视口拓宽至桌面端时自动关闭移动端侧边抽屉
  useEffect(() => {
    if (headerWidth >= 960) {
      setIsMobileMenuOpen(false);
    }
  }, [headerWidth]);

  // 持久化恢复完成后，按版本号同步示例：仅当 DEMO_VERSION 变化时，刷新用户未编辑过的字段为最新示例。
  useEffect(() => {
    if (!hasHydrated) return;
    syncDemoContent(DEMOS);
  }, [hasHydrated, syncDemoContent]);

  const restoreDocumentSettingsDemo = useStore((s) => s.restoreDocumentSettingsDemo);

  const handleRestoreDemo = useCallback(() => {
    if (
      window.confirm(
        "确定要恢复当前模块的示例内容吗？这将会覆盖当前编辑区内容。",
      )
    ) {
      if (mode === 'document') {
        restoreDocumentSettingsDemo();
      }
      restoreDemo(mode, DEMOS);
      showToast("已恢复当前模块示例");
    }
  }, [mode, restoreDemo, restoreDocumentSettingsDemo, showToast]);

  // 监听子组件打开设置弹窗的请求（如 Mermaid 图床提醒弹窗的「配置图床」按钮）
  useEffect(() => {
    const handler = () => setIsSettingsOpen(true)
    window.addEventListener('m2v-open-settings', handler)
    return () => window.removeEventListener('m2v-open-settings', handler)
  }, []);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <AppHeader
        mode={mode}
        setMode={setMode}
        accent={accent}
        setTheme={setTheme}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onRestoreDemo={handleRestoreDemo}
        onTriggerGuide={() => triggerGuide(mode)}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        onWidthChange={handleWidthChange}
      />

      {/* 主体：按模式渲染 */}
      {/* key={mode} 保证切换模式时错误状态自动重置 */}
      <ErrorBoundary key={mode} fallback={<ModeErrorFallback />}>
        <Suspense fallback={<ModeLoading />}>
          {mode === "article" && (
            <ArticleMode
              markdown={articleMarkdown}
              setMarkdown={setArticleMarkdown}
              colors={colors}
              onToast={showToast}
            />
          )}
          {mode === "html" && (
            <HtmlMode html={html} setHtml={setHtml} onToast={showToast} />
          )}
          {mode === "document" && (
            <DocumentMode
              markdown={documentMarkdown}
              setMarkdown={setDocumentMarkdown}
              colors={colors}
              settings={documentSettings}
              updateSettings={updateDocumentSettings}
              onToast={showToast}
            />
          )}
          {mode === "card" && (
            <CardMode
              markdown={cardMarkdown}
              setMarkdown={setCardMarkdown}
              colors={colors}
              platform={platform === "xiaohongshu" ? platform : "xiaohongshu"}
              setPlatform={setPlatform}
              onToast={showToast}
            />
          )}
        </Suspense>
      </ErrorBoundary>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />
      <Toast toast={toast} />

      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        mode={mode}
        setMode={setMode}
        accent={accent}
        setTheme={setTheme}
        onTriggerGuide={() => triggerGuide(mode)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        onRestoreDemo={handleRestoreDemo}
      />

      {/* 浏览器兼容性警告（z-55，优先级高于用户指引 z-35） */}
      <BrowserCompatDialog />
    </div>
  );
}
