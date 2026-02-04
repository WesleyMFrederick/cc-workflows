# Continuous Learning Port — PRD

**Feature**: Port Continuous Learning System from [`everything-claude-code`](/Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/everything-claude-code)
**Created**: 2026-02-02
**Status**: Draft

---

## Overview

Port continuous learning from everything-claude-code to cc-workflows. Enables pattern detection, instinct creation, and behavioral memory across sessions.

**Value:**
- Corrections/workflows persist across sessions
- Learned instincts inform future behavior
- Export/import instincts between projects
- 100% reliable capture via hooks (not probabilistic)
### Success Criteria

**Done when:**
- Observation hooks capture tool events without impacting performance
- Observer daemon creates instincts automatically from observations (opt-in)
- `/instinct-status` shows instincts with confidence bars by domain
- `/evolve` clusters instincts into discoverable SKILL.md files
- Instinct CLI handles import/export with deduplication and privacy
- All data stored per-project in `.claude/learned/`
- Observer daemon starts/stops cleanly (opt-in, disabled by default)

---

## Scope

### In Scope

**Observation pipeline:**

- PreToolUse/PostToolUse hook capturing tool events as JSONL
- Auto-archiving when observation file exceeds size threshold
- Integration with existing `.claude/settings.json` hook arrays

**Pattern extraction:**

- ~~`/learn` slash command for manual mid-session pattern extraction~~ **DEFERRED**
- `/instinct-status` slash command for viewing learned instincts
- Instinct YAML format with confidence scoring

**Instinct management:**

- CLI tool (JS) for status, import, and export operations
- Smart merge on import (deduplication, confidence comparison)
- Privacy stripping on export (remove code, paths, session IDs)

**Observer daemon (optional):**

- Background Haiku analysis of observations
- Pattern detection: corrections, error resolutions, repeated workflows, tool preferences
- Disabled by default, opt-in via config

**Instinct evolution:**

- `/evolve` skill for clustering related instincts into discoverable skills
- Generated skills placed in `.claude/learned/evolved/skills/`
- Auto-discoverable by Claude via standard skill discovery

### Out of Scope
- Session persistence, feature linking — Phase B
- Cross-project instinct sync
- Confidence decay timer
- Instinct auto-application during sessions
- New features beyond source system
- Architecture refactoring

---

## Requirements

### Functional Requirements

- FR1: The system SHALL capture tool usage events during sessions for later analysis. ^FR1
- FR2: The system SHALL manage observation storage to prevent unbounded growth. ^FR2
- FR3: The system SHALL integrate with existing hook infrastructure without disrupting current hooks. ^FR3
- FR4: ~~The system SHALL provide manual pattern extraction from session activity.~~ **DEFERRED** — v1 behavior; v2 uses automatic detection via observer daemon. ^FR4
- FR5: The system SHALL persist learned patterns as structured, confidence-weighted instinct files. ^FR5
- FR6: The system SHALL provide visibility into learned instincts and their confidence levels. ^FR6
- FR7: The system SHALL support optional background pattern detection (disabled by default). ^FR7
- FR8: The system SHALL support instinct portability via import and export with privacy controls. ^FR8
- FR9: The system SHALL transform high-confidence instincts into discoverable skills via clustering and generation. ^FR9

### Non-Functional Requirements

#### Quality Requirements

- NFR1: Observation capture SHALL NOT noticeably impact tool execution performance. ^NFR1
- NFR2: Observation storage SHALL be resilient against data corruption. ^NFR2
- NFR3: Hook scripts SHALL be portable across macOS and Linux. ^NFR3

#### Compatibility Requirements

- NFR4: New components SHALL follow cc-workflows language and location conventions. ^NFR4
- NFR5: All learned data SHALL be scoped per-project, not global. ^NFR5

#### Process Requirements

- NFR6: The port SHALL minimize translation risk by preserving source system patterns. ^NFR6
- NFR7: Configurable parameters SHALL be externalized, not hardcoded. ^NFR7

---

## Non-Goals

Explicitly **out of scope** for this port:

- **Architecture Changes**: No modifications to the everything-claude-code learning pipeline design
- **Language Rewrites**: No rewriting bash hooks to TypeScript or JS (except Python CLI → JS)
- **New Features**: No capabilities beyond what the source system provides
- **Instinct Evolution**: No clustering instincts into skills/commands/agents (Phase A.2)
- **Session Context**: No session persistence or feature-based linking (Phase B)
- **Cross-Project Sync**: No synchronization of instincts between different project workspaces
- **Auto-Application**: No reading instincts to influence Claude behavior during sessions

