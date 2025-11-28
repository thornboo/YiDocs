# 开发路线图

这是为 YiDocs 开发者准备的分步实施指南。

## 开发阶段

### Phase 1: 基础架构搭建（下载器）

**目标**：为下载 GitHub 文档建立基础架构。

**任务**：

- [ ] 初始化 Node.js 项目（`npm init`）并安装依赖。
- [ ] 实现 `Config` 读取逻辑。
- [ ] 集成 `giget`：
  - 测试能否将 `github:pmndrs/zustand/docs#main` 下载到本地临时目录 `.temp_raw`。
  - 处理图片和静态资源（确保它们被一同下载）。

**实施细节**：

1. **项目初始化**
   - 设置包含所有必需依赖的 package.json
   - 配置 TypeScript（可选但推荐）
   - 建立基本项目结构

2. **配置系统**
   - 创建配置解析器读取 `readlocal.config.json`
   - 验证配置架构
   - 支持环境变量覆盖

3. **GitHub 下载器**
   - 集成 `giget` 库用于高效 GitHub 文件夹下载
   - 为失败下载实现重试逻辑
   - 处理不同的 GitHub URL 格式
   - 下载时保持目录结构

---

### Phase 2: 翻译核心（翻译器）

**目标**：构建 AI 驱动的翻译引擎，智能翻译文档同时保留格式。

**任务**：

- [ ] 搭建 AI 翻译服务层：
  - 配置 OpenAI SDK 连接 DeepSeek。
  - **Prompt 工程**（关键）：编写 System Prompt，要求保留 MDX 语法、Code Block、Frontmatter。
  - **术语表支持**：支持注入自定义术语表（Glossary）以保持翻译一致性。
- [ ] 文件遍历与过滤：
  - 递归查找 `.md` 和 `.mdx` 文件。
  - 过滤掉不需要翻译的文件（如 `_meta.json` 或纯配置）。
- [ ] 实现增量翻译：
  - 计算文件 Hash，对比缓存，仅翻译变更文件（节省 API 成本）。
- [ ] 实现并发队列：
  - 使用 `p-limit` 限制并发数为 5-10，避免 429 错误。
  - 添加重试机制（如果请求失败，自动重试 1 次）。

**实施细节**：

1. **翻译服务层**
   - 创建抽象的 `TranslationProvider` 接口
   - 实现 `DeepSeekProvider` 类
   - 支持自定义 API 基础 URL
   - 实现 token 计数和成本估算
   - 集成术语表替换逻辑

2. **Prompt 工程**
   - 设计保留以下内容的系统提示词：
     - 代码块和语法高亮
     - Frontmatter 元数据
     - React 组件语法
     - 文件链接和引用
   - 针对技术文档翻译进行优化
   - 支持批量翻译

3. **文件处理与缓存**
   - 递归文件发现与过滤
   - 建立文件 Hash 缓存机制
   - 跳过未变更的文件
   - 保留文件编码和换行符

4. **并发控制**
   - 实现速率限制以遵守 API 配额
   - 队列管理（支持优先级）
   - 进度跟踪和报告
   - 错误处理和重试逻辑

---

### Phase 3: 渲染引擎集成（渲染器）

**目标**：使用 VitePress 生成美观、可导航的文档网站。

**关键策略**：

1.  **JSX 清洗 (Sanitizer)**：为了防止 React/MDX 组件导致 VitePress 构建崩溃，实行"优雅降级"策略。

2.  **菜单生成 (Sidebar)**：采用"文件系统优先 + 标题提取"算法，确保菜单结构稳定且显示中文。

**任务**：

- [ ] 实现 JSX Sanitizer (清洗器)：
  - 读取 Markdown 内容，正则匹配 JSX 组件（如 `<Counter />` 或 `import ...`）。

  - **替换策略**：将组件替换为引用块 `> **[交互组件已移除]**: <组件名 />`，保持排版整洁。

  - 移除所有顶层 `import` 语句。

- [ ] 侧边栏生成器 (Sidebar Generator)：
  - 遍历翻译后的目录结构。

  - **标题提取**：读取每个文件的 Frontmatter `title` 或第一个 H1 `# Title` 作为菜单名。

  - **排序**：优先匹配文件名前缀数字（`01-xxx`），否则按字母顺序。

- [ ] 自动生成 VitePress 配置：
  - 动态创建 `.vitepress/config.js`，注入生成的 Sidebar 对象。

**实施细节**：

