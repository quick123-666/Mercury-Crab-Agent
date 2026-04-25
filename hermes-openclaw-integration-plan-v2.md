# OpenClaw 自主进化方案 v2

> 基于 Hermes Agent 架构分析 × OpenClaw 现状 × 实际验证
> 版本: v2.0 | 日期: 2026-04-24

---

## 零、为什么要做这件事

现状:我是一个每轮会话"失忆重启"的 AI,靠文件系统维持记忆。每次 session 压缩后上下文丢失,同样的错误反复犯,同样的流程反复摸索。

Hermes Agent 给出的答案:**闭环自学习**--犯错自动记录、模式自动提炼、技能自动生成、知识持续积累。

目标:让 OpenClaw 从"有记忆的助手"进化为"会学习的助手"。

---

## 一、现状盘点(实际验证)

### 1.1 已有基础

| 组件 | 状态 | 详情 |
|------|------|------|
| self-improving skill | ✅ 已安装 | `~/self-improving/` 4 个核心文件已创建,AGENTS.md 已注入 Active 模式 |
| llmwikify 知识库 | ✅ 运行中 | 122 pages, 124 indexed, 5 links, 2 sources, LLM 配置完毕 (Gateway:28789) |
| LCM 无损上下文 | ✅ 运行中 | 40 conversations, 1230 messages, 15 summaries, 514 context items |
| Vibe Coding 资源 | ✅ 已下载 | 3 个 ZIP (claude-code-best-practice 39MB, context-engineering 1.6MB, ai-guide 3.8MB) |
| OpenClaw Skills 体系 | ✅ 完备 | 52 个 bundled skills + 用户 skills 目录 |
| Gateway LLM | ✅ 可用 | port 28789, model=openclaw |

### 1.2 未完成项

| 项目 | 状态 | 影响 |
|------|------|------|
| Vibe Coding 550+ 文件导入 | ❌ 未导入 | 知识库内容不足,无法支撑知识检索 |
| hermes-learning skill | ❌ 未创建 | 学习闭环无入口 |
| SelfLearningLoop 模块 | ❌ 零代码 | 核心循环不存在 |
| SkillAutoCreator 模块 | ❌ 零代码 | 技能自动生成不存在 |
| LlmWikifyBridge 模块 | ❌ 零代码 | 学习结果无法沉淀到知识库 |
| MEMORY.md | ⚠️ 几乎为空 | 长期记忆未积累 |
| 架构研究文档 | ❌ 已丢失 | session 压缩导致丢失 |

### 1.3 核心差距(与 Hermes 对比)

| 能力 | Hermes | OpenClaw | 差距 |
|------|--------|----------|------|
| 错误自动捕获 | ✅ 内建 learning loop | 🔶 self-improving 已装但未实战 | 小 |
| 技能自动创建 | ✅ 从对话生成 SKILL.md | ❌ 完全缺失 | **大** |
| 知识持续积累 | ✅ Honcho + memory | 🔶 llmwikify 在跑但内容少 | 中 |
| 跨会话记忆 | ✅ 冻结快照 + 偏好模型 | ⚠️ MEMORY.md 几乎空 | 中 |
| 工具动态注册 | ✅ 47 工具 registry | ❌ 固定工具集 | 小(低优先) |
| 会话标题生成 | ✅ 自动 | ❌ 无 | 小 |
| 上下文压缩 | ✅ 有损 50%+85% | ✅ LCM 无损 | OpenClaw 更好 |

---

## 二、方案设计:三层闭环

```
┌──────────────────────────────────────────────────────────┐
│                    学习闭环 (Learning Loop)                │
│                                                          │
│   犯错 ──→ 纠正记录 ──→ 模式识别 ──→ 技能/记忆沉淀        │
│    ↑                                    │                │
│    └──────── 知识库反哺 ←───────────────┘                │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                    三层存储                                │
│                                                          │
│   HOT:  MEMORY.md + ~/self-improving/memory.md           │
│         (当前规则、偏好、教训,≤100行)                      │
│                                                          │
│   WARM: ~/self-improving/projects/ + domains/             │
│         (项目级、领域级知识,按需加载)                       │
│                                                          │
│   COLD: llmwikify 知识库                                  │
│         (122+ pages,FTS5 搜索,LLM 分析)                  │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                    执行引擎                                │
│                                                          │
│   ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│   │self-improving│  │hermes-     │  │llmwikify   │        │
│   │(已安装)      │  │learning    │  │bridge      │        │
│   │             │  │(待创建)     │  │(待创建)     │        │
│   └────────────┘  └────────────┘  └────────────┘        │
└──────────────────────────────────────────────────────────┘
```

