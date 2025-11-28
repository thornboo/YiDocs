import { cac } from 'cac';
import { loadConfig, forceReconfigure, updateConfigKey } from './config/index';
import { parseSourceUrl, downloadDocs, type SourceInfo } from './fetcher';
import { runTranslationPhase } from './core';
import { generateVitePressSite } from './renderer';
import { Translator } from './translator';
import fs from 'fs-extra';
import { spawn } from 'child_process';
import path from 'path';
import prompts from 'prompts';
import { logger } from './utils/logger';

const cli = cac('yidocs');

async function resolveSource(config: any, urlArg?: string): Promise<SourceInfo | null> {
  if (urlArg) return parseSourceUrl(urlArg);
  if (config.source?.repo) {
    const fullUrl = `https://github.com/${config.source.repo}/tree/${config.source.branch}/${config.source.docsPath}`;
    return parseSourceUrl(fullUrl);
  }
  try {
    if (await fs.pathExists('.yidocs/current.json')) {
      return await fs.readJson('.yidocs/current.json');
    }
  } catch (e) { /* ignore */ }
  return null;
}

// --- Commands ---

cli.command('add [url]', '下载文档源').action(async (url) => {
  let sourceUrl = url;
  if (!sourceUrl) {
    const res = await prompts({ type: 'text', name: 'v', message: 'GitHub URL:' });
    sourceUrl = res.v;
  }
  if (!sourceUrl) return;

  const info = parseSourceUrl(sourceUrl);
  logger.info(`准备下载: ${info.owner}/${info.repo}`);
  await downloadDocs(info);
});

cli.command('translate', '执行翻译')
  .option('--verbose', '详细日志')
  .action(async (options) => {
    logger.setVerbose(options.verbose);
    const config = await loadConfig();
    const info = await resolveSource(config);
    
    if (!info) {
      logger.error('未找到文档源。请先运行 "yidocs add <url>"');
      return;
    }

    if (!await fs.pathExists(info.localPath)) {
      logger.warn(`源文件不存在，尝试自动下载...`);
      await downloadDocs(info);
    }
    
    await runTranslationPhase(config, info.localPath, options.verbose);
  });

cli.command('build', '构建站点').action(async () => {
  const config = await loadConfig();
  await generateVitePressSite(config, config.output.dir);
});

cli.command('preview', '预览站点').action(async () => {
  const config = await loadConfig();
  const outputDir = path.resolve(config.output.dir);
  
  if (!await fs.pathExists(path.join(outputDir, 'package.json'))) {
    logger.error('站点未构建。请先运行 "yidocs build"');
    return;
  }

  logger.info(`启动预览服务器 (Port 3000)...`);
  if (!await fs.pathExists(path.join(outputDir, 'node_modules'))) {
    logger.info('正在安装依赖...');
    const install = spawn('npm', ['install'], { cwd: outputDir, stdio: 'inherit' });
    await new Promise((resolve) => install.on('close', resolve));
  }
  spawn('npm', ['run', 'dev'], { cwd: outputDir, stdio: 'inherit' });
});

cli.command('start', '一键启动').action(async () => {
  logger.info('YiDocs 自动流程启动');
  const config = await loadConfig();
  let info = await resolveSource(config);

  if (!info) {
    const res = await prompts({ type: 'text', name: 'v', message: 'GitHub URL:' });
    if (!res.v) return;
    info = parseSourceUrl(res.v);
  }

  if (!await fs.pathExists(info.localPath)) {
    logger.info('>>> 下载文档');
    await downloadDocs(info);
  }

  logger.info('>>> 智能翻译');
  await runTranslationPhase(config, info.localPath);

  logger.info('>>> 构建站点');
  await generateVitePressSite(config, config.output.dir);

  logger.info('>>> 启动预览');
  const outputDir = path.resolve(config.output.dir);
  if (!await fs.pathExists(path.join(outputDir, 'node_modules'))) {
    const install = spawn('npm', ['install'], { cwd: outputDir, stdio: 'inherit' });
    await new Promise((resolve) => install.on('close', resolve));
  }
  spawn('npm', ['run', 'dev'], { cwd: outputDir, stdio: 'inherit' });
});

cli.command('config [action] [key] [value]', '管理配置')
  .action(async (action, key, value) => {
    if (!action) {
      await forceReconfigure();
      return;
    }
    if (action === 'set') {
      if (!key || !value) return logger.error('用法: config set <key> <value>');
      await updateConfigKey(key, value);
      logger.success(`已更新 ${key}`);
    } else if (action === 'view') {
      const config = await loadConfig();
      // Mask key logic omitted for brevity
      console.log(JSON.stringify(config, null, 2));
    }
  });

cli.command('test-connection', '测试连接').action(async () => {
  const config = await loadConfig();
  const translator = new Translator(config.translation);
  if (await translator.checkConnection()) {
    logger.success('API 连接成功');
  }
});

cli.help();
cli.version('0.2.0');
cli.parse();