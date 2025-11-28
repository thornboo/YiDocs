import fs from 'fs-extra';
import path from 'node:path';
import { globby } from 'globby';
import crypto from 'node:crypto';
import matter from 'gray-matter';

export interface FileInfo {
  path: string; // 相对路径，如 'guide/intro.md'
  absolutePath: string; // 绝对路径
  content: string; // 原始内容
  hash: string; // 内容哈希
  extension: string; // .md 或 .mdx
}

/**
 * 计算内容的 SHA-256 哈希值
 * 用于增量构建，对比文件是否发生变化
 */
export function computeHash(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * 扫描目录下的所有 Markdown/MDX 文件
 * @param dir 要扫描的目录路径
 * @param exclude 排除模式数组
 */
export async function scanFiles(dir: string, exclude: string[] = []): Promise<FileInfo[]> {
  const patterns = ['**/*.md', '**/*.mdx', ...exclude.map((p) => `!${p}`)];

  // 使用 globby 查找文件
  const paths = await globby(patterns, {
    cwd: dir,
    absolute: false, // 返回相对路径
    onlyFiles: true,
  });

  const files: FileInfo[] = [];

  for (const p of paths) {
    const absPath = path.join(dir, p);
    const content = await fs.readFile(absPath, 'utf-8');

    files.push({
      path: p,
      absolutePath: absPath,
      content,
      hash: computeHash(content),
      extension: path.extname(p),
    });
  }

  return files;
}

/**
 * 保存翻译后的文件
 * 自动处理目录创建
 */
export async function saveTranslatedFile(
  outputDir: string,
  relativePath: string,
  content: string,
): Promise<void> {
  const outputPath = path.join(outputDir, relativePath);
  await fs.ensureDir(path.dirname(outputPath));
  await fs.writeFile(outputPath, content, 'utf-8');
}
