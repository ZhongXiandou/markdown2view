import { Suspense, lazy, useEffect, useState, useRef } from "react";
import { useStore, type DemoContents } from "@/lib/store";
import { Toast, type ToastState } from "@/components/ui/Toast";
import { ModeTabs } from "@/components/layout/ModeTabs";
import { THEMES } from "@engine/composables/useTheme";
import { SettingsModal } from "@/components/editor/SettingsModal";
import { PrivacyModal } from "@/components/layout/PrivacyModal";
import { HeaderMoreMenu } from "@/components/layout/HeaderMoreMenu";

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

// 各模式最新示例内容集合（模块级常量，引用稳定），供版本同步与恢复示例使用。
const DEMOS: DemoContents = {
  article: DEMO_ARTICLE,
  document: DEMO_DOCUMENT,
  card: DEMO_CARD,
  html: DEMO_HTML,
};

// 多场景渲染工作台：长图文 / A4 文档 / 小红书卡片 / HTML 可视化。
export default function App() {
  const articleMarkdown = useStore((s) => s.articleMarkdown);
  const setArticleMarkdown = useStore((s) => s.setArticleMarkdown);
  const documentMarkdown = useStore((s) => s.documentMarkdown);
  const setDocumentMarkdown = useStore((s) => s.setDocumentMarkdown);
  const cardMarkdown = useStore((s) => s.cardMarkdown);
  const setCardMarkdown = useStore((s) => s.setCardMarkdown);
  const html = useStore((s) => s.html);
  const setHtml = useStore((s) => s.setHtml);
  const colors = useStore((s) => s.colors);
  const accent = useStore((s) => s.accent);
  const setTheme = useStore((s) => s.setTheme);
  const mode = useStore((s) => s.mode);
  const setMode = useStore((s) => s.setMode);
  const platform = useStore((s) => s.platform);
  const setPlatform = useStore((s) => s.setPlatform);
  const documentSettings = useStore((s) => s.documentSettings);
  const updateDocumentSettings = useStore((s) => s.updateDocumentSettings);
  const syncDemoContent = useStore((s) => s.syncDemoContent);
  const restoreDemo = useStore((s) => s.restoreDemo);
  const triggerGuide = useStore((s) => s.triggerGuide);

  // 图床设置弹窗状态
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  // 隐私说明弹窗状态
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  // 移动端侧边菜单抽屉状态
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 统一 Toast 反馈
  const [toast, setToast] = useState<ToastState | null>(null);
  const showToast = (message: string) => setToast({ message, key: Date.now() });

  // 导航栏宽度动态自适应测量
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerWidth, setHeaderWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 1200,
  );

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect;
      setHeaderWidth(rect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // 视口拓宽至桌面端时自动关闭移动端侧边抽屉
  useEffect(() => {
    if (headerWidth >= 960) {
      setIsMobileMenuOpen(false);
    }
  }, [headerWidth]);

  // 挂载时按版本号同步示例：仅当 DEMO_VERSION 变化时，刷新用户未编辑过的字段为最新示例。
  useEffect(() => {
    syncDemoContent(DEMOS);
  }, [syncDemoContent]);

  const handleRestoreDemo = () => {
    if (
      window.confirm(
        "确定要恢复当前模块的示例内容吗？这将会覆盖当前编辑区内容。",
      )
    ) {
      restoreDemo(mode, DEMOS);
      showToast("已恢复当前模块示例");
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header
        ref={headerRef}
        className="app-header relative z-20 flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 shadow-sm"
      >
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="app-logo-bg flex h-7 w-7 items-center justify-center rounded-md text-white shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
                <path d="M2 2l7.586 7.586"></path>
                <circle cx="11" cy="11" r="2"></circle>
              </svg>
            </div>
            {headerWidth >= 1300 ? (
              <h1 className="text-[17px] font-bold tracking-tight text-slate-800">
                markdown<span className="app-title-accent">2</span>view
              </h1>
            ) : (
              <h1 className="text-[17px] font-bold tracking-tight text-slate-800">
                m2v
              </h1>
            )}
          </div>
          {/* 多模式切换：仅在宽度 >= 960px 时显示 */}
          {headerWidth >= 960 && (
            <ModeTabs mode={mode} onChange={setMode} />
          )}
        </div>

        {/* 桌面与平板端功能按钮区 (>=960px) */}
        {headerWidth >= 960 ? (
          <div className="flex items-center gap-4">
            {/* BeeEffy: 仅在 1300px 以上展示；在 1450px 以上展示文字 */}
            {headerWidth >= 1300 && (
              <a
                href="https://www.beeeffy.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[12px] font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
                title="作者的另一个项目：BeeEffy——个人AI待办与复盘成长系统"
              >
                <svg width="48" height="14" viewBox="0 0 77.63 21.69" fill="none" stroke="currentColor" className="shrink-0">
                  <circle cx="10.84" cy="10.84" r="10.84" fill="currentColor" stroke="none" />
                  <circle cx="35.1" cy="10.84" r="10.84" fill="currentColor" stroke="none" opacity="0.45" />
                  <circle cx="66.79" cy="10.84" r="10.84" fill="currentColor" stroke="none" opacity="0.45" />
                  <path d="M50.74 1.97 L62.55 10.84 L50.74 19.72" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M64.32 1.97 L76.13 10.84 L64.32 19.72" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.45" />
                </svg>
                {headerWidth >= 1450 && <span>BeeEffy</span>}
              </a>
            )}

            {headerWidth >= 1300 && <div className="w-px h-4 bg-slate-200" />}

            {/* GitHub: 始终直观展示 */}
            <a
              href="https://github.com/ZhongXiandou/markdown2view"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center rounded-md px-2 py-1.5 text-[12px] font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
              title="完全开源的纯前端项目，数据不传输至服务器。访问 GitHub 源码仓库"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
            </a>

            {/* 使用帮助: 始终直观展示 */}
            <button
              onClick={() => triggerGuide(mode)}
              className="flex items-center rounded-md px-2 py-1.5 text-[12px] font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
              title="查看使用帮助"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <path d="M12 17h.01" />
              </svg>
            </button>

            <div className="w-px h-4 bg-slate-200" />

            {/* 图床设置: 仅在 1300px 以上展示；在 1450px 以上展示文字 */}
            {headerWidth >= 1300 && (
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[12px] font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
                title="图床设置 (配置图片上传与云存储参数)"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
                {headerWidth >= 1450 && <span>图床设置</span>}
              </button>
            )}

            {headerWidth >= 1300 && <div className="w-px h-4 bg-slate-200" />}

            {/* 恢复示例: 仅在 1300px 以上展示；在 1450px 以上展示文字 */}
            {headerWidth >= 1300 && (
              <button
                onClick={handleRestoreDemo}
                className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[12px] font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
                title="恢复当前模块的示例内容"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                  <path d="M3 3v5h5"></path>
                </svg>
                {headerWidth >= 1450 && <span>恢复示例</span>}
              </button>
            )}

            {headerWidth >= 1300 && <div className="w-px h-4 bg-slate-200" />}

            {/* 主题色 */}
            <div className="flex items-center gap-1.5">
              {THEMES.map((t) => (
                <button
                  key={t.accent}
                  title={t.accent}
                  onClick={() => setTheme(t.accent, t.dark)}
                  className="h-5 w-5 rounded-full border transition-transform hover:scale-110 cursor-pointer"
                  style={{
                    background: t.accent,
                    borderColor: accent === t.accent ? "#111" : "transparent",
                    outline: accent === t.accent ? "2px solid #1118" : "none",
                  }}
                />
              ))}
            </div>

            {headerWidth < 1300 && <div className="w-px h-4 bg-slate-200" />}

            {/* 更多菜单 (•••): 仅在 960px - 1300px 下展示 */}
            {headerWidth < 1300 && (
              <HeaderMoreMenu
                onOpenSettings={() => setIsSettingsOpen(true)}
                onRestoreDemo={handleRestoreDemo}
              />
            )}
          </div>
        ) : null}

        {/* 移动端汉堡菜单按钮 (宽度 < 960px) */}
        {headerWidth < 960 && (
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
            title="更多菜单"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        )}
      </header>

      {/* 主体：按模式渲染 */}
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

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />
      <Toast toast={toast} />

      {/* 移动端侧边菜单抽屉 */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-fade-in">
          {/* 遮罩点击关闭 */}
          <div className="absolute inset-0" onClick={() => setIsMobileMenuOpen(false)} />

          {/* 抽屉面板 */}
          <div className="relative w-80 max-w-full h-full bg-white shadow-2xl flex flex-col p-6 animate-slide-in-right overflow-y-auto">
            {/* 头部 */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <div className="app-logo-bg flex h-6 w-6 items-center justify-center rounded-md text-white shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path></svg>
                </div>
                <span className="font-bold text-slate-800 text-[15px]">markdown2view</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                aria-label="关闭菜单"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            {/* 模块模式切换卡片区 */}
            <div className="mb-6">
              <div className="mb-2.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">切换场景模式</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'document', label: 'A4 规范文档', icon: '📄' },
                  { key: 'article', label: '长图文排版', icon: '📚' },
                  { key: 'card', label: '分页图文卡', icon: '🖼️' },
                  { key: 'html', label: '自由画布', icon: '🎨' }
                ].map((m) => {
                  const active = mode === m.key
                  return (
                    <button
                      key={m.key}
                      onClick={() => {
                        setMode(m.key as any)
                        setIsMobileMenuOpen(false)
                      }}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        active
                          ? 'border-[var(--accent)] bg-emerald-50/30 text-[var(--accent)] font-semibold shadow-sm'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-[20px] mb-1.5">{m.icon}</span>
                      <span className="text-[12px]">{m.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 功能列表 */}
            <div className="space-y-3 mb-6 flex-1">
              <div className="mb-2.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">系统功能</div>
              
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  triggerGuide(mode)
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-[13px] font-medium text-slate-700 transition-colors cursor-pointer"
              >
                <span className="text-lg">❓</span>
                <span>查看使用帮助</span>
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  setIsSettingsOpen(true)
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-[13px] font-medium text-slate-700 transition-colors cursor-pointer"
              >
                <span className="text-lg">⚙️</span>
                <span>图床参数配置</span>
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  handleRestoreDemo()
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-[13px] font-medium text-slate-700 transition-colors cursor-pointer"
              >
                <span className="text-lg">🔄</span>
                <span>恢复当前示例内容</span>
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  setIsPrivacyOpen(true)
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-[13px] font-medium text-slate-700 transition-colors cursor-pointer"
              >
                <span className="text-lg">🛡️</span>
                <span>隐私与安全说明</span>
              </button>
            </div>

            {/* 主题色切换 */}
            <div className="border-t border-slate-100 pt-5 mb-6">
              <div className="mb-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">切换系统主题色</div>
              <div className="flex items-center gap-3 justify-center">
                {THEMES.map((t) => (
                  <button
                    key={t.accent}
                    title={t.accent}
                    onClick={() => setTheme(t.accent, t.dark)}
                    className="h-8 w-8 rounded-full border transition-transform hover:scale-110 cursor-pointer flex items-center justify-center"
                    style={{
                      background: t.accent,
                      borderColor: accent === t.accent ? "#111" : "transparent",
                      boxShadow: accent === t.accent ? "0 0 0 2px #fff, 0 0 0 4px var(--accent)" : "none"
                    }}
                  />
                ))}
              </div>
            </div>

            {/* 关于与外链 */}
            <div className="border-t border-slate-100 pt-5 text-center space-y-4">
              <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
                <a
                  href="https://github.com/ZhongXiandou/markdown2view"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline flex items-center gap-1"
                >
                  GitHub 仓库
                </a>
                <span className="text-slate-300">|</span>
                <a
                  href="https://www.beeeffy.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  作者网站 BeeEffy
                </a>
              </div>
              <div className="text-[11px] text-slate-400 leading-relaxed">
                本项目为 100% 纯前端开源工具<br />所有编辑数据均存储在您的本地浏览器中 🛡️
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
