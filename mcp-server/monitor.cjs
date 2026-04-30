const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { execSync } = require("child_process");

const PORT = process.env.MONITOR_PORT || 8787;
const WORKSPACE = process.env.MERCURY_WORKSPACE || process.cwd();
const MEMORY_DIR = path.join(WORKSPACE, "memory");
const WIKI_DIR = path.join(WORKSPACE, "wiki");
const RAW_DIR = path.join(WORKSPACE, "raw");
const SESSIONS_DIR = path.join(WORKSPACE, "sessions");
const SELF_IMPROVING_DIR = path.join(os.homedir(), "self-improving");

// Cache for data
let lastFetch = 0;
let cachedData = null;

function countFiles(dir, ext = ".md") {
  if (!fs.existsSync(dir)) return { count: 0, size: 0 };
  let count = 0;
  let size = 0;
  const files = [];
  function walk(d, prefix = "") {
    if (!fs.existsSync(d)) return;
    for (const entry of fs.readdirSync(d)) {
      const full = path.join(d, entry);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) walk(full, path.join(prefix, entry));
      else if (entry.endsWith(ext)) {
        count++;
        size += stat.size;
        files.push({ name: path.join(prefix, entry), size: stat.size, mtime: stat.mtimeMs });
      }
    }
  }
  walk(dir);
  files.sort((a, b) => b.mtime - a.mtime);
  return { count, size, files: files.slice(0, 10) };
}

function getTasks() {
  try {
    const names = [
      "KnowledgeSync", "SessionSummary", "SelfImprovingScan",
      "SessionTitleGen", "MemoryMaintenance", "SnapshotCleanup",
    ];
    const tasks = [];
    for (const name of names) {
      try {
        const out = execSync(
          `cmd /c "chcp 437 >nul && schtasks /query /FO CSV /TN "\\MercuryCrab_${name}""`,
          { encoding: "utf-8", timeout: 3000, maxBuffer: 4096 }
        );
        const lines = out.trim().split("\r\n");
        if (lines.length >= 2) {
          const vals = parseCSVLine(lines[1]);
          tasks.push({
            name: "MercuryCrab_" + name,
            state: vals[2] || "Unknown",
            nextRun: vals[1] || "Scheduled",
            lastRun: "N/A",
            result: "N/A",
          });
        }
      } catch { /* skip */ }
    }
    return tasks;
  } catch {
    return [];
  }
}

function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