1.  **JSX Sanitizer 逻辑**
    - 目标：确保 `npm run build` 0 报错。

    - 规则：
      - `import ...` -> `// import ...` (注释掉)

      - `<Component prop={...} />` -> `> ⚠️ **互动组件占位符**: Component`

      - 处理 Vue 冲突语法：转义双花括号 `{{ }}` -> `\{{ }}`

    - 效果：交互组件位置会显示为一个显眼的提示框，不破坏上下文阅读流。

2.  **Sidebar 生成算法**
    - 避免使用 LLM 生成结构（不可控）。

    - 递归扫描目录：
      - 文件夹 -> Sidebar Group (Title = 文件夹名)

      - 文件 -> Sidebar Item (Text = H1 标题, Link = 文件路径)

    - 确保菜单名称是翻译后的中文标题，而不是英文文件名。

3.  **VitePress 配置**
    - 注入清洗后的 Markdown 文件。

    - 配置本地搜索功能。

    - 自定义 CSS 隐藏不必要的 VitePress 默认元素。

---

### Phase 4: CLI 封装与优化

**目标**：创建用户友好的 CLI 界面并优化整体用户体验。

**任务**：

- [ ] 添加进度条（`ora` 或 `cli-progress`）显示翻译进度（如 "Translating 15/45 files..."）。
- [ ] 实现断点续传（State Management）：记录每个文件的翻译状态，失败重启时自动跳过已完成文件。
- [ ] 实现 `npm run start` 命令，一键完成 "下载 -> 翻译 -> 启动预览"。

**实施细节**：

1. **用户界面**
   - 使用 `cac` 或 `commander` 创建美观的命令行界面
   - 实时进度条和状态更新
   - 使用 `chalk` 实现彩色输出
   - 配置交互式提示

2. **工作流自动化**
   - 单命令操作流水线
   - 将所有阶段整合为无缝工作流
   - 翻译后自动启动本地服务器
   - 自动打开浏览器（可选）

3. **错误处理与恢复**
   - 全面的错误消息
   - 本地状态文件记录任务进度
   - 启动时检查并恢复中断的任务
   - 优雅的故障恢复

---

## 核心代码逻辑

### Prompt 设计参考

````text
System: You are a professional technical translator.
Task: Translate the following Markdown/MDX content into Chinese.

Constraints:
1. DO NOT translate code blocks (content inside ```...```).
2. DO NOT translate Frontmatter keys (yaml content between ---). Only translate values if they are titles/descriptions.
3. DO NOT translate React component names or props (e.g. <MyComponent prop="value" />).
4. Keep original English filenames in links (e.g. [Link](./guide.md) stays ./guide.md).
5. Use professional terminology (e.g. keep "Store", "Hook", "State" in English or formatted as "中文(English)").

User Content: {RAW_MARKDOWN_CONTENT}
````

### 目录结构规划

```text
YiDocs/
├── bin/
│   └── yidocs.js           # CLI 入口点 (npx yidocs)
├── src/
│   ├── fetcher.js          # 下载 GitHub 文件
│   ├── translator.js       # 调用 LLM API
│   ├── processor.js        # 文件 I/O 和正则处理
│   ├── renderer.js         # 生成 VitePress 配置
│   └── config/
│       └── schema.js       # 配置验证
├── templates/              # VitePress 模版文件
│   ├── config.js
│   └── package.json
├── lib/
│   ├── github.js           # GitHub API 工具
│   ├── queue.js            # 任务队列实现
│   └── logger.js           # 日志工具
├── package.json
├── README.md
└── Development.md
```

---

## 实施最佳实践

### 1. 错误处理

- 始终为异步操作实现 try-catch 块
- 提供有意义的错误消息
- 实现指数退避重试
- 记录错误时包含足够的调试上下文

### 2. 性能优化

- 对大文件操作使用流
- 为 API 调用实现连接池
- 缓存频繁访问的数据
- 在安全的地方进行并行处理

### 3. 代码质量

- 为所有核心函数编写单元测试
- 使用 TypeScript 获得更好的类型安全
- 遵循 ESLint 和 Prettier 配置
- 用 JSDoc 记录复杂逻辑

### 4. 用户体验

- 提供清晰的进度指示器
- 支持键盘快捷键
- 使所有操作可取消
- 缓存结果以避免重复翻译

---

## 测试策略

### 单元测试

- 配置验证
- 文件过滤逻辑
- 翻译队列管理
- API 客户端功能

### 集成测试

- 完整下载 → 翻译 → 渲染工作流
- 不同仓库类型
- 各种文件大小和结构
- 错误场景和恢复

### 手动测试

- 使用热门仓库测试（React、Next.js、Vue）
- 验证 MDX 组件处理
- 检查 VitePress 站点生成
- 测试并发翻译场景

