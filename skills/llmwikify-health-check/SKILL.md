# llmwikify 健康检查技能

汇报当前状态，避免长任务中途被终止导致丢失进度。

## 汇报内容

执行以下检查并汇报结果：

```
1. llmwikify status
2. wiki 目录结构
3. .wiki-config.yaml 当前配置
4. raw/ 待导入文件数量
5. QClaw LLM 代理连通性
```

## 执行

```powershell
# 1. Wiki 状态
$env:PYTHONIOENCODING="utf-8"
python -m llmwikify status

# 2. Wiki 结构
Get-ChildItem wiki/ -Recurse -File | Measure-Object | Select Count
Get-ChildItem raw/ -Recurse -File -ErrorAction SilentlyContinue | Measure-Object | Select Count

# 3. 配置文件
Test-Path .wiki-config.yaml
Test-Path .llmwikify.db

# 4. LLM 代理测试
python -c "[import urllib.request,urllib.parse,json; r=urllib.request.Request('http://127.0.0.1:28789/v1/chat/completions',data=json.dumps({'messages':[{'role':'user','content':'hi'}],'max_tokens':5}).encode(),headers={'Content-Type':'application/json','Authorization':'Bearer 62eb2f11a0b0fda249189109332b0276766e70f6f5f2e526'}); print(urllib.request.urlopen(r,timeout=5).read().decode())]" 2>&1

# 5. 待导入项目
Get-ChildItem . -Directory | Where-Object { $_.Name -match "Vibe|claude|ai-guide" } | Select Name, @{N='Files';E={@(Get-ChildItem $_.FullName -Recurse -File).Count}}
```

## 判断标准

| 检查项 | 正常状态 |
|--------|---------|
| wiki 页面数 | ≥100 |
| raw 文件数 | >0 表示有待导入 |
| .wiki-config.yaml | 存在且 enabled=true |
| LLM 代理 | 返回 200 或 401，不超时 |

## 汇报格式

```
📊 llmwikify 健康检查 — 2026-04-24

✅ Wiki: 121 页 | 0 Sources | 123 索引
⚠️ raw/: 无文件（待创建）
✅ .wiki-config.yaml: 已配置 LLM
❌ LLM 代理: timeout（需修复）
📁 项目: ai-guide-main (72 文件) | claude-code-best-practice (待导入)
```

如果任何检查失败，在继续导入前报告并等待确认。