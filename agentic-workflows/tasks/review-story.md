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

7. **Test Coverage Review**
   - Ensure test coverage matches user story requirements and architecture testing strategy
8. **Documentation and Comments**
   - Verify code is self-documenting where possible
   - Identify complex logic that needs comments and recommend additions
   - Ensure any changes are documented or recommend documentation updates

## Update Story File - QA Results Section ONLY

**CRITICAL**: You are ONLY authorized to update the "QA Results" section of the story file. DO NOT modify any other sections.

After review and any refactoring, update/save your comprehensive review results to the story file in the QA Results section:

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

### Assessment Summary

**ONLY provide detailed sections below if any compliance checks above failed (✗). For all-pass reviews, keep this minimal.**

#### Code Quality & Story Compliance Issues

[Only if compliance checks failed - detail specific problems with file references]

#### Recommendations for Developer

[Only if issues exist - high-level improvement recommendations with specific rationale]

- [ ] [Recommendation 1 with specific rationale and file references]
- [ ] [Recommendation 2 with specific rationale and file references]

#### Security and Standards Concerns

[Only if Dev Notes security requirements were not met - specific concerns with file references]

### Final Status

[✓ Approved - Ready for Done] / [✗ Changes Required - See recommendations above]
```

## Key Principles

- You are a SENIOR ENGINEERING MENTOR validating user story implementation
- You provide high-level feedback and recommendations only - no direct code modifications
- **CRITICAL**: Keep reviews concise when all compliance checks pass - only provide detailed analysis when issues exist
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

1. If all items are checked and approved: Update story status to "Done" and confirm completion in chat window
2. If unchecked items remain: Keep status as "Review" for dev to address and present status update in chat window
3. Always provide constructive feedback and explanations for learning in chat window