---

## 部署考虑

### 环境变量

- 支持 `.env` 文件
- Docker 环境支持
- CI/CD 管道集成
- 密钥管理最佳实践

### 分发

- NPM 包分发
- 主要平台的二进制发布
- Homebrew 配方（可选）
- Chocolatey 包（可选）

---

## 架构与功能优化建议 (Architecture Proposals)

为了提升工具的实用性、稳定性和成本效益，建议在架构设计中尽早考虑以下机制：

### 1. 增量翻译系统 (Incremental Build & Caching)

**痛点**：文档通常只有少量修改。每次全量翻译既浪费 Token 成本，又消耗时间。
**解决方案**：

- **哈希比对**：在翻译前，计算源文件（Markdown）的内容哈希（MD5/SHA256）。
- **缓存层**：维护一个 `manifest.json` 或 `.cache` 目录，存储 `filepath -> source_hash` 的映射。
- **逻辑**：如果不匹配（文件已修改）或无缓存，才调用 LLM API；否则直接使用上次的翻译结果。

### 2. 术语一致性控制 (Glossary Context)

**痛点**：LLM 可能在不同文件中对同一术语有不同翻译（例如 "Store" 翻成 "商店" 或 "存储"）。
**解决方案**：

- **配置增强**：在配置文件中支持 `glossary` 字段。
- **Prompt 注入**：将用户定义的术语表动态注入到 System Prompt 中。
  ```json
  "glossary": {
    "Store": "Store (保留英文)",
    "Hooks": "Hooks",
    "Context": "上下文"
  }
  ```

### 3. 断点续传与状态管理 (Checkpointing)

**痛点**：在大规模文档（>100页）翻译过程中，如果网络中断或 API 报错，不应重头开始。
**解决方案**：

- **持久化状态**：使用本地 JSON 文件（如 `.yidocs/state.json`）实时记录每个文件的处理状态（`pending`, `translating`, `completed`, `failed`）。
- **恢复机制**：工具启动时检查状态文件，自动跳过 `completed` 的文件，仅重试 `failed` 或 `pending` 的任务。

### 4. CLI 执行支持 (npx support)

为了支持 `npx yidocs` 直接运行，目录结构和 `package.json` 需要特别配置：

**目录结构调整**：

```text
YiDocs/
├── bin/
│   └── yidocs.js           # CLI 入口 (#!/usr/bin/env node)
├── src/
│   ├── index.ts            # 核心导出
│   └── ...
```

**Package.json 配置**：

```json
{
  "name": "yidocs",
  "bin": {
    "yidocs": "./bin/yidocs.js"
  },
  "files": ["bin", "dist"]
}
```

---

## MVP（最小可行性产品）目标

初始发布的主要目标是：

**能把 Zustand 的 `getting-started.md` 下载下来，翻译成中文，并用 VitePress 跑起来。**

这专注于：

1. 验证核心工作流
2. 确保基本功能正常
3. 验证翻译质量
4. 测试生成的文档站点

### 成功标准

- [ ] 成功从公开 GitHub 仓库下载文档文件夹
- [ ] 翻译 markdown 文件同时保留代码块和格式
- [ ] 生成可工作的 VitePress 站点
- [ ] 站点可以本地服务并导航
- [ ] 翻译内容可读且连贯

---

## 未来增强

MVP 完成后，考虑这些改进：

1. **多语言支持**
   - 支持中文以外的语言
   - 语言特定的提示优化
   - 本地化 UI 字符串

2. **高级功能**
   - 增量更新（仅翻译变更文件）
   - 翻译记忆和缓存
   - 术语表管理以保持术语一致性
   - 自定义翻译模型

3. **用户体验**
   - GUI 应用程序
   - 基于 Web 的仪表板
   - 浏览器扩展用于即时翻译
   - 翻译文档的书签管理器

4. **集成**
   - IDE 插件（VSCode、WebStorm）
   - CLI 自动完成和建议
   - 程序化使用的 API
   - CI/CD 集成

5. **性能**
   - 分布式翻译工作器
   - GPU 加速支持
   - 基于云的翻译服务
   - 缓存层改进

---

## 贡献

为 YiDocs 贡献时：

1. **从 MVP 开始**：在添加功能之前，专注于让基本工作流程正常工作
2. **编写测试**：为任何新功能添加测试
3. **文档**：更新相关文档
4. **保持风格**：保持一致的代码风格
5. **保持耐心**：仔细审查反馈并迭代

有关详细的贡献指南，请参阅 [CONTRIBUTING.md](./CONTRIBUTING.md)。
