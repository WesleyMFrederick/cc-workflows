# Agentic Workflow Development Patterns

## Overview

This document outlines the standardized patterns and practices for developing agentic workflow prompts in the Claude Code Web UI project.

## File Structure

```text
agentic-workflows/
├── agents/           # Agent definitions with persona and capabilities
├── tasks/            # Executable task workflows with YAML frontmatter
├── templates/        # Template files for document generation
├── checklists/       # Quality assurance and validation checklists
├── config-schemas/   # Configuration schemas and structural patterns
├── data/             # Knowledge bases and reference materials
├── patterns/         # Design principles and architectural guidance
├── rules/            # Interaction protocols and behavioral guidelines
├── utility-scripts/  # Core parsing, mirroring, and workflow management scripts
├── workflows/        # YAML workflow definitions for multi-agent coordination
├
├ agentic-workflow-development-patterns.md  # This documentation file
├ config.yaml                               # Main configuration for agentic workflow system
└ package.json                              # Node.js project configuration and scripts
```

## Development Workflow

### 1. Agent Development Pattern

**Location:** `agentic-workflows/agents/{agent-name}.md`

**Template Reference:** `agentic-workflows/config-schemas/agent-config-template.md`

**Required Structure:**

```yaml
---
name: agent-name-kebab-case
description: Use for [functions]. This agent specializes in [specialization]. Examples: <example>Context: [context]. user: '[request]' assistant: '[response]' <commentary>[reasoning]</commentary></example>
tools: [Tool1, Tool2, Tool3]
model: sonnet
color: [blue|red|purple|green|yellow|orange]
persona-name: Human Readable Agent Name
---

# Agent Name

## Activation
activation-instructions: |
  - STEP 1: Read THIS ENTIRE FILE - contains complete persona definition
  - STEP 2: Adopt the persona defined in ## Persona section
  - STEP 3: Greet user with name/role and mention `--help` command
  - [Standard activation workflow with file loading rules]

## Persona
persona:
  role: Primary Role & Secondary Role Descriptor
  style: trait1, trait2, trait3, trait4, trait5, trait6
  identity: Specialization description with focus areas
  focus: Primary focus, secondary focus, key outcomes

## User Interfaces and Interaction Protocols
[UNIVERSAL SECTION - Same for all agents]
- Dual-interface approach (chat window vs file-based)
- Protocol compliance rules (9 question limit, content segregation)

## Agent Commands and File Dependencies
commands:
  - help: Present numbered list of commands
  - [domain-commands]: Agent-specific command set
dependencies:
  tasks: [task files]
  templates: [template files]
  data: [knowledge base files]

## Resolving Requests
[UNIVERSAL SECTION - Same for all agents]
file-resolution: Standard dependency mapping rules
request-resolution: Flexible matching with examples

## Core Principles
core_principles: |
  - 'CRITICAL: [Domain-specific critical principle]'
  - 'CRITICAL: [Evidence-based approach]'
  - [Standard principles with clear guidelines]

## Core Responsibilities
- [Primary domain responsibilities with clear scope]
- [Secondary responsibilities with boundaries]

## [Domain] Standards
[domain]-standards:
  [category-1]: [Methodology standards]
  [category-2]: [Quality standards]
  [category-3]: [Deliverable standards]

## Workflow Patterns
workflow-patterns:
  [pattern-1]: [Step-by-step domain workflow]
  [pattern-2]: [Common task approach]
```

### 2. Task Development Pattern

**Location:** `agentic-workflows/tasks/{task-name}.md`

**Required Structure:**

```yaml
---
type: task
task-name: task-name
description: Task description for parse-prompt.js
required-inputs:
  - name: input-name
    description: Input description
    expected-type: input-type
    validation: validation-rule
---

# Task Instructions
- Use template variables: {{config.*}}, {{input.*}}, {{agent.*}}
- Dynamic path resolution: @{{config.outputBase}}/{{config.featurePrefix}}/
- Structured step-by-step workflows
```

