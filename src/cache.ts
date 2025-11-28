import fs from 'fs-extra';
import path from 'node:path';

const CACHE_FILE = '.yidocs/cache.json';

interface FileCacheEntry {
  hash: string; // 源文件 Hash
  status: 'pending' | 'success' | 'failed';
  lastModified: number;
}

type CacheStore = Record<string, FileCacheEntry>; // filepath -> entry

export class CacheManager {
  private cache: CacheStore = {};

  async load() {
    if (await fs.pathExists(CACHE_FILE)) {
      try {
        this.cache = await fs.readJson(CACHE_FILE);
      } catch (e) {
        this.cache = {};
      }
    }
  }

  async save() {
    await fs.ensureDir(path.dirname(CACHE_FILE));
    await fs.writeJson(CACHE_FILE, this.cache, { spaces: 2 });
  }

  /**
   * 检查文件是否需要翻译
   * 如果 Hash 相同且上次状态为 success，则跳过
   */
  shouldTranslate(filePath: string, currentHash: string): boolean {
    const entry = this.cache[filePath];
    if (!entry) return true; // 无记录，需翻译
    if (entry.status !== 'success') return true; // 上次失败或未完成，需翻译
    if (entry.hash !== currentHash) return true; // 内容变更，需翻译
    return false; // 缓存命中，跳过
  }

  update(filePath: string, hash: string, status: 'success' | 'failed') {
    this.cache[filePath] = {
      hash,
      status,
      lastModified: Date.now(),
    };
  }
}
