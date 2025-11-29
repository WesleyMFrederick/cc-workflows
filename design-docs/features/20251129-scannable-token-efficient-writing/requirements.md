# Scannable & Token-Efficient Writing Skill - Requirements Document

**Date**: 2025-11-29
**Status**: Draft
**Related Whiteboard**: [Whiteboard Phase 1](./1-discovery-elicitation-sense-making/whiteboard-phase1.md)

## Introduction

This document defines requirements for a Claude Code skill that enables Claude to write output optimized for both human scannability (CEO reading patterns) and token efficiency (LLM context management). The skill addresses the dual challenge of creating responses that executives can quickly scan while minimizing token consumption to maximize conversation depth.

## Alignment with Architecture Principles

_To be evaluated using `evaluate-against-architecture-principles` skill in Phase 2_

## Problem Statement

Claude currently lacks standardized guidance for balancing two critical output constraints:

1. **Human Scannability**: CEO needs rapid comprehension via System 1 (fast, pattern-based) processing with clear signals for when System 2 (slow, analytical) engagement is needed
2. **Token Efficiency**: 200K token budget requires minimizing verbose explanations, redundant context, and unnecessary detail to maximize conversation turns

Without clear rules, Claude may over-explain (wasting tokens) or under-explain (reducing comprehension), creating friction in the development workflow.

## Requirements

### Functional Requirements

- FR1: The skill SHALL define specific formatting rules for chat responses vs. file content, distinguishing scannable output from detailed documentation. ^FR1
- FR2: The skill SHALL provide decision criteria for when to use brief scannable format vs. detailed comprehensive format based on content type and user role. ^FR2
- FR3: The skill SHALL specify front-loading patterns where decision-critical information appears in the first 1-2 sentences of any response or section. ^FR3
- FR4: The skill SHALL define visual hierarchy rules using headers, bullets, bold text, and whitespace to support F-pattern scanning. ^FR4
- FR5: The skill SHALL provide token reduction techniques including elimination of hedge words, redundant explanations, and background fluff. ^FR5
- FR6: The skill SHALL specify when to use progressive disclosure (start brief, add detail on request) vs. comprehensive detail upfront. ^FR6
- FR7: The skill SHALL define formatting for option presentations requiring either AskUserQuestion tool or numbered lists with recommendation stated upfront. ^FR7
- FR8: The skill SHALL provide examples of scannable vs. non-scannable content types with specific formatting for each. ^FR8
- FR9: The skill SHALL integrate with existing `elements-of-style:writing-clearly-and-concisely` skill without duplication or contradiction. ^FR9
- FR10: The skill SHALL define compliance measurement criteria so Claude can self-assess adherence to scannability and token efficiency standards. ^FR10

### Non-Functional Requirements

- NFR1: The skill SHALL follow Single Responsibility—focus exclusively on output formatting and structure, not content generation strategy. ^NFR1
- NFR2: The skill SHALL use modular design with clear sections for chat output rules, file output rules, and content-type-specific guidance. ^NFR2
- NFR3: The skill SHALL provide decision trees or clear conditional logic using the [`creating-mermaid-flowcharts` skill](/Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/cc-workflows/.claude/skills/creating-mermaid-flowcharts/SKILL.md) that Claude can apply without ambiguity during response composition. ^NFR3
- NFR4: The skill SHALL include concrete before/after examples demonstrating scannable vs. non-scannable formatting for at least 3 common scenarios. ^NFR4
- NFR5: The skill SHALL maintain consistency with CEO output preferences hook while being usable independently in any context. ^NFR5
- NFR6: The skill SHALL avoid creating new jargon or acronyms—use plain language accessible to any Claude instance reading the skill. ^NFR6
- NFR7: The skill SHALL include anti-rationalization safeguards preventing Claude from justifying verbose output when brief format is appropriate. ^NFR7
- NFR8: The skill SHALL follow writing-skills token budget guidelines with SKILL.md under 200 words and total context load (SKILL.md + formatting-reference.md) not exceeding 3,500 tokens. ^NFR8

## Success Criteria

The skill will be considered successful when:

1. Claude can consistently apply formatting rules to produce scannable chat responses
2. Token usage for equivalent information content decreases by measurable amount
3. CEO can extract key decisions/actions from responses within 10 seconds
4. Detailed content (pseudocode, design docs) remains comprehensive when appropriate
5. Skill integrates seamlessly with existing workflow skills without conflicts

## Out of Scope

- Content strategy or what information to include (covered by role-specific skills)
- Technical writing style guide for documentation (covered by `elements-of-style`)
- Code formatting or implementation standards (covered by application-tech-lead)
- Git commit message formatting (covered by `create-git-commit` skill)

## Related Documentation

- Research: [Scannable Content](../../research/Scannable Content.md)
- Research: [F-Shaped Pattern (original)](../../research/F-Shaped%20Pattern%20For%20Reading%20Web%20Content%20%28original%20eyetracking%20research%29.md)
- Research: [F-Shaped Pattern (modern)](../../research/F-Shaped%20Pattern%20of%20Reading%20on%20the%20Web%20Misunderstood%2C%20But%20Still%20Relevant%20%28Even%20on%20Mobile%29.md)
- Research: [Kahneman - System 1 vs System 2](../../research/Daniel Kahneman Explains The Machinery of Thought.md)
- Research: [Token Optimized Writing](../../research/Token optimized writing.md)
- Research: [Web Content Best Practices](../../research/Web content best practices.md)