### 3. Template Development Pattern

**Location:** `agentic-workflows/templates/{template-name}.yaml`

**Required Structure:**

```yaml
template:
  id: template-id
  name: Template Name
  output:
    filename: '{{config.outputBase}}/{{config.featurePrefix}}/path/{{variables}}'

# Template sections with dynamic variables
```

## Integration Process

### Step 1: Develop in Source Directory

- Create/modify files in `agentic-workflows/`
- Use dynamic variables instead of hardcoded paths
- Follow established patterns from reference files

### Step 2: Mirror to Claude Commands

```bash
cd agentic-workflows
npm run mirror
```

This creates reference files in `.claude/commands/agentic-workflows/` following the `@<absolute-path>` pattern.

> [!NOTE]
> *Claude Code has an issue where chained commands using && will as the user for permission, even when the user has given Bash(cd:\*)  and Bash(npm run:\*) permissions.*

### Step 3: Execute Tasks or Workflows

**Task Execution:**

```bash
cd agentic-workflows
npm run parse-prompt <task-file> <input-file> [agent-file]
```

**Workflow Execution:**

```bash
cd agentic-workflows
npm run parse-workflow <workflow-file> [story-file] [options]
```

**Multi-Agent Workflow Options:**

```bash
# Default agent routing
cd agentic-workflows
npm run parse-workflow workflows/tdd-workflow.yaml story.md

# Override specific agent for a workflow step (frontend development)
cd agentic-workflows
npm run parse-workflow workflows/tdd-workflow.yaml story.md --agent=frontend-developer-agent

# Other workflow options
cd agentic-workflows
npm run parse-workflow workflow.yaml story.md --retry-count=1 --current-step=implement-code
```

Generates Task tool calls for orchestrator agent to coordinate multi-agent workflows with state management and flexible agent routing.

## Key Principles

### Template Variables

- **Configuration:** `{{config.*}}` - Project configuration values
- **Input Files:** `{{input.*}}` - Input file paths and metadata
- **Agent Data:** `{{agent.*}}` - Agent metadata and names
- **Path Resolution:** `@{{config.path}}` - Converts to absolute paths
- **✅ VALIDATED:** Template variable system fully implemented in parse-prompt.js (lines 91-112) with complete `{{config.*}}` support

### Evidence-Based Development

- Always backup assertions with citations from actual code
- Reference specific files and line numbers
- Research first using tools before making claims
- Validate assumptions through testing

### Boundary Management

- Agents have specific roles and cannot exceed them
- Tasks define clear input/output expectations
- Templates provide structured document generation
- **Agent-Agnostic Design:** Avoid hardcoding agent references in task files
- **Orchestrator Routing:** Use workflow YAML definitions for agent coordination and routing decisions

### Interface Protocol Pattern

**Universal Standard for All Agents:**

- **Dual-Interface Approach:** All agents must support both chat window and file-based interfaces
- **Chat Window Interface:** Reserved for lightweight, interactive communication:
  - User questions (max 9 numbered questions per interaction)
  - Status updates and progress reports
  - Interactive dialogue and command selections
  - Navigation assistance with numbered options
- **File-Based Interface:** All substantial content creation occurs in files:
  - Content creation (reports, briefs, analyses)
  - In-document comments using highlighted markup
  - Document revisions and collaborative editing
- **Protocol Compliance:**
  - Question limits enforce cognitive load management
  - Content segregation optimizes communication efficiency
  - Markup standards ensure consistent collaborative editing

### Command Structure Pattern

**Universal Standard for All Agents:**

- **Prefix Convention:** All commands require `--` prefix (e.g., `--help`, `--create-doc`)
- **Shorthand Support:** Commands can be shortened (`--h`, `--cd`, `--rp`)
- **Standard Commands:** Every agent must include:
  - `help`: Present numbered command list for user selection
  - `exit`: Abandon persona and end agent session
