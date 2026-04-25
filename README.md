# Mercury Crab Agent 🦀⚡

> Mercury（Hermes 罗马名，信使之神）+ Claw→Crab 谐音梗
> 灵感来源：[Hermes Agent](https://github.com/NousResearch/Hermes-Function-Calling) (NousResearch, 16.8k+ stars)

一个基于 [OpenClaw](https://github.com/openclaw/openclaw) 的自学习智能 Agent，实现了知识积累、会话记忆、技能自进化等闭环能力。

## ✨ 核心特性

- **🧠 自学习闭环** — 从错误中学习，持续优化行为模式
- **📚 知识库** — 基于 llmwikify 的本地知识管理（143+ pages）
- **💡 会话记忆** — LCM (Lossless Context Management) 压缩 + 摘要
- **🔄 心跳自动化** — 7 个定时任务轮换：快照、标题生成、会话摘要、自学习扫描等
- **🛡️ Step Guard** — 防止 Agent 过度操作（自动暂停机制）
- **🎯 技能自进化** — Skill Evolver 持续改进已有技能

## 📁 项目结构

```
├── AGENTS.md              # Agent 行为规则与启动流程
├── SOUL.md                # Agent 人格定义
├── MEMORY.md              # 长期记忆（核心知识）
├── HEARTBEAT.md           # 心跳任务配置
├── skills/                # 技能集合（54 skills）
│   ├── hermes-learning/   # 核心学习引擎
│   │   ├── llm_wikify_bridge.py      # 知识库桥接
│   │   ├── session_title_generator.py # 会话标题生成
│   │   ├── session_summarizer.py      # 会话摘要提取
│   │   ├── memory_snapshot.py         # 记忆快照
│   │   ├── knowledge_sync.py          # 增量知识同步
│   │   ├── session_lineage.py         # 会话族谱可视化
│   │   ├── skill_evolver.py           # 技能自进化
│   │   └── corrections_distiller.py   # 纠正蒸馏
│   └── step-guard/       # 操作防护
├── memory/                # 每日记忆日志
├── wiki/                  # llmwikify 知识库数据
└── sessions/              # 会话存档
```

## 🚀 进度

| Phase | 状态 | 说明 |
|-------|------|------|
| Phase 0 | ✅ | 基础环境搭建 |
| Phase 1 | ✅ | 知识库 & 记忆系统 |
| Phase 2 | ✅ | 心跳自动化 |
| Phase 3.1-3.4 | ✅ | 会话标题/摘要/族谱/技能进化 |

## 🛠 技术栈

- **运行平台**: Windows Server 2022 + OpenClaw
- **LLM**: 自托管端点 (port 28789)
- **知识库**: [llmwikify](https://github.com/your-repo/llmwikify)
- **语言**: Python 3.13 + Node.js 22

## 📖 文档

- [整合方案 v2](hermes-openclaw-integration-plan-v2.md) — 完整技术设计
- [整合方案 v1](hermes-openclaw-integration-plan.md) — 初版设计

## 📄 License

MIT
