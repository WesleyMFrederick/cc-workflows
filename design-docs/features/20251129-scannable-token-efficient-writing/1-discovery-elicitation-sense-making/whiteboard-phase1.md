# Whiteboard: Scannable & Token-Efficient Writing Skill

**Date**: 2025-11-29
**Phase**: Discovery & Ideation

## Problem Statement

Claude needs to write output that serves two masters:
1. **Token efficiency** for LLM processing (minimize context usage)
2. **Scannability** for human CEO who needs quick comprehension without unnecessary detail

Current state: No standardized approach for balancing these needs. Claude may over-explain or under-explain, making responses either bloated or unclear.

## Key Research Insights

### Human Cognition (Kahneman - System 1 vs System 2)

**System 1** (Fast, automatic):
- Pattern recognition, visual cues, heuristics
- Dominates web scanning behavior
- Minimal effort, no voluntary control
- Good at familiar situations, bad at logic/statistics

**System 2** (Slow, deliberate):
- Effortful analysis, complex computation
- Engages only when System 1 can't handle it
- Requires attention and concentration
- Used for high-stakes decisions

**Key insight**: Users optimize for the web as a whole, not individual sites. They use System 1 to decide what deserves System 2 attention.

### Scanning Patterns (Nielsen Norman Group)

**F-Pattern** (most common):
- Horizontal scan across top
- Second horizontal scan (shorter)
- Vertical scan down left side
- First lines and first words get most fixations
- Pattern emerges when: unformatted text + efficiency goal + low motivation

**Other patterns**:
- Layer-cake: scan headings only
- Spotted: hunt for specific words/numbers
- Marking: eyes fixed while scrolling
- Bypassing: skip repeated first words
- Commitment: read everything (rare)

**Critical finding**: F-pattern is BAD - users miss important content based on flow, not importance. Good formatting prevents F-pattern scanning.

### What Makes Content Scannable

**Structure**:
- Short paragraphs (1-3 sentences, one idea each)
- Descriptive headings that preview content accurately
- Bulleted/numbered lists for multi-part ideas
- Visual hierarchy via typography and whitespace
- Front-load important words at start of headings/sentences

**Scannable content types**:
- Navigation, menus, dashboards (independent items)
- Checklists, procedures, FAQs (atomic actions)
- Marketing pages, product details (independent sections)

**Non-scannable content types** (require System 2):
- Deep conceptual explanations with dependencies
- Legal/policy docs with precise interdependent language
- Stories and narratives requiring context

### Token Efficiency Principles

From "Token optimized writing" research:
- **Don't just say "optimize for LLM"** - define specific constraints
- Define: budget, priority, format, content focus, success metric
- Eliminate: redundant explanations, background fluff, hedge words
- What's "redundant" or "detail" needs clear definition

**Constraint examples**:
- Maximum token budget
- Priority information (what's referenced repeatedly)
- Format preferences (bullets, tables, short sections)
- Content focus (actionable details affecting decisions)
- Success metric (find detail in <10 seconds)

### Web Content Best Practices

- Chunk content into modular units
- Front-load essential information
- Use headings to make content scannable
- Focus on 2-3 key points per section
- Identify audience and goals per page
- Keep it simple, concise, clear

## User Need Analysis

**CEO context** (from hook output):
- Time-sensitive decision maker
- Needs scannable output
- Doesn't need all details all the time
- Wants brief, clear, actionable information
- When detail IS needed (implementation), needs it comprehensive

**Claude context**:
- Token budget constraints (200K tokens)
- Multiple tool calls consume tokens quickly
- Longer responses = fewer turns before context limit
- Need to balance thoroughness with efficiency

## Use Cases

### When to be scannable + brief
- Status updates
- Tool execution summaries
- Option presentations (use AskUserQuestion or numbered lists)
- Progress reports
- Error summaries

### When to be detailed
- Implementation pseudocode
- Code scaffolding
- Architectural decisions with trade-offs
- Design documents
- Technical specifications

### When to be token-efficient always
- Internal reasoning (thinking blocks)
- Tool parameter descriptions
- Repeated context (use references, not repetition)

## Design Principles (Emerging)

1. **Progressive disclosure**: Start scannable, add detail on request
2. **Front-load key information**: Decision-critical info in first 2 sentences
3. **Visual hierarchy**: Headers, bullets, bold for scanning
4. **Contextual adaptation**: Match detail level to content type
5. **Token consciousness**: Eliminate hedge words, redundant explanations
6. **Recommendation-first**: When presenting options, state preference upfront

## Questions to Answer in Design Phase

- How does this integrate with existing skills (elements-of-style, CEO output hook)?
- What specific formatting rules should apply to chat vs. files?
- How to detect when detail is appropriate vs. inappropriate?
- What are the token budget guardrails?
- How to measure success (compliance)?

## Next Steps

1. Create formal requirements document
2. Research existing skills for patterns
3. Design specific rules and examples
4. Create implementation plan