- **Dependency Organization:** Structured by type:
  - `tasks`: Executable workflow files
  - `templates`: Document generation templates
  - `data`: Knowledge bases and reference materials
  - `checklists`: Quality assurance and validation lists
- **Lazy Loading:** Dependencies loaded only when user requests execution
- **Request Resolution:** Flexible matching with examples for common user requests

### Domain-Specific Implementation Patterns

**Analysis & Strategy Agents** (analyst, product-manager):
- Research methodology standards with multiple source validation
- Facilitation approaches using systematic elicitation methods
- Deliverable quality metrics with trade-off documentation
- Strategic contextualization within business objectives

**Implementation Agents** (code-developer, frontend-developer, test-writer):
- Quality control gates with type checking and linting requirements
- Failure escalation patterns with halt-after-3-attempts rule
- Verification checklists documenting implementation changes
- Evidence-based assertions with file path and line number citations

**Orchestration Agents** (orchestrator, workflow-developer):
- State management using story file checkboxes (MVP approach)
- YAML workflow integration with parse-prompt.js coordination
- Agent routing decisions based on workflow definitions
- Error handling with retry counters and feedback loops

**Review & Validation Agents** (engineering-mentor, qa-validation):
- Review criteria structures with measurable completion standards
- Issue documentation formats with reproduction steps
- Handoff protocols for workflow coordination
- Quality gate enforcement with clear pass/fail criteria

**Strategy & Architecture Agents** (system-architect):
- High-level design patterns with technology selection criteria
- Implementation workflow planning with multi-component coordination
- Architectural decision documentation with rationale capture
- System integration standards with scalability considerations

## Testing & Validation

### Local Testing

1. Develop workflow components in `agentic-workflows/`
2. Test with parse-prompt.js using sample inputs
3. Validate template variable resolution
4. Verify agent boundary compliance

### Integration Testing

1. Run `cd agentic-workflows` then `npm run mirror`
2. Test reference file access through Claude commands
3. Validate end-to-end workflow execution
4. Confirm linting passes with .prettierignore

## Migration from BMad

When transitioning from BMad patterns:

1. Replace `{{paths.bmadCore}}` with `{{config.*}}` variables
2. Add YAML frontmatter to tasks with required-inputs
3. Convert hardcoded paths to dynamic template variables
4. Update agent definitions to follow structured format
5. Test with parse-prompt.js before deployment

## Generic Workflow Engine

### Orchestrator Agent Pattern

**Location:** `agentic-workflows/agents/orchestrator.md`

Generic workflow coordinator with Task tool integration for executing multi-agent workflows. Loads YAML workflow definitions and coordinates sequential agent execution with state management.

### Workflow Execution Process

1. **Workflow Loading:** parse-workflow.js processes YAML workflow definitions
2. **State Management:** Story file checkboxes track workflow progress (MVP approach)
3. **Agent Coordination:** Task tool responses in array format `[{type: "text", text: "response"}]`
4. **Error Handling:** Retry counters and feedback loops for validation failures
5. **Dynamic Routing:** Orchestrator reads workflow YAML to determine next agent based on issue type
6. **Agent-Agnostic Handoffs:** Tasks use generic "validation workflow" language, orchestrator handles specific agent assignments

### Workflow YAML Schema

**Location:** `agentic-workflows/templates/workflow-schema.yaml`

```yaml
name: workflow-name
description: Brief workflow description
steps:
  - name: step-name
    agent: agent-name
    success_criteria: completion criteria
    on_failure: retry|stop|route_to_step
    max_retries: 3
```

**Example:** TDD workflow with test-writer → code-developer-agent → engineering-mentor-code cycle

### Multi-Agent Routing Capabilities

**Command-Line Agent Override:**
The parse-workflow.js script supports flexible agent routing through the `--agent=` parameter, allowing dynamic agent selection without modifying workflow YAML files.

