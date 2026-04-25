---
title: QQ Bot IP Whitelist Configuration
type: Source
created: 2026-04-24
sources: [conversation-2026-04-24-session2]
---

## Summary

Configuration details for QQ bot IP whitelist management in OpenClaw. During the session, IP 172.20.43.170 was added to the allowFrom whitelist in openclaw.json.

## Configuration Details

### IP Addresses

| IP Address | Type | Purpose | Status |
|------------|------|---------|--------|
| 172.20.43.170 | Internal | Added to qqbot allowFrom | Active |
| 222.213.21.3 | Public | Confirmed public IP (Sichuan) | Verified |

### Configuration Location

- File: `openclaw.json`
- Setting: `qqbot.allowFrom`

## Key Facts

- IP 172.20.43.170 is an internal network IP address
- Public facing IP confirmed as 222.213.21.3 located in Sichuan province
- The IP was added to whitelist for QQ bot access control

## Related Pages

- [[source/conversation-2026-04-24-session2]] - Session context

## Notes

The use of internal IP 172.20.43.170 for the whitelist is unusual as QQ bot access typically requires public IP addresses for external access. The public IP 222.213.21.3 (Sichuan) was confirmed separately. This may indicate the bot is accessed through a VPN or tunnel configuration.
