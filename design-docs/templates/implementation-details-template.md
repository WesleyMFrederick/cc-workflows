# Implementation Details Template - Phase 4

> [!attention] **AI Implementation Details Template Instructions**
> **CRITICAL**: This template is for Phase 4 - Self-contained implementation specifications for individual subtasks
> **CRITICAL**: Instructions for the AI are in callouts using this format: > [!attention] **AI {{task instruction title}}**
> **CRITICAL**: Goals for a document section are in callouts using this format: > [!done] **AI {{section}} Goal**
> **CRITICAL**: Content the AI must populate are in [single brackets]. [Further instructions on how to populate, style, and length of the content are in between the brackets]
> **CRTICAL**: Examples of content are in callouts using this format: > [!example] **AI {{section}} Example**
> **CRTICAL**: All other callouts and text outside of [brackets] are content that should be populated in the final document
>
> **Prime Directive #1: Self-Contained Context.** Each implementation details file must contain ALL information needed for an agent to execute the subtask without reading other files.
>
> **Prime Directive #2: Implementation Gap Analysis.** Clearly define the current state, required state, and the specific implementation gap to be bridged.
>
> **Prime Directive #3: Actionable Guidance.** Provide concrete implementation patterns, code examples, and technical specifications that agents can follow directly.
>
> **Prime Directive #4: Validation Clarity.** Include specific validation criteria and commands that confirm successful implementation.

## [Subtask Name] Implementation Details

> [!attention] **AI Implementation Details Instructions:**
> Use this template to create a self-contained implementation specification for a single subtask from Phase 3.

## Implementation Gap

> [!done] **AI Implementation Gap Goal**
> **Define the Current vs Required State**
> Clearly articulate what exists now, what needs to exist after implementation, and the specific gap to be bridged.

- **Objective**: [Clear, specific objective copied from subtask definition]
- **Current State**: [Detailed description of what exists before this subtask begins]
- **Required State**: [Detailed description of what must exist after successful completion]
- **Integration Requirement**: [How this implementation integrates with existing components and architecture]

> [!example] **AI Implementation Gap Example**
> - **Objective**: Create minimal DirectoryManager class with ES modules exports and dependency injection constructor to pass interface tests
> - **Current State**: Interface test exists in `test/directoryManager.test.js` that fails with module import error (`ERR_MODULE_NOT_FOUND`) because DirectoryManager class doesn't exist
> - **Required State**: Working DirectoryManager class file with basic structure that passes interface validation tests from Task 2.1.1
> - **Integration Requirement**: Implementation must satisfy the exact interface contract defined by the failing tests while following ES modules patterns and dependency injection architecture

## Background Context

> [!done] **AI Background Context Goal**
> **Provide Complete Implementation Context**
> Include all architectural context, previous subtask results, and integration requirements needed for implementation.

### Architectural Context

> [!attention] **AI Architectural Context Instructions:**
> Include relevant architectural information from the parent story's Dev Notes section.