**Supported Override Options:**

```bash
# Backend implementation (default)
--agent=code-developer-agent

# Frontend implementation with research capabilities
--agent=frontend-developer-agent
```

**Use Cases:**

- **Frontend Stories**: Override implementation step to use research-heavy frontend developer for UI/component work
- **Specialized Development**: Route specific workflow steps to agents with specialized tools or expertise
- **Testing Scenarios**: Override agents for validation and testing workflows

**Automated Failure Routing:**
The parse-workflow.js script now supports automatic routing based on validation failures documented in Known Issues sections.

**Routing Mechanisms:**

```bash
# Automatic routing based on Known Issues Owner Agent field
# When validation fails, workflow routes to agent specified in first Open issue

# Manual routing override for testing
--route-to=step-id

# Step routing examples
--route-to=write-tests      # Route to test-writer agent
--route-to=implement-code   # Route to implementation agent
```

**Agent Capability Differentiation:**

- **code-developer-agent**: Backend/API development, server-side logic, database integration
- **frontend-developer-agent**: Research-driven UI development with Context7, Perplexity, and Playwright MCP tools for hypothesis validation
- **test-writer**: Unit test creation, integration test infrastructure, test framework configuration

## Best Practices

### Core Development Patterns

- **Component Modularity:** Separate workflow processing (parse-workflow.js) from task processing (parse-prompt.js)
- **Just Enough Context:** Surgical workflow state management using story file checkboxes
- **Evidence-Based Workflow Decisions:** All workflow routing based on measurable completion criteria
- **Modularity:** Keep agents, tasks, and templates separate and focused
- **Reusability:** Use template variables for path and configuration flexibility
- **Validation:** Include input validation and type checking in tasks
- **Documentation:** Maintain clear descriptions and examples
- **Testing:** Validate workflows before mirroring to commands directory

### Agent-Agnostic Design Principles

- **No Hardcoded Agent References:** Tasks should use generic terms like "validation workflow" instead of specific agent names
- **Orchestrator-Driven Routing:** Let workflow YAML definitions handle all agent coordination and routing decisions
- **Separation of Concerns:** Agent files define WHO, task files define HOW, workflow files define WHEN/WHICH
- **Modular Boundaries:** Each agent has clear responsibilities that don't overlap with other agents
- **Task Checkbox Management:** Implementation subtasks remain agent-agnostic (no agent assignments in checkbox text), only workflow-level tasks get agent assignments for orchestrator routing

### Enhanced Agent Pattern Guidelines

**Agent Structure Standards:**

- **Universal Sections:** All agents must include identical "User Interfaces and Interaction Protocols" and "Resolving Requests" sections
- **Template Compliance:** Use `agentic-workflows/config-schemas/agent-config-template.md` as authoritative structure reference
- **Section Ordering:** Maintain consistent section sequence across all agent files for predictable navigation
- **YAML Consistency:** Follow standardized frontmatter format with required fields (name, description, tools, model, color, persona-name)

**Interface Protocol Standards:**

- **Dual-Interface Enforcement:** All agents must support both chat window (lightweight) and file-based (substantial) interfaces
- **Question Limit Compliance:** Maximum 9 numbered questions per chat interaction to manage cognitive load
- **Content Segregation:** Heavy content creation must occur in files, not chat window
- **Protocol Documentation:** Include complete interface protocol section in every agent file

**Command Structure Standards:**

- **Prefix Consistency:** All commands require `--` prefix with shorthand support
- **Standard Commands:** Every agent must include `help` and `exit` commands
- **Dependency Organization:** Structure by type (tasks, templates, data, checklists)
- **Lazy Loading:** Load dependencies only when user requests execution

**Domain-Specific Pattern Application:**

