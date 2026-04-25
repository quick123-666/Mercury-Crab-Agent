---
title: IP Whitelist Configuration
type: Configuration
created: 2026-04-24
sources:
  - [Source: conversation-2026-04-24](source/conversation-2026-04-24)
  - [Source: conversation-2026-04-24-session1](source/conversation-2026-04-24-session1)
---

# IP Whitelist Configuration

## Summary

Records of IP whitelist configuration status and issues encountered during QQ Robot setup, including IP mismatches and wildcard configuration.

## Key Entities & Relations

### Entities

- **223.113.240.6** (location): Server public IP configured in whitelist
- **222.213.21.3** (location): Actual public IP of the AI service

### Relations

- 223.113.240.6 → contradicts → 222.213.21.3 (IP mismatch)

## Key Claims & Facts

### Claims

- Current whitelist uses wildcard (*) to cover all IPs (confidence: high)
- AI public IP is 222.213.21.3 (confidence: high)

### Key Facts

- Configured server IP: 223.113.240.6
- Actual AI service IP: 222.213.21.3
- Whitelist currently set to wildcard (*) to allow all IPs

## Contradictions & Gaps

### Contradictions

- AI actual public IP is 222.213.21.3, but whitelist configuration shows 223.113.240.6

### Data Gaps

- Final resolution status of the whitelist configuration issue is unknown

## Cross-References

- [[source\conversation-2026-04-24]]
- [[source\conversation-2026-04-24-session1]]
- [[QQ Robot Configuration Troubleshooting]] (related issue page)

## Sources

- [Source: conversation-2026-04-24](source/conversation-2026-04-24)
- [Source: conversation-2026-04-24-session1](source/conversation-2026-04-24-session1)