[Brief description of the component's role in the overall architecture and how this subtask fits into the broader implementation]

### Previous Subtask Dependencies

> [!attention] **AI Dependencies Instructions:**
> List any previous subtasks this implementation depends on and their outcomes.

**Dependencies**: [List of prerequisite subtasks that must be complete]
**Available Assets**: [What files, classes, or functionality is available from previous subtasks]
**Integration Points**: [Specific connection points with existing implementations]

### Context Gathering Steps

> [!attention] **AI Context Gathering Instructions:**
> Provide specific steps the implementing agent should take to gather additional context.

1. **[Context Source 1]**: [Specific instruction for gathering context]
2. **[Context Source 2]**: [Specific instruction for validation or research]
3. **[Context Source 3]**: [Additional context requirements]

> [!example] **AI Context Gathering Example**
> 1. **Review interface test requirements**: Read `test/directoryManager.test.js` to understand the exact interface contract that must be satisfied
> 2. **Understand architectural patterns**: Review the implementation guide pseudocode for DirectoryManager architectural guidance
> 3. **Validate current test state**: Run the interface tests to confirm they fail with import errors: `npm test test/directoryManager.test.js`

## Implementation Requirements

> [!done] **AI Implementation Requirements Goal**
> **Specify Exact Implementation Specifications**
> Define the technical requirements, file changes, and code patterns needed for successful implementation.

### Files

> [!attention] **AI Files Instructions:**
> List all files that will be created, modified, or affected by this implementation.

- `[file-path]` ([create | modify]) - [Description of changes to this file]
- `[another-file-path]` ([create | modify]) - [Description of changes to this file]

### Change Patterns

> [!attention] **AI Change Patterns Instructions:**
> Describe the specific types of changes and implementation patterns to follow.

**[Implementation Scenario]**: [Description of the implementation approach]

1. [Implementation step 1 with technical details]
2. [Implementation step 2 with technical details]
3. [Implementation step 3 with technical details]

```[language]
// [Description]: [Implementation pattern example]
[Code example showing the expected implementation pattern]
```

> [!example] **AI Change Patterns Example**
> **TDD Green phase implementation scenario**:
> 1. Create ES modules class that can be imported successfully
> 2. Implement constructor that accepts fs, path, logger, config parameters via dependency injection
> 3. Add method stubs for `createVersionDirectory()` and `rollbackDirectory()` that satisfy interface tests
>
> ```javascript
> // Target Pattern: Minimal class structure to pass interface tests
> export class DirectoryManager {
>   constructor(fs, path, logger, config) {
>     // Validation: Constructor requires all four dependencies
>     if (!fs || !path || !logger || !config) {
>       throw new Error('DirectoryManager requires fs, path, logger, and config dependencies');
>     }
>
>     // Store injected dependencies
>     this.fs = fs;
>     this.path = path;
>     this.logger = logger;
>     this.config = config;
>   }
> }
> ```

### Critical Rules

> [!attention] **AI Critical Rules Instructions:**
> List the non-negotiable requirements and constraints for this implementation.

- [Critical rule 1 with justification]
- [Critical rule 2 with architectural reference]
- [Critical rule 3 with integration requirement]

> [!example] **AI Critical Rules Example**
> - Implementation must pass ALL interface tests from Task 2.1.1 without implementing actual directory operations
> - Use dependency injection pattern - no direct imports of fs, path, or logger modules
> - Follow ES modules export pattern with explicit file extensions in imports

## Key Implementation Elements

> [!done] **AI Implementation Elements Goal**
> **Identify Core Implementation Components**
> Break down the implementation into its key technical elements and integration points.

### Primary Changes

> [!attention] **AI Primary Changes Instructions:**
> Describe the main implementation work and its technical approach.

1. **[Primary Change Description]**: [Technical implementation details]
2. **[Integration Points]**: [How this connects with other components]
3. **[Validation Strategy]**: [How success will be measured]

### Technical Specifications

> [!attention] **AI Technical Specifications Instructions:**
> Provide specific technical details for the implementation.

**[Technical Area 1]**: [Specific implementation details with examples]
**[Technical Area 2]**: [Integration requirements and patterns]
**[Technical Area 3]**: [Validation and testing specifications]

> [!example] **AI Technical Specifications Example**
> **Constructor Pattern**: ES modules export with dependency injection accepting fs, path, logger, config parameters
> **Method Signatures**: `createVersionDirectory(version)` returns path string, `rollbackDirectory(path)` returns void
> **Error Handling**: Throw descriptive errors for missing dependencies and invalid parameters

### Expected Outcome

> [!attention] **AI Expected Outcome Instructions:**
> Define the specific deliverable and its characteristics.

**Output**: [Specific deliverable description]
**Scope**: [Detailed list of what will be implemented]
**Success Criteria**: [How successful completion will be validated]

> [!example] **AI Expected Outcome Example**
> **Output**: Working DirectoryManager class file with basic structure that passes interface validation tests
> **Scope**:
> - DirectoryManager class with ES modules export
> - Constructor with dependency injection (fs, path, logger, config)
> - Method stubs for `createVersionDirectory()` and `rollbackDirectory()`
> **Success Criteria**: All interface tests from Task 2.1.1 pass, no import errors, methods are callable

## Immediate Validation

> [!done] **AI Immediate Validation Goal**
> **Provide Specific Validation Commands**
> Include the exact commands and expected results for validating successful implementation.

### Validation Commands

> [!attention] **AI Validation Commands Instructions:**
> Provide specific commands that can be run to validate the implementation.

```bash
[command-1]
# Expected result: [description of expected output]

[command-2]
# Expected result: [description of expected output]
```

### Success Indicators

> [!attention] **AI Success Indicators Instructions:**
> List the specific indicators that confirm successful implementation.

- [ ] **[Indicator 1]**: [Specific check with expected result]
- [ ] **[Indicator 2]**: [Another validation point with criteria]
- [ ] **[Indicator 3]**: [Final confirmation check]

> [!example] **AI Validation Example**
>
> ```bash
> npm test test/directoryManager.test.js
> # Expected result: All interface tests pass, no import errors, methods are callable
> ```
>
> - [ ] **Import Success**: DirectoryManager class can be imported without module errors
> - [ ] **Constructor Function**: Constructor accepts all four dependency parameters
> - [ ] **Method Availability**: Both `createVersionDirectory()` and `rollbackDirectory()` methods are callable

## Integration Notes

> [!done] **AI Integration Notes Goal**
> **Document Integration Context and Dependencies**
> Provide information about how this implementation fits into the broader system and any follow-up considerations.

### Component Integration

> [!attention] **AI Component Integration Instructions:**
> Describe how this implementation integrates with other components and systems.

**[Integration Point 1]**: [How this component connects with other parts of the system]
**[Integration Point 2]**: [Dependencies this implementation creates or satisfies]
**[Integration Point 3]**: [Future integration considerations]

### Follow-Up Considerations

> [!attention] **AI Follow-Up Instructions:**
> Note any considerations for subsequent subtasks or implementations.

[Description of what subsequent subtasks will build upon this implementation and any considerations for future development]

> [!example] **AI Integration Example**
> **ES Modules Integration**: Implementation follows project ES modules patterns for consistent import/export structure
> **Dependency Injection**: Constructor pattern enables testability and future enhancement while maintaining interface contracts
> **TDD Foundation**: This minimal implementation creates the foundation for TDD Green phase, enabling future RED-GREEN-REFACTOR cycles

## Implementation Agent Notes

> [!attention] **AI Agent Notes Instructions:**
> This section will be populated by the implementing agent during execution.

### Agent Model Used
[Record the specific AI agent model and version used for implementation]

### Debug Log References
[Reference any debug logs or traces generated during implementation]

### Completion Notes List
[Notes about the completion of implementation and any issues encountered]

### File List
[List all files created, modified, or affected during implementation]

### Implementation Challenges
[Document any challenges encountered and how they were resolved]

### Validation Results
[Results of running the validation commands and success indicators]

## Implementation Readiness Checklist

> [!attention] **AI Readiness Checklist Instructions:**
> Verify this implementation details file is complete before agent execution.

- [ ] **Implementation Gap**: Current state, required state, and gap clearly defined
- [ ] **Background Context**: Architectural context and dependencies documented
- [ ] **Implementation Requirements**: Files, change patterns, and critical rules specified
- [ ] **Technical Specifications**: Detailed technical guidance provided
- [ ] **Validation Commands**: Specific validation steps and success criteria defined
- [ ] **Integration Context**: Component integration and follow-up considerations documented
- [ ] **Self-Contained**: All necessary context included for independent agent execution

**Ready for Agent Implementation**: [ ] (Check when all above items complete)

## Next Steps

> [!attention] **AI Next Steps Instructions:**
> Provide guidance for the implementing agent and subsequent workflow.

1. **Implementation Execution**: Execute the implementation following the specifications in this document
2. **Validation**: Run all validation commands and verify success indicators
3. **Documentation**: Update the Agent Notes section with implementation details
4. **Story Integration**: Return to the parent story and update the subtask with implementation details link
5. **Workflow Continuation**: Proceed to the next subtask in the sequence or return to Phase 3 for additional task scoping

## Citation Integration

> [!attention] **AI Citation Integration Instructions:**
> Ensure all architectural references and dependencies are properly cited.

### Source References

**Parent Story**: [Link to parent user story file]
**Parent Subtask**: [Reference to the specific subtask this implements]
**Architectural Sources**: [Links to relevant architecture documents]
**Design Patterns**: [References to design principles and patterns applied]

### Validation Citations

> [!attention] **AI Validation Citations Instructions:**
> Validate all citations using the citation manager before marking this file complete.

**Citation Validation Command**:

```bash
npm run citation:validate <this-file-path>
```

**Citation Status**: [ ] All citations validated and confirmed working
