# session-summary-2026-04-24-2318

# session-summary-2026-04-24-2318

【LLM 不可用，降级为原文摘要】

[2026-04-24 08:26:51] assistant: 根据日志分析，**当前机器人实际上是正常运行的** — 我能看到消息正在正常收发（"666"、"安装 llmwikify"、"1006怎么办" 都在被处理）。  **1006 是什么意思：** QQ 开放平台 WebSocket 错误码 1006 = **连接异常断开**（abnormal closure），通常原因：  1. **网络不稳定** — 路由器/防火墙断了一下 2. **长连接超时** — 空闲太久被 QQ 服务器主动断开 3. **IP 被限制** — 频繁请求被 QQ 风控 4. **Token 失效** — 机器人 AppID 的 access_token 过期 5. **服务器重启** — QQ 平台侧维护  **现在的状态：** - ✅ Gateway：运行正常（RP
[2026-04-24 08:34:20] user: System: [2026-04-24 16:24:38 GMT+8] Exec completed (calm-sum, code 0) :: 9 Dashboard: http://127.0.0.1:28789/ Probe note: Loopback-only gateway; only local clients can connect. Runtime: un