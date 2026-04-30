@echo off
set MERCURY_WORKSPACE=C:\Users\Administrator\Documents\GitHub\Mercury-Crab-Agent
set PATH=C:\Program Files\nodejs;%PATH%
node "%MERCURY_WORKSPACE%\mcp-server\run-session.cjs" %*
