# 规范: llmwikify ingest 在 Chinese Windows 上因 pathlib 默认 G

**来源**: memory
**日期**: 2026-04-25

## 正确做法
llmwikify ingest 在 Chinese Windows 上因 pathlib 默认 GBK 编码会失败，需 PYTHONUTF8=1 或预转 UTF-8-BOM

## 应用场景
适用于写作、代码生成、系统配置等场景。
