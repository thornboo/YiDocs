import { downloadTemplate } from 'giget';
import path from 'node:path';
import fs from 'fs-extra';
import chalk from 'chalk';
import ora from 'ora';

const SOURCES_ROOT = '.yidocs/sources';

export interface SourceInfo {
  owner: string;
  repo: string;
  branch: string;
  subdir: string;
  localPath: string; // 存储在本地的路径
}

/**
 * 解析 GitHub URL
 * 支持完整 URL: https://github.com/pmndrs/zustand/tree/main/docs
 * 支持简写: pmndrs/zustand/docs
 */
export function parseSourceUrl(input: string): SourceInfo {
  let owner, repo, subdir, branch;

  if (input.startsWith('https://github.com/')) {
    // 解析 https://github.com/owner/repo/tree/branch/subdir
    const url = new URL(input);
    const parts = url.pathname.split('/').filter(Boolean);
    // parts: [owner, repo, 'tree', branch, ...subdir]
    owner = parts[0];
    repo = parts[1];

    if (parts[2] === 'tree') {
      branch = parts[3];
      subdir = parts.slice(4).join('/');
    } else {
      branch = 'main'; // 默认 fallback
      subdir = '';
    }
  } else {
    // 简写模式处理逻辑 (简化版)
    const parts = input.split('/');
    owner = parts[0];
    repo = parts[1];
    subdir = parts.slice(2).join('/') || '';
    branch = 'main';
  }

  // 简化目录结构: .yidocs/sources/owner__repo__branch
  // 替换 / 为 __ 以避免深层嵌套，但保留唯一性
  const safeSubdir = subdir ? `__${subdir.replace(/\//g, '_')}` : '';
  const dirName = `${owner}__${repo}__${branch}${safeSubdir}`;
  const localPath = path.join(SOURCES_ROOT, dirName);

  return { owner, repo, branch, subdir, localPath };
}

/**
 * 下载文档
 */
export async function downloadDocs(info: SourceInfo): Promise<string> {
  const spinner = ora(`正在下载 ${info.owner}/${info.repo}...`).start();

  // giget format: github:owner/repo/subdir#branch
  const source = `github:${info.owner}/${info.repo}/${info.subdir}#${info.branch}`;

  try {
    // 确保父目录存在
    await fs.remove(info.localPath); // 清理旧版本，实现“完全覆盖”更新
    await fs.ensureDir(path.dirname(info.localPath));

    await downloadTemplate(source, {
      dir: info.localPath,
      force: true,
      preferOffline: false,
    });

    spinner.succeed(chalk.green(`下载成功! 文件已保存至: ${info.localPath}`));

    // 保存当前源信息，供后续流程自动使用
    await fs.writeJson('.yidocs/current.json', info, { spaces: 2 });

    return info.localPath;
  } catch (error) {
    spinner.fail(chalk.red(`下载失败: ${source}`));
    throw error;
  }
}

/**
 * 检查更新 (模拟)
 * 实际上可以通过 GitHub API 检查 commit hash
 */
export async function checkUpdate(info: SourceInfo): Promise<boolean> {
  // TODO: 实现真实检查
  // 暂时返回 true 提示用户可以更新
  return true;
}
