/**
 * iframe 内的 Paged.js 运行时：外壳 HTML + 引导脚本 + 父页样式克隆。
 *
 * 设计要点：
 * - Paged.js 的 Polisher 使用全局 document.head 注入样式，故必须在 iframe 内执行才能隔离。
 * - polyfill 以静态资源方式从 /vendor 引入，暴露 window.Paged.{Previewer,Handler,registerHandlers}。
 * - 引导脚本定义 window.__m2vRender(contentHtml, pageCss)，供父页防抖重排时调用；
 *   每次重排前清理上轮注入样式与页面节点，避免样式/页面累积。
 * - 表格续接 Handler 在 afterParsed 按 data-ref 缓存原始表头，afterPageLayout 对
 *   data-split-from 的续接片段补回表头并插入「（续表）」。
 */

export const PAGED_POLYFILL_URL = '/vendor/pagedjs/paged.polyfill.min.js'

/** 收集父文档的样式表（<style> 与 <link rel=stylesheet>）以注入 iframe，复用既有 .document-* 排版样式 */
export function collectParentStyles(): string {
  const nodes = document.querySelectorAll('style, link[rel="stylesheet"], link[rel="preconnect"]')
  let html = ''
  nodes.forEach((node) => {
    html += node.outerHTML
  })
  return html
}

/** 在 iframe 内执行的引导脚本（字符串，注意不得包含字面量 </script>） */
const BOOTSTRAP_SCRIPT = `
(function () {
  function whenReady(fn) {
    if (window.Paged && window.Paged.Previewer) { fn(); }
    else { setTimeout(function () { whenReady(fn); }, 20); }
  }

  whenReady(function () {
    var Paged = window.Paged;
    var cachedHeads = {};      // data-ref -> 原始 thead outerHTML
    var lastHead = '';          // 兜底：最近一次缓存的表头

    // Paged.Handler 是 ES6 class，必须用 class extends 继承（不能用 apply 伪继承）
    class TableContinuationHandler extends Paged.Handler {
      // 解析后：按 data-ref 缓存每个表格的表头
      afterParsed(parsed) {
        cachedHeads = {};
        var tables = parsed.querySelectorAll('table');
        for (var i = 0; i < tables.length; i++) {
          var t = tables[i];
          var ref = t.getAttribute('data-ref');
          var head = t.querySelector('thead');
          if (ref && head && head.querySelector('tr')) {
            cachedHeads[ref] = head.outerHTML;
            lastHead = head.outerHTML;
          }
        }
      }

      // 每页布局后：为被拆分表格的续接片段补表头 + 续表标记
      afterPageLayout(pageElement) {
        var tables = pageElement.querySelectorAll('table[data-split-from]');
        for (var i = 0; i < tables.length; i++) {
          var table = tables[i];
          var ref = table.getAttribute('data-split-from');
          var headHtml = cachedHeads[ref] || lastHead;
          var existing = table.querySelector('thead');
          if (headHtml && (!existing || !existing.querySelector('tr'))) {
            if (existing) existing.remove();
            table.insertAdjacentHTML('afterbegin', headHtml);
          }
          var prev = table.previousElementSibling;
          if (!(prev && prev.classList && prev.classList.contains('continued-caption'))) {
            var cap = document.createElement('div');
            cap.className = 'continued-caption';
            cap.textContent = '（续表）';
            table.parentNode.insertBefore(cap, table);
          }
        }
      }
    }

    Paged.registerHandlers(TableContinuationHandler);

    var RENDER_TARGET_ID = 'm2v-pages';

    function showError(err) {
      var target = document.getElementById(RENDER_TARGET_ID);
      var msg = String((err && (err.stack || err.message)) || err);
      if (target) {
        target.innerHTML =
          '<pre style="color:#dc2626;padding:16px;white-space:pre-wrap;font:13px monospace">分页渲染失败：\\n' +
          msg.replace(/</g, '&lt;') + '</pre>';
      }
      if (window.console) console.error('[m2v] 渲染失败', err);
    }

    window.__m2vRender = function (contentHtml, pageCss) {
      try {
        if (window.console) console.log('[m2v] __m2vRender 调用，内容长度=', (contentHtml || '').length);
        var inserted = document.querySelectorAll('[data-pagedjs-inserted-styles]');
        for (var i = 0; i < inserted.length; i++) inserted[i].remove();
        var target = document.getElementById(RENDER_TARGET_ID);
        if (!target) return Promise.resolve(0);
        target.innerHTML = '';
        cachedHeads = {};

        var previewer = new Paged.Previewer();
        return previewer
          .preview(contentHtml, [{ _m2v_: pageCss }], target)
          .then(function (flow) {
            if (window.console) console.log('[m2v] 渲染完成，页数=', flow.total);
            return flow.total;
          })
          .catch(function (err) {
            showError(err);
            throw err;
          });
      } catch (err) {
        showError(err);
        return Promise.reject(err);
      }
    };

    window.__m2vReady = true;
    if (window.console) console.log('[m2v] bootstrap 就绪，Paged=', !!window.Paged);
    window.dispatchEvent(new Event('m2v-ready'));
  });
})();
`

/** 构建 iframe 的完整文档（srcdoc） */
export function buildIframeShell(parentStyles: string): string {
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
${parentStyles}
<style media="screen">
  html, body { margin: 0; padding: 0; }
  body { background: #eef2f7; overflow-x: hidden; }
  /* 屏幕预览缩放（适配预览面板宽度），打印时忽略 */
  #m2v-pages { --m2v-fit: 1; padding: 12px 0 24px; }
  .pagedjs_pages { zoom: var(--m2v-fit, 1); }
  .pagedjs_page { background: #fff; margin: 12px auto; box-shadow: 0 4px 18px rgba(15, 23, 42, 0.14); }
  #m2v-loading { padding: 24px; color: #94a3b8; font: 14px sans-serif; }
</style>
<style media="print">
  html, body { margin: 0; padding: 0; background: #fff; }
  .pagedjs_pages { zoom: 1; }
  .pagedjs_page { margin: 0; box-shadow: none; }
</style>
<script>
  window.PagedConfig = { auto: false };
  window.addEventListener('error', function (e) {
    var t = document.getElementById('m2v-pages');
    if (t && t.getAttribute('data-state') !== 'rendered') {
      t.textContent = '脚本错误：' + (e.message || (e.error && e.error.message) || e.error || '未知');
    }
  });
</script>
<script src="${PAGED_POLYFILL_URL}"></script>
<script>${BOOTSTRAP_SCRIPT}</script>
</head>
<body>
<div id="m2v-pages"><div id="m2v-loading">正在加载分页引擎…</div></div>
</body>
</html>`
}
