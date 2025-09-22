---
type: task
task-name: execute-workflow
description: Execute multi-agent workflows by loading workflow YAML definitions and coordinating agent sequences with state management
required-inputs:
  - name: workflow-file
    description: 'Path to workflow YAML definition file (e.g., agentic-workflows/workflows/tdd-workflow.yaml)'
    expected-type: workflow-definition
    validation: file-exists
  - name: story-file  
    description: 'Path to user story file for workflow execution and state tracking'
    expected-type: user-story
    validation: file-exists
---

# Execute Workflow Task

## Purpose

To execute generic multi-agent workflows by loading workflow definitions from YAML files and coordinating agent sequences with proper state management, error handling, and retry logic. This task enables automated execution of any workflow type (TDD, code review, validation, etc.) using a consistent orchestration pattern.

## SEQUENTIAL Task Execution (Do not proceed until current Task is complete)

### 0. Load Workflow Configuration

- Load workflow YAML definition file from {{input.workflow-file}}
- If the file does not exist, HALT and inform user: "Workflow definition not found at {{input.workflow-file}}. Please verify the workflow file path and ensure it follows the workflow schema."
- Parse workflow structure: name, steps, agent assignments, retry limits, success criteria
- Load target story file from {{input.story-file}} to understand current state

### 1. Parse Current Workflow State

#### 1.1 Use parse-workflow.js for State Analysis

- **CRITICAL**: Use parse-workflow.js as the primary workflow state engine:

  ```bash
  node utility-scripts/parse-workflow.js {{input.workflow-file}} {{input.story-file}}
  ```

- parse-workflow.js automatically handles:
  - Story file Task/Subtask checkbox analysis
  - Completed vs pending step identification  
  - Retry counter extraction
  - **NEW**: Known Issues routing analysis for validation failure recovery
  - Current workflow step determination with routing decisions

#### 1.2 Validate Workflow Compatibility

- Verify story file structure supports workflow execution
- Check that required story sections exist (Tasks/Subtasks, Dev Agent Record, etc.)
- Confirm story file YAML frontmatter contains necessary metadata
- HALT if story file is incompatible with workflow requirements

### 2. Execute Current Workflow Step

#### 2.1 Process parse-workflow.js Output and Generate Agent Prompt

- **CRITICAL**: Extract complete workflow decision from parse-workflow.js JSON output:
  - `action`: 'execute-step', 'route-to-agent', 'manual-route', or 'workflow-complete'
  - `step`: Current workflow step object with agent and task-template information
  - `routing`: Boolean indicating if this is a routing decision vs normal progression
- **Execute promptGenerationCommand**: Run the exact command from parse-workflow.js output:

  ```bash
  # Example output from parse-workflow.js:
  node utility-scripts/parse-prompt.js agentic-workflows/tasks/write-tests.md story.md .claude/agents/test-writer.md
  ```

- **Handle Routing Scenarios**:
  - Normal progression: Continue with next incomplete step
  - route-to-agent: Workflow is routing back to previous agent based on Known Issues
  - manual-route: Manual routing override was specified via --route-to parameter
- Read generated prompt file content for Task tool execution

#### 2.2 Execute Agent via Task Tool

- Spawn designated agent using Task tool with generated prompt
- Pass complete processed prompt as single parameter to agent
- Wait for agent completion and capture full response
- Parse agent response from response[0].text format
- Extract structured data or status information from agent output

### 3. Process Agent Response and Update State

#### 3.1 Parse Agent Output

- Extract workflow status from agent response (success/fail/partial)
- Identify any issues or error messages from agent execution
- Determine next workflow step based on agent response and workflow definition
- Check if agent response meets workflow step success criteria

#### 3.2 Update Story File State Using parse-workflow.js

- **CRITICAL**: Use parse-workflow.js to update workflow state and determine next action:

  ```bash
  node utility-scripts/parse-workflow.js {{input.workflow-file}} {{input.story-file}} --update-step --current-step={{step.id}} --status=success
  ```

- parse-workflow.js automatically handles:
  - Task checkbox updates with [x] completion status
  - Completion timestamp and workflow tracking
  - Story status updates if workflow is complete
  - **NEW**: Next step routing analysis (may route to different agent based on validation results)
- **Handle Routing Results**: Parse JSON response for next workflow action:
  - `workflow-complete`: All steps finished successfully
  - `route-to-agent`: Validation failure triggered routing to specific agent
  - `execute-step`: Continue with normal linear progression