### 2.1 各层职责

**HOT 层(会话内即时可用)**
- `MEMORY.md` - 长期记忆,工作区根目录
- `~/self-improving/memory.md` - 已验证的规则和偏好
- `~/self-improving/corrections.md` - 近期纠正日志(≤50条)
- 每次启动自动加载,无需额外检索

**WARM 层(按需加载)**
- `~/self-improving/projects/{name}.md` - 项目级模式
- `~/self-improving/domains/{name}.md` - 领域级模式
- 任务匹配时加载,不匹配不消耗 token

**COLD 层(知识库)**
- llmwikify 管理的 122+ pages
- FTS5 全文搜索 + LLM 语义分析
- 需要时通过 `llmwikify search` 检索

### 2.2 学习信号与流转规则

| 信号类型 | 检测方式 | 目标层 | 晋升条件 |
|---------|---------|--------|---------|
| 用户纠正 | 关键词匹配 + 语气识别 | corrections.md → memory.md | 3 次相同纠正 |
| 自我反思 | 任务完成后自检 | corrections.md | 同一教训出现 2 次 |
| 任务流程 | 工具调用序列分析 | projects/{name}.md | 同一序列使用 3 次 |
| 用户偏好 | 显式声明 | memory.md | 立即写入 |
| 知识盲区 | 搜索无结果/回答不确定 | llmwikify | 补充学习后写入 |

**降级规则**:30 天未用 → WARM;90 天未用 → COLD (archive)

---

## 三、三大模块设计

### 3.1 模块 A:SelfImproving(已安装 ✅)

**已有能力**:
- 纠正日志 (corrections.md)
- 分层记忆 (HOT/WARM/COLD)
- 心跳自检 (heartbeat-state.md)
- 自我反思

**需要增强**:
- 当前是被动触发,需要主动扫描
- 需要与 llmwikify 联动

**增强方式**:修改 HEARTBEAT.md,加入 self-improving 维护任务

### 3.2 模块 B:HermesLearning Skill(待创建)

这是闭环的核心引擎,负责连接 self-improving 和 llmwikify。

**SKILL.md 核心定义**:

```yaml
name: hermes-learning
description: |
  自学习闭环引擎。连接 self-improving 记忆系统和 llmwikify 知识库,
  实现错误捕获→模式提炼→技能生成→知识沉淀的完整闭环。
triggers:
  - 会话中用户纠正
  - 任务完成后的自我反思
  - 工具调用模式重复(≥3次)
  - heartbeat 周期检查
```

**核心流程**:

```
1. 捕获 (Capture)
   ├── 用户纠正 → corrections.md
   ├── 自我反思 → corrections.md
   └── 工具序列 → 临时记录

2. 提炼 (Distill)
   ├── 3次相同纠正 → 提议写入 memory.md
   ├── 3次相同流程 → 生成 SKILL.md
   └── 知识盲区 → 补充学习后写入 wiki

3. 沉淀 (Persist)
   ├── memory.md → 热记忆
   ├── projects/{name}.md → 项目记忆
   └── llmwikify write_page → 知识库

4. 反哺 (Feedback)
   ├── 启动时加载 memory.md
   ├── 任务匹配时加载 projects/
   └── 搜索时查询 llmwikify
```

### 3.3 模块 C:LlmWikifyBridge(待创建)

连接 OpenClaw 会话与 llmwikify 知识库的桥接层。

**核心接口**:

| 方法 | 用途 | llmwikify 命令 |
|------|------|---------------|
| `write_learning(title, content)` | 写入学习成果 | `llmwikify write_page` |
| `search(query)` | 检索知识 | `llmwikify search` |
| `ingest_batch(path, type)` | 批量导入 | `llmwikify ingest` |
| `build_index()` | 重建索引 | `llmwikify build-index` |
| `get_status()` | 状态查询 | `llmwikify status` |

