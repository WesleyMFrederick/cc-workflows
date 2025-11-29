# Whiteboard Phase 2: Research & Design

**Date**: 2025-11-29
**Phase**: Research & Design (The Bridge)

## System Context Gathered

### Existing CEO Output Hook

**Location**: `.claude/hooks/user-prompt-submit.sh`

**Current Directives**:
- Keep responses CONCISE and SCANNABLE
- Use bullets, short paragraphs, clear headers
- Front-load key information
- Omit verbose explanations unless explicitly requested
- File output: detailed documentation allowed
- Options: numbered lists OR AskUserQuestion with recommendation
- Default to minimal necessary information

**Assessment**: Lightweight, high-level guidance. Missing:
- Specific formatting patterns
- Token efficiency techniques
- Content-type decision logic
- F-pattern awareness
- Progressive disclosure strategies

### Existing elements-of-style Skill

**Location**: `.claude/plugins/cache/elements-of-style/skills/writing-clearly-and-concisely/SKILL.md`

**Focus**: Strunk & White writing principles
- Active voice
- Omit needless words
- Definite, specific, concrete language
- Put statements in positive form
- Keep related words together

**Token Cost**: ~12,000 tokens for full style guide

**Assessment**: Focuses on writing quality, not formatting or scannability. Complimentary but different purpose.

### Other Writing Skills Found

- `writing-requirements-documents` - Obsidian-specific linking
- `writing-plans` - Implementation plan structure
- `writing-implementation-pseudocode` - Code examples in docs
- `writing-implementation-test-pseudocode` - Test examples in docs
- `writing-skills` - Meta skill for creating skills
- `writing-slash-commands` - Slash command docs

**Assessment**: All focus on specific document types, not general output formatting.

## Gaps Identified

### Gap 1: No F-Pattern Awareness
Current hook says "scannable" but doesn't explain:
- What makes content scannable
- How users actually scan (F-pattern, layer-cake, etc.)
- Where to place critical information
- Visual hierarchy techniques

### Gap 2: No Token Efficiency Techniques
No guidance on:
- Eliminating hedge words ("basically", "essentially", "generally")
- Avoiding redundant explanations
- When to use references vs. repetition
- Thinking block optimization

### Gap 3: No Content-Type Decision Logic
Current system doesn't distinguish between:
- Status updates (brief)
- Implementation pseudocode (detailed)
- Option presentations (structured)
- Error explanations (contextual)

### Gap 4: No Progressive Disclosure Strategy
Missing guidance on:
- When to start brief and add detail on request
- When to front-load comprehensive detail
- How to signal "more available"
- Detecting when user needs more vs. less

### Gap 5: No Integration of Human + LLM Constraints
Doesn't connect:
- System 1/System 2 processing (human)
- Token budget management (LLM)
- F-pattern scanning behavior (human)
- Context window limits (LLM)

## Solutions Hypothesis

### Solution: Comprehensive Formatting Skill

Create `scannable-token-efficient-writing` skill that:

1. **Extends (not replaces) CEO hook**: Provides the detailed implementation of "scannable" directive
2. **Complements elements-of-style**: Focuses on structure/format, not prose quality
3. **Provides decision trees**: Clear conditional logic for when to be brief vs. detailed
4. **Includes content-type matrix**: Specific formatting for each common scenario
5. **Teaches F-pattern optimization**: Where to place critical info for human scanning
6. **Defines token reduction techniques**: Concrete examples of before/after
7. **Integrates System 1/2 thinking**: Explains why certain formats work for humans
8. **Includes anti-rationalization safeguards**: Prevents verbose output when inappropriate

### Architecture

**Skill Structure**:

```text
1. Overview & When to Use
2. Core Principles (F-pattern, System 1/2, tokens)
3. Chat vs. File Output Rules
4. Content-Type Decision Matrix
5. Formatting Techniques (bullets, headers, bold)
6. Token Reduction Techniques
7. Progressive Disclosure Patterns
8. Before/After Examples (5+ scenarios)
9. Red Flags & Rationalizations
10. Integration with other skills
```

**Decision Logic**:
- IF status update OR progress report → Brief format
- IF implementation detail OR architecture → Detailed format
- IF options presentation → Numbered list OR AskUserQuestion
- IF error explanation → Contextual (brief if clear, detailed if complex)

**Formatting Rules**:
- First 1-2 sentences = decision-critical info
- Headers for sections requiring System 2 attention
- Bold for critical terms/decisions
- Bullets for lists (not prose paragraphs)
- Max 3-4 sentences per paragraph in chat

**Token Techniques**:
- Remove: "basically", "essentially", "generally", "actually"
- Replace repetition with references
- Omit background unless requested
- Use tables over prose where applicable

## Existing Pattern Research

### Pattern: CEO Hook Lightweight Injection
- Injects context on every user message
- Low token cost (~200 tokens)
- General directives, not rules
- Works because it's  brief

### Pattern: Skills with Decision Trees
- `creating-mermaid-flowcharts` has conditional logic
- `writing-requirements-documents` has "when to use" section
- `writing-plans` has format specifications

### Pattern: Before/After Examples
- Multiple skills use this pattern
- Shows concrete transformations
- Prevents misinterpretation

### Pattern: Red Flags & Rationalizations
- `writing-requirements-documents` has this
- `using-superpowers` has extensive rationalizations section
- Effective at preventing shortcuts

## Design Decisions

### Decision 1: Skill vs. Hook Enhancement
**Choice**: Create new skill, keep hook as-is
**Rationale**:
- Hook should stay lightweight
- Skill provides depth when needed
- Skill can be tested with subagents
- Skill can evolve without hook changes

### Decision 2: Token Budget for Skill
**Target**: ~3,000-4,000 tokens
**Rationale**:
- Must be readable in context
- Smaller than elements-of-style (12K)
- Large enough for comprehensive examples
- Can be loaded per-session if needed

### Decision 3: Integration Strategy
**Approach**: Reference elements-of-style, extend CEO hook
**Implementation**:
- Mention elements-of-style for prose quality
- State this skill covers format/structure
- CEO hook points to this skill for details (optional enhancement)

### Decision 4: Mandatory vs. Guidance
**Choice**: Provide both rules and judgment calls
**Implementation**:
- Hard rules: "ALWAYS use numbered lists for options"
- Soft guidance: "Generally prefer brief format for status updates"
- Decision trees for gray areas

## Next Steps

1. Create detailed design document with:
   - Complete skill structure
   - Content-type matrix (exhaustive)
   - 5+ before/after examples
   - Integration points with existing system

2. Design document should specify:
   - Exact formatting rules
   - Token reduction checklist
   - F-pattern optimization techniques
   - Progressive disclosure patterns
