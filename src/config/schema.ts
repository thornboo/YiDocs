import { z } from 'zod';

export const ConfigSchema = z.object({
  source: z
    .object({
      repo: z.string().optional(),
      branch: z.string().default('main'),
      docsPath: z.string().default('docs'),
    })
    .default({}), // 整个 source 对象也是可选的
  translation: z.object({
    apiKey: z.string().describe('DeepSeek or OpenAI API Key'),
    apiBaseUrl: z.string().default('https://api.deepseek.com').describe('API Base URL'),
    model: z.string().default('deepseek-chat').describe('Model name'),
    concurrency: z.number().min(1).max(20).default(5),
    exclude: z.array(z.string()).default([]),
    glossary: z
      .record(z.string())
      .optional()
      .describe('Key-value pairs for consistent terminology'),
  }),
  output: z.object({
    dir: z.string().default('./dist-docs'),
    siteTitle: z.string().default('YiDocs Generated Site'),
  }),
});

export type UserConfig = z.infer<typeof ConfigSchema>;
