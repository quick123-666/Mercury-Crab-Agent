# Hermes Agent + OpenClaw + llmwikify 完整整合方案

> 基于 Hermes Agent 源码深度分析的技术方案
> 版本: v1.0 | 日期: 2026-04-24

---

## 一、系统架构对比分析

### 1.1 Hermes Agent 核心架构

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Hermes Agent                                 │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ AIAgent      │  │ Prompt       │  │ Provider     │              │
│  │ (run_agent)  │  │ Builder      │  │ Resolution   │              │
│  │ ~10,700 行   │  │              │  │              │              │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
│         │                │                   │                      │
│  ┌──────┴───────┐  ┌─────┴──────┐  ┌────────┴────────┐              │
│  │ Compression  │  │ Tool       │  │ Session        │              │
│  │ & Caching    │  │ Registry   │  │ Storage        │              │
│  │              │  │ 47 tools   │  │ SQLite + FTS5  │              │
│  └──────────────┘  └────────────┘  └─────────────────┘              │
│         │                │                   │                      │
│         └────────────────┼───────────────────┘                      │
│                          ▼                                           │
│  ┌─────────────────────────────────────────────────────┐            │
│  │              Memory System (冻结快照)               │            │
│  │  MEMORY.md  │  USER.md  │  Skills Index  │  Honcho │            │
│  └─────────────────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 OpenClaw 当前架构

```
┌─────────────────────────────────────────────────────────────────────┐
│                         OpenClaw                                     │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ Agent Core   │  │ Prompt       │  │ Provider     │              │
│  │ (TypeScript) │  │ Assembly     │  │ Gateway      │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ LCM          │  │ Skills       │  │ Memory       │              │
│  │ Lossless CM  │  │ System       │  │ MEMORY.md    │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                          │                                           │
│                          ▼                                           │
│  ┌─────────────────────────────────────────────────────┐            │
│  │              llmwikify 知识库                        │            │
│  │  121 pages  │  123 indexed  │  FTS 搜索  │  LLM 分析 │            │
│  └─────────────────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.3 核心差距分析

| 功能模块 | Hermes Agent | OpenClaw | 差距等级 |
|---------|-------------|----------|---------|
| 自学习循环 | ✅ built-in learning loop | ❌ 缺失 | 🔴 高 |
| 技能自动创建 | ✅ 从对话自动生成 SKILL.md | ❌ 手动 | 🔴 高 |
| 会话标题生成 | ✅ 自动生成唯一标题 | ❌ 无 | 🟡 中 |
| 会话族谱 | ✅ parent_session_id | 🔶 LCM 部分 | 🟡 中 |
| 工具注册表 | ✅ 47 工具动态注册 | 🔶 固定工具 | 🟡 中 |
| 上下文压缩 | ✅ 双层 50%+85% | 🔶 LCM 无损 | 🟢 低 |
| 记忆快照 | ✅ 冻结快照防缓存失效 | ✅ 已有 | 🟢 低 |
| FTS5 搜索 | ✅ messages_fts | ✅ LCM | 🟢 低 |
| 多平台网关 | ✅ 18 适配器 | ✅ 多渠道 | 🟢 低 |

---

## 二、Hermes Agent 核心机制深度解析

### 2.1 AIAgent 核心循环

**源码位置**: `run_agent.py` (~10,700 行)

```
run_conversation() 每轮迭代:
1. 生成 task_id（如果未提供）
2. 将用户消息追加到对话历史
3. 构建或复用缓存的系统提示词 (prompt_builder.py)
4. 检查是否需要预压缩 (>50% context)
5. 从对话历史构建 API 消息
   - chat_completions: OpenAI 格式
   - codex_responses: Responses API 格式
   - anthropic_messages: 通过 adapter 转换
6. 注入临时提示层（预算警告、上下文压力）
7. 应用提示词缓存标记（Anthropic）
8. 执行可中断的 API 调用
9. 解析响应:
   - tool_calls → 执行 → 追加结果 → 循环回步骤 5
   - text response → 持久化会话 → 刷新内存 → 返回
