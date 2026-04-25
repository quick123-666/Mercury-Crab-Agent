# llm-wikify-bridge-fix-log

---
title: llmwikify Bridge Ingest Command Fix
created: 2026-04-24
type: source
sources: llm_wikify_bridge.py fix record
---

## Summary

On 2026-04-24 at 22:56, the `llm_wikify_bridge.py` script was patched to correct the `llmwikify ingest` command syntax. The upstream CLI had changed from a flag-based interface (`--source`/`--type`) to a positional-path interface with an optional `--self-create` flag. This page documents the change and its context.

## Before / After

| Aspect | Before (broken) | After (fixed) |
|--------|----------------|---------------|
| Command | `llmwikify ingest --source <path> --type <type>` | `llmwikify ingest <path> [--self-create]` |
| Path argument | Passed via `--source` flag | Positional argument |
| Type handling | Passed via `--type` flag | Replaced by `--self-create` flag |

## Context

- **Script**: `llm_wikify_bridge.py` — bridges OpenClaw agent to llmwikify CLI
- **Tool**: [[source/conversation-2026-04-24-bridge-fix]] — source summary page
- **Related sessions**: [[source/conversation-2026-04-24-session2]], [[source/conversation-2026-04-24]]

## Open Questions

1. What error did the old syntax produce?
2. Does `--self-create` have different semantics than `--type`?
3. Were other subcommands (search, status, write) also affected?
4. Was the fix verified with a test ingest?

## Sources

- [Source: llmwikify bridge script fix record](raw/llm_wikify_bridge_fix)