function getCorrections() {
  const filePath = path.join(SELF_IMPROVING_DIR, "corrections.md");
  if (!fs.existsSync(filePath)) return { count: 0 };
  const content = fs.readFileSync(filePath, "utf-8");
  const count = (content.match(/^## /gm) || []).length;
  return { count };
}

function fetchAll() {
  const memoryStats = countFiles(MEMORY_DIR);
  const wikiStats = countFiles(WIKI_DIR);
  const rawCount = fs.existsSync(RAW_DIR) ? fs.readdirSync(RAW_DIR).length : 0;
  const sessionStats = countFiles(SESSIONS_DIR, ".md");
  const corrections = getCorrections();

  let tasks = [];
  try {
    tasks = getTasks();
  } catch {}

  return {
    memory: {
      files: memoryStats.count,
      sizeMB: (memoryStats.size / (1024 * 1024)).toFixed(2),
      recent: memoryStats.files.map((f) => ({
        name: f.name,
        sizeKB: (f.size / 1024).toFixed(1),
        date: new Date(f.mtime).toISOString().substring(0, 10),
      })),
    },
    wiki: {
      pages: wikiStats.count,
      rawPending: rawCount,
    },
    sessions: {
      summaries: sessionStats.count,
      dirs: fs.existsSync(SESSIONS_DIR) ? fs.readdirSync(SESSIONS_DIR).filter((e) => fs.statSync(path.join(SESSIONS_DIR, e)).isDirectory()).length : 0,
    },
    corrections,
    tasks,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  };
}

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>MERCURY-CRAB // COMMAND CENTER</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700;900&family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&display=swap');

  :root {
    --cyan: #0891b2; --orange: #ea580c; --red: #dc2626;
    --green: #16a34a; --yellow: #ca8a04; --purple: #9333ea;
    --bg: #e8ecf1; --panel: rgba(255, 255, 255, 0.85);
    --border: rgba(8, 145, 178, 0.2); --text: #1e293b;
    --dim: #64748b; --glow: 0 0 15px rgba(8, 145, 178, 0.15);
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    background: var(--bg); color: var(--text);
    font-family: 'Share Tech Mono', 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;
    min-height: 100vh; overflow-x: hidden;
    background-image:
      radial-gradient(ellipse at 15% 80%, rgba(147, 51, 234, 0.08) 0%, transparent 50%),
      radial-gradient(ellipse at 85% 15%, rgba(8, 145, 178, 0.1) 0%, transparent 50%),
      radial-gradient(ellipse at 50% 50%, rgba(255, 255, 255, 0.5) 0%, rgba(232, 236, 241, 1) 100%),
      linear-gradient(rgba(8, 145, 178, 0.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(8, 145, 178, 0.06) 1px, transparent 1px);
    background-size: 100% 100%, 100% 100%, 100% 100%, 32px 32px, 32px 32px;
  }

  /* Scanline overlay - subtle for light theme */
  body::after {
    content: ''; position: fixed; inset: 0;
    background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.02) 2px, rgba(0,0,0,0.02) 4px);
    pointer-events: none; z-index: 9999;
  }

  /* ── TOP BAR ── */
  .top-bar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 24px; border-bottom: 1px solid var(--border);
    background: linear-gradient(180deg, rgba(8,145,178,0.08), transparent);
    position: relative;
  }
  .top-bar::after {
    content: ''; position: absolute; bottom: -1px; left: 0; width: 100%; height: 2px;
    background: linear-gradient(90deg, transparent, var(--cyan), transparent);
  }
  .logo {
    font-family: 'Orbitron', 'Noto Sans SC', sans-serif; font-size: 18px; font-weight: 900;
    color: var(--cyan); text-shadow: 0 1px 2px rgba(0,0,0,0.1); letter-spacing: 4px;
    display: flex; align-items: center; gap: 12px;
  }
  .logo .icon {
    font-size: 24px; filter: drop-shadow(0 0 8px var(--cyan));
    animation: float 3s ease-in-out infinite;
  }
  @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }

  .top-bar .clock {
    font-family: 'Orbitron', 'Noto Sans SC', sans-serif; font-size: 14px;
    color: var(--orange); letter-spacing: 2px;
  }
  .top-bar .status {
    display: flex; align-items: center; gap: 8px; font-size: 11px;
    color: var(--green); letter-spacing: 1px;
  }
  .status-dot {
    width: 6px; height: 6px; border-radius: 50%; background: var(--green);
    box-shadow: 0 0 8px var(--green); animation: blink 2s infinite;
  }
  @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }

  /* ── MAIN GRID ── */
  .dashboard {
    display: grid; grid-template-columns: repeat(6, 1fr);
    gap: 16px; padding: 20px 24px;
  }

  /* ── STAT CARDS ── */
  .stat-card {
    background: var(--panel); border: 1px solid var(--border);
    padding: 20px; position: relative; clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px));
    transition: all 0.3s;
  }
  .stat-card:hover { border-color: var(--cyan); box-shadow: var(--glow); transform: translateY(-2px); }
  .stat-card::before {
    content: ''; position: absolute; top: 0; left: 0;
    width: 100%; height: 3px;
    background: linear-gradient(90deg, transparent, var(--cyan), transparent);
  }
  .stat-card .label {
    font-size: 10px; color: var(--dim); letter-spacing: 1px;
    margin-bottom: 12px;
    display: flex; align-items: center; gap: 6px;
  }
  .stat-card .value {
    font-family: 'Orbitron', 'Noto Sans SC', sans-serif; font-size: 30px;
    font-weight: 900; color: #0f172a;
  }
  .stat-card .sub { font-size: 11px; color: var(--dim); margin-top: 6px; font-weight: 300; }
  .stat-card.cyan .value { color: var(--cyan); }
  .stat-card.orange .value { color: var(--orange); }
  .stat-card.green .value { color: var(--green); }
  .stat-card.red .value { color: var(--red); }
  .stat-card.purple .value { color: var(--purple); }
  .stat-card.yellow .value { color: var(--yellow); }

  /* ── SECTIONS (bottom panels) ── */
  .sections {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 16px; padding: 0 24px 20px;
  }

  .panel {
    background: var(--panel); border: 1px solid var(--border);
    position: relative;
  }
  .panel::before {
    content: ''; position: absolute; top: 0; left: 0;
    width: 40px; height: 3px; background: var(--cyan);
    border-radius: 0 0 2px 0;
  }
  .panel::after {
    content: ''; position: absolute; bottom: 0; right: 0;
    width: 40px; height: 3px; background: var(--orange);
    border-radius: 2px 0 0 0;
  }
  .panel-header {
    padding: 14px 20px; border-bottom: 1px solid var(--border);
    font-family: 'Orbitron', 'Noto Sans SC', sans-serif; font-size: 12px;
    letter-spacing: 1px; color: var(--cyan); display: flex;
    align-items: center; gap: 8px;
  }
  .panel-body { padding: 16px 20px; max-height: 280px; overflow-y: auto; }
  .panel-body::-webkit-scrollbar { width: 3px; }
  .panel-body::-webkit-scrollbar-track { background: transparent; }
  .panel-body::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

  /* ── TASK TABLE ── */
  .tasks-panel { grid-column: 1 / -1; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  th {
    text-align: left; padding: 10px 16px; color: var(--dim);
    font-size: 9px; letter-spacing: 2px; text-transform: uppercase;
    border-bottom: 1px solid var(--border);
  }
  td { padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.03); }
  tr { transition: background 0.2s; }
  tr:hover td { background: rgba(8,145,178,0.05); }
  .tag {
    display: inline-block; padding: 2px 10px; font-size: 9px;
    letter-spacing: 1px; clip-path: polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%);
  }
  .tag-ready { background: rgba(0,255,136,0.15); color: var(--green); }
  .tag-running { background: rgba(255,221,0,0.15); color: var(--yellow); }
  .tag-idle { background: rgba(74,85,104,0.3); color: var(--dim); }

  /* ── FILE LIST ── */
  .file-item {
    display: flex; justify-content: space-between; align-items: center;
    padding: 8px 0; border-bottom: 1px solid rgba(0,0,0,0.06);
    font-size: 11px;
  }
  .file-item:last-child { border-bottom: none; }
  .file-name { color: var(--text); max-width: 260px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .file-meta { color: var(--dim); font-size: 10px; white-space: nowrap; margin-left: 12px; }

  /* ── PROGRESS BAR ── */
  .progress-bar {
    width: 100%; height: 6px; background: rgba(0,0,0,0.08);
    border-radius: 3px; overflow: hidden; margin-top: 12px;
    position: relative;
  }
  .progress-fill {
    height: 100%; border-radius: 3px; transition: width 1s ease;
    position: relative;
  }
  .progress-fill::after {
    content: ''; position: absolute; right: 0; top: 0;
    width: 20px; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4));
    animation: shimmer 1.5s infinite;
  }
  @keyframes shimmer { 0% { opacity: 0; } 50% { opacity: 1; } 100% { opacity: 0; } }

  /* ── FOOTER ── */
  .footer {
    text-align: right; padding: 12px 24px; font-size: 9px;
    color: var(--dim); letter-spacing: 1px; border-top: 1px solid var(--border);
  }

  /* ── RESPONSIVE ── */
  @media (max-width: 1200px) {
    .dashboard { grid-template-columns: repeat(3, 1fr); }
  }
  @media (max-width: 768px) {
    .dashboard { grid-template-columns: repeat(2, 1fr); }
    .sections { grid-template-columns: 1fr; }
  }