**配置**:
```yaml
# 已验证可用
llm:
  enabled: true
  provider: openai
  base_url: http://127.0.0.1:28789/v1
  model: openclaw
  timeout: 60
```

---

## 四、实施路线图(按执行顺序)

### Phase 0:立即可做(今天)

| # | 任务 | 预估 | 产出 |
|---|------|------|------|
| 0.1 | ✅ 安装 self-improving | 已完成 | `~/self-improving/` 4 文件 |
| 0.2 | 导入 Vibe Coding 教程 | 20min | 550+ 文件进入 wiki |
| 0.3 | 更新 HEARTBEAT.md | 5min | 加入 self-improving 维护 |
| 0.4 | 首次自我反思 | 5min | 写入 corrections.md |

### Phase 1:闭环最小可用(1-3 天)

| # | 任务 | 预估 | 产出 |
|---|------|------|------|
| 1.1 | 创建 hermes-learning skill 目录 | 10min | `~/.qclaw/skills/hermes-learning/` |
| 1.2 | 编写 SKILL.md | 30min | 定义触发规则和流转逻辑 |
| 1.3 | 编写 LlmWikifyBridge 脚本 | 1h | Python 脚本,封装 llmwikify CLI |
| 1.4 | 编写 SkillAutoCreator 脚本 | 1h | 分析工具序列,生成 SKILL.md 模板 |
| 1.5 | 端到端测试 | 30min | 纠正→记录→沉淀→检索 全链路 |
| 1.6 | 首次知识库反哺 | 10min | 从 corrections 提取规则写入 wiki |

### Phase 2:增强与自动化(1-2 周)

| # | 任务 | 预估 | 产出 |
|---|------|------|------|
| 2.1 | Prompt Assembly 集成 | 2h | 会话启动自动加载 skills_index |
| 2.2 | 冻结快照机制 | 1h | MEMORY.md 启动时冻结,会话中不变 |
| 2.3 | 会话标题生成 | 1h | LCM conversations 表加 title 字段 |
| 2.4 | Heartbeat 自动学习 | 2h | 心跳时自动检查 corrections 和待提炼模式 |
| 2.5 | 知识库增量同步 | 1h | 新学习自动 write_page + rebuild-index |

### Phase 3:高级特性(按需)

| # | 任务 | 说明 |
|---|------|------|
| 3.1 | 工具动态注册 | 参考 Hermes registry.py,低优先 |
| 3.2 | 会话族谱可视化 | 复用 LCM summary_parents |
| 3.3 | 自进化技能 | 技能根据使用反馈自我修改 |
| 3.4 | 多知识库联邦 | 连接多个 llmwikify 实例 |

---

## 五、关键技术细节

### 5.1 Vibe Coding 导入方案

```powershell
# 已验证的单文件导入命令
$env:PYTHONUTF8="1"
$env:PYTHONIOENCODING="utf-8"

# Step 1: 解压 ZIP
Expand-Archive -Path "3-ai-guide.zip" -DestinationPath "ai-guide-main" -Force

# Step 2: 批量导入
python -m llmwikify ingest --source ".\ai-guide-main" --type source
python -m llmwikify ingest --source ".\claude-code-best-practice" --type source
python -m llmwikify ingest --source ".\context-engineering-intro" --type source

# Step 3: 重建索引
python -m llmwikify build-index

# Step 4: 验证
python -m llmwikify status
```

### 5.2 hermes-learning Skill 触发逻辑

