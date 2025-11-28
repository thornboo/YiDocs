#!/usr/bin/env node

import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 在开发环境中，我们直接运行 tsx
// 在生产环境中，我们应该运行编译后的 JS
// 为了简化 MVP，这里我们假设用户也是通过 tsx 运行或者我们稍后编译

// 简单起见，我们直接引入 src/index.ts (需要 tsx 支持)
// 或者，我们可以通过子进程调用
console.log("🚀 Starting YiDocs...");

const projectRoot = path.resolve(__dirname, "..");
const entryPoint = path.join(projectRoot, "src", "index.ts");

const child = spawn("npx", ["tsx", entryPoint, ...process.argv.slice(2)], {
  stdio: "inherit",
  cwd: process.cwd(),
  env: { ...process.env },
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
