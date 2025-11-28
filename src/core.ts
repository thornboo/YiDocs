import pLimit from 'p-limit';
import ora from 'ora';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'node:path';
import type { UserConfig } from './config/schema';
import { scanFiles, saveTranslatedFile } from './processor';
import { Translator } from './translator';
import { CacheManager } from './cache';
import { sanitizeContent } from './sanitizer';

// 简单日志工具
function logVerbose(msg: string, verbose: boolean) {
  if (verbose) console.log(chalk.gray(`[DEBUG] ${msg}`));
}

export async function runTranslationPhase(
  config: UserConfig,
  sourceDir: string,
  verbose: boolean = false,
) {
  const spinner = ora('正在初始化翻译引擎...').start();

  // 1. 扫描文件
  logVerbose(`扫描目录: ${sourceDir}`, verbose);
  const files = await scanFiles(sourceDir, config.translation.exclude);
  spinner.succeed(`发现 ${files.length} 个 Markdown/MDX 文件`);

  // 2. 初始化服务
  const translator = new Translator(config.translation);
  const cache = new CacheManager();
  await cache.load();

  // 3. 过滤需要翻译的文件 (增量检查)
  const filesToTranslate = files.filter((f) => cache.shouldTranslate(f.path, f.hash));

  if (filesToTranslate.length === 0) {
    console.log(chalk.green('✨ 所有文件均已是最新，无需翻译。'));
    return;
  }

  console.log(
    chalk.blue(
      `ℹ️  准备翻译 ${filesToTranslate.length} 个文件 (跳过 ${files.length - filesToTranslate.length} 个无变更文件)`,
    ),
  );

  // 4. 并发控制
  const limit = pLimit(config.translation.concurrency);
  let completed = 0;
  let failed = 0;
  const total = filesToTranslate.length;

  const progress = ora(`进度: 0/${total}`).start();

  // 5. 执行任务队列
  const tasks = filesToTranslate.map((file) => {
    return limit(async () => {
      try {
        logVerbose(`开始翻译: ${file.path}`, verbose);

        // 调用 AI 翻译
        const translatedContent = await translator.translateContent(file.content, file.path);

        // Phase 3: 清洗内容 (防止 VitePress 构建崩溃)
        const safeContent = sanitizeContent(translatedContent);

        // 保存文件 (使用 config.output.dir)
        await saveTranslatedFile(config.output.dir, file.path, safeContent);

        // 更新缓存
        cache.update(file.path, file.hash, 'success');

        completed++;
        progress.text = `进度: ${completed}/${total} (当前: ${path.basename(file.path)})`;
      } catch (error) {
        failed++;
        cache.update(file.path, file.hash, 'failed');
        logVerbose(`翻译失败 ${file.path}: ${error}`, true);
      }
    });
  });

  await Promise.all(tasks);
  await cache.save();

  if (failed > 0) {
    progress.fail(chalk.yellow(`翻译完成，但有 ${failed} 个文件失败。请检查日志或重试。`));
  } else {
    progress.succeed(chalk.green(`翻译完成！成功: ${completed}/${total}`));
  }
}
