import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

// ============================================================================
// Configuration
// ============================================================================
const WORKSPACE = path.resolve(process.env.MERCURY_WORKSPACE || process.cwd());
const MEMORY_DIR = path.join(WORKSPACE, "memory");
const WIKI_DIR = path.join(WORKSPACE, "wiki");
const RAW_DIR = path.join(WORKSPACE, "raw");
const SELF_IMPROVING_DIR = path.join(os.homedir(), "self-improving");
const SESSIONS_DIR = path.join(WORKSPACE, "sessions");

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// ============================================================================
// MCP Server
// ============================================================================
const server = new McpServer({
  name: "mercury-crab-agent",
  version: "1.0.0",
});

// ============================================================================
// Memory Tools
// ============================================================================
server.tool(
  "memory_read",
  "Read a memory file. Supports daily logs (memory/YYYY-MM-DD.md), MEMORY.md, and user memory.",
  {
    file: z.string().describe("Memory file path or name, e.g. 'MEMORY.md', '2026-04-25.md', 'E12BB65A68385DD731292197EE5BBCA1/MEMORY.md'"),
  },
  async ({ file }) => {
    try {
      const filePath = path.join(MEMORY_DIR, file);
      if (!fs.existsSync(filePath)) {
        return {
          content: [{ type: "text" as const, text: `Memory file not found: ${file}\nSearch in ${MEMORY_DIR}` }],
        };
      }
      const content = fs.readFileSync(filePath, "utf-8");
      return { content: [{ type: "text" as const, text: content }] };
    } catch (err: any) {
      return { content: [{ type: "text" as const, text: `Error reading memory: ${err.message}` }] };
    }
  }
);

server.tool(
  "memory_write",
  "Write to a memory file. Appends to existing files or creates new ones. Use for daily logs, long-term memory, and user memory.",
  {
    file: z.string().describe("Memory file path or name"),
    content: z.string().describe("Content to write (will be appended with timestamp)"),
    mode: z.enum(["append", "overwrite"]).optional().default("append").describe("Write mode: append or overwrite"),
  },
  async ({ file, content, mode }) => {
    try {
      ensureDir(MEMORY_DIR);
      const filePath = path.join(MEMORY_DIR, file);
      const fileDir = path.dirname(filePath);
      ensureDir(fileDir);

      if (mode === "append") {
        const timestamp = new Date().toISOString().replace("T", " ").substring(0, 16);
        const entry = `\n## ${timestamp}\n${content}\n`;
        fs.appendFileSync(filePath, entry, "utf-8");
      } else {
        fs.writeFileSync(filePath, content, "utf-8");
      }
      return { content: [{ type: "text" as const, text: `Memory written: ${file} (${mode} mode)` }] };
    } catch (err: any) {
      return { content: [{ type: "text" as const, text: `Error writing memory: ${err.message}` }] };
    }
  }
);

server.tool(
  "memory_search",
  "Search across all memory files for a keyword or phrase. Returns matching files with context.",
  {
    query: z.string().describe("Search query (keyword or phrase)"),
    caseSensitive: z.boolean().optional().default(false).describe("Case sensitive search"),
  },
  async ({ query, caseSensitive }) => {
    try {
      ensureDir(MEMORY_DIR);
      const results: string[] = [];
      const flags = caseSensitive ? "g" : "gi";
      const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), flags);

      function searchDir(dir: string, prefix = ""): void {
        if (!fs.existsSync(dir)) return;
        const entries = fs.readdirSync(dir);
        for (const entry of entries) {
          const fullPath = path.join(dir, entry);
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            searchDir(fullPath, path.join(prefix, entry));
          } else if (entry.endsWith(".md")) {
            const content = fs.readFileSync(fullPath, "utf-8");
            const lines = content.split("\n");
            for (let i = 0; i < lines.length; i++) {
              if (regex.test(lines[i])) {
                regex.lastIndex = 0;
                const filePath = path.join(prefix, entry);
                results.push(`File: ${filePath}:${i + 1}\n  ${lines[i].trim()}`);
                if (results.length >= 20) return;
              }
            }
            if (results.length >= 20) return;
          }
        }
      }
      searchDir(MEMORY_DIR);

      if (results.length === 0) {
        return { content: [{ type: "text" as const, text: `No results found for "${query}"` }] };
      }
      return { content: [{ type: "text" as const, text: `Found ${results.length} results for "${query}":\n\n${results.join("\n\n")}` }] };
    } catch (err: any) {
      return { content: [{ type: "text" as const, text: `Error searching memory: ${err.message}` }] };
    }
  }
);

