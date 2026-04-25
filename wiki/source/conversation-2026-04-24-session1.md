---
title: "Conversation 2026-04-24 Session1"
type: "Source"
created: "2026-04-24"
sources:
  - "conversation-2026-04-24-session1"
---

## Summary

A ~4-hour session covering four main topics: (1) vibe coding repository imports from GitHub, (2) QQ bot IP whitelist configuration, (3) Feishu bot setup discussion, and (4) discovery of the Hermes Agent framework. The session ended with 3 downloaded repositories extracted to the workspace pending wiki import — though the existing wiki index shows these repos were already imported in a prior session.

## Key Entities & Relations

**Entities:**

- **claude-code-best-practice** (product): GitHub repo, 47.7k stars. Source: GitHub ZIP download.
- **context-engineering-intro** (product): GitHub repo, ~9k stars. Source: GitHub ZIP download.
- **ai-guide** (product): GitHub repo, 12.4k stars. Source: GitHub ZIP download.
- **172.20.43.170** (location): IP address added to QQ bot allowFrom whitelist.
- **222.213.21.3** (location): Public IP geolocated to Sichuan province, used to verify IP context.
- **Feishu** (product): Bot platform discussed for setup guide.
- **Nous Research** (organization): Creator of Hermes Agent framework.
- **Hermes Agent** (product): Open-source AI agent framework with 211 expert roles, compatible with OpenClaw, Claude Code, Cursor.

**Relations:**

- `claude-code-best-practice` → related_to → `OpenClaw`
- `context-engineering-intro` → related_to → `OpenClaw`
- `ai-guide` → related_to → `OpenClaw`
- `Nous Research` → is_a → `Hermes Agent`
- `Hermes Agent` → extends → `OpenClaw`
- `Hermes Agent` → extends → `Claude Code`
- `Hermes Agent` → extends → `Cursor`
- `172.20.43.170` → uses → `QQ Bot`

## Key Claims & Facts

**Claims:**

- claude-code-best-practice repository has 47.7k stars on GitHub (confidence: high)
- context-engineering-intro repository has ~9k stars on GitHub (confidence: high)
- ai-guide repository has 12.4k stars on GitHub (confidence: high)
- IP 172.20.43.170 was added to qqbot allowFrom in openclaw.json (confidence: high)
- Public IP 222.213.21.3 is located in Sichuan (confidence: high)
- Hermes Agent is an open-source AI agent framework with 211 expert roles (confidence: medium — no source URL)
- Hermes Agent is compatible with OpenClaw, Claude Code, and Cursor (confidence: medium — no source URL)

**Facts:**

- Three vibe coding repositories were downloaded via GitHub ZIP: claude-code-best-practice, context-engineering-intro, ai-guide
- QQ bot IP whitelist was updated with 172.20.43.170
- Feishu bot setup guide was provided (app creation, permissions, WebSocket event subscription)
- Nous Research's Hermes Agent was discovered as an AI agent framework
- Session duration: 2026-04-24 07:08–11:19 UTC+8 (~4 hours 11 minutes)

## Contradictions & Gaps

**Contradictions:**

- The source notes that vibe coding repos were "pending import into wiki," but the existing wiki index already contains 115 project pages including claude-code-best-practice and context-engineering-intro pages — the import appears to have already happened.

**Data Gaps:**

- No source URL or GitHub link for Hermes Agent — cannot verify "211 expert roles" claim
- No details on which specific Feishu permissions were configured
- Missing context on why 172.20.43.170 was chosen (internal network IP)
- No information on whether Feishu config was actually implemented or just discussed
- No quality assessment of Hermes Agent beyond initial discovery

## Cross-References

- [[concepts/claude-code-best-practice-readme]]
- [[concepts/context-engineering-intro-readme]]
- [[concepts/ai-guide-readme]]
- [[projects/claude-code-best-practice-best-practice/claude-settings]]
- [[projects/context-engineering-claude-code-full-guide/README]]
- [[entity/hermes-agent]]
- [[entity/nous-research]]
- [[source/qq-bot-config]]
- [[source/feishu-bot-setup]]

## Sources

- [Source: conversation-2026-04-24-session1](conversation-2026-04-24-session1.md) — Session notes 2026-04-24 07:08–11:19 UTC+8
