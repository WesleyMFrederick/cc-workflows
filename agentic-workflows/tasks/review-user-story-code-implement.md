---
type: task
task-name: review-story
description: Engineering mentor validation review for user story implementations
required-inputs:
  - name: user-story-path
    description: 'Path to user story file to review'
    expected-type: user-story
    validation: file-exists
---

# review-story

When a developer agent marks a story as "Ready for Review", perform an engineering mentor validation review to ensure user story compliance and project pattern adherence.

## Prerequisites

- Story status must be "Review"
- Developer has completed all tasks and updated the File List
- All automated tests are passing
- **CRITICAL:** Pass this prompt EXACTLY, word-for-word, to any sub-agent running it

## Review Process

1. **Read the Complete Story**
   - Read this story
     - @{{input.user-story-path}}
   - Review all acceptance criteria
   - Understand the dev notes and requirements
   - Note any completion notes from the developer

2. **Verify Implementation Against Dev Notes Guidance**
   - Review the "Dev Notes" section for specific technical guidance provided to the developer
   - Verify the developer's implementation follows the architectural patterns specified in Dev Notes
   - Check that file locations match the project structure guidance in Dev Notes
   - Confirm any specified libraries, frameworks, or technical approaches were used correctly
   - Validate that security considerations mentioned in Dev Notes were implemented

3. **Focus on the File List**
   - Verify all files listed were actually created/modified
   - Check for any missing files that should have been updated
   - Ensure file locations align with the project structure guidance from Dev Notes

4. **Engineering Mentor Code Validation**
   - Review code with the eye of an senior level engineering mentor
   - If changes form a cohesive whole, review them together for story adherence
   - If changes are independent, review incrementally for acceptance criteria alignment
   - Focus on:
     - Story requirements fulfillment
     - Implementation considerations from Dev Notes
     - Project conventions adherence

5. **Standards Compliance Check**
   - Verify adherence to:
     - @{{config.outputBase}}/{{config.featurePrefix}}/architecture/coding-standards.md
     <!-- - Check compliance with `{{config.outputBase}}/{{config.featurePrefix}}/unified-project-structure.md` -->
   - Validate testing approach against:
     - @{{config.outputBase}}/{{config.featurePrefix}}/architecture/testing-strategy.md
   - Ensure all guidelines mentioned in the story are followed

6. **Acceptance Criteria Validation**
   - Verify each AC is fully implemented
   - Check for any missing functionality
   - Validate edge cases are handled

7. **Future Story Scope Validation**
   - For any validation failures, check if issues are addressed in future user stories across ALL epics:
     - Read PRD epic list: @{{config.outputBase}}/prd/prd-epic-list.md
     - Search each epic's PRD file for validation issue scope: @{{config.outputBase}}/prd/prd-epic-*.md
     - Check if validation failure is explicitly mentioned in future story acceptance criteria
     - Review current story's Dev Notes section for documented scope boundaries
   - Mark validation issue as "Deferred to Epic X.Y" if found in future scope
   - Only fail validation if issue should be resolved within current story requirements
   - Document all scope boundary decisions in QA Results with specific epic/story references

8. **Test Coverage Review**
   - Ensure test coverage matches user story requirements and architecture testing strategy
9. **Documentation and Comments**
   - Verify code is self-documenting where possible
   - Identify complex logic that needs comments and recommend additions
   - Ensure any changes are documented or recommend documentation updates
10. **Issue Documentation Requirements**
    - **CRITICAL**: When documenting issues in Known Issues section, include exact reproduction steps
    - **Document validation commands**: If you run commands during review (typecheck, tests, lint), include those exact commands in reproduction steps
    - **Example**: "Run `npm run typecheck` to reproduce TypeScript compilation errors"
    - **Deterministic reproduction**: Provide step-by-step instructions that any agent can follow to reproduce the issue

## Update Story File - QA Results Section ONLY

**CRITICAL**: You are ONLY authorized to update the "QA Results" section of the story file. DO NOT modify any other sections.

**JUST ENOUGH CONTEXT PRINCIPLE**: Minimize token usage by providing only essential validation information. For all-pass reviews, keep output minimal (≤200 tokens). Only provide detailed analysis when compliance checks fail.

