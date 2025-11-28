import fs from 'fs-extra';
import path from 'node:path';
import chalk from 'chalk';
import ora from 'ora';
import type { UserConfig } from './config/schema';
import { createSidebar } from './sidebar';

export async function generateVitePressSite(config: UserConfig, outputDir: string) {
  const spinner = ora('正在构建文档站点...').start();

  try {
    const vpDir = path.join(outputDir, '.vitepress');
    await fs.ensureDir(vpDir);

    const sidebar = await createSidebar(outputDir);

    const configContent = `
import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "${config.output.siteTitle}",
  description: "Translated by YiDocs",
  themeConfig: {
    search: {
      provider: 'local'
    },
    sidebar: ${JSON.stringify(sidebar, null, 2)},
    socialLinks: [
      { icon: 'github', link: 'https://github.com/${config.source?.repo || 'user/repo'}' }
    ],
    footer: {
      message: 'Translated by YiDocs',
      copyright: 'Powered by AI'
    }
  },
  ignoreDeadLinks: true,
})
`;
    await fs.writeFile(path.join(vpDir, 'config.js'), configContent);

    // 生成默认首页 index.md，防止 404
    const indexPath = path.join(outputDir, 'index.md');
    if (!(await fs.pathExists(indexPath))) {
      const indexContent = `---
layout: home

hero:
  name: "${config.output.siteTitle}"
  text: "本地化文档"
  tagline: "由 YiDocs 自动翻译生成"
  actions:
    - theme: brand
      text: 开始阅读
      link: ${sidebar.length > 0 && sidebar[0].items && sidebar[0].items.length > 0 ? sidebar[0].items[0].link : '/guide/intro'}
---`;
      await fs.writeFile(indexPath, indexContent);
    }

    const pkgPath = path.join(outputDir, 'package.json');
    const pkgContent = {
      name: 'yidocs-site',
      version: '1.0.0',
      type: 'module',
      scripts: {
        dev: 'vitepress dev --port 3000',
        build: 'vitepress build',
        preview: 'vitepress preview --port 3000',
      },
      devDependencies: {
        vitepress: '^1.0.0-rc.44',
        vue: '^3.4.0',
      },
    };
    await fs.writeJson(pkgPath, pkgContent, { spaces: 2 });

    spinner.succeed(chalk.green('站点构建完成'));
  } catch (error) {
    spinner.fail(chalk.red('站点构建失败'));
    throw error;
  }
}
