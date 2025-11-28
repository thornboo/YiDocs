import fs from 'fs-extra';
import path from 'node:path';
import matter from 'gray-matter';
import { globby } from 'globby';

interface SidebarItem {
  text: string;
  link?: string;
  items?: SidebarItem[];
  collapsed?: boolean;
}

/**
 * 提取 Markdown 文件的标题
 * 优先顺序: Frontmatter title -> H1 (# Title) -> 文件名
 */
async function extractTitle(filePath: string): Promise<string> {
  const content = await fs.readFile(filePath, 'utf-8');
  const { data } = matter(content);

  if (data.title) return data.title;

  const h1Match = content.match(/^#\s+(.+)$/m);
  if (h1Match) return h1Match[1];

  return path.basename(filePath, path.extname(filePath));
}

/**
 * 生成 VitePress Sidebar 配置
 * 策略: 递归遍历目录，文件夹 -> Group, 文件 -> Link
 */
export async function generateSidebar(rootDir: string): Promise<SidebarItem[]> {
  const items: SidebarItem[] = [];

  const entries = await fs.readdir(rootDir, { withFileTypes: true });

  // 排序: 数字前缀优先 (01-intro), 否则字母序
  entries.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

  for (const entry of entries) {
    // 忽略隐藏文件和特定目录
    if (entry.name.startsWith('.') || entry.name === 'public' || entry.name === 'assets') continue;
    if (entry.name === 'package.json' || entry.name === 'node_modules') continue;

    const fullPath = path.join(rootDir, entry.name);

    if (entry.isDirectory()) {
      // 递归处理子目录
      const children = await generateSidebar(fullPath);
      if (children.length > 0) {
        items.push({
          text: entry.name.replace(/^\d+-/, ''), // 去除 "01-" 前缀作为显示名
          items: children,
          collapsed: false,
        });
      }
    } else if (entry.isFile() && /\.(md|mdx)$/.test(entry.name)) {
      // 处理 Markdown 文件
      if (entry.name.toLowerCase() === 'index.md' || entry.name.toLowerCase() === 'readme.md') {
        // Index 文件通常不直接列在列表中，或者放在最上面?
        // 策略: 如果是 index.md，它通常是上一级 Group 的入口 link。
        // 但目前的递归结构很难回溯。简单起见，我们把它当做普通文件，但名字叫 "概览"
        // 并在 VitePress config 里手动处理主页。
      }

      const title = await extractTitle(fullPath);
      // VitePress link 是相对于 .vitepress/config.js 的 sourceDir 的
      // 这里的 link 应该是 /path/to/file (不含 .md)
      // 我们假设 rootDir 就是 content root

      // 计算相对路径，并转为 / 开头
      // 这里有个 tricky 的点：generateSidebar 被递归调用，fullPath 是绝对路径。
      // 我们需要知道相对于 "output.dir" 的路径。
      // 所以我们其实应该传递 relativePath。
      // 暂时我们在外部调用时保证 rootDir 是绝对路径，并且 link 生成需要再处理一下。
      // 为了简单，我们只返回结构，link 的前缀由调用者决定?
      // 不，我们直接返回 SidebarItem。

      // 修正：我们需要 outputDir 作为 base
      // 但这里我们没有传入 base。
      // Hack: 我们可以存一个相对路径在 SidebarItem 里，最后再统一处理?
      // 或者，我们假设 generateSidebar 接收 (currentDir, baseDir)
    }
  }

  return items;
}

// 由于递归需要 baseDir，我们重写一个辅助函数
async function scanDir(currentDir: string, baseDir: string): Promise<SidebarItem[]> {
  const items: SidebarItem[] = [];
  const entries = await fs.readdir(currentDir, { withFileTypes: true });
  entries.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name === 'public' || entry.name === 'assets') continue;

    const fullPath = path.join(currentDir, entry.name);
    const relativePath = path.relative(baseDir, fullPath); // e.g. "guide/intro.md"

    if (entry.isDirectory()) {
      const children = await scanDir(fullPath, baseDir);
      if (children.length > 0) {
        items.push({
          text: entry.name.replace(/^\d+-/, '').replace(/-/g, ' '), // 美化文件夹名
          items: children,
          collapsed: false,
        });
      }
    } else if (entry.isFile() && /\.(md|mdx)$/.test(entry.name)) {
      const title = await extractTitle(fullPath);
      const link = '/' + relativePath.replace(/\.(md|mdx)$/, ''); // /guide/intro

      items.push({
        text: title,
        link: link,
      });
    }
  }
  return items;
}

export async function createSidebar(outputDir: string): Promise<SidebarItem[]> {
  return scanDir(outputDir, outputDir);
}
