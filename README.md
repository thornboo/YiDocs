# YiDocs

<div align="center">

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![DeepSeek](https://img.shields.io/badge/DeepSeek-API-blue.svg)](https://api.deepseek.com)
[![VitePress](https://img.shields.io/badge/VitePress-Documentation-orange.svg)](https://vitepress.vuejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**让翻译后的文档更易于阅读。**

An AI-powered document localization tool that downloads Markdown/MDX documents from GitHub, translates them with DeepSeek or other LLMs, and generates a beautiful local documentation website.

[中文文档](README_CN.md)

</div>

---

## What is YiDocs?

YiDocs automatically fetches documentation from GitHub repositories, translates them using AI (DeepSeek/OpenAI), and renders them locally with a modern design - all while preserving code formatting, file structure, and navigation.

## Features

- **Zero Config**: Interactive setup for API keys and sources.
- **Smart Translation**: Preserves code blocks, frontmatter, and MDX components.
- **Incremental Build**: Only translates changed files (based on content hash) to save costs.
- **VitePress Rendering**: Generates a beautiful static site with search and navigation.
- **CLI First**: Powerful command-line interface for automation.

## Quick Start

### Installation

```bash
npm install -g yidocs
# Or run directly with npx
npx yidocs --help
```

### Usage

1. **Configure API Key**
   Run the config wizard to set up your DeepSeek/OpenAI key.

   ```bash
   npx yidocs config
   ```

2. **Auto Mode (Recommended)**
   Add a source, translate, and preview in one go.

   ```bash
   npx yidocs start
   ```

3. **Manual Workflow**
   - **Download Source**:
     ```bash
     npx yidocs add https://github.com/pmndrs/zustand/tree/main/docs
     ```
   - **Translate**:
     ```bash
     npx yidocs translate
     ```
   - **Build Site**:
     ```bash
     npx yidocs build
     ```
   - **Preview**:
     ```bash
     npx yidocs preview
     ```

## Configuration

YiDocs uses a local JSON file (`readlocal.config.json`) to store your settings. You generally don't need to edit this manually; use the CLI commands instead.

- **Storage**: `.yidocs/` (Source files, cache, and history)
- **Output**: `dist-docs/` (Generated VitePress site)

## License

MIT License - see [LICENSE](LICENSE) file.