</style>
</head>
<body>

<div class="top-bar">
  <div class="logo">
    <span class="icon">🦀</span>
    MERCURY-CRAB <span style="color:var(--dim);font-weight:400;font-size:12px;letter-spacing:1px">// 指挥控制中心</span>
  </div>
  <div class="clock" id="clock">00:00:00</div>
  <div class="status"><span class="status-dot"></span> <span id="server-status">系统在线</span></div>
</div>

<div class="dashboard" id="stats-grid"></div>

<div class="sections">
  <div class="panel tasks-panel">
    <div class="panel-header">⚙ 自动化任务队列</div>
    <div class="panel-body" style="max-height:none;padding:0">
      <table>
        <thead><tr><th>模块</th><th>状态</th><th>上次执行</th><th>下次运行</th><th>结果</th></tr></thead>
        <tbody id="tasks-body"></tbody>
      </table>
    </div>
  </div>
</div>

<div class="sections">
  <div class="panel">
    <div class="panel-header">📋 记忆日志</div>
    <div class="panel-body" id="recent-memory"></div>
  </div>
  <div class="panel">
    <div class="panel-header">📚 知识库</div>
    <div class="panel-body" id="wiki-stats"></div>
  </div>
</div>

<div class="footer">
  AUTO-REFRESH: 30s · 最后同步: <span id="last-update">--</span>
</div>

<script>
const fmtTime = (d) => {
  if (!d || d === "Never" || d === "N/A" || d === "Scheduled") return d || "--";
  const dt = new Date(d);
  if (isNaN(dt)) return d;
  return dt.toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
};

