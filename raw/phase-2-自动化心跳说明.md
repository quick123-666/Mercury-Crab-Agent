# Phase 2 自动化心跳说明

---

## 心跳任务总览

心跳（Heartbeat）是 OpenClaw 的后台任务机制，每个心跳周期执行 7 个维护任务。

---

## 7 个心跳任务

| # | 任务 | 频率 | 脚本 |
|---|------|------|------|
| 1 | 记忆快照 | 每次 heartbeat | memory_snapshot.py |
| 2 | 会话标题生成 | 每 12h | session_title_generator.py --recent 3 |
| 3 | 会话摘要提取 | 每 8h（非深夜） | session_summarizer.py |
| 4 | Self-Improving 扫描 | 每 6h | 读取 corrections.md，找重复模式 |
| 5 | MEMORY.md 维护 | 每 72h | 对比快照，提议归档旧条目 |
| 6 | 快照清理 | 每周 | memory_snapshot.py --cleanup 7 |
| 7 | 知识库增量同步 | 每 4h | knowledge_sync.py --recent 3 |

---

## 任务详情

### Task 1: Memory Snapshot（每次 heartbeat）

```python
python C:/Users/Administrator/.qclaw/skills/hermes-learning/memory_snapshot.py
```

创建 MEMORY.md 快照，记录当前 hash，用于检测会话间变化。

### Task 2: Session Title Generator（每 12h）

```python
python C:/Users/Administrator/.qclaw/skills/hermes-learning/session_title_generator.py --recent 3
```

为 LCM 无标题会话生成中文标题，每次只处理 3 个避免阻塞。

### Task 3: Session Summary（每 8h，非 0-6 点）

```python
$env:PYTHONUTF8="1"; $env:PYTHONIOENCODING="utf-8"
python C:/Users/Administrator/.qclaw/skills/hermes-learning/session_summarizer.py
```

从 LCM DB 提取有实质内容的会话，生成摘要写入 memory/ 和 wiki。

### Task 4: Self-Improving Scan（每 6h）

读取 C:/Users/Administrator/self-improving/corrections.md：
- ≥3 条同类纠正 → 提议写入 memory.md
- corrections.md >30 条 → 清理已晋升的旧条目

### Task 5: MEMORY.md Maintenance（每 72h）

```python
python memory_snapshot.py --diff
```

比对快照：MEMORY.md >100 行 → 提议归档旧内容到 WARM 层。

### Task 6: Snapshot Cleanup（每周）

```python
python memory_snapshot.py --cleanup 7
```

清理 7 天前的快照文件。

### Task 7: Knowledge Sync（每 4h）

```python
$env:PYTHONUTF8="1"; $env:PYTHONIOENCODING="utf-8"
python knowledge_sync.py --recent 3
```

增量同步 memory/ 日志到 llmwikify（MD5 检测变更）。

---

## 心跳状态文件

路径：C:/Users/Administrator/self-improving/heartbeat-state.md

记录每个任务的最后执行时间，用于判断是否需要执行：

```json
{
  "lastChecks": {
    "snapshot": 1745568000,
    "titleGen": 1745550000,
    "summary": 1745540000,
    "selfImprove": 1745530000,
    "memoryMaint": 1745500000,
    "snapshotCleanup": 1745400000,
    "knowledgeSync": 1745560000
  }
}
```
