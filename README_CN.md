# YiDocs

<div align="center">

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![DeepSeek](https://img.shields.io/badge/DeepSeek-API-blue.svg)](https://api.deepseek.com)
[![VitePress](https://img.shields.io/badge/VitePress-文档-orange.svg)](https://vitepress.vuejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**让翻译后的文档更易于阅读。**

一个基于 AI 的文档本地化工具，可从 GitHub 下载 Markdown/MDX 文档，使用 DeepSeek 或其他 LLM 进行翻译，并生成美观的本地文档网站。

[快速开始](#-快速开始) • [功能特性](#-核心功能) • [文档](#-文档) • [贡献](#-贡献指南)

</div>

---

## 什么是 YiDocs？

YiDocs 是一个强大的文档本地化工具，它能够自动从 GitHub 仓库获取英文文档，使用 AI 将其翻译成中文（或其他语言），并以现代化的响应式设计在本地渲染，同时保留代码格式、文件结构和导航功能。

专为希望阅读母语文档但又不想失去原始文档交互性和专业性体验的开发者而设计。

## 核心痛点与解决方案

**痛点**：
- 优秀的开源项目（如 Zustand, React, Next.js）文档通常只有英文。
- 网页翻译插件体验差：无法保持代码格式，无法处理专业术语，页面布局容易乱。
- 逐页翻译效率极低。

**解决方案**：
1.  **一键抓取**：指定 GitHub 仓库子路径（如 `pmndrs/zustand/docs`），自动拉取最新源文件。
2.  **AI 智能翻译**：使用 DeepSeek API，针对技术文档优化的 Prompt，保留代码块、Frontmatter 和文件结构。
3.  **本地渲染**：基于 **VitePress** 自动生成静态站点，提供极致的阅读体验。

---

## 核心功能

- **一键操作**：只需配置并运行 - 自动完成下载、翻译和本地服务器启动
- **智能 AI 翻译**：由 DeepSeek 或兼容 OpenAI 的 LLM 驱动，使用专门针对技术文档优化的提示词
- **保留格式**：代码块、语法高亮、链接和文件结构保持完整
- **灵活源选择**：可从任意 GitHub 仓库下载特定文件夹或子目录
- **美观渲染**：使用 VitePress 生成现代化文档网站
- **并发处理**：优化的 API 调用，支持速率限制和重试机制
- **进度追踪**：实时显示翻译进度和详细状态更新
- **可定制输出**：可配置站点标题、主题和导航结构
- **本地优先**：所有数据保存在本地机器上 - 无需云存储

---

## 技术栈设计

*   **运行环境**: Node.js (>= 18)
*   **下载器**: [`giget`](https://github.com/unjs/giget) (快速下载 GitHub 文件夹，无需 Git 历史)
*   **AI 客户端**: `openai` SDK (兼容 DeepSeek API)
*   **并发控制**: `p-limit` (防止 API 速率限制)
*   **文件操作**: `fs-extra`, `globby`
*   **UI/渲染引擎**: `vitepress` (Vue 驱动的静态站点生成器，支持 MDX)
*   **CLI 交互**: `cac` 或 `commander`, `ora` (加载动画), `chalk` (颜色)

---

## 配置文件设计

在开发前，我们需要定义好用户如何配置这个工具：

```json
{
  "source": {
    "repo": "pmndrs/zustand",
    "branch": "main",
    "docsPath": "docs"
  },
  "translation": {
    "apiKey": "sk-xxxxxx",
    "apiBaseUrl": "https://api.deepseek.com",
    "concurrency": 5,
    "exclude": ["public", "assets", "img"]
  },
  "output": {
    "dir": "./dist-docs",
    "siteTitle": "Zustand 中文文档 (Local)"
  }
}
```

### 配置参数说明

#### source (源配置)
- `repo`: GitHub 仓库名，格式为 `owner/repo`
- `branch`: 分支名，默认为 `main`
- `docsPath`: 要下载的文档路径，如 `docs`、`src/pages` 等

#### translation (翻译配置)
- `apiKey`: DeepSeek API 密钥
- `apiBaseUrl`: API 基础 URL，可自定义
- `concurrency`: 并发数，建议 3-7，避免 API 速率限制
- `exclude`: 要排除的文件或文件夹模式数组

#### output (输出配置)
- `dir`: 输出目录路径
- `siteTitle`: 生成的文档网站标题

---

## 快速开始

### 前置要求

- Node.js 18 或更高版本
- DeepSeek API 密钥 ([获取地址](https://api.deepseek.com))

### 安装步骤

1. **克隆项目仓库**
   ```bash
   git clone https://github.com/yourusername/YiDocs.git
   cd YiDocs
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **设置环境变量**
   ```bash
   cp .env.example .env
   ```

   编辑 `.env` 文件，添加你的 API 密钥：
   ```env
   DEEPSEEK_API_KEY=sk-your-api-key-here
   ```

4. **配置目标仓库**

   创建 `readlocal.config.json` 配置文件：
   ```json
   {
     "source": {
       "repo": "pmndrs/zustand",
       "branch": "main",
       "docsPath": "docs"
     },
     "translation": {
       "apiKey": "sk-your-api-key-here",
       "apiBaseUrl": "https://api.deepseek.com",
       "concurrency": 5,
       "exclude": ["public", "assets", "img"]
     },
     "output": {
       "dir": "./dist-docs",
       "siteTitle": "Zustand 中文文档 (Local)"
     }
   }
   ```

5. **运行工具**
   ```bash
   npm start
   ```

6. **打开浏览器**

   访问 `http://localhost:5173` 即可阅读翻译后的文档。

---

## 配置示例

### 翻译 React 官方文档
```json
{
  "source": {
    "repo": "reactjs/react.dev",
    "branch": "main",
    "docsPath": "src/pages"
  },
  "translation": {
    "apiKey": "sk-your-key",
    "concurrency": 3,
    "exclude": ["**/*.css", "**/*.test.*"]
  },
  "output": {
    "dir": "./react-docs-zh",
    "siteTitle": "React 中文文档 (本地版)"
  }
}
```

### 翻译 Next.js 指南
```json
{
  "source": {
    "repo": "vercel/next.js",
    "branch": "canary",
    "docsPath": "docs"
  },
  "translation": {
    "apiKey": "sk-your-key",
    "concurrency": 5,
    "exclude": ["app", "components"]
  },
  "output": {
    "dir": "./nextjs-docs-zh",
    "siteTitle": "Next.js 中文文档 (本地版)"
  }
}
```

### 翻译 Vue.js 指南
```json
{
  "source": {
    "repo": "vuejs/docs",
    "branch": "main",
    "docsPath": "src"
  },
  "translation": {
    "apiKey": "sk-your-key",
    "concurrency": 5,
    "exclude": ["examples", "assets"]
  },
  "output": {
    "dir": "./vue-docs-zh",
    "siteTitle": "Vue.js 中文文档 (本地版)"
  }
}
```

---

## 工作原理

YiDocs 的工作流程分为四个主要阶段：

### 1. 下载阶段 (Fetching)
- 使用 `giget` 库从 GitHub 仓库下载指定路径的文档
- 保持原始的目录结构
- 下载所有相关资源（图片、静态文件等）

### 2. 翻译阶段 (Translation)
- 扫描所有 `.md` 和 `.mdx` 文件
- 使用 AI 翻译内容，同时保留：
  - 代码块和语法高亮
  - Frontmatter 元数据
  - React 组件语法
  - 文件链接和引用
- 支持并发翻译，提高效率

### 3. 渲染阶段 (Rendering)
- 动态生成 VitePress 配置
- 自动创建侧边栏导航
- 处理 MDX 组件兼容性
- 生成完整的静态网站

### 4. 启动阶段 (Serving)
- 启动本地开发服务器
- 自动打开浏览器（可选）
- 提供实时的翻译进度显示

---

## 常见问题

### Q: 是否支持私有仓库？
**A:** 目前 YiDocs 仅支持公开的 GitHub 仓库。对于私有仓库，你需要手动下载文件并在本地运行翻译工具。

### Q: 是否可以使用 DeepSeek 以外的 LLM 提供商？
**A:** 可以！YiDocs 基于兼容 OpenAI 的 API 构建。你可以将 `apiBaseUrl` 配置为与 OpenAI、Anthropic 或任何兼容 OpenAI 的 API 提供商一起使用。

### Q: 翻译需要多长时间？
**A:** 翻译速度取决于：
- 待翻译文件的数量
- 文件大小和复杂度
- API 速率限制
- 并发设置（推荐：3-7）

典型的文档集（50-100 页）通常需要 10-30 分钟。

### Q: 可以自定义 VitePress 主题吗？
**A:** 可以！初始设置完成后，你可以修改生成的 `.vitepress/config.js` 文件来自定义：
- 颜色方案
- 导航结构
- 主题选项
- 自定义组件

### Q: 是否支持 MDX 文件？
**A:** 支持！YiDocs 同时支持 Markdown（`.md`）和 MDX（`.mdx`）文件。它会智能保留 React 组件和特殊语法。

### Q: 可以翻译成中文以外的语言吗？
**A:** 目前该工具针对中文翻译进行了优化。不过，你可以在配置中修改系统提示词以支持其他目标语言。

### Q: 如果某些文件翻译失败怎么办？
**A:** 工具包含重试逻辑，会显示哪些文件失败。你可以：
- 查看错误日志
- 检查是否是速率限制问题
- 手动重试失败的文件

### Q: 我的数据是否会被发送到外部服务？
**A:** 你的文档会被发送到配置的 LLM API（DeepSeek、OpenAI 等），但不会永久存储。由于此工具完全在本地运行，没有数据会发送到 YiDocs 的服务器。

### Q: 如何提高翻译质量？
**A:** 可以通过以下方式优化：
- 调整 `concurrency` 设置，避免速率限制
- 在 `exclude` 中排除不需要翻译的文件
- 检查生成的文档，手动优化特定部分

### Q: 能否批量翻译多个仓库？
**A:** 目前每次只能翻译一个仓库。你可以创建多个配置文件，依次运行翻译。

### Q: 如何更新翻译后的文档？
**A:** 重新运行 `npm start` 即可。工具会自动重新下载和翻译最新版本的文档。

---

## 许可证

本项目采用 MIT 许可证 - 详情请查看 [LICENSE](LICENSE) 文件。

---

## 贡献指南

欢迎贡献！欢迎提交 Pull Request。具体步骤如下：

1. Fork 本仓库
2. 创建功能分支（`git checkout -b feature/amazing-feature`）
3. 提交你的更改（`git commit -m '添加很棒的功能'`）
4. 推送分支（`git push origin feature/amazing-feature`）
5. 打开 Pull Request

### 开发路线图

如果你对贡献感兴趣，请查看 [Development.md](./Development.md) 文档中的详细实施计划，那里包含了：
- 四个开发阶段的详细说明
- 核心代码逻辑
- 实施最佳实践
- 测试策略
- MVP 目标
- 未来增强计划

---

## 致谢

- [giget](https://github.com/unjs/giget) - 快速 GitHub 文件夹下载器
- [VitePress](https://vitepress.vuejs.org/) - 美观的文档网站生成器
- [DeepSeek](https://api.deepseek.com) - 高质量 AI 翻译
- 开源社区启发了这个项目

---

<div align="center">

**用 love 制作，由开发者，为开发者**

[官网](https://github.com/yourusername/YiDocs) • [问题反馈](https://github.com/yourusername/YiDocs/issues) • [讨论区](https://github.com/yourusername/YiDocs/discussions)

</div>
