---
type: task
task-name: fix-issue
description: Resolve specific issue identified in user story with focused context and agent-agnostic approach
required-inputs:
  - name: story-file
    description: Path to user story file containing issue context and background
    expected-type: user-story
    validation: file-exists
---

# Fix Issue Task

## Purpose

Resolve specific technical or process issues identified in user stories by providing focused context and agent-agnostic resolution approach. This task allows any agent to address problems by reading story context and receiving targeted issue descriptions from the user.

## SEQUENTIAL Task Execution (Do not proceed until current Task is complete)

### 1. Load Story Context

- Load story file from @{{input.user-story-path}}
- Read current status, acceptance criteria, tasks/subtasks, and dev notes
- Review QA Results section for context about current state
- Understand development history and any previous issues from Development Agent Record

### 2. Issue Description

**Issues to Resolve**:

{{story.known-issues}}

**If no Known Issues found above**, ask user to provide specific issue description including:

- **Issue Type**: infrastructure|testing|implementation|requirements
- **Owner Agent**: [agent-name] (for workflow routing - matches agent who can best resolve this issue)
- **Validator Agent**: [agent-name] (agent who will validate the fix is complete)
- **Description**: Clear, specific description of the problem
- **Context**: How this issue affects story completion or testing with relevant file paths, error messages, or technical constraints
- **Status**: Open

### 3. Issue Analysis and Resolution Planning

Based on story context and user-provided issue description:

- **Analyze Issue Scope**: Determine if issue is isolated or affects multiple components
- **Identify Root Cause**: Review story documentation, dev notes, and QA results for context
- **Plan Resolution Approach**: Determine specific steps needed to resolve the issue
- **Check Dependencies**: Verify if resolution will impact other story components

### 4. Implement Issue Resolution

**Resolution Actions** (select appropriate approach based on issue type):

#### For Infrastructure Issues
- Update file paths, environment configurations, or build settings
- Fix dependency issues or version conflicts
- Resolve deployment or testing infrastructure problems

#### For Testing Issues
- Fix test file locations or test data paths
- Update test configurations or framework settings
- Resolve test execution failures or environment issues

#### For Implementation Issues
- Fix code bugs, logic errors, or missing functionality
- Update implementation to match acceptance criteria
- Resolve integration issues between components

#### For Requirements Issues
- Clarify ambiguous requirements with user
- Update story documentation for clarity
- Align implementation with corrected requirements

### 5. Validation and Documentation

- **Test Resolution**: Verify the issue is actually resolved
- **Run Relevant Tests**: Execute tests affected by the resolution
- **Document Changes**: Record what was changed and why
- **Update Story**: Add resolution notes to appropriate story sections

### 6. Report Resolution Results

Provide structured summary including:

- **Issue Resolved**: Brief description of what was fixed
- **Changes Made**: Specific files, configurations, or code changes
- **Validation Results**: Test results or verification of resolution
- **Impact Assessment**: Any side effects or additional considerations
- **Next Steps**: Recommendations for continued story development

## Template Variables Available

- `{{input.user-story-path}}`: Path to story file containing context
- `{{story.*}}`: All story metadata and content sections
- `{{config.*}}`: Project configuration values (if available)

## Success Criteria

- Issue clearly identified and understood from story context
- Root cause analysis completed based on available information
- Resolution implemented with appropriate validation
- Changes documented for future reference
- Story can proceed with development or completion
- No new issues introduced by the resolution

## Agent-Agnostic Design

This task is designed to work with any agent type:

- **test-writer**: For testing infrastructure or test-related issues
- **code-developer-agent**: For implementation or code-related issues  
- **architect-agent**: For infrastructure or system design issues
- **engineering-mentor-code**: For validation or quality-related issues
- **general-purpose**: For analysis or research-heavy issues

The agent selected should match the issue type for optimal resolution efficiency.
