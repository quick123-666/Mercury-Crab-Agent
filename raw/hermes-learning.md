# hermes-learning

> 自学习闭环引擎 — 连接 self-improving 记忆系统和 llmwikify 知识库

## 触发条件

当以下任一条件满足时加载此 skill：

1. 用户纠正了我的错误（关键词：不对/错了/应该是/不是这样）
2. 用户表达了偏好（关键词：我喜欢/以后都这样/别再/记住）
3. 任务完成后自我反思发现改进空间
4. 心跳（heartbeat）周期检查
5. 用户明确说"学习"/"记住"/"反思"

## 核心流程

### 1. 捕获（Capture）

**用户纠正** → 写入 `~/self-improving/corrections.md`
```
| {日期} | {错误描述} | {正确答案} | 待确认 |
```

**用户偏好** → 写入 `~/self-improving/memory.md`（Preferences 节）
- 立即写入，无需确认

**自我反思** → 写入 `~/self-improving/corrections.md`
- 任务完成后自检：结果是否符合预期？有无更优解？

### 2. 提炼（Distill）

**纠正 → 规则晋升**（心跳时执行）：
- 扫描 corrections.md，找出现 ≥3 次的相同模式
- 提议写入 `~/self-improving/memory.md`（Rules 节）
- 等待用户确认后才晋升

**工具序列 → 技能生成**（心跳时执行）：
- 扫描近期任务中重复 ≥3 次的工具调用序列
- 调用 `scripts/skill_auto_creator.py` 生成 SKILL.md 模板
- 放入 `~/self-improving/projects/` 等待用户审核

### 3. 沉淀（Persist）

**HOT 层**（每次会话加载）：
- `MEMORY.md` — 长期规则和偏好（≤100 行）
- `~/self-improving/memory.md` — 已验证的规则
- `~/self-improving/corrections.md` — 近期纠正（≤50 条）

**WARM 层**（按需加载）：
- `~/self-improving/projects/{name}.md` — 项目级模式
- `~/self-improving/domains/{name}.md` — 领域级模式

**COLD 层**（搜索加载）：
- llmwikify 知识库
- 通过 `scripts/llm_wikify_bridge.py` 桥接

### 4. 反哺（Feedback）

**会话启动时**：
1. 读取 `MEMORY.md`（项目上下文自动加载）
2. 读取 `~/self-improving/memory.md`
3. 读取 `~/self-improving/corrections.md`（最近 10 条）
4. 冻结快照：记录当前 MEMORY.md 哈希，会话中修改不污染初始状态

**任务执行时**：
- 根据任务关键词匹配 `~/self-improving/projects/` 和 `domains/`
- 匹配则加载相关模式文件

**搜索时**：
- 先查 `~/self-improving/memory.md`
- 再查 llmwikify（通过 bridge 脚本）

## 记忆层间流转规则

| 信号 | 源 | 目标 | 条件 |
|------|----|------|------|
| 3 次相同纠正 | corrections.md | memory.md (Rules) | 3 次出现 + 用户确认 |
| 显式偏好 | 用户声明 | memory.md (Preferences) | 立即写入 |
| 重复工具序列 | 任务日志 | projects/{name}.md | 3 次出现 + 自动提议 |
| 知识盲区 | 搜索无结果 | llmwikify | 补充学习后写入 |
| 30 天未用 | memory.md | projects/ 或 domains/ | 自动降级 |
| 90 天未用 | WARM 层 | archive/ | 自动归档 |

## 安全边界

**永远不记录**：
- 密码、Token、API Key
- 健康数据
- 第三方隐私信息
- 用户说"别记住"的内容

**写入前需确认**：
- 新规则提议（3 次模式晋升）
- 新 skill 生成
- 写入 llmwikify

**自动写入（无需确认）**：
- corrections.md（纠正日志）
- memory.md（用户显式偏好）
- heartbeat-state.md（心跳状态）

## 心跳维护任务

每次心跳时执行：

1. **扫描 corrections.md**：找 ≥3 次重复模式 → 提议晋升为规则
2. **检查 memory.md 条目数**：>100 行 → 提议降级旧条目
3. **同步 llmwikify**：如有新学习成果，调用 bridge 写入知识库
4. **更新 heartbeat-state.md**：记录检查时间戳

