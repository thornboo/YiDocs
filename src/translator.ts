import OpenAI from 'openai';
import type { UserConfig } from './config/schema';
import chalk from 'chalk';

export interface LLMProvider {
  translate(content: string, filename: string, systemPrompt: string): Promise<string>;
  checkConnection(): Promise<boolean>;
}

/**
 * OpenAI 兼容适配器 (DeepSeek, Moonshot, Yi, GLM-4 等)
 */
export class OpenAIProvider implements LLMProvider {
  private client: OpenAI;
  private model: string;

  constructor(config: UserConfig['translation']) {
    // Debug: 打印 Key 信息辅助排查 (只显示前3位和长度)
    const key = config.apiKey || '';
    const maskedKey =
      key.length > 3 ? `${key.substring(0, 3)}... (Length: ${key.length})` : 'Missing/Empty';
    console.log(
      chalk.gray(`[Debug] Initializing API: BaseURL=${config.apiBaseUrl}, Key=${maskedKey}`),
    );

    this.client = new OpenAI({
      baseURL: config.apiBaseUrl,
      apiKey: config.apiKey,
    });
    this.model = config.model;
  }

  async checkConnection(): Promise<boolean> {
    try {
      // 策略更新：发送一个极简的对话请求 (1 token)
      // 这比 models.list() 更能真实反映 Chat API 是否可用
      await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 1,
      });
      return true;
    } catch (error) {
      console.error(chalk.red('[API Error] 连接验证失败:'), error);
      console.error(
        chalk.yellow(
          '提示: 请检查 API Key 是否正确，或 Base URL 是否需要 "/v1" 后缀 (例如 https://api.deepseek.com/v1)',
        ),
      );
      return false;
    }
  }

  async translate(content: string, filename: string, systemPrompt: string): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Translate this file: ${filename}\n\n${content}`,
        },
      ],
      temperature: 0.1,
    });

    const result = response.choices[0]?.message?.content;
    if (!result) throw new Error('Empty response from AI');
    return result;
  }
}

// 可以在这里扩展 AnthropicProvider, GeminiProvider 等

/**
 * 翻译工厂类
 */
export class Translator {
  private provider: LLMProvider;
  private config: UserConfig['translation'];

  constructor(config: UserConfig['translation']) {
    this.config = config;
    // 目前默认使用 OpenAI 兼容模式
    // 未来可以根据 config.provider = 'anthropic' 来切换
    this.provider = new OpenAIProvider(config);
  }

  private buildSystemPrompt(): string {
    const glossaryText = this.config.glossary
      ? `\nTerminology Glossary:\n${Object.entries(this.config.glossary)
          .map(([k, v]) => `- ${k}: ${v}`)
          .join('\n')}`
      : '';

    return `You are a professional technical document translator (English to Chinese).
Your goal is to translate the Markdown/MDX content while STRICTLY preserving the original format, code, and technical accuracy.

CRITICAL RULES:
1. **Preserve Structure**: Do NOT change any Markdown syntax.
2. **Preserve Code**: NEVER translate content inside code blocks or inline code.
3. **Preserve Frontmatter**: Keep YAML frontmatter exactly as is.
4. **Preserve Components**: Do NOT translate React/Vue component names or props.
5. **Preserve Links**: Do NOT translate file paths in links.
6. **Terminology**: Use professional Chinese technical terms. ${glossaryText}

Output ONLY the translated Markdown content.`;
  }

  async checkConnection(): Promise<boolean> {
    return this.provider.checkConnection();
  }

  async translateContent(content: string, filename: string): Promise<string> {
    return this.provider.translate(content, filename, this.buildSystemPrompt());
  }
}