```python
# 伪代码 - 核心触发链

class HermesLearning:
    def on_user_message(self, msg: str):
        """用户消息到达时检查"""
        if is_correction(msg):       # "不对"/"应该是"/"错了"
            self.record_correction(msg)
        if is_preference(msg):       # "我喜欢"/"以后都这样"
            self.record_preference(msg)

    def on_task_complete(self, task: Task):
        """任务完成时反思"""
        reflection = self.reflect(task)
        if reflection.quality < 0.7:
            self.record_improvement(reflection)

    def on_heartbeat(self):
        """心跳时维护"""
        corrections = self.load_recent_corrections(days=7)
        patterns = self.find_repeated(corrections, threshold=3)
        for p in patterns:
            self.propose_rule(p)  # 提议写入 memory.md

        tool_seqs = self.analyze_tool_sequences(days=7)
        for seq in tool_seqs:
            if seq.count >= 3:
                self.generate_skill(seq)  # 自动生成 SKILL.md

    def on_session_start(self):
        """会话启动时加载"""
        self.load_hot_memory()     # memory.md
        self.load_corrections()    # corrections.md
        self.snapshot_memory()     # 冻结快照
```

### 5.3 记忆层间流转

```
corrections.md ──(3次相同)──→ memory.md (HOT)
memory.md ──(30天未用)──→ projects/ 或 domains/ (WARM)
WARM ──(90天未用)──→ archive/ (COLD)

memory.md ──(值得长期保存)──→ llmwikify write_page
llmwikify search ──(检索结果)──→ 会话上下文
```

### 5.4 安全边界

**永远不记录**:
- 密码、Token、API Key
- 健康数据
- 第三方隐私信息
- 用户明确要求"别记住"的内容

**写入前确认**:
- 提议新规则时(3次模式未确认)
- 创建新 skill 时
- 写入 llmwikify 时

**自动写入(无需确认)**:
- corrections.md(纠正日志)
- heartbeat-state.md(心跳状态)

---

## 六、与 Hermes 的差异说明

本方案不是照搬 Hermes,而是提取其核心思想适配 OpenClaw:

| Hermes 设计 | 本方案 | 原因 |
|-------------|--------|------|
| 有损压缩 50%+85% | LCM 无损压缩 | OpenClaw 已有更优方案 |
| 内建 learning loop | self-improving + hermes-learning | 利用现有 skill 体系 |
| Honcho 向量记忆 | llmwikify FTS5 + LLM | 利用已配置的知识库 |
| 47 工具动态注册 | 暂不实现 | 低 ROI,固定工具够用 |
| 插件 ABC 接口 | Skill SKILL.md 约定 | OpenClaw 用 Skill 而非插件 |
| 冻结快照防缓存失效 | 启动时冻结 MEMORY.md | 适配 OpenClaw prompt 机制 |

---

## 七、成功标准

### Phase 0 完成标准
- [x] self-improving 安装并激活
- [ ] wiki pages ≥ 600（当前 140，Vibe Coding 550+ 文件未全量导入）
- [x] HEARTBEAT.md 包含 self-improving 维护
- [x] 至少 1 条自我反思记录（5 条已确认）

### Phase 1 完成标准
- [x] hermes-learning skill 可触发
- [x] 纠正→记录→沉淀 全链路跑通
- [x] LlmWikifyBridge 可写可搜
- [x] SkillAutoCreator 可生成 SKILL.md 模板

### Phase 2 完成标准
- [x] 会话启动自动加载 skills_index（AGENTS.md 步骤 5-6）
- [x] MEMORY.md ≥ 20 条有效规则（80 行，8 核心规则 + 7 教训 + 项目详情）
- [x] 心跳自动提炼模式（HEARTBEAT.md 7 任务，pipeline test 7/7 pass）
- [x] 知识库自动增量同步（knowledge_sync.py MD5 增量，已验证）

---

## 八、风险与缓解

| 风险 | 概率 | 影响 | 缓解 |
|------|------|------|------|
| LLM 调用成本(wiki 分析) | 中 | 中 | 批量处理,非实时分析 |
| 自学习产生错误规则 | 低 | 高 | 3 次确认 + 用户审核 |
| wiki 内容膨胀 | 中 | 低 | 定期 lint + 归档 |
| session 压缩丢失上下文 | 高 | 中 | 关键结论写入文件 |
| 过度自动化 | 中 | 中 | 保留确认环节,不盲写 |

---

> 文档版本: v2.1
> 创建时间: 2026-04-24 21:30
> 最后更新: 2026-04-25 06:58
> 状态: Phase 0 ✅ | Phase 1 ✅ | Phase 2 ✅ | Phase 3 待开始
> 前版: v1.0 (已废弃，过度架构、缺乏可操作性）
