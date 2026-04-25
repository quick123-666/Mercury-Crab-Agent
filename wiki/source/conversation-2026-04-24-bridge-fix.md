# llmwikify Bridge Script Fix

---
title: llmwikify Bridge Script Fix
type: source
created: 2026-04-24
sources: llm_wikify_bridge.py fix record
---

## Summary

Record of a CLI command syntax fix applied to the `llm_wikify_bridge.py` bridge script on 2026-04-24 at 22:56. The `llmwikify ingest` subcommand changed its argument format, causing the bridge wrapper to pass incorrect flags. The fix updated the bridge to use the new positional-path syntax with the `--self-create` flag.

## Key Entities & Relations

### Entities
- **llm_wikify_bridge.py** (product): Bridge script between OpenClaw and llmwikify; wraps CLI commands for status, search, write, and ingest operations.
- **llmwikify** (product): Knowledge base ingest tool used to store and retrieve information via LLM-powered indexing.

### Relations
- llm_wikify_bridge.py → uses → llmwikify (bridge wraps CLI commands)
- llm_wikify_bridge.py → optimizes → llmwikify ingest (fixed command syntax to match new CLI interface)

## Key Claims & Facts

### Claims
- The `llmwikify ingest` command syntax changed from `--source <path> --type <type>` to `<path> [--self-create]` (confidence: high)
- Fix was applied at 2026-04-24 22:56 (confidence: high)

### Facts
- Old ingest syntax: `llmwikify ingest --source <path> --type <type>`
- New ingest syntax: `llmwikify ingest <path> [--self-create]`
- `--source` and `--type` flags were removed; path is now a positional argument
- `--self-create` is a new optional flag that replaces `--type`
- Fix was applied to `llm_wikify_bridge.py` on 2026-04-24 at 22:56

## Contradictions & Gaps

### Data Gaps
- No mention of what triggered the fix (error message, failed test, or manual discovery)
- No mention of whether `--self-create` has different semantics than the old `--type` flag
- No mention of whether other llmwikify subcommands (search, status, write) were also affected by CLI changes
- No mention of verification or testing performed after the fix

## Cross-References

- [[source/conversation-2026-04-24-session2]]
- [[source/conversation-2026-04-24]]

## Sources

- [Source: llmwikify bridge script fix record](raw/llm_wikify_bridge_fix)