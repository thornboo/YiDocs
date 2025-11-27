# YiDocs

<div align="center">

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![DeepSeek](https://img.shields.io/badge/DeepSeek-API-blue.svg)](https://api.deepseek.com)
[![VitePress](https://img.shields.io/badge/VitePress-Documentation-orange.svg)](https://vitepress.vuejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Make translated documentation easier to read.**

An AI-powered document localization tool that downloads Markdown/MDX documents from GitHub, translates them with DeepSeek or other LLMs, and generates a beautiful local documentation website.

[Documentation](README_CN.md) • [中文文档](README_CN.md)

</div>

---

## What is YiDocs?

YiDocs automatically fetches documentation from GitHub repositories, translates them using AI, and renders them locally with a modern design - all while preserving code formatting, file structure, and navigation.

## Features

- One-click operation: automatic download, translation, and local server startup
- Smart AI translation with preserved formatting
- Flexible source selection from any GitHub repository
- Beautiful VitePress rendering
- Concurrent processing with rate limiting
- Real-time progress tracking

## Tech Stack

- **Runtime**: Node.js (>= 18)
- **Downloader**: [giget](https://github.com/unjs/giget)
- **AI Client**: OpenAI SDK (DeepSeek compatible)
- **Concurrency**: p-limit
- **Renderer**: VitePress

## FAQ

**Q: Does it support private repositories?**
A: Currently only public repositories are supported.

**Q: Can I use other LLM providers?**
A: Yes! Configure `apiBaseUrl` to use OpenAI, Anthropic, or any OpenAI-compatible API.

**Q: How long does translation take?**
A: Depends on file count, size, and API limits. Typically 10-30 minutes for 50-100 pages.

## License

MIT License - see [LICENSE](LICENSE) file.

## Contributing

Contributions welcome! See [Development.md](./Development.md) for development roadmap and implementation details.
