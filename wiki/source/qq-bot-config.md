---
title: "QQ Bot IP Whitelist Configuration"
type: "Source"
created: "2026-04-24"
sources:
  - "conversation-2026-04-24-session1"
---

## Summary

QQ bot IP whitelist configuration session: internal IP `172.20.43.170` was added to the `allowFrom` field in OpenClaw's `openclaw.json`. Public IP `222.213.21.3` (Sichuan) was identified and noted for reference.

## Key Entities & Relations

**Entities:**

- **172.20.43.170** (location): Internal IP address added to qqbot allowFrom whitelist in openclaw.json
- **222.213.21.3** (location): Public IP address geolocated to Sichuan province, used as reference context

**Relations:**

- `172.20.43.170` → uses → `QQ Bot` (added to allowFrom)
- `222.213.21.3` → located_in → `Sichuan`

## Key Claims & Facts

**Claims:**

- IP 172.20.43.170 was added to qqbot allowFrom in openclaw.json (confidence: high)
- Public IP 222.213.21.3 is located in Sichuan (confidence: high)

**Facts:**

- The whitelist update was applied to openclaw.json
- 222.213.21.3 is a Sichuan-based public IP, noted as context for understanding the network environment

## Data Gaps

- No documentation on why 172.20.43.170 was specifically chosen (internal RFC-1918 address)
- No details on whether other IPs were considered or removed
- No information on whether the QQ bot was restarted/reloaded after config change

## Cross-References

- [[about-openclaw]] — OpenClaw hosts the qqbot plugin with allowFrom configuration

## Sources

- [Source: conversation-2026-04-24-session1](source/conversation-2026-04-24-session1.md) — Session notes 2026-04-24