## 脚本

### session_summarizer.py
**Phase 2A: 会话摘要自动沉淀** — compaction 前自动提取关键决策。

运行方式：
```bash
python C:\Users\Administrator\.qclaw\skills\hermes-learning\session_summarizer.py
```

功能：
1. 从 LCM DB 拉最新有实质内容的会话（compaction 后当前空会话自动跳过）
2. 调用 QClaw Gateway LLM 提取关键决策/技术结论
3. 追加到 `memory/YYYY-MM-DD.md`
4. ingest 到 llmwikify 知识库（标题：`session-summary-YYYY-MM-DD-HHMM`）

**关键教训**：
- `urllib.request.Request` 对象只能使用一次，必须每次创建新对象
- Windows 控制台 GBK 编码无法打印 emoji，需 `sys.stdout = io.TextIOWrapper(sys.stdout.buffer, 'utf-8')` 修复
- Gateway 响应约 6-12s，超时设为 45-60s
- SQLite `WHERE` 子句必须在 `GROUP BY` 之前；按 `cnt DESC` 而非 `conversation_id DESC`

### llm_wikify_bridge.py
桥接 llmwikify CLI，提供统一接口：
- `write_learning(title, content)` — 写入学习成果
- `search(query)` — 检索知识
- `ingest_batch(path, type)` — 批量导入（positional argument，v0.30+ 无需 flag）
- `status()` — 状态查询
- CLI：`python llm_wikify_bridge.py ingest <file>`（无需 `--self-create`，否则超时）

### skill_auto_creator.py
分析工具序列，生成 SKILL.md 模板：
- 输入：工具调用序列 + 上下文
- 输出：标准 SKILL.md 模板文件
- 放入 `~/self-improving/projects/` 等待审核

### session_title_generator.py
为 LCM 无标题会话自动生成中文标题：
- 从 LCM DB 查询 title=NULL 的会话
- 调用 LLM 提取会话主题
- 更新 conversations 表 title 字段
- CLI：`python session_title_generator.py --recent 3`

### session_summarizer.py
提取会话关键决策/技术结论：
- 从 LCM DB 拉取有实质内容的会话
- LLM 生成摘要 → 追加到 `memory/YYYY-MM-DD.md`
- ingest 到 llmwikify 知识库
- Windows: 需 PYTHONUTF8=1

### memory_snapshot.py
MEMORY.md 快照 + hash 变更检测：
- 创建快照: `python memory_snapshot.py`
- 差异对比: `python memory_snapshot.py --diff`
- 清理: `python memory_snapshot.py --cleanup 7`

### knowledge_sync.py
增量同步 memory/ 日志到 llmwikify 知识库：
- MD5 hash 检测变更文件
- 仅同步新增/修改的文件
- CLI：`python knowledge_sync.py --recent 3`
- 状态存储: `memory/.sync-state.json`（key="synced"）

### session_lineage.py
LCM 压缩族谱可视化：
- 追踪 summary_parents 表的 parent→child 关系
- 支持: 文本树 / JSON / --conv 过滤 / --depth 限制
- CLI：`python session_lineage.py [--json] [--conv N] [--stats]`

### skill_evolver.py
技能自进化引擎（Phase 3.3）：
- 扫描 corrections.md 匹配 skill 相关纠正
- 检测 SKILL.md 质量问题（缺触发条件/注意事项/脚本引用）
- 调用 LLM 生成改进建议 → 写入 evolution-log.md
- `--dry-run` 只分析不写入，`--apply --skill X` 自动应用改进

### openclaw_config.py
读取 openclaw.json 配置的辅助模块：
- `get_llm_endpoint()` → (base_url, model, token)
- 供其他脚本统一调用

## 配置

```yaml
llmwikify:
  enabled: true
  python_env: PYTHONUTF8=1;PYTHONIOENCODING=utf-8
  base_url: http://127.0.0.1:28789/v1
  model: openclaw

self_improving:
  root: ~/self-improving
  corrections_max: 50
  memory_max_lines: 100
  promotion_threshold: 3
  demotion_days: 30
  archive_days: 90
```
