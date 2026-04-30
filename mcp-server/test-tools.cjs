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
    const preview = text.substring(0, 150).replace(/\n/g, " ");
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
      } catch { /* skip non-json */ }
    }
  });

  proc.stderr.on("data", (d) => console.error("[MCP]", d.toString().trim()));

  // Initialize
  console.log("\n=== Mercury-Crab MCP Server - Tool Test Suite ===\n");
  console.log("[1/13] Initializing protocol...");
  await send("initialize", {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "test", version: "1.0.0" },
  });

  // Get tool list
  console.log("[2/13] Listing tools...");
  const toolList = await send("tools/list");
  const tools = toolList?.result?.tools || [];
  console.log(`  Found ${tools.length} tools: ${tools.map((t) => t.name).join(", ")}`);
  results.push({ label: "Tool List", status: "PASS", preview: `${tools.length} tools registered` });

  // --- MEMORY TOOLS ---
  console.log("\n--- Memory Tools ---");

  await runTest("memory_list", () => callTool("memory_list"));

  await runTest("memory_read (MEMORY.md)", () => callTool("memory_read", { file: "MEMORY.md" }));

  await runTest("memory_read (2026-04-24.md)", () => callTool("memory_read", { file: "2026-04-24.md" }));

  await runTest("memory_read (nonexistent)", () => callTool("memory_read", { file: "does-not-exist.md" }));

  await runTest("memory_write (append test)", () =>
    callTool("memory_write", {
      file: "test-mcp-entry.md",
      content: "MCP Server test entry - automated test",
    })
  );

  await runTest("memory_write (overwrite test)", () =>
    callTool("memory_write", {
      file: "test-mcp-overwrite.md",
      content: "Original content",
      mode: "overwrite",
    })
  );

  await runTest("memory_search (query: 'QQ')", () => callTool("memory_search", { query: "QQ" }));

  await runTest("memory_search (query: 'llmwikify')", () => callTool("memory_search", { query: "llmwikify" }));

  // --- WIKI TOOLS ---
  console.log("\n--- Wiki Tools ---");

  await runTest("wiki_status", () => callTool("wiki_status"));

  await runTest("wiki_search (query: 'Hermes')", () => callTool("wiki_search", { query: "Hermes" }));

  await runTest("wiki_read (index.md)", () => callTool("wiki_read", { path: "index.md" }));

  await runTest("wiki_write (test page)", () =>
    callTool("wiki_write", {
      path: "projects/mcp-test-page.md",
      content: "# MCP Test Page\n\nCreated by automated MCP tool test.\n\nDate: 2026-04-30\n",
    })
  );

  await runTest("wiki_ingest (single file from raw/)", () =>
    callTool("wiki_ingest", {
      sourcePath: `${WORKSPACE}\\raw\\10-tips-for-using-claude-code-from-the-claude-code-team.md`,
      destPath: "projects/test-ingest",
    })
  );

  // --- HEARTBEAT ---
  console.log("\n--- Heartbeat ---");

  await runTest("heartbeat_check", () => callTool("heartbeat_check"));

  // --- SELF-IMPROVING ---
  console.log("\n--- Self-Improving ---");

  await runTest("correction_log", () =>
    callTool("correction_log", {
      description: "Test correction - agent guessed config instead of reading file",
      correction: "Always read config file before using values",
      context: "MCP automated test",
    })
  );

  await runTest("pattern_scan", () => callTool("pattern_scan"));

  // --- VERIFY WRITE ---
  console.log("\n--- Verification ---");

  await runTest("verify memory_write (read back)", () => callTool("memory_read", { file: "test-mcp-overwrite.md" }));

  await runTest("verify wiki_write (read back)", () => callTool("wiki_read", { path: "projects/mcp-test-page.md" }));

  // --- Summary ---
  console.log("\n=== Test Summary ===\n");
  const pass = results.filter((r) => r.status === "PASS").length;
  const fail = results.filter((r) => r.status === "FAIL").length;
  console.log(`Total: ${results.length} | Passed: ${pass} | Failed: ${fail}\n`);

  for (const r of results) {
    if (r.status === "FAIL") {
      console.log(`  ✗ ${r.label}: ${r.error}`);
    } else {
      console.log(`  ✓ ${r.label}`);
    }
  }

  proc.kill();
  process.exit(fail > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Fatal:", err);
  proc?.kill();
  process.exit(1);
});