- **Pattern Selection:** Choose domain standards based on agent's primary function (Analysis, Implementation, Orchestration, Review, Strategy)
- **Workflow Pattern Definition:** Include domain-specific workflow patterns with step-by-step approaches
- **Quality Standards:** Define measurable standards appropriate to agent's domain
- **Boundary Clarity:** Ensure agent responsibilities don't overlap with other domain agents

**Migration and Maintenance:**

- **Existing Agent Updates:** Migrate all existing agents to new enhanced structure
- **Pattern Validation:** Validate agent files against template structure before deployment
- **Consistency Checking:** Regular reviews to ensure pattern compliance across agent portfolio
- **Documentation Currency:** Keep agent configuration template updated with pattern evolution

### Issue Tracking Integration

**Issue Documentation Format**:

- **Standard Status**: Use conventional issue tracking status (Open, In Progress, Resolved, Closed)
- **Section Pattern**: Document issues in "Known Issues" section of story files with reproduction steps
- **Reproduction Requirements**: All issues must include exact commands/steps to reproduce the problem
- **Template Variable**: `{{story.known-issues}}` extracts entire section verbatim with repro steps for fix-issue tasks
- **Agent-Agnostic**: Any agent can document issues using this standardized format

**Issue Status Lifecycle**:

- **Open**: Issue identified and documented, ready for assignment
- **In Progress**: Issue actively being worked on by assigned agent
- **Resolved**: Issue fixed and validated, pending final verification
- **Closed**: Issue completely resolved and verified

**Parse-Prompt Integration**:

- `extractKnownIssuesSection()` function extracts entire "### Known Issues" section content
- Template variable `{{story.known-issues}}` provides verbatim section for fix-issue task consumption
- No individual field parsing required - complete section transferred as-is
- Supports multiple issues within single section with individual status tracking

**Engineering Mentor Review Integration**:

- Engineering mentor documents fixable issues in QA Results "Known Issues" section
- Issues follow standard format: Issue Type, Owner Agent, Description, Context, Reproduction Steps, Status
- parse-prompt.js automatically extracts section for fix-issue task handoff
- Maintains separation of concerns between review documentation and issue resolution

**Automated Workflow Routing Integration**:

- **Owner Agent Field**: Enables direct agent routing for workflow failure recovery
- **Parse-Workflow Integration**: `parseKnownIssuesForRouting()` function extracts Owner Agent from first Open issue
- **TDD Workflow Support**: When validation fails with Known Issues, workflow automatically routes to specified agent
- **Command-Line Override**: `--route-to=step-id` parameter allows manual routing for testing and debugging
- **Backward Compatibility**: Falls back to linear workflow progression when no routing specified

### Current Task Files

- `implement-story.md` - Code implementation tasks (agent-agnostic)
- `review-user-story-code-implement.md` - Engineering validation and review
- `write-tests.md` - Test creation and infrastructure
- `validate-next-story.md` - Story progression validation
- `fix-issue.md` - Generic issue resolution with orchestrator auto-population support

### Current Agent Files

**Development Agents:**

- `code-developer-agent.md` - Backend implementation agent for server-side development
- `frontend-developer-agent.md` - Research-driven frontend agent with Context7, Perplexity, and Playwright MCP tools
- `test-writer.md` - Test creation and infrastructure setup agent

**Product Management Agents:**

- `product-manager.md` - Product strategy, PRD creation, feature prioritization, roadmap planning
- `product-owner.md` - Story validation, backlog management, acceptance criteria refinement
- `analyst.md` - Market research, competitive analysis, project briefing, brownfield documentation

**Quality & Architecture Agents:**

- `engineering-mentor-code.md` - Code review and validation agent
- `qa-validation.md` - Quality assurance and testing validation agent
- `system-architect.md` - High-level system design and architecture planning agent
- `application-tech-lead.md` - Application-level architecture and technical leadership agent focused on practical delivery

**Workflow Management Agents:**

- `orchestrator.md` - Multi-agent workflow coordination and state management
- `workflow-developer.md` - Agentic-workflow pattern optimization and maintenance
