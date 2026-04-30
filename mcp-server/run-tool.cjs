const { spawn } = require("child_process");

const WORKSPACE = process.env.MERCURY_WORKSPACE || process.cwd();
const NODE_PATH = process.execPath;
const MCP_SCRIPT = `${WORKSPACE}\\mcp-server\\dist\\index.js`;

const TOOL_NAME = process.argv[2];
if (!TOOL_NAME) {
  console.error("Usage: node run-tool.cjs <tool-name> [args...]");
  console.error("  Available tools: heartbeat_check, session_title_gen, session_summary, pattern_scan, wiki_status, memory_list");
  process.exit(1);
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      const key = argv[i].slice(2);
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith("--")) {
        args[key] = isNaN(next) ? next : Number(next);
        i++;
      } else {
        args[key] = true;
      }
    }
  }
  return args;
}

const toolArgs = parseArgs(process.argv.slice(3));

const proc = spawn(NODE_PATH, [MCP_SCRIPT], {
  stdio: ["pipe", "pipe", "pipe"],
  env: { ...process.env, MERCURY_WORKSPACE: WORKSPACE },
});

let buffer = "";
let initSent = false;
let resolved = false;

function processOutput() {
  const lines = buffer.split("\n");
  buffer = lines.pop();
  for (const line of lines) {
    if (!line.trim() || resolved) continue;
    try {
      const res = JSON.parse(line);
      if (res.id === 1 && !initSent) {
        initSent = true;
        proc.stdin.write(JSON.stringify({
          jsonrpc: "2.0",
          id: 2,
          method: "tools/call",
          params: { name: TOOL_NAME, arguments: toolArgs },
        }) + "\n");
      } else if (res.id === 2) {
        resolved = true;
        const text = res?.result?.content?.[0]?.text || JSON.stringify(res.result);
        console.log(text);
        proc.stdin.end();
        proc.kill();
      }
    } catch {}
  }
}

proc.stdout.on("data", (chunk) => {
  buffer += chunk.toString();
  processOutput();
});

proc.stderr.on("data", (d) => process.stderr.write(d));

proc.on("error", (err) => {
  console.error(`Failed: ${err.message}`);
  process.exit(1);
});

proc.on("exit", () => {
  process.exit(resolved ? 0 : 1);
});

proc.stdin.write(JSON.stringify({
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "task-runner", version: "1.0.0" } },
}) + "\n");

setTimeout(() => {
  if (!resolved) {
    console.error("Timeout 60s");
    proc.kill();
    process.exit(1);
  }
}, 60000);
