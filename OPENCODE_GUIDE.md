# OpenCode 迁移与适配指南

## 背景
本项目最初计划使用 OpenClaw 框架，但因环境限制（Windows Server、无 Ollama、无 LLM 端点 28789），最终迁移至 **OpenCode** 作为运行时环境，并保留 MCP Server 作为工具层。

## 遇到的问题与解决方案

### 1. Windows 环境无 Node.js
- **问题**：Windows Server 未安装 Node.js，无法运行任何 JS 脚本。
- **解决**：安装 Node.js v22.21.1，添加至系统 PATH。

### 2. `opencode run` 报 "Session not found"
- **问题**：调用 `opencode run` 时总是失败并立即报 `Session not found`。
- **排查**：
  - 发现 `opencode` 版本 1.14.x 在存在 `OPENCODE_SERVER_PASSWORD` / `OPENCODE_SERVER_USERNAME` 环境变量时，内部 SDK 客户端未正确传递 Basic Auth 头，导致内部会话创建失败。
  - 清除认证环境变量后，`opencode run` 可运行，但依赖外部 LLM 端点。
- **解决**：放弃 `opencode run` 直接调度方式。改为使用 `node:sqlite` 直接写入 `opencode.db`，实现每次任务触发生成独立会话记录，绕过 LLM 依赖。

### 3. PowerShell 管道与编码问题
- **问题**：PowerShell 默认 UTF-16 编码与 `chcp`、`schtasks` 的 CP437 输出冲突，导致定时任务状态解析乱码。
- **解决**：在 `monitor.cjs` 和任务查询中显式使用 `chcp 437` 并正确转义 CSV 输出。

### 4. Monitor 面板亮色主题未生效
- **问题**：修改 CSS 后重启 `monitor.cjs` 仍显示暗色背景。
- **原因**：
  - 旧进程未被完全终止。
  - 启动时缺少 `MERCURY_WORKSPACE` 环境变量，导致脚本报错崩溃，实际上未提供 HTTP 服务。
- **解决**：
  - 创建 `start-monitor.bat` 显式设置 `MERCURY_WORKSPACE` 环境变量。
  - 使用 `Get-Process -Force` 彻底清理旧进程。

### 5. 定时任务路径解析失败
- **问题**：`run-tool.bat` 依赖相对路径，在 Task Scheduler 以 SYSTEM 用户运行时工作目录可能不一致。
- **解决**：所有启动脚本显式 `cd /d "%MERCURY_WORKSPACE%"` 并使用绝对路径。

### 6. SQLite 模块缺失
- **问题**：环境中无 `better-sqlite3` 或 `sqlite3` npm 包。
- **解决**：利用 Node.js 22 内置的实验性 `node:sqlite` (`DatabaseSync`) 模块，实现零依赖数据库写入。

## 架构概览
```
Mercury-Crab-Agent
├── mcp-server/
│   ├── src/index.ts          # MCP 工具定义 (14 tools)
│   ├── dist/index.js         # 编译产物
│   ├── monitor.cjs           # Web 监控面板 (http://127.0.0.1:8787)
│   ├── run-tool.cjs          # 直接调用 MCP 工具
│   ├── run-session.cjs       # 调用工具并写入 opencode 会话数据库
│   └── start-monitor.bat     # 监控面板启动脚本
├── opencode.json             # OpenCode MCP 配置
├── memory/                   # 记忆存储
├── wiki/                     # 知识库
├── raw/                      # 待处理原始数据
└── sessions/                 # 会话历史
```

## 部署步骤
1. 安装 Node.js v22+。
2. `cd mcp-server && npm install && npx tsc`。
3. 配置 `opencode.json` MCP 节点。
4. 运行 `register-tasks.ps1` 注册定时任务。
5. 双击 `start-monitor.bat` 启动监控面板。
