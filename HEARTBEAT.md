# HEARTBEAT.md

## Phase 2 — Automated Heartbeat Tasks

**Skill path**: `~/.qclaw/skills/hermes-learning/`
**Self-improving path**: `C:\Users\Administrator\self-improving\`

> 每个 heartbeat 只执行 1-2 个任务，轮换执行，避免 token 浪费。
> 读取 `heartbeat-state.md` 的 lastChecks 决定哪些任务需要执行。

---

### Task 1: Memory Snapshot (每次 heartbeat)
创建 MEMORY.md 快照，用于检测会话间变化。
```
python ~/.qclaw/skills/hermes-learning/memory_snapshot.py
```

### Task 2: Session Title Backfill (每天1次，早8点后)
为无标题的 LCM 会话生成中文标题。
```
python ~/.qclaw/skills/hermes-learning/session_title_generator.py --recent 3
```
- 检查 `heartbeat-state.md` lastTitleGen，距上次 >12h 才执行
- `--recent 3` 每次只处理3个，避免阻塞

### Task 3: Session Summary (每天1次，晚22点后)
提取最近有实质内容的会话，生成摘要写入 memory/ 和 wiki。
```
python ~/.qclaw/skills/hermes-learning/session_summarizer.py
```
- 检查 `heartbeat-state.md` lastSummary，距上次 >8h 才执行
- 需要设置环境变量: `$env:PYTHONUTF8="1"; $env:PYTHONIOENCODING="utf-8"`

### Task 4: Self-Improving Scan (每天1-2次)
扫描 corrections.md，发现重复模式。
1. 读取 `C:\Users\Administrator\self-improving\corrections.md`
2. 如果有 ≥3 条同类纠正 → 提议写入 `memory.md`
3. 如果 corrections.md >30 条 → 清理已晋升的旧条目
4. 更新 `heartbeat-state.md`

### Task 5: MEMORY.md Maintenance (每3天1次)
1. 比对快照: `python memory_snapshot.py --diff`
2. 检查 MEMORY.md 行数 >100 → 提议归档旧内容到 WARM 层
3. 合并 memory/ 日志中的关键条目到 MEMORY.md

### Task 6: Memory Snapshot Cleanup (每周1次)
清理7天前的快照文件。
```
python ~/.qclaw/skills/hermes-learning/memory_snapshot.py --cleanup 7
```

---

## Execution Priority (轮换顺序)

| 轮次 | 执行任务 | 条件 |
|------|---------|------|
| 1 | Task 1 (Snapshot) | 每次 |
| 2 | Task 2 (Title Gen) | lastTitleGen > 12h |
| 3 | Task 3 (Summary) | lastSummary > 8h, 且非深夜(0-6点) |
| 4 | Task 4 (Self-Improve) | lastSelfImprove > 6h |
| 5 | Task 5 (Memory Maint) | lastMemoryMaint > 72h |
| 6 | Task 6 (Snapshot Cleanup) | lastSnapshotCleanup > 168h (每周) |
| 7 | Task 7 (Knowledge Sync) | lastKnowledgeSync > 4h |

### Task 7: Knowledge Sync (每4h或每次 heartbeat)
增量同步 memory/ 日志到 llmwikify 知识库。
```
python ~/.qclaw/skills/hermes-learning/knowledge_sync.py --recent 3
```
- 检查 `heartbeat-state.md` lastKnowledgeSync，距上次 >4h 才执行
- 需要 PYTHONUTF8=1 环境变量

---

## Known Issues & Workarounds
- **llmwikify GBK bug**: 需要 `$env:PYTHONUTF8="1"; $env:PYTHONIOENCODING="utf-8"`
- **subprocess GBK crash**: curl 返回的 UTF-8 中文需要 `encoding='utf-8', errors='replace'`
- **LCM DB path**: `~/.qclaw/memory/lossless/lcm.db`
- **LLM endpoint**: `http://127.0.0.1:28789/v1`, model=`openclaw`
- **Gateway token**: 从 `openclaw.json` 的 `gateway.auth.token` 读取
