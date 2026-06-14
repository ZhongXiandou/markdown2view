/**
 * Tailwind CSS 浏览器运行时本地化支持。
 * 
 * 当用户 HTML 包含 Tailwind 类名但没有引入 Tailwind 脚本时，
 * 自动注入本地版本（public/tailwind.js），避免依赖外部 CDN。
 */

// 检测 HTML 是否包含 Tailwind 类名
export function hasTailwindClasses(html: string): boolean {
  const tailwindPatterns = [
    /\b(flex|grid|block|inline|hidden)\b/,
    /\b(p|m|w|h|text|bg|border|rounded|shadow|gap|space|items|justify|self|col|row)-/,
    /\b(sm|md|lg|xl|2xl):/,
    /\b(hover|focus|active|disabled|first|last|odd|even):/,
    /\b(container|prose|sr-only|truncate|line-clamp|aspect-|divide-|ring-|outline-)/,
  ]
  return tailwindPatterns.some(pattern => pattern.test(html))
}

// 检测 HTML 是否已包含 Tailwind 脚本标签
export function hasTailwindScript(html: string): boolean {
  return /<script[^>]*tailwind[^>]*>/i.test(html)
}

// 生成本地 Tailwind 注入脚本标签
export function generateTailwindScriptTag(): string {
  return '<script src="/tailwind.js"></script>'
}
