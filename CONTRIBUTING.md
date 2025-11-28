# 贡献指南 (Contributing Guide)

感谢你对 YiDocs 感兴趣！我们需要你的帮助来让文档本地化变得更加简单。

本文档提供了设置开发环境、提交代码和参与社区的指南。

## 🤝 如何参与

你可以通过以下方式参与贡献：

1. **报告 Bug**：在 Issues 中提交详细的 Bug 报告。
2. **提交功能建议**：你有好的点子？欢迎在 Issues 或 Discussions 中提出。
3. **提交代码**：修复 Bug 或实现新功能（请先阅读下方的开发流程）。
4. **改进文档**：帮助优化 README 或其他说明文件。

## 🛠 开发环境设置

YiDocs 是一个 Node.js 项目。

### 前置要求

- **Node.js**: >= 18.0.0
- **包管理器**: 推荐使用 `npm` 或 `pnpm`
- **Git**

### 启动步骤

1. **Fork 本仓库**：点击右上角的 "Fork" 按钮。
2. **克隆到本地**：
   ```bash
   git clone https://github.com/YOUR_USERNAME/YiDocs.git
   cd YiDocs
   ```
3. **安装依赖**：
   ```bash
   npm install
   ```
4. **配置环境变量**（用于测试翻译功能）：
   ```bash
   cp .env.example .env
   # 在 .env 中填入你的 DEEPSEEK_API_KEY
   ```
5. **链接 CLI**（用于本地测试 `npx yidocs`）：
   ```bash
   npm link
   ```

## 📐 代码结构与架构

在开始编码前，请务必阅读 [Development.md](./Development.md)。它详细描述了：

- 项目的四个核心阶段（Fetching, Translation, Rendering, Serving）。
- 目录结构规划。
- 核心代码逻辑。

## workflow 开发流程

1. **创建分支**：
   - 功能分支：`feature/your-feature-name`
   - 修复分支：`fix/issue-id-description`
2. **编写代码**：请遵循现有的代码风格（ESLint/Prettier）。
3. **提交 Commit**：
   我们推荐使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：
   - `feat: add incremental translation cache`
   - `fix: resolve giget timeout issue`
   - `docs: update contributing guide`
4. **推送到远程**：
   ```bash
   git push origin feature/your-feature-name
   ```
5. **提交 Pull Request (PR)**：
   - 将你的分支合并到 `main` 分支。
   - 在 PR 描述中清晰说明你做了什么改变。

## ✅ 代码风格指南

- **Linting**: 提交前请运行 `npm run lint`（需先配置脚本）。
- **注释**: 复杂的逻辑请添加注释，解释 _为什么_ 这样做。
- **测试**: 如果添加了新功能，请尽量包含相应的单元测试。

## ❓ 遇到问题？

如果你在开发过程中遇到任何问题，欢迎在 GitHub Issues 中提问。

感谢你的贡献！🚀