### 4. Determine Next Workflow Action

#### 4.1 Success Path

- If current step succeeded and more steps remain:
  - Move to next workflow step as defined in workflow YAML
  - Repeat execution cycle from step 2
- If current step succeeded and no more steps remain:
  - Mark workflow as complete in story file
  - Update story status to appropriate completion state
  - Generate workflow completion summary

#### 4.2 Error and Retry Path

- If current step failed and retry limit not exceeded:
  - Increment retry counter in story file
  - Re-execute current step from step 2.1
- If current step failed and retry limit exceeded:
  - Mark step as permanently failed in story file
  - Check workflow definition for error handling instructions
  - Route to recovery step or fail workflow gracefully

#### 4.3 Automated Validation Routing (NEW)

- **Engineering Mentor Integration**: When validation fails, engineering mentor documents issues in Known Issues section with:
  - **Issue Type**: testing, implementation, infrastructure, requirements
  - **Owner Agent**: Specific agent name for routing (e.g., test-writer, code-developer-agent)
  - **Description**: Detailed issue description with file references
  - **Reproduction Steps**: Exact commands to reproduce the issue
  - **Status**: Open (triggers routing), In Progress, Resolved, Closed

- **Automatic Routing Decision**: parse-workflow.js automatically:
  - Extracts Owner Agent from first Open issue in Known Issues section
  - Routes workflow back to specified agent (test-writer for missing tests, code-developer-agent for implementation issues)
  - Continues iterative cycle until validation passes or retry limits exceeded
  
- **Manual Routing Override**: For debugging, use manual routing:

  ```bash
  node utility-scripts/parse-workflow.js {{input.workflow-file}} {{input.story-file}} --route-to=write-tests
  ```

### 5. Workflow Completion

#### 5.1 Success Completion

- Verify all workflow steps completed successfully
- Update story status to appropriate completion state (Ready for Review, Done, etc.)
- Generate workflow execution summary with:
  - Total steps executed
  - Agents involved
  - Completion time
  - Any notable issues resolved during execution

#### 5.2 Failure Completion

- Document workflow failure reason and step where failure occurred
- Update story file with failure information and recommendations
- Preserve all agent outputs and error information for debugging
- Provide clear guidance on manual intervention needed

## Workflow Context Variables

The following template variables are available for workflow execution:

- `{{workflow.name}}` - Name of the current workflow being executed
- `{{workflow.current-step}}` - Current step ID from workflow definition
- `{{workflow.retry-count}}` - Number of retries for current step
- `{{workflow.previous-result}}` - Output from previous workflow step
- `{{input.story-file}}` - Path to story file being processed
- `{{input.workflow-file}}` - Path to workflow definition file
- `{{config.*}}` - All configuration values from story file frontmatter

## Routing Context Variables (NEW)

Additional variables available when routing is active:

- `{{workflow.routing-active}}` - Boolean indicating if current step is a routing decision
- `{{workflow.routing-source}}` - Source of routing: 'known-issues', 'manual-override', 'linear-progression'  
- `{{workflow.owner-agent}}` - Agent name extracted from Known Issues Owner Agent field
- `{{workflow.route-to-step}}` - Target step ID for routing decisions

## parse-workflow.js Integration

All workflow execution relies on parse-workflow.js as the state engine:

```bash
# Standard workflow state analysis
node utility-scripts/parse-workflow.js {{input.workflow-file}} {{input.story-file}}

# Step completion with automatic routing analysis  
node utility-scripts/parse-workflow.js {{input.workflow-file}} {{input.story-file}} --update-step --current-step={{step.id}} --status=success

# Manual routing override for testing
node utility-scripts/parse-workflow.js {{input.workflow-file}} {{input.story-file}} --route-to=write-tests
```

## Error Handling Standards

- **Retry Logic**: Follow workflow YAML retry limits (default 3 attempts per step)
- **State Preservation**: Always update story file state before proceeding
- **Error Documentation**: Capture all agent outputs and error messages
- **Graceful Degradation**: Provide clear failure modes and recovery guidance
- **Validation Loops**: Support iterative improvement cycles with mentor feedback
- **Automated Routing Recovery (NEW)**: When validation fails:
  - Engineering mentor documents issues with Owner Agent field
  - parse-workflow.js automatically routes to appropriate agent
  - Supports TDD feedback loops (validation → test-writer → implementation → validation)
  - Manual routing override available for debugging: `--route-to=step-id`
