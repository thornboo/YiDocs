/**
 * JSX 清洗器 (Sanitizer)
 *
 * 目标：将 React/MDX 专有的语法转换为纯 Markdown 或 Vue 安全的格式，
 * 防止 VitePress (Vue) 构建时崩溃。
 */
export function sanitizeContent(content: string): string {
  let cleaned = content;

  // 1. 移除顶层的 import 语句
  // 匹配: import { X } from 'y'; 或 import X from 'y';
  cleaned = cleaned.replace(/^import\s+.*from\s+['"].*['"]\s*$/gm, (match) => {
    return `<!-- ${match} (Import removed for VitePress compatibility) -->`;
  });

  // 2. 处理 React 组件 <Component ... />
  // 策略：不删除，而是包裹在引用块中，作为展示
  // 匹配: 自闭合标签 <X /> 或 <X>...</X> (简单匹配，不支持极度复杂的嵌套)
  // 为了安全，我们主要针对行内或块级的组件调用

  // 2.1 匹配行首的组件调用 (通常是 Demo)
  // 例如: <Counter />
  // 只有首字母大写的标签才被视为 React 组件，避免误伤 <div>, <span>
  cleaned = cleaned.replace(/^<([A-Z][a-zA-Z0-9]*)([^>]*)\/?>/gm, (match, tagName) => {
    return `> ⚠️ **互动组件 (${tagName})**: 此处原为一个交互式 React 组件，因跨框架限制已替换为静态展示。\n>\n> \`${match}\``;
  });

  // 2.2 处理 Vue 插值冲突 {{ }}
  // React 中 {{ }} 是对象字面量，Vue 中是插值
  // 必须转义为\{\{ \}\} 或者 v-pre
  cleaned = cleaned.replace(/\{\{/g, '\\{\\{').replace(/\}\}/g, '\\}\\}');

  return cleaned;
}
