# YiDocs

<div align="center">

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![DeepSeek](https://img.shields.io/badge/DeepSeek-API-blue.svg)](https://api.deepseek.com)
[![VitePress](https://img.shields.io/badge/VitePress-文档-orange.svg)](https://vitepress.vuejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**让翻译后的文档更易于阅读。**

一个基于 AI 的文档本地化工具，可从 GitHub 下载 Markdown/MDX 文档，使用 DeepSeek 或其他 LLM 进行翻译，并生成美观的本地文档网站。

</div>

---

## 核心功能

- **零配置上手**：全交互式 CLI，无需手动编辑配置文件。
- **智能 AI 翻译**：针对技术文档优化的 Prompt，保留代码块、Frontmatter 和文件结构。
- **增量构建**：内置哈希缓存机制，仅翻译变更文件，大幅节省 API Token 成本。
- **断点续传**：翻译任务可随时中断，下次运行自动从断点继续。
- **JSX 自动清洗**：智能处理 MDX 中的 React 组件，确保 VitePress 渲染不报错。
- **美观渲染**：自动生成侧边栏导航和主页，基于 VitePress 提供极速阅读体验。

## 快速开始

### 1. 初始化配置

首次使用需要配置 LLM API 密钥（推荐使用 DeepSeek）。

```bash
npx yidocs config
```

_根据提示输入 API Key 和 Base URL。_

### 2. 一键运行 (Auto Mode)

这是最简单的使用方式。它会自动引导你下载文档、翻译、构建并打开预览。

```bash
npx yidocs start
```

### 3. 分步操作

如果你需要更精细的控制，可以使用独立命令：

- **下载文档源**：

  ```bash
  npx yidocs add https://github.com/pmndrs/zustand/tree/main/docs
  ```

- **执行翻译**：

  ```bash
  npx yidocs translate
  # 支持增量更新，可随时中断
  ```

- **构建站点**：

  ```bash
  npx yidocs build
  ```

- **本地预览**：
  ```bash
  npx yidocs preview
  ```

## 命令详解

| 命令                     | 说明                                                               |
| :----------------------- | :----------------------------------------------------------------- |
| `yidocs start`           | **推荐**。全自动流程：下载 -> 翻译 -> 构建 -> 预览。               |
| `yidocs config`          | 进入交互式配置向导，设置 API Key。                                 |
| `yidocs add <url>`       | 解析 GitHub URL 并下载文档到本地缓存 (`.yidocs/sources`)。         |
| `yidocs translate`       | 读取本地源文件进行 AI 翻译。支持 `--verbose` 查看详细日志。        |
| `yidocs build`           | 生成 VitePress 工程结构 (`package.json`, `config.js`, `sidebar`)。 |
| `yidocs preview`         | 启动本地服务器 (Port 3000) 预览文档。                              |
| `yidocs test-connection` | 测试 API Key 是否有效。                                            |

## 技术细节

### 目录结构

工具运行后会在当前目录下生成：

- `.yidocs/`：核心数据目录（请加入 `.gitignore`）
  - `sources/`：下载的原始 Markdown 文件。
  - `cache.json`：增量翻译的哈希记录。
  - `current.json`：最近使用的源信息。
- `dist-docs/`：生成的 VitePress 网站（请加入 `.gitignore`）。
- `readlocal.config.json`：用户配置文件（自动生成）。

### 增量翻译原理

YiDocs 会计算每个源文件的 SHA-256 哈希值。

- **首次运行**：全量翻译。
- **再次运行**：对比 Hash，仅调用 API 翻译内容发生变化的文件。
- **缓存位置**：`.yidocs/cache.json`。

### 清洗策略 (Sanitizer)

为了让 React 生态的 MDX 文档能在 VitePress (Vue) 中正常跑起来，我们在翻译后会执行清洗：

1.  移除所有顶层 `import` 语句。
2.  将 JSX 组件（如 `<Counter />`）替换为引用块 `> [交互组件已移除]`，保留代码展示但禁用交互，防止构建崩溃。

## 常见问题

**Q: 支持哪些 LLM？**
A: 默认支持 DeepSeek 和所有兼容 OpenAI 接口的模型（如 Moonshot, Yi, GLM-4）。只需在 `config` 中修改 Base URL。

**Q: 下载失败怎么办？**
A: `add` 命令直接使用了 `giget`。如果下载失败，请检查网络是否能访问 GitHub，或者尝试手动下载文件放入 `.yidocs/sources` 对应目录。

**Q: 翻译到一半报错了？**
A: 没关系。直接重新运行 `yidocs translate` 即可。工具会自动跳过已成功的页面，从失败的地方继续。

## License

MIT License - see [LICENSE](LICENSE) file.
