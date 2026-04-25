# MEMORY.md — Long-Term Memory

> 每次主会话启动自动加载。会话间持久化的核心知识。
> 更新频率：每次重要发现/决策后追加，定期由 heartbeat 维护。

---

## 人

- 主人通过 QQ Bot (account 1903889907) 交互
- 时区 Asia/Shanghai

## 系统环境

- 平台：Windows Server 2022 (x64), Python 3.13.2, Node v22.21.1
- LLM 端点：port 28789, model=openclaw（不是 modelroute，不是 19000）
- llmwikify base_url：http://127.0.0.1:28789（不带 /v1，llmwikify 自己加）
- Gateway token：openclaw.json → gateway.auth.token（不是 gateway.token）
- self-improving 目录：C:\Users\Administrator\self-improving

## 核心规则（高频使用）

1. **先执行后完善**：拒绝过度规划，边做边改。用户明确偏好"少说多做"
2. **关键结论立即写入文件**：session 压缩前必须持久化，不依赖上下文记忆
3. **文本文件用脚本写入**：qclaw-text-file skill 的 write_file.py，不用内置 write 工具
4. **Windows 编码三件套**：PYTHONUTF8=1 + PYTHONIOENCODING=utf-8 + encoding='utf-8' errors='replace'
5. **同一错误犯 3 次**：必须晋升为规则写入 self-improving/memory.md
6. **corrections.md 用 append**：永远不要覆盖，只追加
7. **临时文件及时清理**：tmp_*.py / tmp_*.txt 用完即删，不污染工作区
8. **PowerShell 环境变量**：用 cmd /c "set VAR=val & command" 或 temp .py 脚本，避免 PS 语法坑

## llmwikify 使用规则

- ingest 语法：positional argument（ingest <path>），不是 --source
- 不要加 --self-create：会触发 LLM API 调用导致超时
- 二进制文件（.ico/.xml/.exe）会导致导入崩溃，批量导入时需过滤只导 .md
- pydantic_core + asyncio 在 Windows Python 3.13 上可能 OSError 10106
- 直接 `python -m llmwikify status` 可能崩溃，但脚本 subprocess 调用正常

## 项目：Mercury-Crab-Agent（原 Hermes-OpenClaw 自学习闭环）

> 名称由来：Mercury（Hermes 罗马名，信使之神）+ Claw→Crab 谐音梗（主人命名）
> 灵感来源：Hermes Agent（NousResearch, 16.8k stars）

### 进度（2026-04-25）
- Phase 0 ✅ | Phase 1 ✅ | Phase 2 ✅ | Phase 3.1-3.4 ✅
- 整合方案 v2：hermes-openclaw-integration-plan-v2.md

### 已建成组件
- **hermes-learning skill**（~/.qclaw/skills/hermes-learning/）
  - llm_wikify_bridge.py：知识库桥接（status/search/write/ingest）
  - session_title_generator.py：LCM 会话标题生成（35 已命名）
  - session_summarizer.py：会话摘要提取 → memory/ + wiki
  - memory_snapshot.py：MEMORY.md 快照 + hash 变更检测
  - knowledge_sync.py：增量同步 memory/ → llmwikify（MD5）
  - session_lineage.py：LCM 会话族谱可视化
  - skill_evolver.py：技能自进化（evolution-log.md）
  - corrections_distiller.py：corrections→wiki 蒸馏管道
  - openclaw_config.py：读取 openclaw.json 配置
- **self-improving**（~/self-improving/）
  - corrections.md：纠正日志
  - memory.md：已验证规则
  - heartbeat-state.md：心跳任务执行状态
- **step-guard skill**（~/.qclaw/skills/step-guard/）
  - 自动暂停：≥5工具调用、≥3文件修改、批量>10
- **54 skills 注册**（31 enabled, 23 disabled）
  - 含4关键系统skill恢复：qclaw-rules/qclaw-text-file/qclaw-env/qclaw-cron-skill

### 心跳自动化（HEARTBEAT.md）
7 个任务轮换执行：快照、标题生成、会话摘要、自学习扫描、MEMORY.md 维护、快照清理、知识库同步
所有任务脚本已验证通过（7/7 pipeline test pass）

### 知识库状态
- Wiki: 143 pages / 698 sources / 143 indexed / 212 links

## 教训合集（从 corrections.md 提炼）

| 场景 | 规则 |
|------|------|
| 过度规划 | 用户说"继续"就执行，不要重新分析 |
| 上下文丢失 | 压缩前写 memory/YYYY-MM-DD.md |
| 端口/模型名猜错 | 先查配置文件再试，不要猜 |
| CLI 语法变更 | 查文档或 --help，不要凭记忆 |
| GBK 编码 | Windows 上所有中文处理都设 UTF-8 环境变量 |
| write 工具 | 永远用 qclaw-text-file 脚本写文本文件 |
| PowerShell 环境变量 | 用 cmd /c 或 .py 脚本绕过 PS 语法坑 |

## 经验与决策

- IMA 知识库认证失败（code 20004），系统回退到本地存储作为替代方案
