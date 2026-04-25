## 任务背景
用户询问本地 llmwikify 是否能允许其他 QClaw Agent（龙虾）接入共享使用。
## 执行过程
1. 定位 llmwikify 目录：~/.qclaw/workspace/；
2. 分析配置文件 `.wiki-config.yaml`，确认 LLM 指向本地 127.0.0.1:28789；
3. 识别 llmwikify 内置 MCP Server 能力，支持 HTTP/SSE/STDIO 三种传输协议；
4. 整理三个可行方案并推荐 MCP Server 模式。
## 关键结果
- llmwikify 已有 `serve` 命令，支持多客户端接入（自带认证）；
- 推荐命令：`py -m llmwikify serve --web --host 0.0.0.0 --port 8766 --auth-token 你的密钥`；
- 其他龙虾在配置中添加该 MCP endpoint 即可接入；
- 方案二（共享数据库文件）存在并发写入冲突风险，不推荐；
- 产物文件：task-summary_20260424-2055.md 已生成。
## 结论建议
MCP Server 方案可行且安全，建议配置 auth-token 后启动服务。如需可进一步协助编写开机自启脚本或配置防火墙规则。