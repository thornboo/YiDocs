import prompts from 'prompts';
import chalk from 'chalk';
import type { UserConfig } from './schema';

/**
 * 交互式配置向导
 * @param currentConfig 当前已有的部分配置（可选）
 */
export async function runConfigWizard(currentConfig: Partial<UserConfig> = {}): Promise<UserConfig> {
  console.log(chalk.cyan('\n👋 欢迎使用 YiDocs！我们需要配置您的翻译服务。'));

  const response = await prompts([
    {
      type: 'text',
      name: 'apiKey',
      message: '请输入您的 DeepSeek API Key (sk-...):',
      initial: currentConfig.translation?.apiKey,
      validate: (value: string) => value.length > 10 ? true : 'Key 长度看起来不对，请检查'
    },
    {
      type: 'text',
      name: 'apiBaseUrl',
      message: '请输入 API Base URL:',
      initial: currentConfig.translation?.apiBaseUrl || 'https://api.deepseek.com'
    }
  ]);

  if (!response.apiKey) {
    throw new Error('用户取消了配置');
  }

  // 构造完整的配置对象
  const newConfig: UserConfig = {
    source: currentConfig.source || { branch: 'main', docsPath: 'docs' },
    translation: {
      apiKey: response.apiKey,
      apiBaseUrl: response.apiBaseUrl,
      model: currentConfig.translation?.model || 'deepseek-chat',
      concurrency: currentConfig.translation?.concurrency || 5,
      exclude: currentConfig.translation?.exclude || []
    },
    output: currentConfig.output || { dir: './dist-docs', siteTitle: 'My Docs' }
  };

  return newConfig;
}
