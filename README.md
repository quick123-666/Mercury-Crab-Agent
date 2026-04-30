# OpenCode 分支 - Mercury-Crab-Agent

## 📋 分支说明
本分支为 **OpenCode 运行时迁移专用分支**，将 Agent 底层框架从 OpenClaw 迁移至 OpenCode，同时保留 MCP Server 工具层。适用于 Windows Server 环境，无需外部 LLM 端点即可运行。

## 🎯 核心变更

| 组件 | 原方案 | 本分支方案 |
|------|--------|------------|
| **运行时** | OpenClaw (`~/.qclaw/`) | OpenCode (v1.14.30) |
| **LLM 调用** | 依赖本地端口 28789 | 启发式工具调用，绕过 LLM |
| **会话记录** | 内置会话管理 | 直接写入 `opencode.db` (node:sqlite) |
| **任务调度** | 内置调度器 | Windows Task Scheduler (6 个定时任务) |
| **监控面板** | 无 | Web 面板 (http://127.0.0.1:8787)，亮色 Game UI 风格 |

## 🏗 架构概览

```
Mercury-Crab-Agent
├── mcp-server/
│   ├── src/index.ts          # MCP 工具定义 (14 tools)
│   ├── dist/index.js         # TypeScript 编译产物
│   ├── monitor.cjs           # Web 监控面板 (http://127.0.0.1:8787)
│   ├── run-tool.cjs          # 直接调用 MCP 工具（后台模式）
│   ├── run-session.cjs       # 调用工具并写入 opencode.db 创建独立会话
│   ├── run-tool.bat          # 工具调用启动脚本
│   ├── run-session.bat       # 会话模式启动脚本
│   ├── start-monitor.bat     # 监控面板启动脚本
│   └── register-tasks.ps1    # Windows 定时任务注册脚本
├── opencode.json             # OpenCode MCP 配置
├── memory/                   # 记忆存储
├── wiki/                     # 知识库
├── raw/                      # 待处理原始数据
└── sessions/                 # 会话历史
```

## 🔧 MCP 工具列表 (14 个)

| 工具 | 功能 |
|------|------|
| `memory_write` | 写入记忆文件 |
| `memory_read` | 读取记忆文件 |
| `memory_list` | 列出所有记忆文件 |
| `memory_delete` | 删除记忆文件 |
| `wiki_index` | 索引原始文件到知识库 |
| `wiki_read` | 读取知识库页面 |
| `wiki_search` | 搜索知识库 |
| `wiki_status` | 查看知识库状态（已索引/待处理） |
| `session_title_gen` | 启发式生成会话标题 |
| `session_summary` | 启发式提取会话摘要 |
| `heartbeat_check` | 心跳状态检查 |
| `correction_log` | 记录/查看纠正日志 |
| `pattern_scan` | 扫描学习模式 |
| `snapshot_cleanup` | 清理旧快照 |

## ⏰ 定时任务列表 (6 个)

| 任务名称 | 调用工具 | 间隔 | 功能 |
|----------|----------|------|------|
| `MercuryCrab_KnowledgeSync` | `wiki_status` | 4h | 检查知识库同步状态 |
| `MercuryCrab_MemoryMaintenance` | `heartbeat_check` | 6h | 内存/心跳维护 |
| `MercuryCrab_SelfImprovingScan` | `pattern_scan` | 2h | 自学习模式扫描 |
| `MercuryCrab_SessionSummary` | `session_summary --recent 5` | 4h | 提取最近 5 个会话摘要 |
| `MercuryCrab_SessionTitleGen` | `session_title_gen --recent 5` | 6h | 生成最近 5 个会话标题 |
| `MercuryCrab_SnapshotCleanup` | `memory_list` | 24h | 清理过期快照 |

## 🚀 部署步骤

### 1. 环境要求
- Windows Server / Windows 10+
- Node.js v22.21.1+
- Git

### 2. 安装
```powershell
# 克隆分支
git clone -b opencode https://github.com/quick123-666/Mercury-Crab-Agent.git
cd Mercury-Crab-Agent

# 安装依赖
cd mcp-server
& "C:\Program Files\nodejs\npm.cmd" install

# 编译 TypeScript
& "C:\Program Files\nodejs\npx.cmd" tsc

# 注册定时任务
powershell -ExecutionPolicy Bypass -File register-tasks.ps1

# 启动监控面板
..\start-monitor.bat
```

### 3. 配置 OpenCode
`opencode.json` 已预配置 MCP 节点：
```json
{
  "mcp": {
    "mercury_crab": {
      "type": "local",
      "command": ["node", "mcp-server/dist/index.js"],
      "enabled": true,
      "environment": {
        "MERCURY_WORKSPACE": "<项目路径>"
      }
    }
  }
}
```

## ⚠️ 问题排查指南

### 问题 1: `opencode run` 报 "Session not found"
- **原因**：opencode 1.14.x 在存在 `OPENCODE_SERVER_PASSWORD` / `OPENCODE_SERVER_USERNAME` 环境变量时，内部 SDK 客户端未正确传递 Basic Auth 头。
- **解决**：使用 `run-session.cjs` 绕过 `opencode run`，直接通过 `node:sqlite` 写入 `opencode.db`。

### 问题 2: 定时任务状态解析乱码
- **原因**：PowerShell 默认 UTF-16 与 `schtasks` 的 CP437 输出冲突。
- **解决**：显式使用 `chcp 437` 并正确转义 CSV 输出。

### 问题 3: Monitor 面板无法访问
- **原因**：缺少 `MERCURY_WORKSPACE` 环境变量，导致启动脚本崩溃。
- **解决**：使用 `start-monitor.bat` 启动，其中显式设置了环境变量。

### 问题 4: SQLite 模块缺失
- **原因**：无 `better-sqlite3` 或 `sqlite3` npm 包。
- **解决**：使用 Node.js 22 内置的 `node:sqlite` (`DatabaseSync`) 模块，零依赖。

## 📊 监控面板
- 地址：`http://127.0.0.1:8787`
- 自动刷新：30 秒
- 功能：任务状态、知识库进度、记忆文件列表、系统统计
- 主题：亮色 Game UI 风格

## 🔮 后续优化方向
1. 接入 OpenAI 兼容 API 实现真正的 LLM Agent 会话
2. 增加 WebSocket 实时推送
3. 支持多项目并行调度
4. 优化 `node:sqlite` 写入事务性能
