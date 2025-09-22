# Story Technical Readiness Checklist

The Architect Agent should use this checklist to validate that a story drafted by the Scrum Master is technically sound, architecturally aligned, and ready for developer implementation.

## Initialization Instructions - Technical Validation

**FIRST:** Load `{{config.configFile}}` and extract `{{config.outputBase}}` and `{{config.featurePrefix}}` values to construct file paths.

Before proceeding with this checklist, ensure you have access to:

1. The draft story document being validated (usually in `{{config.outputBase}}/{{config.featurePrefix}}/stories/` or provided directly)
2. Relevant architecture documentation as specified in the task
3. Project structure and coding standards documentation
4. Testing strategy and technical requirements documentation

**IMPORTANT:** This checklist validates stories AFTER SM business validation and BEFORE developer implementation begins.

**VALIDATION PRINCIPLES:**

1. **Technical Feasibility** - Implementation is possible with available technology and resources
2. **Architecture Alignment** - Story requirements align with established system architecture
3. **Implementation Clarity** - Developer has sufficient technical context to begin work
4. **Risk Assessment** - Technical risks are identified and mitigation strategies defined
5. **Pattern Compliance** - Story follows established coding and design patterns

**REMEMBER:** We assume competent architect review that can:

- Validate technical assumptions against current system state
- Assess implementation complexity and resource requirements
- Identify architectural conflicts or gaps
- Plan implementation workflow with risk mitigation
- Provide technical guidance for successful developer handoff

We're checking for TECHNICAL SOUNDNESS and IMPLEMENTATION READINESS.

## 1. ARCHITECTURE ALIGNMENT & FEASIBILITY

**Validation Guidelines:** Story must be technically sound within current system architecture. Verify:

1. Story requirements align with established architecture decisions
2. Required technologies and dependencies are available and compatible
3. Integration points are clearly defined and feasible
4. No conflicts with existing system components or patterns
5. Data models and API contracts are complete and consistent

- [ ] Story requirements are architecturally sound and feasible
- [ ] Required technologies are available and version-compatible
- [ ] Integration points are clearly defined with existing system components
- [ ] Data models and schemas are consistent with system architecture
- [ ] API contracts and interfaces are complete and compatible
- [ ] No architectural conflicts or breaking changes identified

## 2. IMPLEMENTATION COMPLEXITY & RESOURCE ASSESSMENT

**Validation Guidelines:** Implementation path must be clear with appropriate resource allocation. Check:

1. Technical complexity is appropriately assessed and documented
2. Implementation sequence is logical and achievable
3. Resource requirements (time, expertise, dependencies) are realistic
4. Potential technical risks are identified with mitigation strategies
5. Prerequisites and blockers are clearly documented

- [ ] Implementation complexity is appropriately assessed
- [ ] Technical risks are identified with mitigation strategies
- [ ] Implementation sequence is logical and achievable
- [ ] Resource requirements are realistic and documented
- [ ] Prerequisites and dependencies are clearly identified
- [ ] No critical technical blockers remain unresolved

## 3. DEVELOPER HANDOFF PREPARATION

**Validation Guidelines:** Developer must have sufficient context to begin implementation. Ensure:

1. Technical requirements are specific and actionable
2. File locations and naming conventions are clearly specified
3. Coding patterns and standards to follow are documented
4. Integration patterns and examples are provided where needed
5. Testing requirements and strategies are defined

- [ ] Technical requirements are specific and implementable
- [ ] File locations and project structure guidance is clear
- [ ] Coding patterns and standards are documented with examples
- [ ] Integration approaches are specified with guidance
- [ ] Testing strategy and requirements are clearly defined
- [ ] Special technical considerations are documented

## 4. PATTERN COMPLIANCE & STANDARDS VALIDATION

**Validation Guidelines:** Implementation must follow established project standards. Verify:

1. Story follows established coding and design patterns
2. Security considerations are addressed appropriately
3. Performance requirements are identified and achievable
4. Testing approach aligns with project testing strategy
5. Documentation standards are met for technical components