// ============================================================================
// Wiki (Knowledge Base) Tools
// ============================================================================
server.tool(
  "wiki_search",
  "Search the local knowledge base (wiki directory) for information. Returns matching wiki pages.",
  {
    query: z.string().describe("Search query"),
  },
  async ({ query }) => {
    try {
      ensureDir(WIKI_DIR);
      const results: string[] = [];
      const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");

      function searchDir(dir: string, prefix = ""): void {
        if (!fs.existsSync(dir)) return;
        const entries = fs.readdirSync(dir);
        for (const entry of entries) {
          const fullPath = path.join(dir, entry);
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            searchDir(fullPath, path.join(prefix, entry));
          } else if (entry.endsWith(".md")) {
            const content = fs.readFileSync(fullPath, "utf-8");
            const lines = content.split("\n");
            for (let i = 0; i < lines.length; i++) {
              if (regex.test(lines[i])) {
                regex.lastIndex = 0;
                const filePath = path.join(prefix, entry);
                results.push(`Page: ${filePath}:${i + 1}\n  ${lines[i].trim()}`);
                if (results.length >= 15) return;
              }
            }
            if (results.length >= 15) return;
          }
        }
      }
      searchDir(WIKI_DIR);

      if (results.length === 0) {
        return { content: [{ type: "text" as const, text: `No wiki pages found for "${query}". Try ingesting files from raw/ directory.` }] };
      }
      return { content: [{ type: "text" as const, text: `Found ${results.length} wiki results for "${query}":\n\n${results.join("\n\n")}` }] };
    } catch (err: any) {
      return { content: [{ type: "text" as const, text: `Error searching wiki: ${err.message}` }] };
    }
  }
);

server.tool(
  "wiki_read",
  "Read a specific wiki page by path.",
  {
    path: z.string().describe("Wiki page path relative to wiki directory, e.g. 'projects/claude-code.md'"),
  },
  async ({ path: wikiPath }) => {
    try {
      const fullPath = path.join(WIKI_DIR, wikiPath);
      if (!fs.existsSync(fullPath)) {
        return { content: [{ type: "text" as const, text: `Wiki page not found: ${wikiPath}` }] };
      }
      const content = fs.readFileSync(fullPath, "utf-8");
      return { content: [{ type: "text" as const, text: content }] };
    } catch (err: any) {
      return { content: [{ type: "text" as const, text: `Error reading wiki: ${err.message}` }] };
    }
  }
);

server.tool(
  "wiki_write",
  "Write or create a wiki page in the knowledge base.",
  {
    path: z.string().describe("Wiki page path relative to wiki directory"),
    content: z.string().describe("Page content in markdown format"),
  },
  async ({ path: wikiPath, content }) => {
    try {
      ensureDir(WIKI_DIR);
      const fullPath = path.join(WIKI_DIR, wikiPath);
      const fileDir = path.dirname(fullPath);
      ensureDir(fileDir);
      fs.writeFileSync(fullPath, content, "utf-8");
      return { content: [{ type: "text" as const, text: `Wiki page written: ${wikiPath}` }] };
    } catch (err: any) {
      return { content: [{ type: "text" as const, text: `Error writing wiki: ${err.message}` }] };
    }
  }
);

