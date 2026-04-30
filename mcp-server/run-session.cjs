const { spawnSync } = require("child_process");
const { randomBytes } = require("crypto");
const { DatabaseSync } = require("node:sqlite");
const path = require("path");
const os = require("os");
const fs = require("fs");

const WORKSPACE = process.env.MERCURY_WORKSPACE || process.cwd();
const DB_PATH = path.join(os.homedir(), ".local", "share", "opencode", "opencode.db");

const TOOL_NAME = process.argv[2];
if (!TOOL_NAME) {
  console.error("Usage: node run-session.cjs <tool-name> [args...]");
  process.exit(1);
}

function generateID(prefix, length = 22) {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = prefix;
  const buf = randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += chars[buf[i] % chars.length];
  }
  return result;
}

function generateSlug() {
  const words = ["swift", "eager", "calm", "bold", "keen", "wise", "bright", "sharp", "quick", "noble", "crab", "mercury"];
  const a = words[Math.floor(Math.random() * words.length)];
  const b = words[Math.floor(Math.random() * words.length)];
  return `${a}-${b}`;
}

// Run the tool
console.log(`Running tool: ${TOOL_NAME}...`);
const toolArgs = process.argv.slice(3);
const result = spawnSync("node", [
  path.join(WORKSPACE, "mcp-server", "run-tool.cjs"),
  TOOL_NAME,
  ...toolArgs,
], {
  cwd: WORKSPACE,
  env: { ...process.env, MERCURY_WORKSPACE: WORKSPACE },
  encoding: "utf-8",
  timeout: 120000,
});

const toolOutput = (result.stdout || "").trim();
const toolError = (result.stderr || "").trim();
const exitCode = result.status ?? 1;

const outputText = toolOutput || (toolError ? `Error: ${toolError}` : "No output");
const status = exitCode === 0 ? "completed" : "failed";
const now = Date.now();

console.log(`Tool exited with code ${exitCode}`);

// Write to opencode DB
if (!fs.existsSync(DB_PATH)) {
  console.error(`Database not found: ${DB_PATH}`);
  console.log(outputText);
  process.exit(exitCode);
}

const db = new DatabaseSync(DB_PATH, { create: false });

// Get project
const project = db.prepare("SELECT id FROM project WHERE worktree = ?").get(WORKSPACE);
if (!project) {
  console.error(`Project not found for ${WORKSPACE}`);
  process.exit(1);
}

const sessionID = generateID("ses_");
const slug = generateSlug();
const userMsgID = generateID("msg_");
const assistantMsgID = generateID("msg_");
const userPartID = generateID("prt_");
const assistantPartID = generateID("prt_");

// Insert session
db.prepare(`
  INSERT INTO session (id, project_id, parent_id, slug, directory, title, version, permission, time_created, time_updated)
  VALUES (?, ?, NULL, ?, ?, ?, '1.14.30', ?, ?, ?)
`).run(
  sessionID,
  project.id,
  slug,
  WORKSPACE,
  `MercuryCrab: ${TOOL_NAME}`,
  JSON.stringify([
    { permission: "question", pattern: "*", action: "deny" },
    { permission: "plan_enter", pattern: "*", action: "deny" },
    { permission: "plan_exit", pattern: "*", action: "deny" },
  ]),
  now,
  now
);

// Insert user message
db.prepare(`
  INSERT INTO message (id, session_id, time_created, time_updated, data)
  VALUES (?, ?, ?, ?, ?)
`).run(
  userMsgID,
  sessionID,
  now,
  now,
  JSON.stringify({
    role: "user",
    time: { created: now },
    agent: "build",
    model: { providerID: "mercury_crab", modelID: TOOL_NAME },
  })
);

// Insert user message part (the tool invocation)
db.prepare(`
  INSERT INTO part (id, message_id, session_id, time_created, time_updated, data)
  VALUES (?, ?, ?, ?, ?, ?)
`).run(
  userPartID,
  userMsgID,
  sessionID,
  now,
  now,
  JSON.stringify({
    type: "text",
    text: `执行工具: ${TOOL_NAME}\n参数: ${JSON.stringify(toolArgs)}`,
  })
);

// Insert assistant message
db.prepare(`
  INSERT INTO message (id, session_id, time_created, time_updated, data)
  VALUES (?, ?, ?, ?, ?)
`).run(
  assistantMsgID,
  sessionID,
  now + 100,
  now + 100,
  JSON.stringify({
    parentID: userMsgID,
    role: "assistant",
    mode: "build",
    agent: "build",
    path: { cwd: WORKSPACE, root: WORKSPACE },
    cost: 0,
    tokens: { input: 0, output: 0, reasoning: 0, cache: { read: 0, write: 0 } },
    modelID: TOOL_NAME,
    providerID: "mercury_crab",
    time: { created: now + 100, completed: now + 200 },
    finish: "stop",
  })
);

// Insert assistant message part (the tool output)
db.prepare(`
  INSERT INTO part (id, message_id, session_id, time_created, time_updated, data)
  VALUES (?, ?, ?, ?, ?, ?)
`).run(
  assistantPartID,
  assistantMsgID,
  sessionID,
  now + 100,
  now + 100,
  JSON.stringify({
    type: "text",
    text: outputText,
  })
);

db.close();

console.log(`Session created: ${sessionID}`);
console.log(outputText);

process.exit(exitCode);
