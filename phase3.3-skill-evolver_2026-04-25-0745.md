# Task 3.3: Skill Self-Evolution Engine — Complete

## Objective
Build a skill self-evolution engine that analyzes usage feedback (corrections.md) and SKILL.md quality issues, then generates improvement suggestions.

## Implementation
**File**: ~/.qclaw/skills/hermes-learning/skill_evolver.py (~17KB)

### Core Flow
1. **Scan corrections.md** → match entries to skills by keyword overlap (≥3 shared terms)
2. **Quality checks** per SKILL.md:
   - Missing trigger conditions (medium)
   - Missing cautions/safety boundaries (low, now also checks 安全/边界)
   - Too brief (<500 chars, medium)
   - Undocumented scripts (medium)
   - Excessive evolutions (>10, low)
3. **Generate suggestions**: try LLM first, fallback to rule-based if timeout
4. **Log to evolution-log.md** with ⏳ 待审核 status
5. **Apply**: --apply --skill X auto-modifies SKILL.md via LLM

### CLI
`ash
python skill_evolver.py                    # Full scan
python skill_evolver.py --skill hermes-learning  # Single skill
python skill_evolver.py --dry-run          # Analyze only, no writes
python skill_evolver.py --apply --skill X  # Apply pending evolution
python skill_evolver.py --json             # JSON output
`

### First Evolution Applied
- **Evolution #1**: hermes-learning had 2 issues (3 related corrections + 6 undocumented scripts)
- **Fix**: Added documentation for all 7 scripts in SKILL.md
- Result: score dropped from 6 → 3, issues from 3 → 1 (remaining is informational)

### Key Design Decisions
- dry-run skips LLM calls (pure rule-based analysis)
- LLM timeout → graceful fallback to rule-based suggestions
- evolution-log.md tracks all changes with audit trail
- Apply requires explicit --apply flag (safety)

## Status: ✅ Complete