```

### 2.2 Prompt Assembly 层次结构

**源码位置**: `agent/prompt_builder.py`

```python
# Hermes 系统提示词组装顺序（7 层）
layers = [
    "agent_identity",      # SOUL.md (~/.hermes/SOUL.md)
    "tool_guidance",       # 工具使用指导
    "memory_snapshot",     # 冻结的 MEMORY 快照
    "user_profile",        # 冻结的 USER 快照
    "skills_index",        # 技能索引
    "context_files",       # AGENTS.md, .cursorrules 等
    "timestamp_session",   # 时间戳 + 会话 ID
]
```

**关键设计：冻结快照**
- 会话启动时捕获 MEMORY.md 和 USER.md
- 注入系统提示词后**不再变动**
- 防止缓存失效，保持前缀稳定

### 2.3 记忆工具机制

**源码位置**: `tools/memory_tool.py`

```python
class MemoryTool:
    """持久记忆管理"""
    
    def __init__(self):
        self._char_limit = 10000  # 默认字符限制
        self._snapshot = None     # 会话开始时的快照
    
    def write(self, category: str, content: str):
        current = self._char_count()
        
        if current + len(content) > self._char_limit:
            # 超限：返回错误，引导 Agent 整理/压缩
            return {
                "success": False,
                "error": f"Memory at {current}/{self._char_limit} chars.",
                "hint": "Replace or remove existing entries first."
            }
        
        self._append(category, content)
        return {"success": True}
```

**核心洞察**：错误信息引导 Agent **自主反思和整理记忆**

### 2.4 Session Storage 架构

```sql
-- Hermes SQLite Schema
CREATE TABLE sessions (
    id TEXT PRIMARY KEY,
    source TEXT NOT NULL,           -- cli, telegram, discord...
    user_id TEXT,
    model TEXT,
    parent_session_id TEXT,         -- 会话族谱（压缩分裂）
    title TEXT UNIQUE,              -- 自动生成的唯一标题
    started_at REAL,
    ended_at REAL,
    end_reason TEXT,
    message_count INTEGER,
    tool_call_count INTEGER,
    input_tokens INTEGER,
    output_tokens INTEGER
);

-- FTS5 全文搜索
CREATE VIRTUAL TABLE messages_fts USING fts5(
    content,
    content=messages,
    content_rowid=id
);
```

### 2.5 上下文压缩：双层系统

```
┌──────────────────────────────────────┐
│  Gateway Session Hygiene (85%)       │ ← 安全网，粗略估计
│  (pre-agent, 触发于消息到达前)        │
└────────────────┬─────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────┐
│  Agent ContextCompressor (50%)       │ ← 正常上下文管理
│  (in-loop, 真实 token 计数)           │
└──────────────────────────────────────┘
```

---

## 三、OpenClaw LCM 现状分析

### 3.1 LCM 数据库结构

```
LCM 表结构（已验证）：
├── conversations (40 rows)     # 对话元数据
├── messages (1,230 rows)       # 消息历史
├── summaries                   # 压缩摘要
├── summary_parents             # 摘要父子关系 ✅ 已有！
├── context_items               # 上下文项
├── messages_fts                # FTS5 全文搜索 ✅ 已有！
└── summaries_fts               # 摘要 FTS
```

**优势**：LCM 已具备无损上下文管理能力，比 Hermes 的有损压缩更先进！

### 3.2 llmwikify 配置

```yaml
# .wiki-config.yaml
llm:
  enabled: true
  provider: openai
  base_url: http://127.0.0.1:28789/v1
  api_key: [gateway token]
  model: openclaw
  timeout: 60