server.tool(
  "wiki_ingest",
  "Ingest a file or directory into the wiki knowledge base. Copies files from raw/ or specified path into wiki/.",
  {
    sourcePath: z.string().describe("Source file or directory to ingest"),
    destPath: z.string().optional().describe("Destination path in wiki (defaults to projects/)"),
  },
  async ({ sourcePath, destPath }) => {
    try {
      ensureDir(WIKI_DIR);
      const dest = destPath ? path.join(WIKI_DIR, destPath) : path.join(WIKI_DIR, "projects");
      ensureDir(dest);

      function copyRecursive(src: string, dst: string): number {
        let count = 0;
        const stat = fs.statSync(src);
        if (stat.isDirectory()) {
          ensureDir(dst);
          const entries = fs.readdirSync(src);
          for (const entry of entries) {
            const srcPath = path.join(src, entry);
            const dstPath = path.join(dst, entry);
            if (entry.endsWith(".md")) {
              count += copyRecursive(srcPath, dstPath);
            }
          }
        } else if (sourcePath.endsWith(".md")) {
          fs.copyFileSync(src, dst);
          count++;
        }
        return count;
      }

      const count = copyRecursive(sourcePath, dest);
      return { content: [{ type: "text" as const, text: `Ingested ${count} files from ${sourcePath} to ${destPath || "projects/"}` }] };
    } catch (err: any) {
      return { content: [{ type: "text" as const, text: `Error ingesting: ${err.message}` }] };
    }
  }
);

server.tool(
  "wiki_status",
  "Get the current status of the knowledge base: page count, directory structure, recent pages.",
  {},
  async () => {
    try {
      ensureDir(WIKI_DIR);
      let pageCount = 0;
      const pages: string[] = [];

      function countDir(dir: string): void {
        if (!fs.existsSync(dir)) return;
        const entries = fs.readdirSync(dir);
        for (const entry of entries) {
          const fullPath = path.join(dir, entry);
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            countDir(fullPath);
          } else if (entry.endsWith(".md")) {
            pageCount++;
            if (pages.length < 10) pages.push(fullPath.replace(WIKI_DIR + path.sep, ""));
          }
        }
      }
      countDir(WIKI_DIR);

      const status = `Wiki Status:
- Total pages: ${pageCount}
- Raw files awaiting ingest: ${fs.existsSync(RAW_DIR) ? fs.readdirSync(RAW_DIR).length : 0}

Recent pages (first 10):
${pages.map((p) => `  - ${p}`).join("\n")}`;

      return { content: [{ type: "text" as const, text: status }] };
    } catch (err: any) {
      return { content: [{ type: "text" as const, text: `Error getting wiki status: ${err.message}` }] };
    }
  }
);

// ============================================================================
// Heartbeat Tool
// ============================================================================
server.tool(
  "heartbeat_check",
  "Run a heartbeat check. Checks what tasks need to be executed based on last execution times. Returns recommended next action.",
  {},
  async () => {
    try {
      const statePath = path.join(MEMORY_DIR, "heartbeat-state.md");
      let state: Record<string, any> = { lastChecks: {} };

      if (fs.existsSync(statePath)) {
        try {
          const content = fs.readFileSync(statePath, "utf-8");
          const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
          if (jsonMatch) {
            state = JSON.parse(jsonMatch[1]);
          } else {
            state = JSON.parse(content);
          }
        } catch {
          state = { lastChecks: {} };
        }
      }

      const now = Date.now();
      const tasks = [
        { name: "Memory Snapshot", key: "lastSnapshot", interval: 0, always: true },
        { name: "Session Title Gen", key: "lastTitleGen", interval: 12 * 3600 * 1000 },
        { name: "Session Summary", key: "lastSummary", interval: 8 * 3600 * 1000 },
        { name: "Self-Improving Scan", key: "lastSelfImprove", interval: 6 * 3600 * 1000 },
        { name: "Memory Maintenance", key: "lastMemoryMaint", interval: 72 * 3600 * 1000 },
        { name: "Snapshot Cleanup", key: "lastSnapshotCleanup", interval: 168 * 3600 * 1000 },
        { name: "Knowledge Sync", key: "lastKnowledgeSync", interval: 4 * 3600 * 1000 },
      ];

      const pending = tasks.filter((t) => {
        if (t.always) return true;
        const last = state.lastChecks?.[t.key] || 0;
        return now - last > t.interval;
      });

      const overdue = pending.filter((t) => !t.always);
      overdue.sort((a, b) => {
        const lastA = state.lastChecks?.[a.key] || 0;
        const lastB = state.lastChecks?.[b.key] || 0;
        return (now - lastB) - (now - lastA);
      });

      let output = "Heartbeat Check Results:\n\n";
      output += `Current time: ${new Date().toISOString()}\n`;
      output += `Tasks needing attention: ${pending.length}/${tasks.length}\n\n`;

      if (pending.length > 0) {
        output += "Recommended next action:\n";
        const next = overdue.length > 0 ? overdue[0] : pending[0];
        output += `  -> ${next.name} (last ran: ${state.lastChecks?.[next.key] ? new Date(state.lastChecks[next.key]).toISOString() : "never"})\n\n`;
        output += "Other pending tasks:\n";
        for (const t of pending) {
          if (t !== next) {
            output += `  - ${t.name}\n`;
          }
        }
      } else {
        output += "All tasks up to date. HEARTBEAT_OK";
      }

      return { content: [{ type: "text" as const, text: output }] };
    } catch (err: any) {
      return { content: [{ type: "text" as const, text: `Error running heartbeat: ${err.message}` }] };
    }
  }
);

