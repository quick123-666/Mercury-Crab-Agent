---
title: QQ Robot Configuration Troubleshooting
type: Issue
created: 2026-04-24
sources:
  - [Source: conversation-2026-04-24](source/conversation-2026-04-24)
  - [Source: conversation-2026-04-24-session1](source/conversation-2026-04-24-session1)
---

# QQ Robot Configuration Troubleshooting

## Summary

This page documents the WebSocket connection issue encountered with the QQ Robot integration, including the 1006 error code and the root cause analysis related to IP whitelist configuration and account mismatch.

## Key Entities & Relations

### Entities

- **1903889907** (product): QQ Open Platform Application ID used in actual configuration
- **1903890610** (product): Application ID mentioned by user (does not match actual configuration)
- **223.113.240.6** (location): Server public IP address configured in QQ Open Platform
- **222.213.21.3** (location): Actual public IP address of the AI service
- **QQ Robot** (product): Message platform bot experiencing WebSocket connection failures

### Relations

- QQ Robot → uses → 1903889907
- 1903889907 → contradicts → 1903890610 (configuration mismatch)

## Key Claims & Facts

### Claims

- QQ Robot WebSocket connection failed with error code 1006 (confidence: high)
- Root cause: QQ Open Platform backend configuration incomplete (confidence: medium)
- Configured QQ account is 1903889907, not the 1903890610 mentioned by user (confidence: high)
- Current whitelist uses wildcard (*) to cover all IPs (confidence: high)
- AI public IP is 222.213.21.3 (confidence: high)

### Key Facts

- WebSocket connection error 1006 occurred at 18:04
- Server public IP in configuration: 223.113.240.6
- Actual AI service IP: 222.213.21.3 (IP mismatch exists)
- Possible causes include: pending review, not yet online, messaging capability not enabled, or IP whitelist not configured

## Contradictions & Gaps

### Contradictions

- User mentioned QQ account 1903890610, but actual configuration uses 1903889907
- AI actual public IP is 222.213.21.3, but whitelist configuration shows 223.113.240.6

### Data Gaps

- Final resolution status of the whitelist configuration issue is unknown

## Cross-References

- [[source\conversation-2026-04-24]]
- [[source\conversation-2026-04-24-session1]]
- [[Scheduled Task - news-summary]] (related automation task)
- [[IP Whitelist Configuration]] (related configuration page)

## Sources

- [Source: conversation-2026-04-24](source/conversation-2026-04-24)
- [Source: conversation-2026-04-24-session1](source/conversation-2026-04-24-session1)
