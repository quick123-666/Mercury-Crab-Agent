# llmwikify wrapper for Windows PowerShell
# Place in PATH or call directly with: & wiki.ps1 <command> [args...]

param(
    [Parameter(Position=0)]
    [ValidateSet("status", "search", "write_page", "read_page", "ingest", "graph-query", "graph-analyze", "knowledge-gaps", "synthesize", "lint", "build-index")]
    [string]$Command = "status",

    [Parameter(Position=1, ValueFromRemainingArguments=$true)]
    [string[]]$Args = @()
)

$env:PYTHONIOENCODING = "utf-8"
$workspaceRoot = "C:\Users\Administrator\.qclaw\workspace"

switch ($Command) {
    "status"       { py -m llmwikify status }
    "search"       { py -m llmwikify search $Args[0] }
    "write_page"   { py -m llmwikify write_page $Args[0] --content $Args[1] }
    "read_page"    { py -m llmwikify read_page $Args[0] }
    "ingest"       { py -m llmwikify ingest $Args[0] }
    "graph-query"  { py -m llmwikify graph-query $Args[0] }
    "graph-analyze"{ py -m llmwikify graph-analyze }
    "knowledge-gaps"{ py -m llmwikify knowledge-gaps }
    "synthesize"   { py -m llmwikify synthesize $Args[0] --content $Args[1] }
    "lint"         { py -m llmwikify lint }
    "build-index"  { py -m llmwikify build-index --export-only }
}