---

## Dependencies

### Technical Dependencies

- Source system: `everything-claude-code/skills/continuous-learning-v2/` (proven, working)
- Source hooks: `everything-claude-code/scripts/hooks/` (JS, working)
- Existing cc-workflows hook infrastructure: `.claude/settings.json`, `.claude/hooks/`
- Claude Code hook lifecycle: PreToolUse, PostToolUse, SessionStart, SessionEnd
- Haiku model access (for optional observer daemon)

### Knowledge Dependencies

- Source system architecture (captured in [Phase 1 Whiteboard](1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md))
- cc-workflows hook conventions and settings.json structure
- Instinct YAML schema and confidence scoring model
- Observation JSONL schema

### Process Dependencies

- Source scripts available for direct porting
- cc-workflows `.claude/` directory writable for new hooks and learned data
- Git version control for incremental commits

---

## Risks and Mitigations

### Risk 1: Hook Conflicts with Existing cc-workflows Hooks

**Impact**: Observation hooks interfere with citation-validator, plan-path-sync, or other PostToolUse hooks
**Mitigation**: Add observe.sh to hook arrays alongside existing entries; test that all hooks still fire correctly

### Risk 2: Performance Degradation from Observation Overhead

**Impact**: observe.sh adds latency to every tool call, slowing down interactive work
**Mitigation**: [NFR1](#^NFR1) requires no noticeable performance impact; bash script with JSONL append is inherently fast; profile after integration

### Risk 3: Per-Project Storage Creates Disk Bloat

**Impact**: Large projects with heavy tool usage generate oversized observation files
**Mitigation**: [FR2](#^FR2) manages observation storage to prevent unbounded growth; size thresholds and truncation defined in draft ACs

### Risk 4: Python → JS Rewrite Introduces Bugs in Instinct CLI

**Impact**: Import/export/status logic breaks during language translation
**Mitigation**: Port function-by-function with test validation; instinct-cli.py is ~200 lines, manageable scope

### Risk 5: Observer Daemon Orphaned Processes

**Impact**: Background daemon keeps running after session ends, consuming resources
**Mitigation**: PID file management; SessionEnd hook kills daemon; [FR7](#^FR7) keeps it disabled by default

---

## References

### Context Documents

- **Whiteboard**: [Phase 1 Whiteboard](1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md)%%force-extract%% — Discovery, decisions, source/target analysis
- **Development Workflow**: [Development Workflow Quick Reference](<../../../.claude/skills/enforcing-development-workflow/Development Workflow Quick Reference.md>) — Progressive disclosure levels

### Architecture Standards

- **Data-First Design**: [ARCHITECTURE-PRINCIPLES.md](<../../../ARCHITECTURE-PRINCIPLES.md#Data-First Design Principles>) — Observation schema and instinct data model
- **Modular Design**: [ARCHITECTURE-PRINCIPLES.md](<../../../ARCHITECTURE-PRINCIPLES.md#Modular Design Principles>) — Capture/analysis/storage separation
- **Safety-First Patterns**: [ARCHITECTURE-PRINCIPLES.md](<../../../ARCHITECTURE-PRINCIPLES.md#Safety-First Design Patterns>) — Append-only writes, auto-archive

### Source System

- **Observation hook**: `everything-claude-code/skills/continuous-learning-v2/hooks/observe.sh`
- **Session hooks**: `everything-claude-code/scripts/hooks/` (session-start.js, session-end.js, etc.)
- **Instinct CLI**: `everything-claude-code/skills/continuous-learning-v2/scripts/instinct-cli.py`
- **Config**: `everything-claude-code/skills/continuous-learning-v2/config.json`
- **Utils**: `everything-claude-code/scripts/lib/utils.js`

---

## Appendix: Component Inventory

**Components requiring port** (details in Design phase):

- Observation hook (bash) — tool event capture pipeline
- Session hooks (JS) — session lifecycle management
- Instinct CLI (Python → JS) — status, import, export operations
- Slash commands (markdown) — /learn, /instinct-status
- Observer daemon (bash) — background pattern detection
- Configuration (JSON) — learning pipeline settings
- Utility library (JS) — file I/O helpers

**Total**: ~7 components identified for port (exact sequence and adaptation approach defined in Design document)

**Note:** File mappings and sequence in Design doc per progressive disclosure.
