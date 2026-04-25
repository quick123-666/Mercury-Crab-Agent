# Bridge脚本修复测试

## 修复记录

llm_wikify_bridge.py 修复了 ingest 命令语法：
- 旧：llmwikify ingest --source <path> --type <type>
- 新：llmwikify ingest <path> [--self-create]

修复时间：2026-04-24 22:56