// ============================================================================
// Self-Improving Tools
// ============================================================================
server.tool(
  "correction_log",
  "Log a correction to the self-improving corrections.md file. Use when the agent makes a mistake or is corrected.",
  {
    description: z.string().describe("Description of the mistake or correction"),
    correction: z.string().describe("The correct behavior or fix"),
    context: z.string().optional().describe("Optional context about where/when this occurred"),
  },
  async ({ description, correction, context }) => {
    try {
      ensureDir(SELF_IMPROVING_DIR);
      const correctionsPath = path.join(SELF_IMPROVING_DIR, "corrections.md");
      const timestamp = new Date().toISOString().replace("T", " ").substring(0, 19);
      const entry = `## ${timestamp}\n- **Issue**: ${description}\n- **Correction**: ${correction}\n${context ? `- **Context**: ${context}\n` : ""}\n---\n`;

      if (fs.existsSync(correctionsPath)) {
        fs.appendFileSync(correctionsPath, entry, "utf-8");
      } else {
        fs.writeFileSync(correctionsPath, `# Corrections Log\n\n${entry}`, "utf-8");
      }

      // Count total corrections
      const content = fs.readFileSync(correctionsPath, "utf-8");
      const count = (content.match(/^## /gm) || []).length;

      return { content: [{ type: "text" as const, text: `Correction logged. Total corrections: ${count}. If similar corrections reach 3+, consider promoting to a rule in memory.md.` }] };
    } catch (err: any) {
      return { content: [{ type: "text" as const, text: `Error logging correction: ${err.message}` }] };
    }
  }
);

server.tool(
  "pattern_scan",
  "Scan corrections for repeated patterns. If the same type of error appears 3+ times, suggests promoting to a validated rule.",
  {},
  async () => {
    try {
      const correctionsPath = path.join(SELF_IMPROVING_DIR, "corrections.md");
      if (!fs.existsSync(correctionsPath)) {
        return { content: [{ type: "text" as const, text: "No corrections file found. Nothing to scan." }] };
      }

      const content = fs.readFileSync(correctionsPath, "utf-8");
      const entries = content.split(/^---$/m).filter((e) => e.trim());
      const issues = entries
        .map((e) => {
          const issueMatch = e.match(/\*\*Issue\*\*:?\s*(.+)/i);
          return issueMatch ? issueMatch[1].trim().toLowerCase() : null;
        })
        .filter(Boolean) as string[];

      if (issues.length === 0) {
        return { content: [{ type: "text" as const, text: "No correction entries found." }] };
      }

      // Simple pattern matching: group by first few words
      const patterns: Record<string, string[]> = {};
      for (const issue of issues) {
        const key = issue.split(" ").slice(0, 4).join(" ");
        if (!patterns[key]) patterns[key] = [];
        patterns[key].push(issue);
      }

      const repeated = Object.entries(patterns).filter(([, v]) => v.length >= 2);
      let output = `Pattern Scan Results:\n\nTotal corrections: ${issues.length}\nRepeated patterns (2+ occurrences): ${repeated.length}\n\n`;

      if (repeated.length === 0) {
        output += "No repeated patterns detected. No action needed.";
      } else {
        output += "Suggested rules to promote:\n\n";
        for (const [pattern, entries] of repeated) {
          output += `Pattern: "${pattern}" (${entries.length} occurrences)\n`;
          for (const e of entries) {
            output += `  - ${e}\n`;
          }
          if (entries.length >= 3) {
            output += "  >> PROMOTE to validated rule in self-improving/memory.md\n";
          }
          output += "\n";
        }
      }

      return { content: [{ type: "text" as const, text: output }] };
    } catch (err: any) {
      return { content: [{ type: "text" as const, text: `Error scanning patterns: ${err.message}` }] };
    }
  }
);

server.tool(
  "session_title_gen",
  "Generate titles for sessions that lack them. Scans all sessions, extracts titles from summary content or generates from first meaningful text.",
  {
    recent: z.number().optional().default(0).describe("Only process the N most recently modified sessions. 0 = process all."),
  },
  async ({ recent }) => {
    try {
      if (!fs.existsSync(SESSIONS_DIR)) {
        return { content: [{ type: "text" as const, text: "Sessions directory not found." }] };
      }

      // List all sessions with their last modified time
      const sessionDirs: { name: string; mtime: number }[] = [];
      const entries = fs.readdirSync(SESSIONS_DIR);
      for (const entry of entries) {
        const fullPath = path.join(SESSIONS_DIR, entry);
        if (fs.statSync(fullPath).isDirectory()) {
          sessionDirs.push({ name: entry, mtime: fs.statSync(fullPath).mtimeMs });
        }
      }

      // Sort by mtime descending
      sessionDirs.sort((a, b) => b.mtime - a.mtime);
      const toProcess = recent > 0 ? sessionDirs.slice(0, recent) : sessionDirs;

      const results: string[] = [];
      for (const session of toProcess) {
        const summaryFiles = fs.readdirSync(path.join(SESSIONS_DIR, session.name)).filter((f) => f.startsWith("summary_") && f.endsWith(".md"));
        if (summaryFiles.length === 0) {
          results.push(`Session: ${session.name} - No summary file found`);
          continue;
        }

        for (const summaryFile of summaryFiles) {
          const summaryPath = path.join(SESSIONS_DIR, session.name, summaryFile);
          const content = fs.readFileSync(summaryPath, "utf-8");

          // Try to extract title from embedded JSON
          const jsonMatch = content.match(/"sessionName"\s*:\s*"([^"]+)"/);
          if (jsonMatch) {
            results.push(`Session: ${session.name} | Title: ${jsonMatch[1]} | Source: embedded JSON`);
            continue;
          }

          // Extract from first meaningful non-header line
          const lines = content.split("\n").filter((l) => {
            const t = l.trim();
            return t && !t.startsWith("```") && !t.startsWith("## ") && !t.startsWith("# ");
          });
          const firstLine = lines[0]?.trim() || "";
          const title = firstLine.length > 80 ? firstLine.substring(0, 80) + "..." : firstLine;
          results.push(`Session: ${session.name} | Suggested Title: ${title} | Source: first line`);
        }
      }

      const output = `Session Title Generation Results:\n\nProcessed: ${toProcess.length}/${sessionDirs.length} sessions\n\n${results.join("\n")}`;
      return { content: [{ type: "text" as const, text: output }] };
    } catch (err: any) {
      return { content: [{ type: "text" as const, text: `Error generating session titles: ${err.message}` }] };
    }
  }
);

server.tool(
  "session_summary",
  "Process sessions and extract summaries. Scans for recent sessions, extracts key topics and decisions, writes condensed summaries to memory directory.",
  {
    recent: z.number().optional().default(5).describe("Process the N most recently modified sessions"),
    writeToMemory: z.boolean().optional().default(true).describe("Write extracted summaries to memory/ directory"),
  },
  async ({ recent, writeToMemory }) => {
    try {
      if (!fs.existsSync(SESSIONS_DIR)) {
        return { content: [{ type: "text" as const, text: "Sessions directory not found." }] };
      }

      const sessionDirs: { name: string; mtime: number }[] = [];
      const entries = fs.readdirSync(SESSIONS_DIR);
      for (const entry of entries) {
        const fullPath = path.join(SESSIONS_DIR, entry);
        if (fs.statSync(fullPath).isDirectory()) {
          sessionDirs.push({ name: entry, mtime: fs.statSync(fullPath).mtimeMs });
        }
      }
      sessionDirs.sort((a, b) => b.mtime - a.mtime);
      const toProcess = sessionDirs.slice(0, recent);

      const summaries: string[] = [];
      for (const session of toProcess) {
        const summaryFiles = fs.readdirSync(path.join(SESSIONS_DIR, session.name)).filter((f) => f.startsWith("summary_") && f.endsWith(".md"));
        if (summaryFiles.length === 0) {
          summaries.push(`Session: ${session.name} - No summary file (skipped)`);
          continue;
        }

        for (const summaryFile of summaryFiles) {
          const summaryPath = path.join(SESSIONS_DIR, session.name, summaryFile);
          const content = fs.readFileSync(summaryPath, "utf-8");
          const wordCount = content.split(/\s+/).length;
          const lineCount = content.split("\n").length;

          // Extract key sections
          const taskMatch = content.match(/## 任务背景\s*([\s\S]*?)(?=\n## |$)/);
          const resultMatch = content.match(/## 关键结果\s*([\s\S]*?)(?=\n## |$)/);
          const conclusionMatch = content.match(/## 结论建议\s*([\s\S]*?)(?=\n## |$)/);

          let extracted = `# Session: ${session.name}\n\n`;
          if (taskMatch) extracted += `## Task: ${taskMatch[1].trim()}\n\n`;
          if (resultMatch) extracted += `## Results: ${resultMatch[1].trim()}\n\n`;
          if (conclusionMatch) extracted += `## Conclusion: ${conclusionMatch[1].trim()}\n`;

          if (!taskMatch && !resultMatch) {
            // Use first 200 chars as summary
            extracted += content.substring(0, 200).trim();
          }

          summaries.push(`Session: ${session.name} (${lineCount} lines, ${wordCount} words)\n${extracted}`);

          if (writeToMemory) {
            const today = new Date().toISOString().substring(0, 10);
            const memoryFile = `${session.name}-summary.md`;
            ensureDir(MEMORY_DIR);
            const memoryPath = path.join(MEMORY_DIR, memoryFile);
            fs.writeFileSync(memoryPath, extracted, "utf-8");
          }
        }
      }

      const output = `Session Summary Results:\n\nProcessed: ${toProcess.length} sessions\n\n${summaries.join("\n---\n\n")}`;
      return { content: [{ type: "text" as const, text: output }] };
    } catch (err: any) {
      return { content: [{ type: "text" as const, text: `Error processing session summaries: ${err.message}` }] };
    }
  }
);

server.tool(
  "memory_list",
  "List all memory files with their sizes and last modified dates.",
  {},
  async () => {
    try {
      ensureDir(MEMORY_DIR);
      const files: string[] = [];

      function listDir(dir: string, prefix = ""): void {
        if (!fs.existsSync(dir)) return;
        const entries = fs.readdirSync(dir);
        for (const entry of entries) {
          const fullPath = path.join(dir, entry);
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            listDir(fullPath, path.join(prefix, entry));
          } else if (entry.endsWith(".md")) {
            const relPath = path.join(prefix, entry);
            files.push(`  ${relPath} (${(stat.size / 1024).toFixed(1)}KB, modified: ${stat.mtime.toISOString().substring(0, 10)})`);
          }
        }
      }
      listDir(MEMORY_DIR);

      if (files.length === 0) {
        return { content: [{ type: "text" as const, text: "No memory files found." }] };
      }
      return { content: [{ type: "text" as const, text: `Memory files (${files.length}):\n\n${files.join("\n")}` }] };
    } catch (err: any) {
      return { content: [{ type: "text" as const, text: `Error listing memory: ${err.message}` }] };
    }
  }
);

// ============================================================================
// Start Server
// ============================================================================
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`Mercury-Crab MCP Server running on workspace: ${WORKSPACE}`);
  console.error(`Memory dir: ${MEMORY_DIR}`);
  console.error(`Wiki dir: ${WIKI_DIR}`);
  console.error(`Self-improving dir: ${SELF_IMPROVING_DIR}`);
}

main().catch(console.error);
