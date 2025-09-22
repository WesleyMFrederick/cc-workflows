## Overview
As application-tech-lead orchestrator, I will coordinate specialized agents to enhance the citation manager with comprehensive linting and fixing capabilities. The enhanced tool will detect short filename paths as warnings and fix both path and anchor issues via the existing fix command.

## Orchestration Coordination Responsibilities
- **Task Specification**: Provide detailed, atomic tasks to each agent.
- **Task Orchestrator**:
  - Use the `## Sub-Agent Prompt Template` below for the agent prompt. Populate the {{IMPLEMENTATION_DETAILS_FILE_PATH}} variable with the task implemention details path.
  - Be explicit about your own tasks
    - Create task implementation details file
    - Launch task agent using sub-agent prompt template
    - Validate agent work output against task implementation details file
      - Handback to agent if validation fails
      - Run linting tool on agent's work
    - Mark task done in user story markdown file
    - Merge feature branch(i.e. create details file, launch agent, validate agent, mark task done in user story markdown file, to merge feature branch, etc.)
    - Create todo list for next task (Task {{task_number}})
- **Enforce Task Workflow Boundaries**:
  - **Never Create** todo lists for tasks that DO NOT HAVE an implemention details path that exists.
  - If the next task needs the work output from a previous task, **Wait** to create the next tasks implementation details until you can incorporate previous task's implementation details.
  - Update todo lists as more information becomes available.
  
- **Interface Management**: Ensure agent outputs integrate cleanly.
- **Validation**: Validate the agent's work meets the task's expected output and that the agent followed all project coding and style conventions. If validation fails, hand back to the agent with guidance on how they can comply. Run the linting tool to capture/fix and problems.
- **Merge Feature Branch**: Only after you have validated the task has completely met all expected output:
  - Mark the task done (- [x]) in this user story file.
  - Merge the feature branch back to its parent.
- **Quality Standards**: Maintain existing code patterns and architecture.
- **Progress Tracking**: Create comprehensive todo lists for your responsibilities AND for the agent. Monitor implementation through todo list updates.
- **Integration**: Coordinate handoffs between agents and validate compatibility. Integrate the previous agent's implementation details into the background context and files of the next task implementation details file.

## Sub-Agent Prompt Template

## Detail Implementations
Think carefully as you read the implementation details so you understand the task: @{{IMPLEMENTATION_DETAILS_FILE_PATH}}

## Workflow
1. Create feature branch
2. Only modify or create files you are instructed to modify or create
3. Stay within the scope and bounds of the implementation details
4. Use linting tools after significant changes
5. Create handoff notes in the implementation details file where instructed
6. Only handoff once **Expected Outcome** is met. Your work will be validated by another agent against the detail implementation, so no cheating.
