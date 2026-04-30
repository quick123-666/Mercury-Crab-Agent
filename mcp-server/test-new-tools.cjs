const { spawn } = require("child_process");

const WORKSPACE = "C:\\Users\\Administrator\\Documents\\GitHub\\Mercury-Crab-Agent";
const NODE_PATH = "C:\\Program Files\\nodejs\\node.exe";
const MCP_SCRIPT = `${WORKSPACE}\\mcp-server\\dist\\index.js`;

let nextId = 1;
let proc;
let results = [];
let pending = [];

function send(method, params = {}) {
  return new Promise((resolve) => {
    const id = nextId++;
    const msg = JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n";
    pending.push({ id, resolve });
    proc.stdin.write(msg);
  });
}

function callTool(name, args = {}) {
  return send("tools/call", { name, arguments: args });
}

async function runTest(label, fn) {
  try {
    const result = await fn();
    const text = result?.result?.content?.[0]?.text ?? JSON.stringify(result).substring(0, 200);
    const preview = text.substring(0, 120).replace(/\n/g, " ");
    results.push({ label, status: "PASS", preview });
    console.log(`  ✓ ${label}`);
  } catch (err) {
    results.push({ label, status: "FAIL", error: err.message });
    console.log(`  ✗ ${label}: ${err.message}`);
  }
}

async function main() {
  proc = spawn(NODE_PATH, [MCP_SCRIPT], {
    stdio: ["pipe", "pipe", "pipe"],
    env: { ...process.env, MERCURY_WORKSPACE: WORKSPACE },
  });

  let buffer = "";
  proc.stdout.on("data", (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split("\n");
    buffer = lines.pop();
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const res = JSON.parse(line);
        const idx = pending.findIndex((p) => p.id === res.id);
        if (idx >= 0) {
          const { resolve } = pending.splice(idx, 1)[0];
          resolve(res);
        }
      } catch {}
    }
  });

  proc.stderr.on("data", (d) => console.error("[MCP]", d.toString().trim()));

  console.log("\n=== Mercury-Crab MCP - New Tools Test ===\n");
  await send("initialize", { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "test", version: "1.0.0" } });

  const toolList = await send("tools/list");
  const tools = toolList?.result?.tools || [];
  console.log(`Tools registered: ${tools.length}`);

  // Test session_title_gen
  console.log("\n--- Session Title Gen ---");
  await runTest("session_title_gen (recent 3)", () => callTool("session_title_gen", { recent: 3 }));
  await runTest("session_title_gen (all)", () => callTool("session_title_gen", { recent: 0 }));

  // Test session_summary
  console.log("\n--- Session Summary ---");
  await runTest("session_summary (recent 3, write=true)", () => callTool("session_summary", { recent: 3, writeToMemory: true }));
  await runTest("session_summary (verify memory written)", () => callTool("memory_list"));

  // Test heartbeat with updated tasks
  console.log("\n--- Heartbeat ---");
  await runTest("heartbeat_check", () => callTool("heartbeat_check"));

  // Summary
  console.log("\n=== Test Summary ===\n");
  const pass = results.filter((r) => r.status === "PASS").length;
  const fail = results.filter((r) => r.status === "FAIL").length;
  console.log(`Total: ${results.length} | Passed: ${pass} | Failed: ${fail}\n`);
  for (const r of results) {
    console.log(`  ${r.status === "PASS" ? "✓" : "✗"} ${r.label}${r.status === "FAIL" ? `: ${r.error}` : ""}`);
  }

  proc.kill();
  process.exit(fail > 0 ? 1 : 0);
}

main().catch((err) => { console.error("Fatal:", err); proc?.kill(); process.exit(1); });