当前状态：
- 121 pages
- 123 indexed
- 550+ Vibe Coding 文件待导入
```

---

## 四、完整整合方案

### 4.1 架构设计：三层融合

```
┌─────────────────────────────────────────────────────────────────────┐
│                    整合后架构（OpenClaw-Hermes）                      │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │                    Learning Loop Layer                       │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │    │
│  │  │SessionEnd│  │Pattern   │  │Skill     │  │Knowledge │   │    │
│  │  │Extractor │  │Recognizer│  │Creator   │  │Updater   │   │    │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │    │
│  └────────────────────────────────────────────────────────────┘    │
│                              │                                      │
│  ┌───────────────────────────┼────────────────────────────────┐   │
│  │                    Agent Core Layer                         │   │
│  │                             │                                │   │
│  │  ┌──────────┐  ┌──────────┐  ▼  ┌──────────┐  ┌──────────┐ │   │
│  │  │Prompt    │  │Tool      │  Context │  │Session   │ │   │
│  │  │Builder   │  │Registry  │  │Engine   │  │Manager   │ │   │
│  │  │(扩展版)  │  │(动态注册)│  │(LCM)    │  │(扩展版)  │ │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │   │
│  └────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│  ┌───────────────────────────┼────────────────────────────────┐   │
│  │                 Knowledge Storage Layer                     │   │
│  │                             │                                │   │
│  │  ┌──────────┐  ┌──────────┐  ▼  ┌──────────┐  ┌──────────┐ │   │
│  │  │MEMORY.md │  │SKILL.md  │  │llmwikify │  │LCM DB    │ │   │
│  │  │(快照式)  │  │(自动创建)│  │知识库     │  │会话存储  │ │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │   │
│  └────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.2 核心模块实现

#### 模块 1: SelfLearningLoop（自学习循环）

```python
"""
OpenClaw 版本的自学习循环
核心功能：会话结束时自动提取有价值知识并沉淀
"""

class SelfLearningLoop:
    """自学习循环核心类"""
    
    def __init__(self, memory_path, skills_path, wiki_path, lcm_db):
        self.memory = MemoryManager(memory_path)
        self.skill_creator = SkillAutoCreator(skills_path)
        self.wiki = LlmWikifyBridge(wiki_path)
        self.sessions = LcmBridge(lcm_db)
    
    def on_session_end(self, session_id: str):
        """会话结束时触发（核心入口）"""
        messages = self.sessions.load_messages(session_id)
        
        # 1. 提取错误纠正
        corrections = self._extract_error_corrections(messages)
        for c in corrections:
            self.memory.write("error_correction", c)
        
        # 2. 提取任务流程
        flows = self._extract_task_flows(messages)
        for f in flows:
            skill = self.skill_creator.from_flow(f)
            self.skill_creator.save(skill)
        
        # 3. 提取用户偏好
        prefs = self._extract_preferences(messages)
        for p in prefs:
            self.memory.write("user_preference", p)
        
        # 4. 同步到 Wiki
        self.wiki.sync_learnings(corrections + flows + prefs)
        
        return len(corrections) + len(flows) + len(prefs)
```

#### 模块 2: SkillAutoCreator（技能自动创建器）

```python
class SkillAutoCreator:
    """自动技能创建器"""
    
    def analyze_tool_sequences(self, messages: List[dict]) -> List[dict]:
        """分析工具调用序列，识别可创建技能的模式"""
        sequences = defaultdict(int)
        
        for msg in messages:
            if msg.get("tool_calls"):
                seq = tuple(tc["function"]["name"] for tc in msg["tool_calls"])
                sequences[seq] += 1
        
        # 重复 2 次以上的序列 → 候选技能
        return [
            {"sequence": seq, "count": count}
            for seq, count in sequences.items()
            if count >= 2
        ]
    
    def create_skill(self, pattern: dict) -> str:
        """从模式生成 SKILL.md"""
        name = self._generate_name(pattern)
        return f'''---
name: {name}
description: Auto-generated from tool usage pattern
---

# {name}

## Trigger
Detected {pattern["count"]} repetitions

## Steps
1. Execute tool sequence: {pattern["sequence"]}
2. Handle results
3. Report outcome
'''
```

#### 模块 3: LlmWikifyBridge（知识库桥接）

```python
class LlmWikifyBridge:
    """llmwikify 知识库桥接"""
    
    def __init__(self, wiki_path: Path, config_path: Path):
        self.wiki_path = wiki_path
        self.config_path = config_path
    
    def add_learning(self, learning_type: str, title: str, content: str):
        """添加学习内容到 Wiki"""
        page_path = self.wiki_path / "learnings" / f"{learning_type}-{title}.md"
        page_path.parent.mkdir(parents=True, exist_ok=True)
        
        page_path.write_text(f'''---
type: learning/{learning_type}
created: {datetime.now().isoformat()}
---

{content}
''')
        
        # 触发重新索引
        subprocess.run(["python", "-m", "llmwikify", "index"])
```

