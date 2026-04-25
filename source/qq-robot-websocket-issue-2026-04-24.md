---
title: "QQ机器人WebSocket连接问题排查"
type: Source
---

# QQ机器人WebSocket连接问题排查

## Summary

本文档记录了2026年4月24日关于QQ机器人WebSocket连接失败(错误1006)的问题排查过程，涉及定时任务配置、IP白名单配置不一致、账号配置错误等多个相关问题。

## Key Entities & Relations

### Entities

- **1903889907** (product): QQ开放平台应用ID，服务器公网IP为223.113.240.6
- **1903890610** (product): 用户提到的QQ应用ID（与实际配置不符）
- **223.113.240.6** (location): 服务器公网IP地址
- **222.213.21.3** (location): AI实际公网IP地址
- **news-summary** (product): 技名，用于每8:00自动抓取AI科技热点
- **飞书** (organization): 平台，用户询问接入方式
- **QQ机器人** (product): 消息平台机器人，状态为WebSocket连接失败(1006错误)

### Relations

- QQ机器人 → uses → 1903889907 (机器人使用该appId进行连接)
- news-summary技名 → implements → 定时任务 (用于每8:00自动抓取资讯)
- 用户 → wants_to_integrate → 飞书 (用户询问如何接入飞书平台)
- 1903889907 → contradicts → 1903890610 (实际配置账号与用户提到的账号不一致)

## Key Claims & Facts

### Claims

- QQ机器人WebSocket连接失败，错误码1006 (confidence: high)
- 可能原因：QQ开放平台后台未完成配置（审核未通过/未上线/未开通消息能力/未添加IP白名单） (confidence: medium)
- 配置的QQ账号是1903889907而非用户提到的1903890610 (confidence: high)
- 当前白名单使用*通配符覆盖 (confidence: high)
- AI公网IP为222.213.21.3 (confidence: high)

### Facts

- 用户希望实现对话自动保存到知识库
- 每8:00定时任务使用news-summary技名抓取AI科技热点资讯
- WebSocket连接失败错误码1006
- appId为1903889907，服务器公网IP为223.113.240.6
- 存在账号配置不一致问题：实际1903889907 vs 用户提到1903890610
- 白名单已用*通配符覆盖
- 用户询问飞书接入方式

## Contradictions & Gaps

### Contradictions

- 用户提到的QQ账号1903890610与实际配置的1903889907不一致
- AI实际公网IP为222.213.21.3，但白名单配置IP为223.113.240.6，存在差异

### Data Gaps

- 对话自动保存到知识库功能的实现状态未知
- 飞书接入的具体需求和方案未明确
- 白名单配置问题的最终解决状态未知
- 定时任务是否成功创建并运行未知

## Cross-References

- [[source\conversation-2026-04-24-session1]]
- [[source\conversation-2026-04-24]]

## Sources

- [Source: Document Analysis](conversation-2026-04-24-analysis)