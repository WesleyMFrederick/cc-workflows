# Scannable & Token-Efficient Writing - Design Document

**Date**: 2025-11-29
**Status**: Draft
**Related Requirements**: [Requirements Document](../requirements.md)
**Related Whiteboard**: [Phase 2 Whiteboard](./whiteboard-phase2.md)

## Overview

This document provides system-specific design for a Claude Code skill that teaches Claude to write output optimized for both human scannability (F-pattern, System 1/2) and token efficiency (context management). The skill extends the existing CEO output hook with comprehensive formatting rules and decision logic.

## System Architecture

### Integration Points

1. **CEO Output Hook** (`.claude/hooks/user-prompt-submit.sh`)
   - Remains unchanged
   - Provides high-level directives
   - This skill provides implementation details

2. **elements-of-style Skill** (plugin)
   - Complimentary, not overlapping
   - elements-of-style = prose quality (word choice, grammar)
   - This skill = structure/format (layout, scannability)

3. **Existing Writing Skills**
   - `writing-requirements-documents` - document-specific
   - `writing-plans` - document-specific
   - This skill - general output formatting

### Skill Location

**Path**: `.claude/skills/scannable-token-efficient-writing/SKILL.md`
**Token Budget**: ~3,500 tokens (readable in context, smaller than elements-of-style)

## Content-Type Decision Matrix

| Content Type | Format | Detail Level | Key Techniques |
|-------------|--------|--------------|----------------|
| Status update | Brief | Minimal | Bullets, front-load outcome |
| Progress report | Brief | Summary only | Current state + blockers |
| Tool execution summary | Brief | Action + result | No tool internals |
| Option presentation | Structured | Recommendation + trade-offs | Numbered list OR AskUserQuestion |
| Error explanation | Contextual | Varies by clarity | Brief if clear, detailed if complex |
| Implementation pseudocode | Detailed | Comprehensive | Full context, strategic comments |
| Code scaffolding | Detailed | Complete | All structure, key patterns |
| Architecture decision | Detailed | Full rationale | Trade-offs, alternatives, justification |
| Design document | Detailed | Comprehensive | All sections, examples |
| Technical specification | Detailed | Complete | Exact requirements |
| Quick answer | Brief | Direct | Answer first, context optional |
| Explanation request | Progressive | Start brief | Summary → detail on request |

## Formatting Rules

### Chat Output Rules

#### 1. Front-Loading (First 1-2 Sentences)

```markdown
<!-- GOOD -->
Requirements document created with 10 functional requirements and 7 non-functional requirements. Citations validated successfully.

<!-- BAD -->
I've completed the task you requested. After careful consideration and following the writing-requirements-documents skill, I created a comprehensive requirements document. The document includes various sections...

#### 2. Visual Hierarchy

- Headers: Section breaks for System 2 engagement
- **Bold**: Critical terms, decisions, actions
- Bullets: Lists, not prose paragraphs
- Short paragraphs: 3-4 sentences max in chat

#### 3. F-Pattern Optimization

- Most important words at start of lines
- Scannable headers that preview content
- Key information in first two horizontal scans
- Action items/decisions front-loaded

#### 4. Progressive Disclosure

- Start with summary/outcome
- Provide detail if complexity requires it
- Signal "more available" when appropriate
- Don't pre-emptively explain everything

### File Output Rules

**Different standards for files**:
- Comprehensive detail appropriate
- Full code examples with comments
- Complete explanations
- Extensive documentation acceptable

**Why**: Files are reference material (System 2), chat is scanning medium (System 1 → selective System 2)

## Token Reduction Techniques

### Remove Hedge Words

**Eliminate**:
- "basically" → delete
- "essentially" → delete
- "generally" → delete
- "actually" → delete
- "really" → delete
- "just" → delete (usually)
- "quite" → delete
- "very" → use stronger word

**Before**: "I'm basically just going to essentially create a file that will actually contain the implementation."
**After**: "Creating implementation file."

### Avoid Redundant Explanations

**Pattern**: Don't explain what you're about to do, then do it, then explain what you did.

**Bad**:

```text
I'm going to read the file to check its contents.
[Reads file]
I've read the file and found the following contents...

**Good**:

```text
Checking file contents:
[Reads file]
Found: [summary of contents]

### Use References vs. Repetition

**Pattern**: When mentioning same info multiple times, use references.

**Bad**:

```text
The requirements document specifies 10 functional requirements.
...later...
As stated in the requirements document with its 10 functional requirements...

**Good**:

```text
Requirements: 10 functional (FR1-FR10)
...later...
Per requirements above...

### Thinking Block Optimization

**Thinking blocks consume tokens**. Use them for:
- Complex reasoning
- Trade-off analysis
- Debugging logic

**Don't use for**:
- Narrating simple actions
- Repeating what's in response
- Obvious next steps

## Progressive Disclosure Patterns

### Pattern 1: Summary → Detail on Request

**Use when**: Complexity varies by user need

**Template**:

```text
[1-2 sentence summary]

Need more detail?

**Example**:
"Found 3 validation errors in requirements.md. All related to missing block anchors.

Need the full error report?"

### Pattern 2: Outcome → Context if Needed

**Use when**: User cares about result, not process

**Template**:

```text
[Outcome/result]
[Optional: brief context only if outcome unclear]

**Example**:
"Tests passing. Fixed 2 type errors in MarkdownParser.ts:45 and CitationValidator.ts:128."

### Pattern 3: Decision → Rationale

**Use when**: Presenting recommendations

**Template**:

```text
**Recommendation**: [choice]
**Why**: [1-2 sentence rationale]
**Trade-offs**: [alternatives]

## Before/After Examples

### Example 1: Tool Execution Summary