### 4.3 OpenClaw Skill 定义

#### hermes-learning SKILL.md

```yaml
---
name: hermes-learning
description: |
  Hermes 风格的自学习循环 skill。
  在会话结束时自动提取模式并创建技能。
---

# Hermes 自学习 Skill

## 触发时机

- 会话结束前（end_turn hook）
- 用户明确纠正时
- 任务成功完成时
- 工具调用模式重复时

## 核心流程

### 1. 错误纠正捕获
当用户说 "不对，应该是..." 时自动记录

### 2. 任务流程提取
连续工具调用成功完成任务时提取流程

### 3. 用户偏好学习
从用户指令中提取偏好

## 输出目标

| 学习类型 | 输出目标 |
|---------|---------|
| 错误纠正 | MEMORY.md |
| 任务流程 | skills/auto/{name}/SKILL.md |
| 用户偏好 | USER.md |
| 知识盲区 | llmwikify wiki |
```

---

## 五、实施路线图

### Phase 1: 基础设施（1-2 周）

| 任务 | 优先级 | 说明 |
|-----|-------|------|
| 扩展 LCM Schema | 🔴 高 | 添加 title, parent_session_id 列 |
| 创建 `SelfLearningLoop` 类 | 🔴 高 | 核心学习循环 |
| 创建 `LlmWikifyBridge` | 🔴 高 | 知识库桥接 |
| 安装 `self-improving` skill | 🟡 中 | 从 ClawHub 安装 |

### Phase 2: 核心机制（2-4 周）

| 任务 | 优先级 | 说明 |
|-----|-------|------|
| 实现 `SkillAutoCreator` | 🔴 高 | 自动技能创建 |
| 扩展 Prompt Assembly | 🟡 中 | 添加 skills_index 层 |
| 实现冻结快照 | 🟡 中 | MEMORY.md 启动时冻结 |
| 会话标题生成 | 🟡 中 | 自动唯一标题 |

### Phase 3: 高级特性（4-8 周）

| 任务 | 优先级 | 说明 |
|-----|-------|------|
| 会话族谱查询 | 🟡 中 | 复用 summary_parents |
| 工具动态注册 | 🟢 低 | 参考 Hermes registry.py |
| 钩子系统 | 🟢 低 | session_end, error_capture |
| 提示词缓存优化 | 🟢 低 | Anthropic cache breakpoints |

---

## 六、关键文件路径映射

| Hermes 组件 | OpenClaw 对应路径 |
|------------|-----------------|
| `~/.hermes/SOUL.md` | `{workspace}/SOUL.md` |
| `~/.hermes/memory/MEMORY.md` | `{workspace}/MEMORY.md` |
| `~/.hermes/memory/USER.md` | `{workspace}/USER.md` |
| `~/.hermes/state.db` | `~/.qclaw/memory/lossless/lcm.db` |
| `~/.hermes/skills/` | `~/.qclaw/skills/` |
| Wiki (Honcho) | `{workspace}/wiki/` (llmwikify) |

---

## 七、立即可执行

### 7.1 安装 self-improving skill

```bash
npx clawhub@latest install self-improving
```

### 7.2 导入 Vibe Coding 教程

```powershell
$env:PYTHONUTF8="1"
python -m llmwikify ingest --source "C:\path\to\ai-guide-main" --type source
```

### 7.3 创建 hermes-learning skill 目录

```powershell
mkdir ~/.qclaw/skills/hermes-learning
```

---

## 八、参考资源

- **Hermes Agent 官方文档**: https://hermes-agent.nousresearch.com
- **Hermes GitHub**: https://github.com/NousResearch/hermes-agent
- **self-improving skill (ClawHub)**: pskoett/self-improving-agent
- **llmwikify**: 已配置于 QClaw Gateway (port 28789)

---

> 文档版本: v1.0
> 创建时间: 2026-04-24 20:50
> 状态: 已完成
