## 任务背景
用户要求为 hermes-learning skill 生成改进建议，基于 SKILL.md 片段、6个未文档化脚本、3条相关纠正记录进行分析。

## 执行过程
1. 分析SKILL.md与实际脚本/纠正的差距
2. 验证llm_wikify_bridge.py实际CLI语法
3. 生成7项改进建议和5项注意事项
4. 写入artifact文件

## 关键结果
- 3个high级改进：补全6个缺失脚本文档、新增环境约束硬规则节、修正LLM配置歧义
- 3个medium级：心跳任务映射补全(4→7)、skill_evolver纳入核心流程、openclaw_config基础设施标注
- 1个low级：session_lineage调试工具标注
- 新增5项注意事项：编码前置标注、CLI语法统一、纠正晋升、--apply安全约束、状态文件路径
- Artifact: `task-summary_hermes-learning-evolution_2026-07-11.md`

## 结论建议
整体优先级high，3项high级改进直接关联已发生3次的错误模式（端点猜错、GBK编码、CLI语法），不固化则历史重演。建议优先补全脚本文档和环境约束节。