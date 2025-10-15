
# Create Implementation Task List From User Story

## Generate Implementation Task List
Convert the feature design into a series of prompts for a code-generation LLM that will implement each step in a test-driven manner. Focus ONLY on tasks that involve writing, modifying, or testing code.

### Atomic Task Requirements (CRITICAL FOR AGENT EXECUTION)
- **File Scope**: Touches 1-5 related files maximum
- **Single Purpose**: One testable outcome per task
- **Specific Files**: Must specify exact files to create/modify
- **Agent-Friendly**: Clear input/output with minimal context switching
- **Coding Task Focused**: Excludes any task that cannot be completed through writing/modifying/testing code
- **Hallucination Free**: All tasks and sub-tasks are derived from design documentation

### Task Format Guidelines
- Format as numbered checkbox list with maximum two levels of hierarchy
- Top-level items (like epics) should be used only when needed
- Sub-tasks should be numbered with decimal notation (e.g., 1.1, 1.2, 2.1)
- Each task must include:
  - Clear objective as task description that involves writing/modifying/testing code
  - Specific file paths to create/modify
  - Reference to requirements using: `_Requirements: X.Y, Z.A_`
  - Reference to leverage existing code: `_Leverage: path/to/file.ts_`
- Ensure each step builds incrementally on previous steps
- Prioritize test-driven development where appropriate
- Focus ONLY on coding tasks - exclude:
  - User acceptance testing or feedback gathering
  - Deployment to production/staging
  - Performance metrics gathering
  - Marketing, documentation, or organizational activities
  - Any task that cannot be completed through writing/modifying/testing code

### Example Task Format

```markdown
- [ ] 1. Set up project structure and core interfaces
    - Create directory structure for models, services, repositories
    - Define interfaces that establish system boundaries
    - _Requirements: 1.1_

- [ ] 2. Implement data models and validation
- [ ] 2.1 Create core data model interfaces and types
    - Write TypeScript interfaces for all data models
    - Implement validation functions for data integrity
    - _Requirements: 2.1, 3.3_
    - _Leverage: src/types/base.ts_
```

---

- **File Scope**: Touches 1-5 related files maximum
- - **Specific Files**: Must specify exact files to create/modify
- **Agent-Friendly**: Clear input/output with minimal context switching
- **Hallucination Free**: All tasks and sub-tasks are derived from design documentation
- **Logically Sequenced**: Sequence of tasks should have a logical flow. Ensure each step builds incrementally on previous steps. Group tasks logically by files updated, agents respinsibility. Tasks should be short enough to be
completed in one agent context window, but long enough reduce repetitive directives (i.e. group by required context)

- Format as numbered checkbox list with maximum two levels of hierarchy
- Top-level items (like epics) should be used only when needed
- Sub-tasks should be numbered with decimal notation (e.g., 1.1, 1.2, 2.1)
- Each task must include:
  - Clear objective as task description that involves writing/modifying/testing
  - Specific file paths to create/modify
  - Reference to requirements using: `_Requirements: X.Y, Z.A_`
  - Reference to leverage existing code: `_Leverage: path/to/file.ts_`

  ### Task Format Example

```markdown
- [ ] 1. Set up project structure and core interfaces
    - Create directory structure for models, services, repositories
    - Define interfaces that establish system boundaries
    - _Requirements: 1.1_

- [ ] 2. Implement data models and validation
- [ ] 2.1 Create core data model interfaces and types
    - Write TypeScript interfaces for all data models
    - Implement validation functions for data integrity
    - _Requirements: 2.1, 3.3_
    - _Leverage: src/types/base.ts_
