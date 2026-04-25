# hermes-learning Skill 进化分析报告

## 目标
分析 hermes-learning skill 的 SKILL.md 与实际脚本/纠正记录之间的差距，生成具体改进建议。

## 关键发现

### 1. 6 个脚本未文档化 [high]
- knowledge_sync.py、memory_snapshot.py、openclaw_config.py、session_lineage.py、session_title_generator.py、skill_evolver.py
- AI 读取 SKILL.md 时无法发现这些脚本，导致跳过调用

### 2. Windows 编码约束未固化 [high]
- 3 条纠正记录直接相关：LLM端点猜错、GBK编码错误、CLI语法变更
- 教训零散分布，未在 SKILL.md 中形成硬规则节

### 3. 心跳任务映射不完整 [medium]
- SKILL.md 只列 4 个心跳任务，HEARTBEAT.md 有 7 个

### 4. skill_evolver.py 未纳入核心流程 [medium]
- 最具进化潜力但完全未被主流程引用

### 5. openclaw_config.py 隐性依赖 [medium]
- 被 3 个脚本 import 但无文档，配置路径变化会导致连锁崩溃

## 改进建议（7 项）

| # | 改进项 | 优先级 |
|---|--------|--------|
| 1 | 补全 6 个缺失脚本文档 | high |
| 2 | 新增「环境约束」硬规则节（编码+端点+CLI语法） | high |
| 3 | 修正 LLM 配置节歧义（base_url 是否带 /v1） | high |
| 4 | 心跳任务完整映射表（4→7） | medium |
| 5 | skill_evolver 纳入核心流程提炼节 | medium |
| 6 | openclaw_config 基础设施依赖标注 | medium |
| 7 | session_lineage 调试工具标注 | low |

## 新增注意事项（5 项）

1. [high] 每个脚本说明块必须标注 Windows 编码前置条件
2. [high] llmwikify CLI 语法已变，SKILL.md 需统一为 positional argument 格式
3. [medium] 3 条相关纠正尚未晋升为 memory.md Rules 节
4. [medium] skill_evolver --apply 模式缺少安全约束（需确认+diff+行数限制）
5. [low] heartbeat-state.md 路径未在 SKILL.md 中统一说明

## 整体优先级：high
3 个 high 项直接关联已发生 3 次的错误模式，不修复则历史重演。

## 代码验证
- llm_wikify_bridge.py 确认：内部用 positional argument ingest <path>，已避免 --self-create
- bridge 内部处理编码（os.environ.setdefault）
- 但 SKILL.md 文档中 ingest_batch(path, type) 描述过时，type 参数不再传给 CLI