- [ ] Established coding and design patterns are followed
- [ ] Security considerations are appropriately addressed
- [ ] Performance requirements are identified and realistic
- [ ] Testing approach aligns with project testing strategy
- [ ] Technical documentation meets project standards
- [ ] Error handling and edge case considerations are included

## 5. RESEARCH & VALIDATION COMPLETENESS

**Validation Guidelines:** All technical assumptions must be validated. Check:

1. Technical research has been completed where required
2. External dependencies and APIs are validated as available
3. Technology choices are justified and approved
4. Integration compatibility has been verified
5. Any new patterns or approaches are documented and justified

- [ ] Required technical research has been completed
- [ ] External dependencies and APIs are validated as available
- [ ] Technology choices are justified and appropriate
- [ ] Integration compatibility has been verified
- [ ] New patterns or approaches are documented and justified
- [ ] All technical assumptions have been validated

## 6. DESIGN PRINCIPLES COMPLIANCE

**Validation Guidelines:** Story implementation must follow established design principles. Check:

1. Story adheres to applicable modular design principles (Single File Responsibility, Dependency Abstraction)
2. Safety-first design patterns are implemented (Atomic Operations, Fail Fast, Error Recovery)
3. Data-first principles are considered (One Source of Truth, Clear Contracts)
4. Self-contained naming principles are followed (Descriptive Labels, Immediate Understanding)
5. Anti-patterns are actively avoided (Hidden Global State, Code-Enforced Invariants)
6. Design Principles document has been reviewed and relevant principles documented

- [ ] Modular design principles are properly applied
- [ ] Safety-first patterns are implemented (atomic operations, fail fast, error recovery)
- [ ] Data-first principles are considered and documented
- [ ] Self-contained naming conventions are followed
- [ ] Anti-patterns are identified and avoided
- [ ] Design Principles adherence section is complete and accurate

## VALIDATION RESULT

**VALIDATION OUTPUT STANDARDS:**
- ✅ PASS items: Show checkbox only, no commentary
- ❌ FAIL/⚠️ PARTIAL items: Provide detailed technical explanation
- Follow technical validation principle: comprehensive technical assessment

**Final Technical Validation Report:**

Update/Save a comprehensive technical validation report to file with:

1. Technical Feasibility Summary
   - Story readiness: APPROVED / NEEDS REVISION / BLOCKED
   - Technical complexity score (1-10)
   - Major technical gaps or risks identified

2. Fill in the technical validation table with:
   - PASS: Technical requirements clearly met and feasible
   - PARTIAL: Some technical gaps but workable with noted caveats
   - FAIL: Critical technical issues that must be resolved

3. Technical Issues and Recommendations (if any)
   - List specific technical problems to resolve
   - Suggest architectural improvements or alternatives
   - Identify any technical blocking dependencies
   - Provide implementation guidance and pattern references

4. Implementation Readiness Assessment
   - Is the story technically ready for developer implementation?
   - What technical risks require ongoing attention during implementation?
   - What architectural decisions need communication to the development team?
   - Are there any technical dependencies that could cause delays?

Be thorough - technical validation prevents implementation delays and architectural debt.

| Category                                | Status | Technical Issues |
| --------------------------------------- | ------ | ---------------- |
| 1. Architecture Alignment & Feasibility | _TBD_  |                  |
| 2. Implementation Complexity & Resources| _TBD_  |                  |
| 3. Developer Handoff Preparation        | _TBD_  |                  |
| 4. Pattern Compliance & Standards       | _TBD_  |                  |
| 5. Research & Validation Completeness   | _TBD_  |                  |
| 6. Design Principles Compliance         | _TBD_  |                  |

**Final Technical Assessment:**

- APPROVED: The story is technically sound and ready for developer implementation
- NEEDS REVISION: The story requires technical updates (see issues section)
- BLOCKED: Critical technical dependencies or conflicts must be resolved before implementation
