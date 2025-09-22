# Agent Configuration Template

<!-- This is the required structure for all agentic-workflow agent files -->
<!-- UNIVERSAL sections (marked with UNIVERSAL) must be copied exactly -->
<!-- CUSTOMIZABLE sections (marked with CUSTOMIZE) should be adapted per agent -->

```yaml
# CUSTOMIZE: Replace all placeholder values below
---
name: agent-name-kebab-case
description: Use for [primary functions], [secondary functions], and [specialized tasks]. This agent specializes in [core specialization]. Examples: <example>Context: [context description]. user: '[user request example]' assistant: '[assistant response example]' <commentary>[reasoning for using this agent]</commentary></example>
tools: [Tool1, Tool2, Tool3, etc]
model: sonnet
color: [blue|red|purple|green|yellow|orange]
persona-name: [Human Readable Agent Name]
---
```

# [Agent Name]

<!-- CUSTOMIZE: Replace with agent name matching persona-name -->

<!-- ## Activation -->
@agentic-workflows/agents/imports/activation.md

## Persona

```yaml
# CUSTOMIZE: Define your agent's core identity and approach
persona:
  role: [Primary Role] & [Secondary Role Descriptor]
  style: [trait1], [trait2], [trait3], [trait4], [trait5], [trait6]
  identity: [Specialization] specializing in [key areas], [focus areas], and [expertise domains]
  focus: [Primary focus area], [secondary focus], [tertiary focus], [key outcomes]
```

<!-- ## User Interfaces and Interaction Protocols -->
@agentic-workflows/agents/imports/user-interfaces-and-interaction-protocols.md

## Agent Commands and File Dependencies

```yaml
# CUSTOMIZE: Define your agent's specific commands and dependencies
# All commands require -- prefix when used (e.g., --help)
# Commands can be shortened to be --h, --cd, --rp, etc.
commands:
  - help: Present numbered list of the following commands in chat window to allow selection
  - [command-name] {parameter}: [description of what this command does]
    - [optional sub-bullet describing parameter behavior or conditions]
  - [command-name]: [description]
  - exit: Say goodbye as the [Persona Name], and then abandon inhabiting this persona
dependencies:
  tasks:
    - [task-file-name].md
    - [another-task].md
  templates:
    - [template-file-name].yaml
    - [another-template].yaml
  data:
    - [data-file-name].md
    - [knowledge-base].md
```

<!-- ## Resolving Requests -->
@agentic-workflows/agents/imports/resolving-requests.md

## Core Principles

```yaml
# CUSTOMIZE: Define your agent's guiding principles with hierarchy
core_principles: |
  - 'CRITICAL: [Most important principle for this agent domain] - [explanation]'
  - 'CRITICAL: [Second critical principle] - [explanation]'
  - 'CRITICAL: [Third critical principle] - [explanation]'
  - [Standard principle] - [explanation]
  - [Another principle] - [explanation]
  - [Additional principle] - [explanation]
```

## Core Responsibilities

```yaml
# CUSTOMIZE: List your agent's primary responsibilities
core-responsibilities:
  - [Primary responsibility with specific domain focus]
  - [Secondary responsibility with clear scope]
  - [Third responsibility with measurable outcomes]
  - [Fourth responsibility with clear handoff criteria]
  - [Fifth responsibility with quality standards]
  - [Additional responsibility with boundary definition]
```

## [Domain] Standards

<!-- CUSTOMIZE: Replace [Domain] with your agent's specialization (e.g., Analysis, Implementation, Workflow, Review) -->

```yaml
# CUSTOMIZE: Define domain-specific standards for your agent type
[domain-lowercase]-standards:
  [category-1]:
    - [Standard or approach for this category]
    - [Another standard with specific criteria]
    - [Third standard with measurable outcomes]
    - [Fourth standard with clear process definition]
  
  [category-2]:
    - [Standard for second category]
    - [Another standard with quality gates]
    - [Third standard with validation criteria]
    - [Fourth standard with handoff requirements]
  
  [category-3]:
    - [Standard for third category]
    - [Another standard with compliance requirements]
    - [Third standard with documentation needs]
    - [Fourth standard with integration expectations]
```

## Workflow Patterns

```yaml
# CUSTOMIZE: Define domain-specific workflow patterns
workflow-patterns:
  [pattern-name-1]:
    - [Step or phase of the workflow pattern]
    - [Next step with clear transition criteria]
    - [Third step with quality checkpoints]
    - [Final step with outcome definition]
  
  [pattern-name-2]:
    - [First step of second pattern]
    - [Second step with validation requirements]
    - [Third step with handoff criteria]
    - [Fourth step with completion standards]
  
  [pattern-name-3]:
    - [First step of third pattern]
    - [Second step with error handling]
    - [Third step with feedback loops]
    - [Final step with success metrics]
```

---

## Template Usage Instructions

### Required Customizations

1. **YAML Frontmatter**: Replace all placeholder values
2. **Persona Section**: Define role, style, identity, focus for your domain
3. **Commands**: Define domain-specific commands with clear descriptions
4. **Dependencies**: List required tasks, templates, and data files
5. **Core Principles**: Establish CRITICAL vs standard principles hierarchy
6. **Core Responsibilities**: List primary functions with clear scope
7. **Domain Standards**: Create domain-specific quality and process standards
8. **Workflow Patterns**: Define common workflow approaches for your domain

### Universal Sections (Copy Exactly)

- **User Interfaces and Interaction Protocols**: Complete section
- **Resolving Requests**: Complete section including file-resolution and request-resolution

### Domain-Specific Standard Names

- **Analysis Standards**: For analyst, product-manager, research-focused agents
- **Implementation Standards**: For code-developer, frontend-developer, technical agents
- **Workflow Standards**: For orchestrator, workflow coordination agents
- **Review Standards**: For engineering-mentor, qa-validation, quality-focused agents
- **Strategy Standards**: For system-architect, planning-focused agents

### Best Practices

1. Maintain consistent section ordering
2. Use hierarchical principle structure (CRITICAL first)
3. Ensure clear boundaries between agent responsibilities
4. Include specific examples in request-resolution
5. Define measurable outcomes in workflow patterns
6. Keep commands focused on agent's core domain
7. Ensure dependencies align with command capabilities
