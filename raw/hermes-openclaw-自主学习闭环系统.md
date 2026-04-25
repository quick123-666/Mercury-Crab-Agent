# Hermes-OpenClaw 自主学习闭环系统

> 让 AI 从「有记忆的助手」进化为「会学习的助手」
> 版本 v1.0 | 2026-04-25 | 状态：生产可用

---

## 这是什么

在 OpenClaw 上构建一套自我进化系统，灵感来自 Hermes Agent 架构。
核心目标：**犯错自动记录 → 模式自动提炼 → 技能自动生成 → 知识持续积累**。

---

## 文件夹结构

| 文件夹 | 内容 |
|--------|------|
| `01-项目概述/` | 项目背景、目标、架构全景图 |
| `02-环境配置/` | 硬件、系统、依赖要求 |
| `03-Phase1核心模块/` | hermes-learning skill + 核心脚本源码 |
| `04-Phase2自动化心跳/` | 心跳任务定义 + HEARTBEAT.md |
| `05-Phase3进阶模块/` | 进阶功能（族谱、自进化、纠错蒸馏） |
| `06-技术教训/` | Windows 环境踩坑合集（来自 corrections.md） |
| `07-文件清单/` | 所有源码文件清单和用途说明 |
| `08-快速开始/` | 5分钟部署步骤 + 验证测试 |

---

## 核心模块一览

| 模块 | 主要脚本 | 用途 |
|------|---------|------|
| 自学习 Skill | hermes-learning/SKILL.md | 触发规则、流转逻辑 |
| 知识库桥接 | llm_wikify_bridge.py | 连接 llmwikify CLI |
| 会话摘要 | session_summarizer.py | compaction 前提取关键决策 |
| 会话标题 | session_title_generator.py | LCM 无标题会话自动命名 |
| 记忆快照 | memory_snapshot.py | MEMORY.md 变更检测 |
| 增量同步 | knowledge_sync.py | memory/ 日志 → wiki 增量同步 |
| 会话族谱 | session_lineage.py | LCM 压缩族谱可视化 |
| 技能自进化 | skill_evolver.py | 根据纠正反馈修改 SKILL.md |
| 纠错蒸馏 | corrections_distiller.py | corrections.md → wiki 自动沉淀 |

---

## Phase 进度总览

| Phase | 状态 | 说明 |
|-------|------|------|
| Phase 0 环境搭建 | ✅ 完成 | LLM 连通、llmwikify 配置 |
| Phase 1 核心闭环 | ✅ 完成 | hermes-learning + 7个脚本 |
| Phase 2 自动化心跳 | ✅ 完成 | 7个心跳任务、pipeline 测试通过 |
| Phase 3.1 动态注册 | ✅ 完成 | 20个未注册 skill 全部添加 |
| Phase 3.2 会话族谱 | ✅ 完成 | session_lineage.py |
| Phase 3.3 技能自进化 | ✅ 完成 | skill_evolver.py |
| Phase 3.4 纠错蒸馏 | ✅ 完成 | corrections_distiller.py |

---

## 快速导航

| 你想知道 | 去这里 |
|---------|--------|
| 这个系统是做什么的 | 01-项目概述/项目背景与目标.md |
| 需要什么环境 | 02-环境配置/环境要求.md |
| 各个脚本是干什么的 | 03-Phase1核心模块/模块说明.md |
| 心跳任务怎么工作 | 04-Phase2自动化心跳/心跳任务说明.md |
| 高级功能有哪些 | 05-Phase3进阶模块/进阶功能说明.md |
| Windows 上踩过哪些坑 | 06-技术教训/教训合集.md |
| 所有文件在哪 | 07-文件清单/完整文件清单.md |
| 怎么部署这套系统 | 08-快速开始/部署步骤.md |
