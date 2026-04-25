# Phase 1 核心模块说明

---

## 模块总览

Phase 1 构建了 hermes-learning skill 的核心组件，共 8 个脚本 + 1 个 SKILL.md。

---

## llm_wikify_bridge.py

**功能**：桥接 llmwikify CLI，提供统一 Python 接口。

```python
from llm_wikify_bridge import LlmWikifyBridge

lb = LlmWikifyBridge()
lb.write_learning("标题", "内容")      # 写知识库页面
results = lb.search("查询关键词")       # 搜索
lb.ingest_batch("path/to/files")        # 批量导入
lb.build_index()                        # 重建索引
status = lb.status()                    # 状态查询
```

**CLI 用法**：
```powershell
$env:PYTHONUTF8="1"; $env:PYTHONIOENCODING="utf-8"
python llm_wikify_bridge.py ingest <file>
python llm_wikify_bridge.py search "关键词"
```

**已知问题**：
- 直接 python -m llmwikify 在 Python 3.13 上可能 OSError 10106，用 subprocess 绕过
- --self-create 参数会导致 LLM API 超时，批量导入时不加此参数

---

## session_summarizer.py

**功能**：compaction 前自动提取会话关键决策，写入 memory/ 日志和 wiki。

```powershell
$env:PYTHONUTF8="1"; $env:PYTHONIOENCODING="utf-8"
python session_summarizer.py
```

**流程**：
1. 从 LCM DB 拉最新有实质内容的会话
2. 调用 Gateway LLM 提取关键决策/技术结论
3. 追加到 memory/YYYY-MM-DD.md
4. ingest 到 llmwikify 知识库

**已知 bug 已修复**：
- Windows 控制台 GBK 编码无法打印 emoji → sys.stdout TextIOWrapper 修复
- SQLite WHERE 子句必须在 GROUP BY 之前
- urllib Request 对象只能使用一次（每次创建新对象）

---

## session_title_generator.py

**功能**：为 LCM 无标题会话自动生成中文标题。

```powershell
$env:PYTHONUTF8="1"; $env:PYTHONIOENCODING="utf-8"
python session_title_generator.py --recent 3   # 处理最近3个
python session_title_generator.py --all         # 处理全部
```

**流程**：
1. 从 LCM DB 查询 title IS NULL 的会话
2. 读取前几条消息内容
3. 调用 LLM 生成中文标题（8字以内）
4. 更新 conversations.title 字段

---

## skill_auto_creator.py

**功能**：分析工具调用序列，生成标准 SKILL.md 模板。

```python
from skill_auto_creator import SkillAutoCreator
sc = SkillAutoCreator()
sc.analyze_and_create(name="我的技能", tool_sequence=[...], context="...")
```

输出文件：~/self-improving/projects/{name}.md

---

## openclaw_config.py

**功能**：读取 openclaw.json 配置，供其他脚本统一调用。

```python
from openclaw_config import get_llm_endpoint, get_gateway_token

endpoint, model, token = get_llm_endpoint()
# → ("http://127.0.0.1:28789/v1", "openclaw", "token...")

token = get_gateway_token()
```

---

## SKILL.md（核心定义文件）

路径：hermes-learning/SKILL.md

**触发条件**：
- 用户纠正（关键词：不对/错了/应该是/不是这样）
- 用户偏好（关键词：我喜欢/以后都这样/别再/记住）
- 任务完成后自我反思
- 心跳周期检查
- 用户明确说"学习"/"记住"/"反思"

**核心流程**：
1. 捕获（Capture）→ corrections.md / memory.md
2. 提炼（Distill）→ 规则晋升 / 技能生成
3. 沉淀（Persist）→ HOT/WARM/COLD 三层
4. 反哺（Feedback）→ 启动加载 / 搜索查询

---

## corrections_distiller.py

**功能**：将 corrections.md 中的纠正规则自动蒸馏写入 wiki。

```powershell
$env:PYTHONUTF8="1"; $env:PYTHONIOENCODING="utf-8"
python corrections_distiller.py
```

**流程**：
1. 读取 ~/self-improving/corrections.md
2. 读取 ~/self-improving/memory.md
3. 去重后写入 .llmwikify/raw/（类型标签：教训/规范）
4. 执行 llmwikify build-index
5. 幂等运行（通过 .distill-state.json 记录已处理条目）
