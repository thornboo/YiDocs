import chalk from 'chalk';
import { readRawConfig, validateConfig, saveConfig, ConfigError } from './loader';
import { runConfigWizard } from './wizard';
import type { UserConfig } from './schema';

export * from './schema';

/**
 * 主入口：加载配置
 * 如果配置无效或缺失，自动触发向导
 */
export async function loadConfig(): Promise<UserConfig> {
  try {
    // 1. 尝试读取
    const raw = await readRawConfig();

    // 2. 如果文件不存在，或者关键 Key 缺失，进入向导
    if (!raw || !raw.translation?.apiKey || raw.translation.apiKey.includes('test-key')) {
      if (!raw) {
        console.log(chalk.yellow('ℹ️  未找到配置文件。'));
      } else {
        console.log(chalk.yellow('ℹ️  配置不完整 (缺少 API Key)。'));
      }

      const newConfig = await runConfigWizard(raw || {});
      await saveConfig(newConfig);
      console.log(chalk.green('✅ 配置已保存'));
      return newConfig;
    }

    // 3. 验证并返回
    return validateConfig(raw);

  } catch (error) {
    if (error instanceof ConfigError) {
      console.error(chalk.red(`❌ ${error.message}`));
      process.exit(1);
    }
    throw error;
  }
}

/**
 * 强制进入交互式配置 (用于 yidocs config 命令)
 */
export async function forceReconfigure(): Promise<void> {
  const raw = await readRawConfig();
  const newConfig = await runConfigWizard(raw || {});
  await saveConfig(newConfig);
  console.log(chalk.green('✅ 配置已更新'));
}

/**
 * 编程式更新配置 (用于 yidocs config set)
 */
export async function updateConfigKey(key: string, value: any): Promise<void> {
  const raw = (await readRawConfig()) || {};
  
  // 简单的深层设置支持 (仅限 2 层)
  const parts = key.split('.');
  if (parts.length === 2) {
    if (!raw[parts[0]]) raw[parts[0]] = {};
    raw[parts[0]][parts[1]] = value;
  } else {
    raw[key] = value;
  }

  await saveConfig(raw);
}