**BAD (Verbose)**:

```text
I've successfully completed the execution of the Bash tool to run the npm test command. The test suite has been executed and I can now report that all tests have passed successfully. There were 15 test suites that were run, containing a total of 47 individual test cases, and every single one of them passed without any failures or errors.

**GOOD (Scannable)**:

```text
Tests passing: 15 suites, 47 tests.

### Example 2: Option Presentation

**BAD (Prose)**:

```text
There are a few different approaches we could take here. One option would be to use a monorepo structure, which would keep everything together. Another possibility is to use separate repositories, which might make things cleaner. We could also consider a hybrid approach. What do you think would work best for your needs?

**GOOD (Structured)**:

```text
**Recommendation**: Monorepo structure

**Why**: Shared tooling, atomic commits, simpler dependency management for your team size (3 developers).

**Options**:
1. **Monorepo** - Single repo with workspaces (recommended)
   - Pro: Shared config, easier refactoring
   - Con: Slower git operations at scale

2. **Multi-repo** - Separate repos per service
   - Pro: Independent versioning, clearer boundaries
   - Con: Dependency management overhead, coordination cost

3. **Hybrid** - Core in monorepo, services separate
   - Pro: Flexibility
   - Con: Complexity of two patterns

### Example 3: Error Explanation

**BAD (Over-detailed)**:

```text
I encountered an error when attempting to execute the command. The error message indicates that there's an issue with the file path. This is happening because the citation validation system is looking for the file in a specific location, but the file doesn't exist at that location. The reason this is occurring is likely due to the way the path was specified in the markdown link. Let me explain the citation validation process...

**GOOD (Contextual)**:

```text
Citation validation failed: File not found at `../../research/Scannable%20Content.md`

**Fix**: Remove URL encoding - use spaces directly in path:
`../../research/Scannable Content.md`

### Example 4: Status Update

**BAD (Narrative)**:

```text
I wanted to let you know that I've been working on the requirements document as we discussed. I've made significant progress and have completed the first draft. During this process, I created 10 functional requirements that cover all the key aspects we talked about. I also added 7 non-functional requirements to address quality attributes. The document is now ready for your review.

**GOOD (Front-loaded)**:

```text
Requirements document complete:
- 10 functional requirements (FR1-FR10)
- 7 non-functional requirements (NFR1-NFR7)
- All citations validated

Ready for review.

### Example 5: Architecture Decision

**Context**: This is detailed content type - comprehensive format appropriate

**GOOD (Detailed but Structured)**:

```text
## Decision: Use TypeScript for Citation Manager

**Recommendation**: Migrate from JavaScript to TypeScript

**Rationale**:
- Type safety prevents runtime errors in file path handling
- Better IDE support for API contracts
- Easier refactoring as codebase grows
- Team already familiar with TS from other projects

**Trade-offs**:
- **Accepted**: Build step complexity, migration effort (~40 hours)
- **Mitigated**: Use incremental migration strategy, tsconfig allows .js files

**Alternatives Considered**:
1. JSDoc types - Rejected: Incomplete coverage, no compile-time checks
2. Flow - Rejected: Smaller ecosystem, declining community support

**Implementation Impact**:
- Phase 1: Setup tsconfig, migrate core types (8 hours)
- Phase 2: Migrate validators, parsers (24 hours)
- Phase 3: Migrate CLI, tests (8 hours)

**Success Criteria**: Zero runtime type errors in production after migration

## Red Flags & Rationalizations

### Red Flags

🚩 Response starts with "I'm going to..." instead of outcome
🚩 Explaining what tool does before calling it
🚩 Prose paragraphs where bullets would work
🚩 Options presented without recommendation
🚩 Repeating information already stated
🚩 Hedge words in every sentence
🚩 Context/background before the answer
🚩 Narrating simple actions in thinking blocks

### Common Rationalizations

| Rationalization | Why You Think This | The Truth |
|----------------|-------------------|-----------|
| "User needs context to understand" | Thorough feels professional | Front-load answer, context optional |
| "Options should be neutral" | Avoid bias | CEO needs recommendation to decide faster |
| "This is complex, needs explanation" | Detail shows competence | Start brief, add detail if requested |
| "Being thorough is better" | More information = better | Respecting time = better |
| "Just this once won't matter" | One verbose response is fine | Patterns form from single exceptions |

## Skill Structure

**Sections** (in order):
1. Overview & When to Use
2. Core Principles (F-pattern, System 1/2, tokens)
3. Content-Type Decision Matrix
4. Chat vs. File Output Rules
5. Formatting Techniques
6. Token Reduction Techniques
7. Progressive Disclosure Patterns
8. Before/After Examples (5 scenarios)
9. Red Flags & Rationalizations
10. Integration with Other Skills

**Estimated Token Count**: 3,200-3,500 tokens

## Integration with Other Skills

**Skills this complements**:
- `elements-of-style:writing-clearly-and-concisely` - Prose quality
- CEO output hook - High-level directives
- `writing-requirements-documents` - Document structure
- `writing-plans` - Implementation plans

**Skills this doesn't overlap**:
- `brainstorming` - Content generation
- `writing-skills` - Skill creation
- `test-driven-development` - Development process

## Success Metrics

**Skill is successful when**:
1. Chat responses start with outcome/decision (not process)
2. Options presented with numbered lists + recommendation
3. Token usage decreases for equivalent information
4. CEO can extract key decisions in <10 seconds
5. Detailed content (pseudocode, design) remains comprehensive
6. No rationalization for verbose output when inappropriate

## Open Questions

- Should skill be mandatory via using-superpowers checklist?
- Should CEO hook reference this skill explicitly?
- How to measure token efficiency improvement?
- Should we add hook to validate response format?