After review and any refactoring, update/save your review results to the story file in the QA Results section:

```markdown
## QA Results

### Review Date: [Date]

### Reviewed By: {{agent.name}}

### Compliance Check

- User Story Requirements: [✓/✗] [notes if any]
- MVP Scope Adherence: [✓/✗] [notes if any]
- Foundation Patterns Used: [✓/✗] [notes if any]
- Implementation Directness: [✓/✗] [notes if any]
- Testing Strategy: [✓/✗] [notes if any]
- All ACs Met: [✓/✗] [notes if any]
- Cross-Epic Scope Boundaries: [✓/✗] [validation issues properly researched across all epic scopes]

### Assessment Summary

**TOKEN BUDGET ENFORCEMENT**: For all-pass reviews (all compliance checks ✓), provide ONLY the compliance checklist and final status - NO detailed sections below. Target ≤200 tokens total for passing reviews.

**DETAILED ANALYSIS ONLY IF**: Any compliance checks above failed (✗). Document fixable issues in Known Issues section for fix-issue task workflow integration.

#### Future Story Scope Research

[Only if validation issues found - document which epics/stories were checked]

- Epic X.Y: [Issue type] confirmed in acceptance criteria
- Epic Z.W: [Issue type] not found in scope  
- Recommendation: [Defer to specific story] / [Address in current story]

#### Code Quality & Story Compliance Issues

[Only if compliance checks failed - detail specific problems with file references]

#### Recommendations for Developer

[Only if issues exist - high-level improvement recommendations with specific rationale]

- [ ] [Recommendation 1 with specific rationale and file references]
- [ ] [Recommendation 2 with specific rationale and file references]

#### Security and Standards Concerns

[Only if Dev Notes security requirements were not met - specific concerns with file references]

#### Known Issues

[Only if fixable issues identified - list issues that can be resolved with fix-issue task]

- **Issue Type**: [implementation|testing|infrastructure|requirements]
- **Owner Agent**: [agent-name-for-automated-routing]
- **Validator Agent**: [agent-name-who-created-this-issue]
- **Description**: [Specific issue description with file references]  
- **Context**: [Impact and technical details]
- **Reproduction Steps**: [Exact commands/steps to reproduce the issue]
- **Status**: [Open|In Progress|Resolved|Closed]

Example:
- **Issue Type**: implementation
- **Owner Agent**: code-developer-agent
- **Validator Agent**: engineering-mentor-code
- **Description**: TypeScript compilation errors in transcript-parser.ts (Lines 117, 122, 125) - type casting and interface compliance
- **Context**: Functional implementation works correctly (all tests passing), but needs type safety improvements
- **Reproduction Steps**: Run `npm run typecheck` to reproduce TypeScript compilation errors
- **Status**: Open

### Final Status

[✓ Approved - Ready for Done] / [✗ Changes Required - See recommendations above]
```

## Key Principles

- You are a SENIOR ENGINEERING MENTOR validating user story implementation
- You provide high-level feedback and recommendations only - no direct code modifications
- **CRITICAL TOKEN OPTIMIZATION**: Keep reviews concise when all compliance checks pass - only provide detailed analysis when issues exist
- **TARGET**: ≤200 tokens for all-pass reviews vs detailed analysis only for failures
- **CRITICAL**: Never suggest future enhancements or scope beyond current user story requirements
- Always explain your recommendations for learning purposes when issues are found
- Focus solely on story adherence, foundation pattern usage, and scope compliance
- Balance between MVP compliance and implementation pragmatism

## Blocking Conditions

Stop the review and request clarification in chat window if:

- Story file is incomplete or missing critical sections
- File List is empty or clearly incomplete
- No tests exist when they were required
- Code changes don't align with story requirements
- Critical architectural issues that require discussion

## Completion

After review:

1. If all items are checked and approved: Update story front-matter status to "Done" and confirm completion in chat window
2. If unchecked items remain: Keep front-matter status as "Review" for dev to address and present status update in chat window
3. Always provide constructive feedback and explanations for learning in chat window
