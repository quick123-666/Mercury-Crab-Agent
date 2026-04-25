# Phase 3 进阶模块说明

---

## Phase 3.1：动态工具注册

**状态**: ✅ 完成

**功能**：将所有已安装但未在 openclaw.json 注册的 skill 添加到配置。

**问题**：openclaw.json 的 skills.entries 只接受 {"enabled: bool} 格式，
**不能加 path 字段**，否则 Gateway 重启失败。

**操作**：
- 扫描 ~/.qclaw/skills/ 下所有 skill
- 对比 openclaw.json 中的 entries
- 添加缺失的 skill（只写 {"enabled": true/false}）
- 重启 Gateway

**成果**：20个未注册 skill 全部添加，54个 skill 全部在线。

---

## Phase 3.2：会话族谱可视化

**脚本**：session_lineage.py

**功能**：追踪 LCM 摘要的父子关系，生成压缩族谱树。

```powershell
$env:PYTHONUTF8="1"; $env:PYTHONIOENCODING="utf-8"
python session_lineage.py              # 文本树
python session_lineage.py --json       # JSON 输出
python session_lineage.py --conv 42    # 只看某个会话
python session_lineage.py --stats      # 统计信息
```

**关键发现**：
- summary_parents 表的方向是 **leaf→condensed**（多个叶子汇聚一个压缩节点）
- 一个 condensed 节点可以有多个 parent（多个叶子合并的结果）

**输出示例**：
```
会话族谱:
  conv_12 (3棵子树, 2个独立叶子)
  ├── condensed_sum_5
  │   ├── sum_1 → sum_3 → [sum_5]
  │   └── sum_2 → sum_4 → [sum_5]
  └── sum_6 (独立)
```

---

## Phase 3.3：技能自进化

**脚本**：skill_evolver.py

**功能**：根据 corrections.md 中的使用反馈，自动修改 SKILL.md。

```powershell
python skill_evolver.py --dry-run                    # 只分析，不写入
python skill_evolver.py --apply --skill hermes-learning  # 应用改进
python skill_evolver.py --list                        # 列出所有 skill
```

**进化流程**：
1. 扫描 corrections.md，匹配 skill 相关纠正
2. 检测 SKILL.md 质量问题（缺触发条件/注意事项/脚本引用）
3. 调用 LLM 生成改进建议
4. 写入 evolution-log.md 审计日志
5. --apply 时自动更新对应 SKILL.md

---

## Phase 3.4：纠错蒸馏管道

**脚本**：corrections_distiller.py

**功能**：将 corrections.md 中的纠正规则自动写入 llmwikify wiki。

```powershell
$env:PYTHONUTF8="1"; $env:PYTHONIOENCODING="utf-8"
python corrections_distiller.py
```

**流程**：
1. 读取 ~/self-improving/corrections.md
2. 读取 ~/self-improving/memory.md
3. 对每个条目：去重检查 → 生成 wiki 格式 → 写入 .llmwikify/raw/
4. 类型标签：教训（来自 corrections）/ 规范（来自 memory.md）
5. 执行 llmwikify build-index
6. 幂等：通过 .distill-state.json 跳过已处理条目

**成果**：13条规则已蒸馏写入 wiki。

---

## step-guard Skill（步数守卫）

路径：C:/Users/Administrator/.qclaw/skills/step-guard/

**功能**：防止长时间连续工具调用导致上下文膨胀。

**阈值**：
- 连续 ≥5 个工具调用 → 暂停，等用户确认
- 单次会话 ≥3 个文件修改 → 暂停，等用户确认

**用途**：给用户留出确认/调整方向的机会，避免 AI 盲目执行。
