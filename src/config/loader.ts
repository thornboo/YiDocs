import fs from 'fs-extra';
import { ConfigSchema, type UserConfig } from './schema';

export const DEFAULT_CONFIG_FILE = 'readlocal.config.json';
const CONFIG_FILES = ['readlocal.config.json', 'yidocs.config.json'];

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

/**
 * 纯粹的配置读取函数
 * @returns 配置对象或 null (如果文件不存在)
 * @throws ConfigError 如果文件存在但校验失败
 */
export async function readRawConfig(): Promise<any | null> {
  let configPath: string | null = null;

  for (const file of CONFIG_FILES) {
    if (await fs.pathExists(file)) {
      configPath = file;
      break;
    }
  }

  if (!configPath) return null;

  try {
    return await fs.readJson(configPath);
  } catch (error) {
    throw new ConfigError(`配置文件格式错误: ${configPath}`);
  }
}

/**
 * 验证配置对象
 */
export function validateConfig(raw: any): UserConfig {
  try {
    return ConfigSchema.parse(raw);
  } catch (error) {
    if (error && typeof error === 'object' && 'issues' in error) {
      // 简化 Zod 错误信息
      const issues = (error as any).issues.map((i: any) => `${i.path.join('.')}: ${i.message}`).join('\n');
      throw new ConfigError(`配置验证失败:\n${issues}`);
    }
    throw new ConfigError('配置验证失败');
  }
}

/**
 * 保存配置
 */
export async function saveConfig(config: any): Promise<void> {
  await fs.writeJson(DEFAULT_CONFIG_FILE, config, { spaces: 2 });
}
