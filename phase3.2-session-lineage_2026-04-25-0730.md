# Task 3.2: Session Lineage Visualization — Complete

## Objective
Build a session lineage visualizer that reads LCM DB summary parent/child relationships and renders compression trees.

## Key Discovery: summary_parents Direction
The summary_parents table stores: summary_id(condensed) → parent_summary_id(leaf)
- A condensed summary is the COMPRESSION PRODUCT of multiple leaf summaries
- summary_id = the new condensed node (child/result)
- parent_summary_id = the original leaf node (source/input)
- Multiple leaves compress into one condensed: many-to-one

## Implementation
**File**: ~/.qclaw/skills/hermes-learning/session_lineage.py

### Features
- Text tree rendering with emoji icons (📦=condensed, 🍃=leaf)
- Statistics panel (summary count, depth distribution, parent links)
- --conv N filter by conversation ID
- --json JSON output for programmatic use
- --depth N limit tree depth
- --stats statistics only
- GBK-safe UTF-8 stdout wrapper

### Data Structure
`
3 Condensed Roots:
  Tree 1: sum_dc35c0a2f35c (14 leaves, 1690tok, 00:09-04:34)
  Tree 2: sum_1b26a4c244b6 (20 leaves, 656tok,  04:34-14:11)
  Tree 3: sum_85da78c344fc (8 leaves, 1307tok,  14:11-14:51)
11 Standalone Leaves (not compressed yet)
`

## Bugs Fixed
1. **GBK emoji crash** — added UTF-8 TextIOWrapper on sys.stdout
2. **Wrong tree direction** — initially rendered leaf→condensed as separate trees; corrected to condensed→leaves (top-down)
3. **parent_of/children_of naming confusion** — summary_parents stores condensed→leaf (result→sources), not leaf→condensed

## Status: ✅ Complete
Phase 3.2 session lineage visualization is fully working. Text and JSON output modes both tested.