async function refresh() {
  try {
    const res = await fetch("/api/data");
    const data = await res.json();

    const taskNames = {
      KnowledgeSync: "知识库同步",
      SessionSummary: "会话摘要提取",
      SelfImprovingScan: "自学习扫描",
      SessionTitleGen: "会话标题生成",
      MemoryMaintenance: "记忆维护",
      SnapshotCleanup: "快照清理",
    };

    document.getElementById("stats-grid").innerHTML =
      '<div class="stat-card cyan"><div class="label">🧠 记忆文件</div><div class="value">' + data.memory.files + '</div><div class="sub">' + data.memory.sizeMB + ' MB 已索引</div></div>' +
      '<div class="stat-card orange"><div class="label">📚 知识库</div><div class="value">' + data.wiki.pages + '</div><div class="sub">' + data.wiki.rawPending + ' 原始文件待处理</div></div>' +
      '<div class="stat-card green"><div class="label">💬 会话</div><div class="value">' + data.sessions.dirs + '</div><div class="sub">' + data.sessions.summaries + ' 条摘要</div></div>' +
      '<div class="stat-card red"><div class="label">⚠ 纠错记录</div><div class="value">' + data.corrections.count + '</div><div class="sub">自学习日志</div></div>' +
      '<div class="stat-card purple"><div class="label">🔧 MCP 工具</div><div class="value">14</div><div class="sub">全部已注册</div></div>' +
      '<div class="stat-card yellow"><div class="label">⏰ 定时任务</div><div class="value">' + data.tasks.length + '</div><div class="sub">已调度</div></div>';

    document.getElementById("tasks-body").innerHTML = data.tasks.map(t => {
      const key = t.name.replace("MercuryCrab_", "");
      const cnName = taskNames[key] || key;
      const cls = t.state === "Ready" ? "tag-ready" : t.state === "Running" ? "tag-running" : "tag-idle";
      const statusText = t.state === "Ready" ? "就绪" : t.state === "Running" ? "运行中" : t.state;
      return '<tr><td style="color:#000;font-size:12px">' + cnName + '</td><td><span class="tag ' + cls + '">' + statusText + '</span></td><td>' + fmtTime(t.lastRun) + '</td><td>' + fmtTime(t.nextRun) + '</td><td>' + (t.result === 0 ? '<span style="color:var(--green)">✓ 正常</span>' : t.result) + '</td></tr>';
    }).join("");

    document.getElementById("recent-memory").innerHTML = data.memory.recent.map(f =>
      '<div class="file-item"><span class="file-name">' + f.name + '</span><span class="file-meta">' + f.sizeKB + 'KB · ' + f.date + '</span></div>'
    ).join("");

    const total = data.wiki.pages + data.wiki.rawPending;
    const pct = total > 0 ? Math.round((data.wiki.pages / total) * 100) : 0;
    document.getElementById("wiki-stats").innerHTML =
      '<div class="file-item"><span class="file-name">已索引知识库页面</span><span class="file-meta" style="color:var(--cyan)">' + data.wiki.pages + '</span></div>' +
      '<div class="file-item"><span class="file-name">原始文件待处理</span><span class="file-meta" style="color:var(--orange)">' + data.wiki.rawPending + '</span></div>' +
      '<div class="file-item"><span class="file-name">导入进度</span><span class="file-meta" style="color:var(--green)">' + pct + '%</span></div>' +
      '<div class="progress-bar"><div class="progress-fill" style="width:' + pct + '%;background:linear-gradient(90deg, var(--cyan), var(--green))"></div></div>';

    document.getElementById("last-update").textContent = new Date(data.timestamp).toLocaleTimeString("zh-CN");
    document.getElementById("server-status").textContent = "系统在线";
    document.getElementById("server-status").style.color = "var(--green)";
  } catch (e) {
    document.getElementById("server-status").textContent = "系统离线";
    document.getElementById("server-status").style.color = "var(--red)";
  }
}

function updateClock() {
  document.getElementById("clock").textContent = new Date().toLocaleTimeString("zh-CN");
}

refresh(); updateClock();
setInterval(refresh, 30000);
setInterval(updateClock, 1000);
</script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  if (req.url === "/api/data") {
    const now = Date.now();
    if (!cachedData || now - lastFetch > 10000) {
      cachedData = fetchAll();
      lastFetch = now;
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(cachedData));
  } else {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(HTML);
  }
});

server.listen(PORT, () => {
  console.error(`Mercury-Crab Monitor: http://localhost:${PORT}`);
  console.error(`Workspace: ${WORKSPACE}`);
});
