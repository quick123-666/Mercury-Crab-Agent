# llmwikify Skill

## Description

Personal knowledge base powered by llmwikify. Search, read, write, and manage wiki pages. Acts as long-term memory for the AI assistant.

## Commands

All commands run from workspace root (`C:\Users\Administrator\.qclaw\workspace`). Set `$env:PYTHONIOENCODING="utf-8"` before each call.

### Status
```bash
py -m llmwikify status
```

### Search
```bash
py -m llmwikify search "query"
```

### Write Page
```bash
py -m llmwikify write_page "page-name" --content "markdown content"
# Or from file:
py -m llmwikify write_page "page-name" --file "path/to/file.md"
```

### Read Page
```bash
py -m llmwikify read_page "page-name"
```

### List Pages
```bash
py -m llmwikify build-index --export-only
```

### Ingest Source
```bash
py -m llmwikify ingest "path/to/file.pdf"
py -m llmwikify ingest "path/to/file.md" --dry-run
```

### Knowledge Graph
```bash
py -m llmwikify graph-query "entity name"
py -m llmwikify graph-analyze
```

### Knowledge Gaps
```bash
py -m llmwikify knowledge-gaps
```

### Synthesize Answer
```bash
py -m llmwikify synthesize "question text" --content "answer content"
```

## MCP Server

MCP server runs at `http://127.0.0.1:8766/mcp` via:
```bash
py -m llmwikify serve --web --port 8766
```

## Wiki Structure

```
workspace/
├── wiki/
│   ├── concepts/       # Concept pages
│   ├── entities/      # Entity pages
│   ├── claims/        # Claim pages
│   ├── comparisons/   # Comparison pages
│   ├── sources/       # Source/reference pages
│   ├── synthesis/     # Synthesis pages
│   ├── .sink/         # Query buffer
│   └── index.md       # Page index
├── raw/               # Source files for ingestion
└── .llmwikify.db     # SQLite database
```

## Notes

- On Windows, always set `$env:PYTHONIOENCODING="utf-8"` before running llmwikify commands to avoid GBK encoding errors.
- Page names use hyphens, not spaces.
- Use `--type concept|entity|claim|comparison|source|synthesis` when writing pages.
