export const DEMO_HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>markdown2view — 电子杂志风格项目介绍</title>
<style>
:root {
  --paper: #f1efea;
  --paper-soft: #e8e6e0;
  --paper-dark: #0a1f3d;
  --ink: #1a1714;
  --ink-soft: #3a3530;
  --ink-muted: #6e6b64;
  --ink-faint: #9b9590;
  --accent: #0a1f3d;
  --accent-warm: #c2410c;
  --rule: rgba(26,23,20,0.12);
  --on-dark: #f1efea;
  --on-dark-muted: rgba(241,239,234,0.6);
  --on-dark-faint: rgba(241,239,234,0.35);

  --serif: Georgia, 'Noto Serif SC', 'Source Han Serif SC', 'SimSun', serif;
  --sans: 'PingFang SC', 'Microsoft YaHei', 'Noto Sans SC', sans-serif;
  --mono: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html { background: #e8e6e0; }

body {
  font-family: var(--sans);
  background: #e8e6e0;
  padding: 32px 0 64px;
  -webkit-font-smoothing: antialiased;
  color: var(--ink);
}

/* ── SLIDE CONTAINER ── */
.slide {
  width: min(100vw - 32px, 960px);
  aspect-ratio: 16 / 9;
  overflow: hidden;
  margin: 0 auto 20px;
  position: relative;
  background: var(--paper);
  box-shadow: 0 1px 0 rgba(26,23,20,0.04), 0 8px 24px rgba(26,23,20,0.06);
}

.slide.dark { background: var(--paper-dark); color: var(--on-dark); }
.slide.accent { background: var(--accent); color: var(--on-dark); }

/* ── SHARED CHROME ── */
.header-strip {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 4px;
  background: var(--accent);
  z-index: 5;
}
.slide.dark .header-strip,
.slide.accent .header-strip { background: var(--accent-warm); }

.page-label {
  position: absolute;
  top: 18px; right: 28px;
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.18em;
  color: var(--ink-faint);
  z-index: 5;
}
.slide.dark .page-label,
.slide.accent .page-label { color: var(--on-dark-faint); }

.footer-bar {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 36px;
  border-top: 1px solid var(--rule);
  display: flex;
  align-items: center;
  padding: 0 28px;
  gap: 12px;
  z-index: 5;
}
.slide.dark .footer-bar,
.slide.accent .footer-bar { border-top-color: rgba(241,239,234,0.12); }

.footer-bar .brand {
  font-family: var(--mono);
  font-size: 9px;
  letter-spacing: 0.18em;
  color: var(--ink-faint);
  text-transform: uppercase;
}
.slide.dark .footer-bar .brand,
.slide.accent .footer-bar .brand { color: var(--on-dark-faint); }

.footer-bar .dot {
  width: 3px; height: 3px;
  border-radius: 50%;
  background: var(--ink-faint);
  opacity: 0.5;
}
.slide.dark .footer-bar .dot,
.slide.accent .footer-bar .dot { background: var(--on-dark-faint); }

.footer-bar .tagline {
  font-family: var(--sans);
  font-size: 9px;
  color: var(--ink-faint);
  letter-spacing: 0.04em;
}
.slide.dark .footer-bar .tagline,
.slide.accent .footer-bar .tagline { color: var(--on-dark-faint); }

/* ── MAGAZINE PRIMITIVES ── */
.eyebrow {
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.24em;
  color: var(--accent);
  text-transform: uppercase;
  font-weight: 500;
}
.eyebrow.warm { color: var(--accent-warm); }
.slide.dark .eyebrow,
.slide.accent .eyebrow { color: var(--accent-warm); }

.serif-title {
  font-family: var(--serif);
  font-weight: 900;
  letter-spacing: -0.02em;
  line-height: 1.05;
  color: var(--ink);
}
.slide.dark .serif-title,
.slide.accent .serif-title { color: var(--on-dark); }

.body-text {
  font-family: var(--sans);
  font-size: 12px;
  font-weight: 400;
  color: var(--ink-soft);
  line-height: 1.8;
}
.slide.dark .body-text,
.slide.accent .body-text { color: var(--on-dark-muted); }

.hairline { height: 1px; background: var(--rule); border: 0; }
.slide.dark .hairline,
.slide.accent .hairline { background: rgba(241,239,234,0.12); }

/* ── SLIDE 1: COVER (dark) ── */
.s1-inner {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: 1fr 240px;
  padding: 64px 56px 56px;
  gap: 32px;
}
.s1-main {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.s1-eyebrow {
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.28em;
  color: var(--accent-warm);
  text-transform: uppercase;
  margin-bottom: 24px;
}
.s1-title {
  font-family: var(--serif);
  font-size: 76px;
  font-weight: 900;
  line-height: 0.95;
  color: var(--on-dark);
  letter-spacing: -0.03em;
  margin-bottom: 12px;
}
.s1-title .slash { color: var(--accent-warm); }
.s1-subtitle {
  font-family: var(--sans);
  font-size: 13px;
  font-weight: 300;
  color: var(--on-dark-muted);
  letter-spacing: 0.02em;
  margin-bottom: 32px;
  max-width: 460px;
  line-height: 1.7;
}
.s1-pill-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.s1-pill {
  font-family: var(--mono);
  font-size: 9px;
  letter-spacing: 0.14em;
  border: 1px solid rgba(241,239,234,0.25);
  color: var(--on-dark-muted);
  padding: 5px 11px;
  border-radius: 1px;
  text-transform: uppercase;
}
.s1-stats {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 28px;
  border-left: 1px solid rgba(241,239,234,0.12);
  padding-left: 32px;
}
.s1-stat-num {
  font-family: var(--serif);
  font-size: 56px;
  font-weight: 900;
  color: var(--accent-warm);
  line-height: 0.9;
  letter-spacing: -0.02em;
}
.s1-stat-label {
  font-family: var(--mono);
  font-size: 9px;
  color: var(--on-dark-faint);
  letter-spacing: 0.18em;
  margin-top: 6px;
  text-transform: uppercase;
}

/* ── SLIDE 2: CONCEPT (light) ── */
.s2-inner {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: 1.1fr 1fr;
}
.s2-left {
  padding: 56px 40px 56px 56px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-right: 1px solid var(--rule);
}
.s2-right {
  padding: 56px 56px 56px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: var(--paper-soft);
}
.s2-title {
  font-family: var(--serif);
  font-size: 38px;
  font-weight: 900;
  color: var(--ink);
  line-height: 1.1;
  letter-spacing: -0.02em;
  margin: 12px 0 18px;
}
.s2-lead {
  font-family: var(--sans);
  font-size: 12px;
  color: var(--ink-soft);
  line-height: 1.85;
  margin-bottom: 22px;
}
.s2-pull {
  padding-left: 16px;
  border-left: 2px solid var(--accent-warm);
  font-family: var(--serif);
  font-size: 14px;
  font-style: italic;
  color: var(--ink-soft);
  line-height: 1.7;
}
.principle-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.principle-item {
  display: grid;
  grid-template-columns: 32px 1fr;
  gap: 14px;
  align-items: start;
}
.principle-num {
  font-family: var(--mono);
  font-size: 10px;
  color: var(--accent-warm);
  letter-spacing: 0.1em;
  padding-top: 3px;
  font-weight: 500;
}
.principle-text {
  font-family: var(--sans);
  font-size: 12px;
  color: var(--ink-soft);
  line-height: 1.7;
}
.principle-text strong {
  font-weight: 700;
  color: var(--ink);
  display: block;
  margin-bottom: 2px;
}

/* ── SLIDE 3: BIG QUOTE (accent) ── */
.s3-inner {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 64px 80px;
}
.s3-mark {
  font-family: var(--serif);
  font-size: 180px;
  font-weight: 900;
  color: rgba(241,239,234,0.1);
  line-height: 0.7;
  position: absolute;
  top: 56px;
  left: 64px;
  user-select: none;
}
.s3-quote {
  font-family: var(--serif);
  font-size: 30px;
  font-weight: 400;
  color: var(--on-dark);
  line-height: 1.5;
  letter-spacing: -0.01em;
  max-width: 720px;
  position: relative;
  z-index: 2;
}
.s3-quote .em { color: var(--accent-warm); font-style: italic; }
.s3-source {
  margin-top: 36px;
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.22em;
  color: var(--on-dark-faint);
  text-transform: uppercase;
}
.s3-rule {
  width: 48px;
  height: 2px;
  background: var(--accent-warm);
  margin: 28px 0 0;
}

/* ── SLIDE 4: A4 MODE (light) ── */
.s4-inner {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: 1fr 240px;
}
.s4-left {
  padding: 52px 40px 52px 56px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.s4-right {
  background: var(--paper-dark);
  padding: 52px 32px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  color: var(--on-dark);
}
.mode-num-big {
  font-family: var(--serif);
  font-size: 96px;
  font-weight: 900;
  color: rgba(241,239,234,0.12);
  line-height: 0.9;
  letter-spacing: -0.04em;
}
.mode-title-cn {
  font-family: var(--serif);
  font-size: 22px;
  font-weight: 700;
  color: var(--on-dark);
  line-height: 1.25;
  letter-spacing: -0.01em;
}
.mode-title-en {
  font-family: var(--mono);
  font-size: 9px;
  letter-spacing: 0.2em;
  color: var(--on-dark-faint);
  text-transform: uppercase;
  margin-top: 8px;
}
.s4-title {
  font-family: var(--serif);
  font-size: 32px;
  font-weight: 900;
  color: var(--ink);
  line-height: 1.15;
  letter-spacing: -0.02em;
  margin: 10px 0 16px;
}
.s4-body {
  font-family: var(--sans);
  font-size: 12px;
  color: var(--ink-soft);
  line-height: 1.8;
  margin-bottom: 20px;
  max-width: 480px;
}
.s4-feat {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 24px;
}
.s4-feat-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}
.s4-feat-num {
  font-family: var(--mono);
  font-size: 9px;
  color: var(--accent-warm);
  letter-spacing: 0.1em;
  padding-top: 3px;
  min-width: 18px;
}
.s4-feat-text {
  font-family: var(--sans);
  font-size: 11px;
  color: var(--ink-soft);
  line-height: 1.6;
}
.s4-feat-text strong { color: var(--ink); font-weight: 700; }
.s4-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 18px;
}
.tag-mono {
  font-family: var(--mono);
  font-size: 9px;
  letter-spacing: 0.08em;
  background: rgba(10,31,61,0.06);
  color: var(--accent);
  border: 1px solid rgba(10,31,61,0.15);
  padding: 3px 9px;
  border-radius: 1px;
}

/* ── SLIDE 5: LONGFORM MODE (light) ── */
.s5-inner {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: 240px 1fr;
}
.s5-left {
  background: var(--paper-dark);
  padding: 52px 32px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  color: var(--on-dark);
}
.s5-right {
  padding: 48px 56px 48px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.s5-title {
  font-family: var(--serif);
  font-size: 30px;
  font-weight: 900;
  color: var(--ink);
  line-height: 1.15;
  letter-spacing: -0.02em;
  margin: 10px 0 22px;
}
.feature-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.feature-card {
  background: var(--paper-soft);
  border: 1px solid var(--rule);
  padding: 16px 18px;
  border-radius: 1px;
  position: relative;
}
.feature-card-title {
  font-family: var(--sans);
  font-size: 12px;
  font-weight: 700;
  color: var(--ink);
  margin-bottom: 6px;
  letter-spacing: -0.005em;
}
.feature-card-body {
  font-family: var(--sans);
  font-size: 10.5px;
  color: var(--ink-muted);
  line-height: 1.65;
}
.feature-card-meta {
  font-family: var(--mono);
  font-size: 9px;
  color: var(--accent-warm);
  margin-top: 8px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

/* ── SLIDE 6: SOCIAL CARDS (light, warm accent) ── */
.s6-inner {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
}
.s6-left {
  padding: 52px 40px 52px 56px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-right: 1px solid var(--rule);
}
.s6-right {
  padding: 48px 56px 48px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: var(--paper-soft);
}
.s6-title {
  font-family: var(--serif);
  font-size: 32px;
  font-weight: 900;
  color: var(--ink);
  line-height: 1.15;
  letter-spacing: -0.02em;
  margin: 10px 0 16px;
}
.s6-body {
  font-family: var(--sans);
  font-size: 12px;
  color: var(--ink-soft);
  line-height: 1.8;
  margin-bottom: 20px;
  max-width: 380px;
}
.s6-feat-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.s6-feat-item {
  display: grid;
  grid-template-columns: 24px 1fr;
  gap: 10px;
  align-items: start;
}
.s6-feat-num {
  font-family: var(--mono);
  font-size: 10px;
  color: var(--accent-warm);
  letter-spacing: 0.08em;
  padding-top: 2px;
}
.s6-feat-text {
  font-family: var(--sans);
  font-size: 11.5px;
  color: var(--ink-soft);
  line-height: 1.65;
}
.s6-feat-text strong { color: var(--ink); font-weight: 700; }
.card-row {
  display: flex;
  gap: 14px;
  align-items: flex-end;
  margin-bottom: 20px;
}
.mini-card {
  background: var(--paper-dark);
  border-radius: 3px;
  overflow: hidden;
  flex-shrink: 0;
  position: relative;
}
.mini-card.r34 { width: 96px; height: 128px; }
.mini-card.r916 { width: 72px; height: 128px; }
.mini-card-header {
  height: 48px;
  background: linear-gradient(135deg, var(--paper-dark), #1a3a6b);
  position: relative;
}
.mini-card-corner {
  position: absolute;
  top: 6px; right: 6px;
  font-family: var(--mono);
  font-size: 7px;
  color: var(--accent-warm);
  letter-spacing: 0.08em;
  background: rgba(241,239,234,0.9);
  padding: 1px 4px;
  border-radius: 1px;
}
.mini-card-body { padding: 8px; }
.mini-card-line {
  height: 4px;
  background: rgba(241,239,234,0.18);
  border-radius: 1px;
  margin-bottom: 4px;
}
.mini-card-line.short { width: 60%; }
.mini-card-line.title { height: 6px; background: rgba(194,65,12,0.5); width: 80%; margin-bottom: 6px; }
.mini-card-num {
  font-family: var(--mono);
  font-size: 8px;
  color: var(--on-dark-faint);
  margin-top: 6px;
  letter-spacing: 0.1em;
}
.s6-export {
  padding: 14px 16px;
  background: rgba(194,65,12,0.06);
  border: 1px solid rgba(194,65,12,0.18);
  border-radius: 1px;
}
.s6-export-label {
  font-family: var(--mono);
  font-size: 9px;
  color: var(--accent-warm);
  letter-spacing: 0.14em;
  margin-bottom: 6px;
  text-transform: uppercase;
}
.s6-export-body {
  font-family: var(--sans);
  font-size: 11px;
  color: var(--ink-muted);
  line-height: 1.7;
}

/* ── SLIDE 7: HTML CANVAS (dark) ── */
.s7-inner {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
}
.s7-left {
  padding: 56px 40px 56px 56px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.s7-right {
  padding: 48px 56px 48px 32px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 14px;
  border-left: 1px solid rgba(241,239,234,0.1);
}
.s7-title {
  font-family: var(--serif);
  font-size: 34px;
  font-weight: 900;
  color: var(--on-dark);
  line-height: 1.1;
  letter-spacing: -0.02em;
  margin: 12px 0 18px;
}
.s7-body {
  font-family: var(--sans);
  font-size: 12px;
  color: var(--on-dark-muted);
  line-height: 1.8;
  margin-bottom: 22px;
  max-width: 380px;
}
.cap-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.cap-item {
  display: grid;
  grid-template-columns: 14px 1fr;
  gap: 10px;
  align-items: center;
  font-family: var(--sans);
  font-size: 11.5px;
  color: var(--on-dark-muted);
}
.cap-dot {
  width: 5px; height: 5px;
  border-radius: 50%;
  background: var(--accent-warm);
}
.code-block {
  background: rgba(241,239,234,0.04);
  border: 1px solid rgba(241,239,234,0.1);
  border-radius: 2px;
  padding: 16px 18px;
  font-family: var(--mono);
  font-size: 10px;
  line-height: 1.75;
  color: rgba(241,239,234,0.85);
  white-space: pre;
  overflow: hidden;
}
.code-block .kw { color: #7ab4f5; }
.code-block .str { color: #d4a574; }
.code-block .cm { color: rgba(241,239,234,0.35); }
.code-block .fn { color: #b5c07a; }
.s7-note {
  padding: 12px 14px;
  border: 1px solid rgba(241,239,234,0.1);
  border-radius: 2px;
  font-family: var(--mono);
  font-size: 9px;
  color: var(--on-dark-faint);
  line-height: 1.8;
  letter-spacing: 0.06em;
}

/* ── SLIDE 8: TECH STACK (light) ── */
.s8-inner {
  position: absolute;
  inset: 0;
  padding: 52px 56px 56px;
  display: flex;
  flex-direction: column;
}
.s8-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--rule);
  margin-bottom: 24px;
}
.s8-title {
  font-family: var(--serif);
  font-size: 34px;
  font-weight: 900;
  color: var(--ink);
  letter-spacing: -0.02em;
}
.s8-sub {
  font-family: var(--mono);
  font-size: 10px;
  color: var(--ink-faint);
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.stack-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: 1fr 1fr;
  gap: 12px;
  flex: 1;
}
.stack-item {
  padding: 14px 14px;
  border: 1px solid var(--rule);
  border-radius: 1px;
  background: var(--paper-soft);
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: relative;
}
.stack-item-num {
  position: absolute;
  top: 8px; right: 10px;
  font-family: var(--mono);
  font-size: 8px;
  color: var(--ink-faint);
  letter-spacing: 0.1em;
}
.stack-item-label {
  font-family: var(--mono);
  font-size: 8.5px;
  letter-spacing: 0.14em;
  color: var(--ink-faint);
  text-transform: uppercase;
}
.stack-item-name {
  font-family: var(--serif);
  font-size: 15px;
  font-weight: 700;
  color: var(--ink);
  line-height: 1.2;
  letter-spacing: -0.01em;
  margin-top: 2px;
}
.stack-item-detail {
  font-family: var(--sans);
  font-size: 10px;
  color: var(--ink-muted);
  line-height: 1.55;
  margin-top: 2px;
}
.stack-item.warm { border-color: rgba(194,65,12,0.25); }
.stack-item.warm .stack-item-name { color: var(--accent-warm); }

/* ── SLIDE 9: ARCHITECTURE (light) ── */
.s9-inner {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: 260px 1fr;
}
.s9-left {
  background: var(--paper-dark);
  padding: 52px 28px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: var(--on-dark);
}
.s9-left-label {
  font-family: var(--mono);
  font-size: 9px;
  letter-spacing: 0.2em;
  color: var(--accent-warm);
  text-transform: uppercase;
  margin-bottom: 16px;
}
.dir-tree {
  font-family: var(--mono);
  font-size: 10px;
  line-height: 1.95;
  color: var(--on-dark-muted);
  white-space: pre;
}
.dir-tree .dir { color: var(--accent-warm); }
.dir-tree .hl { color: var(--on-dark); }
.s9-left-foot {
  font-family: var(--mono);
  font-size: 8.5px;
  color: var(--on-dark-faint);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.s9-right {
  padding: 48px 56px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.s9-title {
  font-family: var(--serif);
  font-size: 28px;
  font-weight: 900;
  color: var(--ink);
  letter-spacing: -0.02em;
  margin-bottom: 24px;
}
.arch-flow {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.arch-label {
  font-family: var(--mono);
  font-size: 9px;
  letter-spacing: 0.18em;
  color: var(--ink-faint);
  text-transform: uppercase;
  margin-bottom: 2px;
}
.arch-row {
  display: flex;
  gap: 8px;
  align-items: stretch;
}
.arch-box {
  padding: 10px 12px;
  border: 1px solid var(--rule);
  background: var(--paper-soft);
  border-radius: 1px;
  font-family: var(--sans);
  font-size: 10.5px;
  font-weight: 700;
  color: var(--ink);
  flex: 1;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
}
.arch-box.dark {
  background: var(--paper-dark);
  border-color: var(--paper-dark);
  color: var(--on-dark);
}
.arch-box.warm {
  background: rgba(194,65,12,0.08);
  border-color: rgba(194,65,12,0.25);
  color: var(--accent-warm);
}
.arch-box-sub {
  font-family: var(--mono);
  font-size: 8.5px;
  font-weight: 400;
  color: var(--ink-faint);
  letter-spacing: 0.06em;
}
.arch-box.dark .arch-box-sub { color: var(--on-dark-faint); }
.arch-arrow {
  font-family: var(--mono);
  font-size: 14px;
  color: var(--ink-faint);
  display: flex;
  align-items: center;
}

/* ── SLIDE 10: REFERENCES (light) ── */
.s10-inner {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  padding: 52px 56px 56px;
}
.s10-head {
  padding-bottom: 18px;
  border-bottom: 1px solid var(--rule);
  margin-bottom: 28px;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}
.s10-title {
  font-family: var(--serif);
  font-size: 32px;
  font-weight: 900;
  color: var(--ink);
  letter-spacing: -0.02em;
}
.s10-sub {
  font-family: var(--mono);
  font-size: 10px;
  color: var(--ink-faint);
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.s10-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0;
  flex: 1;
}
.ref-col {
  padding: 0 28px 0 0;
  border-right: 1px solid var(--rule);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}
.ref-col:nth-child(2) { padding-left: 28px; }
.ref-col:nth-child(3) { padding-left: 28px; border-right: none; }
.ref-num {
  font-family: var(--serif);
  font-size: 56px;
  font-weight: 900;
  color: var(--accent-warm);
  line-height: 0.9;
  letter-spacing: -0.03em;
  margin-bottom: 16px;
  opacity: 0.85;
}
.ref-project {
  font-family: var(--mono);
  font-size: 12px;
  font-weight: 500;
  color: var(--accent);
  margin-bottom: 10px;
  letter-spacing: 0.04em;
}
.ref-desc {
  font-family: var(--sans);
  font-size: 11px;
  color: var(--ink-soft);
  line-height: 1.75;
  flex: 1;
}
.ref-tag {
  font-family: var(--mono);
  font-size: 8.5px;
  letter-spacing: 0.14em;
  color: var(--accent-warm);
  margin-top: 14px;
  text-transform: uppercase;
  padding-top: 12px;
  border-top: 1px solid var(--rule);
}
.ref-tag.muted { color: var(--ink-faint); }

/* ── SLIDE 11: QUICK START (dark) ── */
.s11-inner {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 56px;
  text-align: center;
}
.s11-eyebrow {
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.28em;
  color: var(--accent-warm);
  text-transform: uppercase;
  margin-bottom: 24px;
}
.s11-cmd {
  font-family: var(--mono);
  font-size: 38px;
  font-weight: 500;
  color: var(--on-dark);
  line-height: 1.4;
  letter-spacing: -0.01em;
  margin-bottom: 24px;
}
.s11-cmd .prompt { color: var(--accent-warm); }
.s11-cmd .amp { color: var(--on-dark-faint); }
.s11-meta {
  font-family: var(--sans);
  font-size: 12px;
  color: var(--on-dark-muted);
  letter-spacing: 0.04em;
  line-height: 1.8;
  margin-bottom: 36px;
  max-width: 480px;
}
.s11-rule {
  width: 48px;
  height: 2px;
  background: var(--accent-warm);
  margin: 0 auto 32px;
}
.s11-badges {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}
.s11-badge {
  font-family: var(--mono);
  font-size: 9px;
  letter-spacing: 0.14em;
  border: 1px solid rgba(241,239,234,0.22);
  color: var(--on-dark-muted);
  padding: 6px 14px;
  border-radius: 1px;
  text-transform: uppercase;
}

/* ── SLIDE 12: THANKS (dark) ── */
.s12-inner {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 56px;
  text-align: center;
}
.s12-mark {
  position: absolute;
  top: 40px;
  left: 56px;
  font-family: var(--serif);
  font-size: 200px;
  font-weight: 900;
  color: rgba(241,239,234,0.05);
  line-height: 0.7;
  user-select: none;
}
.s12-eyebrow {
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.3em;
  color: var(--accent-warm);
  text-transform: uppercase;
  margin-bottom: 24px;
  position: relative;
  z-index: 2;
}
.s12-title {
  font-family: var(--serif);
  font-size: 80px;
  font-weight: 900;
  color: var(--on-dark);
  line-height: 1;
  letter-spacing: -0.03em;
  position: relative;
  z-index: 2;
}
.s12-title .dot { color: var(--accent-warm); }
.s12-divider {
  width: 56px;
  height: 2px;
  background: var(--accent-warm);
  margin: 28px 0;
  position: relative;
  z-index: 2;
}
.s12-thanks {
  font-family: var(--sans);
  font-size: 12px;
  font-weight: 300;
  color: var(--on-dark-muted);
  letter-spacing: 0.02em;
  line-height: 1.9;
  max-width: 560px;
  margin-bottom: 36px;
  position: relative;
  z-index: 2;
}
.s12-thanks strong { color: var(--accent-warm); font-weight: 500; }
.s12-feedback-label {
  font-family: var(--mono);
  font-size: 9px;
  letter-spacing: 0.22em;
  color: var(--on-dark-faint);
  text-transform: uppercase;
  margin-bottom: 16px;
  position: relative;
  z-index: 2;
}
.s12-channels {
  display: flex;
  gap: 12px;
  position: relative;
  z-index: 2;
}
.s12-channel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  border: 1px solid rgba(241,239,234,0.18);
  padding: 12px 24px;
  border-radius: 1px;
  min-width: 110px;
}
.s12-channel-name {
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.1em;
  color: var(--accent-warm);
}
.s12-channel-desc {
  font-family: var(--sans);
  font-size: 9px;
  color: var(--on-dark-faint);
  letter-spacing: 0.02em;
}

/* ── PRINT ── */
@media print {
  html { background: white; }
  body { padding: 0; background: white; }
  .slide {
    width: 100%;
    aspect-ratio: 16 / 9;
    margin: 0;
    page-break-after: always;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    box-shadow: none;
  }
}
</style>
</head>
<body>

<!-- ── SLIDE 01: COVER (dark) ── -->
<section class="slide dark">
  <div class="header-strip"></div>
  <div class="s1-inner">
    <div class="s1-main">
      <div class="s1-eyebrow">Open Source · Tech Product</div>
      <div class="s1-title">markdown<span class="slash">/</span>view</div>
      <div class="s1-subtitle">纯前端、零后端的 Markdown / HTML 多场景排版与导出工作台。把同一份内容渲染为面向不同受众的成品形态，并一键复制或导出。</div>
      <div class="s1-pill-row">
        <span class="s1-pill">React 18</span>
        <span class="s1-pill">TypeScript</span>
        <span class="s1-pill">Vite</span>
        <span class="s1-pill">CodeMirror 6</span>
        <span class="s1-pill">MIT</span>
      </div>
    </div>
    <div class="s1-stats">
      <div>
        <div class="s1-stat-num">4</div>
        <div class="s1-stat-label">Modes</div>
      </div>
      <div>
        <div class="s1-stat-num">0</div>
        <div class="s1-stat-label">Backend</div>
      </div>
      <div>
        <div class="s1-stat-num">5+</div>
        <div class="s1-stat-label">Exports</div>
      </div>
    </div>
  </div>
  <div class="footer-bar">
    <span class="brand">markdown2view</span>
    <span class="dot"></span>
    <span class="tagline">零网络传输 · 隐私安全 · 浏览器原生能力</span>
  </div>
  <div class="page-label">01 / 12</div>
</section>

<!-- ── SLIDE 02: CONCEPT (light) ── -->
<section class="slide">
  <div class="header-strip"></div>
  <div class="s2-inner">
    <div class="s2-left">
      <div class="eyebrow">设计初衷 · Origin</div>
      <div class="s2-title">内容一次创作<br>多端无损分发</div>
      <div class="s2-lead">免去繁琐的后端依赖与服务部署，利用浏览器原生的渲染能力、排版技术与沙箱机制，实现极致的内容分发与设计自由。</div>
      <div class="s2-pull">同一份 Markdown，公众号长图、A4 文档、小红书卡片、网页 PPT，一键切换，随写随导。</div>
    </div>
    <div class="s2-right">
      <div class="eyebrow warm" style="margin-bottom:20px;">三项核心原则 · Principles</div>
      <ul class="principle-list">
        <li class="principle-item">
          <span class="principle-num">01</span>
          <span class="principle-text"><strong>零服务器</strong>所有处理在浏览器本地完成，数据不离开设备，无隐私风险</span>
        </li>
        <li class="principle-item">
          <span class="principle-num">02</span>
          <span class="principle-text"><strong>内容优先</strong>写一次，适配多种成品形态；平台差异由渲染引擎透明处理</span>
        </li>
        <li class="principle-item">
          <span class="principle-num">03</span>
          <span class="principle-text"><strong>开放扩展</strong>基于 MIT 协议开源，自定义组件与主题可直接接入排版引擎</span>
        </li>
      </ul>
    </div>
  </div>
  <div class="footer-bar">
    <span class="brand">markdown2view</span>
    <span class="dot"></span>
    <span class="tagline">核心理念 · 内容一次创作，多端无损分发</span>
  </div>
  <div class="page-label">02 / 12</div>
</section>

<!-- ── SLIDE 03: BIG QUOTE (accent) ── -->
<section class="slide accent">
  <div class="header-strip"></div>
  <div class="s3-mark">&ldquo;</div>
  <div class="s3-inner">
    <div class="s3-quote">同一份 Markdown 草稿，<span class="em">一键切换</span>为公众号长图、A4 文档、小红书卡片或网页 PPT —— 内容一次创作，多端无损分发。</div>
    <div class="s3-rule"></div>
    <div class="s3-source">markdown2view · 核心产品理念</div>
  </div>
  <div class="footer-bar">
    <span class="brand">markdown2view</span>
    <span class="dot"></span>
    <span class="tagline">Big Idea · 一份内容，多种形态</span>
  </div>
  <div class="page-label">03 / 12</div>
</section>

<!-- ── SLIDE 04: A4 MODE (light) ── -->
<section class="slide">
  <div class="header-strip"></div>
  <div class="s4-inner">
    <div class="s4-left">
      <div class="eyebrow">Mode 01 · A4 Document</div>
      <div class="s4-title">纯前端智能分页<br>还原印刷质感</div>
      <div class="s4-body">引入 W3C Paged Media 规范，在 iframe 沙箱中基于 Paged.js 进行真实物理分页计算，支持自动换页、跨页防孤立标题、长表格优雅切分与续表表头重复。</div>
      <div class="s4-feat">
        <div class="s4-feat-item">
          <span class="s4-feat-num">01</span>
          <span class="s4-feat-text"><strong>物理分页</strong>Paged.js 真实分页，续表 thead 自动重复</span>
        </div>
        <div class="s4-feat-item">
          <span class="s4-feat-num">02</span>
          <span class="s4-feat-text"><strong>页眉页脚</strong>页码、标题、首行缩进、字体倍率可调</span>
        </div>
        <div class="s4-feat-item">
          <span class="s4-feat-num">03</span>
          <span class="s4-feat-text"><strong>矢量 PDF</strong>调用原生打印机制，背景色保留</span>
        </div>
        <div class="s4-feat-item">
          <span class="s4-feat-num">04</span>
          <span class="s4-feat-text"><strong>Word 导出</strong>docx 格式直接生成，不依赖服务器</span>
        </div>
      </div>
      <div class="s4-tags">
        <span class="tag-mono">Paged.js</span>
        <span class="tag-mono">W3C Paged Media</span>
        <span class="tag-mono">@media print</span>
        <span class="tag-mono">docx</span>
      </div>
    </div>
    <div class="s4-right">
      <div class="eyebrow" style="color:var(--accent-warm);">Mode</div>
      <div class="mode-num-big">01</div>
      <div class="mode-title-cn">A4 规范<br>文档模式</div>
      <div class="mode-title-en">A4 Document</div>
    </div>
  </div>
  <div class="footer-bar">
    <span class="brand">markdown2view</span>
    <span class="dot"></span>
    <span class="tagline">A4 文档 · 无损打印 · 前端分页</span>
  </div>
  <div class="page-label">04 / 12</div>
</section>

<!-- ── SLIDE 05: LONGFORM MODE (light) ── -->
<section class="slide">
  <div class="header-strip"></div>
  <div class="s5-inner">
    <div class="s5-left">
      <div class="eyebrow" style="color:var(--accent-warm);">Mode</div>
      <div class="mode-num-big">02</div>
      <div class="mode-title-cn">长图文<br>排版模式</div>
      <div class="mode-title-en">WeChat Longform</div>
    </div>
    <div class="s5-right">
      <div class="eyebrow warm">Mode 02 · WeChat Longform</div>
      <div class="s5-title">公众号无损渲染<br>万字流畅编辑</div>
      <div class="feature-grid">
        <div class="feature-card">
          <div class="feature-card-title">公众号无损渲染</div>
          <div class="feature-card-body">支持自定义组件 steps、timeline、compare、slider，直接复用公众号排版引擎</div>
          <div class="feature-card-meta">Markdown 语法扩展</div>
        </div>
        <div class="feature-card">
          <div class="feature-card-title">一键复制富文本</div>
          <div class="feature-card-body">完美兼容微信公众平台、知乎、头条等图文编辑器，保留格式无偏差</div>
          <div class="feature-card-meta">Clipboard · 富文本保真</div>
        </div>
        <div class="feature-card">
          <div class="feature-card-title">万字流畅编辑</div>
          <div class="feature-card-body">输入防抖 Debounce 与状态解耦保证万字长文编辑时不卡顿</div>
          <div class="feature-card-meta">CodeMirror 6 · Zustand</div>
        </div>
        <div class="feature-card">
          <div class="feature-card-title">本地持久化</div>
          <div class="feature-card-body">Zustand persist 中间件自动将草稿写入 localStorage，关窗不丢内容</div>
          <div class="feature-card-meta">零后端 · 离线可用</div>
        </div>
      </div>
    </div>
  </div>
  <div class="footer-bar">
    <span class="brand">markdown2view</span>
    <span class="dot"></span>
    <span class="tagline">长图文排版 · 公众号生态</span>
  </div>
  <div class="page-label">05 / 12</div>
</section>

<!-- ── SLIDE 06: SOCIAL CARDS (light, warm accent) ── -->
<section class="slide">
  <div class="header-strip" style="background:var(--accent-warm);"></div>
  <div class="s6-inner">
    <div class="s6-left">
      <div class="eyebrow warm">Mode 03 · Social Cards</div>
      <div class="s6-title">小红书<br>多页卡片</div>
      <div class="s6-body">3:4 与 9:16 多尺寸自动适配，Frontmatter 智能生成社交文案，批量 ZIP 导出或逐张高清 PNG 下载。</div>
      <ul class="s6-feat-list">
        <li class="s6-feat-item">
          <span class="s6-feat-num">01</span>
          <span class="s6-feat-text"><strong>自动序号角标</strong>与作者 Logo 注入</span>
        </li>
        <li class="s6-feat-item">
          <span class="s6-feat-num">02</span>
          <span class="s6-feat-text"><strong>Frontmatter 文案</strong>智能生成社交传播文案</span>
        </li>
        <li class="s6-feat-item">
          <span class="s6-feat-num">03</span>
          <span class="s6-feat-text"><strong>批量 ZIP 导出</strong>或逐张高清 PNG 下载</span>
        </li>
      </ul>
    </div>
    <div class="s6-right">
      <div class="card-row">
        <div class="mini-card r34">
          <div class="mini-card-header">
            <div class="mini-card-corner">01</div>
          </div>
          <div class="mini-card-body">
            <div class="mini-card-line title"></div>
            <div class="mini-card-line"></div>
            <div class="mini-card-line short"></div>
            <div class="mini-card-line"></div>
            <div class="mini-card-num">3:4</div>
          </div>
        </div>
        <div class="mini-card r916">
          <div class="mini-card-header">
            <div class="mini-card-corner">02</div>
          </div>
          <div class="mini-card-body">
            <div class="mini-card-line title"></div>
            <div class="mini-card-line"></div>
            <div class="mini-card-line short"></div>
            <div class="mini-card-num">9:16</div>
          </div>
        </div>
        <div style="flex:1;padding-left:8px;display:flex;align-items:flex-end;">
          <div style="font-family:var(--mono);font-size:9px;color:var(--ink-faint);letter-spacing:0.14em;text-transform:uppercase;line-height:1.8;">
            Multi Ratio<br>Auto Numbering
          </div>
        </div>
      </div>
      <div class="s6-export">
        <div class="s6-export-label">Export Options</div>
        <div class="s6-export-body">modern-screenshot 高清截图 → PNG · 批量 ZIP 打包（fflate 异步压缩）· 逐张下载。完全运行在浏览器端，零网络传输，隐私安全。</div>
      </div>
    </div>
  </div>
  <div class="footer-bar">
    <span class="brand">markdown2view</span>
    <span class="dot"></span>
    <span class="tagline">小红书卡片 · 3:4 / 9:16 · 批量导出</span>
  </div>
  <div class="page-label">06 / 12</div>
</section>

<!-- ── SLIDE 07: HTML CANVAS (dark) ── -->
<section class="slide dark">
  <div class="header-strip"></div>
  <div class="s7-inner">
    <div class="s7-left">
      <div class="eyebrow">Mode 04 · HTML Canvas</div>
      <div class="s7-title">沙箱隔离渲染<br>网页 PPT 专属呈现</div>
      <div class="s7-body">内置基于 iframe 容器的隔离机制，防止样式污染，预加载本地化 Tailwind 运行时。生成带有极致字号对比的「电子杂志风格」横向翻页网页 PPT。</div>
      <ul class="cap-list">
        <li class="cap-item"><span class="cap-dot"></span>iframe 沙箱隔离，防止样式污染</li>
        <li class="cap-item"><span class="cap-dot"></span>指令库驱动的 AI 协作工作流</li>
        <li class="cap-item"><span class="cap-dot"></span>MutationObserver DOM 稳定性探测</li>
        <li class="cap-item"><span class="cap-dot"></span>waitForStability 高清截图导出</li>
      </ul>
    </div>
    <div class="s7-right">
      <div class="code-block"><span class="cm">// 探测 DOM 稳定后截图</span>
<span class="kw">async function</span> <span class="fn">waitForStability</span>() {
  <span class="kw">return new</span> <span class="fn">Promise</span>(resolve => {
    <span class="kw">const</span> obs = <span class="kw">new</span> <span class="fn">MutationObserver</span>(
      <span class="fn">debounce</span>(() => {
        obs.<span class="fn">disconnect</span>();
        <span class="fn">resolve</span>();
      }, <span class="str">200</span>)
    );
    obs.<span class="fn">observe</span>(document.body, {
      subtree: <span class="str">true</span>,
      childList: <span class="str">true</span>
    });
  });
}</div>
      <div class="s7-note">电子杂志风格 · 瑞士国际主义风格<br>源自 guizang-ppt-skill 设计精髓</div>
    </div>
  </div>
  <div class="footer-bar">
    <span class="brand">markdown2view</span>
    <span class="dot"></span>
    <span class="tagline">自由画布 · 沙箱隔离 · 网页 PPT</span>
  </div>
  <div class="page-label">07 / 12</div>
</section>

<!-- ── SLIDE 08: TECH STACK (light) ── -->
<section class="slide">
  <div class="header-strip"></div>
  <div class="s8-inner">
    <div class="s8-head">
      <div class="s8-title">技术栈全览</div>
      <div class="s8-sub">10 Items · Browser Native</div>
    </div>
    <div class="stack-grid">
      <div class="stack-item warm">
        <span class="stack-item-num">01</span>
        <div class="stack-item-label">前端框架</div>
        <div class="stack-item-name">React 18</div>
        <div class="stack-item-detail">TypeScript + Vite 构建，热更新开发体验</div>
      </div>
      <div class="stack-item warm">
        <span class="stack-item-num">02</span>
        <div class="stack-item-label">编辑器内核</div>
        <div class="stack-item-name">CodeMirror 6</div>
        <div class="stack-item-detail">Markdown 语法高亮，万字流畅输入</div>
      </div>
      <div class="stack-item">
        <span class="stack-item-num">03</span>
        <div class="stack-item-label">状态管理</div>
        <div class="stack-item-name">Zustand</div>
        <div class="stack-item-detail">persist 中间件自动本地持久化草稿</div>
      </div>
      <div class="stack-item">
        <span class="stack-item-num">04</span>
        <div class="stack-item-label">样式系统</div>
        <div class="stack-item-name">Tailwind v4</div>
        <div class="stack-item-detail">+ Vanilla CSS，响应式自适应布局</div>
      </div>
      <div class="stack-item">
        <span class="stack-item-num">05</span>
        <div class="stack-item-label">截图导出</div>
        <div class="stack-item-name">modern-screenshot</div>
        <div class="stack-item-detail">高清 PNG 截图，DOM 稳定后捕获</div>
      </div>
      <div class="stack-item">
        <span class="stack-item-num">06</span>
        <div class="stack-item-label">渲染引擎</div>
        <div class="stack-item-name">自研引擎</div>
        <div class="stack-item-detail">支持 steps、timeline、slider 自定义语法</div>
      </div>
      <div class="stack-item">
        <span class="stack-item-num">07</span>
        <div class="stack-item-label">分页算法</div>
        <div class="stack-item-name">Paged.js</div>
        <div class="stack-item-detail">W3C Paged Media 物理分页</div>
      </div>
      <div class="stack-item">
        <span class="stack-item-num">08</span>
        <div class="stack-item-label">Word 导出</div>
        <div class="stack-item-name">docx</div>
        <div class="stack-item-detail">浏览器端生成 .docx 文档</div>
      </div>
      <div class="stack-item">
        <span class="stack-item-num">09</span>
        <div class="stack-item-label">批量压缩</div>
        <div class="stack-item-name">fflate</div>
        <div class="stack-item-detail">异步 ZIP 打包，多卡片批量导出</div>
      </div>
      <div class="stack-item">
        <span class="stack-item-num">10</span>
        <div class="stack-item-label">开源协议</div>
        <div class="stack-item-name">MIT License</div>
        <div class="stack-item-detail">自由使用、修改与商业应用</div>
      </div>
    </div>
  </div>
  <div class="footer-bar">
    <span class="brand">markdown2view</span>
    <span class="dot"></span>
    <span class="tagline">技术栈 · 零后端依赖 · 浏览器原生能力</span>
  </div>
  <div class="page-label">08 / 12</div>
</section>

<!-- ── SLIDE 09: ARCHITECTURE (light) ── -->
<section class="slide">
  <div class="header-strip"></div>
  <div class="s9-inner">
    <div class="s9-left">
      <div>
        <div class="s9-left-label">src/ structure</div>
        <div class="dir-tree"><span class="dir">src/</span>
├ <span class="dir">engine/</span>
│  ├ <span class="hl">utils/</span>  markdownParser
│  ├ <span class="hl">editor-components/</span>
│  └ composables/
├ <span class="dir">components/</span>
│  ├ editor/  CodeMirror
│  └ ui/  Toast / Button
├ <span class="dir">modes/</span>
│  ├ <span class="hl">article/</span>
│  ├ <span class="hl">document/</span>
│  ├ <span class="hl">card/</span>
│  └ <span class="hl">html/</span>
├ lib/  store / exportImage
├ data/  demo + prompts
├ <span class="hl">App.tsx</span>  模式切换入口
└ main.tsx</div>
      </div>
      <div class="s9-left-foot">框架无关渲染引擎</div>
    </div>
    <div class="s9-right">
      <div class="s9-title">架构分层</div>
      <div class="arch-flow">
        <div class="arch-label">输入层 · Input</div>
        <div class="arch-row">
          <div class="arch-box dark">Markdown 编辑器<span class="arch-box-sub">CodeMirror 6</span></div>
          <div class="arch-arrow">→</div>
          <div class="arch-box dark">HTML 画布<span class="arch-box-sub">自由输入</span></div>
        </div>
        <div class="arch-label">引擎层 · Engine</div>
        <div class="arch-row">
          <div class="arch-box">自定义 Markdown 解析器<span class="arch-box-sub">steps / timeline / slider</span></div>
          <div class="arch-box">iframe 沙箱渲染器<span class="arch-box-sub">样式隔离</span></div>
        </div>
        <div class="arch-label">渲染层 · 四种模式</div>
        <div class="arch-row">
          <div class="arch-box warm">长图文</div>
          <div class="arch-box warm">A4 文档</div>
          <div class="arch-box warm">社交卡片</div>
          <div class="arch-box warm">自由画布</div>
        </div>
        <div class="arch-label">导出层 · Export</div>
        <div class="arch-row">
          <div class="arch-box">复制富文本</div>
          <div class="arch-box">PNG 截图</div>
          <div class="arch-box">PDF 打印</div>
          <div class="arch-box">ZIP 批量</div>
        </div>
      </div>
    </div>
  </div>
  <div class="footer-bar">
    <span class="brand">markdown2view</span>
    <span class="dot"></span>
    <span class="tagline">项目架构 · 模块分层</span>
  </div>
  <div class="page-label">09 / 12</div>
</section>

<!-- ── SLIDE 10: REFERENCES (light) ── -->
<section class="slide">
  <div class="header-strip"></div>
  <div class="s10-inner">
    <div class="s10-head">
      <div class="s10-title">开源致敬</div>
      <div class="s10-sub">References · Standing on Shoulders</div>
    </div>
    <div class="s10-grid">
      <div class="ref-col">
        <div class="ref-num">01</div>
        <div class="ref-project">r-markdown</div>
        <div class="ref-desc">移植了微信公众号渲染引擎的核心解析逻辑、多款排版组件以及主题配色方案。长图文模式的技术基础来源于此。</div>
        <div class="ref-tag">RobocopMao · 渲染引擎</div>
      </div>
      <div class="ref-col">
        <div class="ref-num">02</div>
        <div class="ref-project">html-anything</div>
        <div class="ref-desc">启发了 HTML 可视化画布中基于 iframe 容器的安全隔离设计与导出规范，奠定沙箱架构基础。</div>
        <div class="ref-tag">nexu-io · 沙箱隔离设计</div>
      </div>
      <div class="ref-col">
        <div class="ref-num">03</div>
        <div class="ref-project">guizang-ppt-skill</div>
        <div class="ref-desc">自由画布中「电子杂志」「瑞士国际主义」的风格参考，以及网页 PPT 主题节奏、标准图片比例、版式校验等经验启发。</div>
        <div class="ref-tag muted">op7418 · AGPL-3.0 · 仅设计经验转译</div>
      </div>
    </div>
  </div>
  <div class="footer-bar">
    <span class="brand">markdown2view</span>
    <span class="dot"></span>
    <span class="tagline">致敬开源社区 · 站在巨人肩膀上</span>
  </div>
  <div class="page-label">10 / 12</div>
</section>

<!-- ── SLIDE 11: QUICK START (dark) ── -->
<section class="slide dark">
  <div class="header-strip"></div>
  <div class="s11-inner">
    <div class="s11-eyebrow">Quick Start · 快速开始</div>
    <div class="s11-cmd"><span class="prompt">$</span> pnpm install<br><span class="amp">&amp;&amp;</span> pnpm dev</div>
    <div class="s11-rule"></div>
    <div class="s11-meta">Node.js ≥ 20 · pnpm ≥ 10<br>默认启动于 http://localhost:5173 · 热更新开发环境</div>
    <div class="s11-badges">
      <span class="s11-badge">MIT License</span>
      <span class="s11-badge">零后端</span>
      <span class="s11-badge">4 种排版模式</span>
      <span class="s11-badge">浏览器原生导出</span>
    </div>
  </div>
  <div class="footer-bar">
    <span class="brand">markdown2view</span>
    <span class="dot"></span>
    <span class="tagline">开源 · 纯前端 · 极致排版自由度</span>
  </div>
  <div class="page-label">11 / 12</div>
</section>

<!-- ── SLIDE 12: THANKS (dark) ── -->
<section class="slide dark">
  <div class="header-strip"></div>
  <div class="s12-mark">&rdquo;</div>
  <div class="s12-inner">
    <div class="s12-eyebrow">Thank You for Watching</div>
    <div class="s12-title">感谢观看<span class="dot">.</span></div>
    <div class="s12-divider"></div>
    <div class="s12-thanks">本项目站在众多开源项目的肩膀上 —— 致敬 <strong>r-markdown</strong>、<strong>html-anything</strong>、<strong>guizang-ppt-skill</strong> 以及每一位开源贡献者。markdown2view 基于 MIT 协议开源，期待与你一同打磨。</div>
    <div class="s12-feedback-label">欢迎反馈与共建 · Feedback</div>
    <div class="s12-channels">
      <div class="s12-channel">
        <div class="s12-channel-name">Issue</div>
        <div class="s12-channel-desc">提交问题与建议</div>
      </div>
      <div class="s12-channel">
        <div class="s12-channel-name">Pull Request</div>
        <div class="s12-channel-desc">贡献代码与组件</div>
      </div>
      <div class="s12-channel">
        <div class="s12-channel-name">Star</div>
        <div class="s12-channel-desc">支持项目持续迭代</div>
      </div>
    </div>
  </div>
  <div class="footer-bar">
    <span class="brand">markdown2view</span>
    <span class="dot"></span>
    <span class="tagline">感谢观看 · 欢迎 Issue / PR / Star 共建</span>
  </div>
  <div class="page-label">12 / 12</div>
</section>

</body>
</html>
`;
