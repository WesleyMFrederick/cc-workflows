---
title: "Specification Templates for AI Code Generation: From First Draft to Production"
source: "https://www.softwareseni.com/specification-templates-for-ai-code-generation-from-first-draft-to-production/?utm_source=perplexity"
author:
  - "[[James A. Wondrasek]]"
published: 2025-09-30
created: 2025-11-29
description: "Copy-paste ready specification templates for AI code generation. 8 progressive templates from simple functions to complex systems with validation checklists."
tags:
  - "clippings"
---
Business

|

SaaS

|

Technology

•

Sep 30, 2025

![Graphic representation of the topic Specification Templates for AI Code Generation](https://www.softwareseni.com/wp-content/uploads/2025/09/CSW202509300852_ART002_header_image.png)

Getting AI to generate quality code isn’t about luck. It’s about telling the AI what you need in a way it can actually work with. Most developers waste hours trying different formats and hoping for the best.

This article fixes that problem for you. You’re getting 8 copy-paste ready specification templates organised by progressive complexity. Each one gives AI exactly what it needs to generate code that’s ready for production. Use these and you’ll spend less time fixing generated code and more time shipping.

## What are specification templates and why do they matter for AI code generation?

Think of specification templates as the “source code” for AI code generation. They’re pre-structured formats that guide you in providing complete requirements to AI coding tools.

They standardise what AI needs to know: context, functional requirements, edge cases, concrete examples, and acceptance criteria. Your specification’s quality directly determines your generated code’s quality.

[Developers at Zoominfo reported minimal modifications needed to AI-generated code](https://arxiv.org/html/2501.13282v1) when they provided proper context and standards. That structured approach pays off— [research shows 70% of engineering managers reclaimed over 25% of their time](https://xenoss.io/blog/enterprise-ai-integration-into-legacy-systems-cto-guide) through AI assistants.

Without templates, you’ll miss details that AI can’t infer. Templates reduce cognitive load—you don’t need to remember what to include because the template structure does that for you.

## What are the essential components every specification template needs?

Every effective specification template needs six core components working together to ensure AI has everything needed for quality code.

**Context Section**: This gives AI the background, purpose, and assumptions it needs for decision-making. Without it, AI makes arbitrary choices that probably won’t fit your architecture.

**Functional Requirements**: Detailed description of what to build and how it should behave. Be specific about inputs, outputs, and expected behaviour.

**Edge Cases and Constraints**: Explicit boundary conditions and error scenarios. AI won’t infer these—you have to state them directly.

**Few-Shot Examples**: Concrete input/output scenarios demonstrating expected behaviour. [Providing examples of desired functionality](https://graphite.dev/guides/ai-pair-programming-best-practices) significantly improves AI output quality.

**Acceptance Criteria**: Testable conditions for validating generated code. These define what “correct” means in measurable terms.

**Non-Functional Requirements**: Performance, security, maintainability concerns. AI won’t consider these unless you specify them.

These six components map to the CARE framework: Context provides the C, Functional Requirements and Examples provide the A (Action), outputs and Acceptance Criteria provide the R (Result), and Non-Functional Requirements provide the E (Evaluation).

## What specification templates should I use?

Choose templates based on your task’s complexity. Start with simple function templates for individual methods, progress to API templates for backend endpoints, and scale up to microservice templates for complete services.

This library gives you 8 copy-paste ready templates: 1 beginner, 3 intermediate, 4 advanced. Each includes annotated sections and validation criteria. You can customise them for your specific tech stack without losing the core structure that makes them work.

### Simple Function Specification Template (Beginner)

Perfect for first-time specification writers and single-purpose functions. You’re looking at 100-200 words typically.

Use it for utility functions, data transformations, and validation logic.

**Template:**

```js
Function: [Function name and signature]

Purpose: [1-2 sentences describing what this function does and why it exists]

Context:
- [Key background information]
- [Relevant system constraints]

Inputs:
- [Parameter name]: [Type] - [Description and constraints]

Expected Output:
- [Return type]: [Description]

Behaviour:
[2-3 sentences describing the processing logic]

Edge Cases:
1. [Case description]: [Expected behaviour]
2. [Case description]: [Expected behaviour]
3. [Case description]: [Expected behaviour]

Examples:
Example 1: [Input] → [Output]
Example 2: [Input] → [Output]
Example 3: [Input] → [Output]

Acceptance Criteria:
- [ ] [Testable criterion 1]
- [ ] [Testable criterion 2]
- [ ] [Testable criterion 3]
```

### REST API Endpoint Specification Template (Intermediate)

For backend API endpoints and RESTful services. Works in natural language or OpenAPI/JSON format. Typical length is 200-400 words.

**Template:**

```js
Endpoint: [HTTP Method] [Path]

Purpose: [What this endpoint does and its role in the system]

Context:
- [System integration points]
- [Authentication/authorisation context]

Request:
Method: [GET|POST|PUT|DELETE|PATCH]
Path: [/api/resource/{id}]
Headers:
- [Header name]: [Value or description]

Request Body (if applicable):
{
  "field1": "type - description",
  "field2": "type - description"
}

Authentication:
[Description of authentication requirements]

Response Schemas:
Success (200/201):
{
  "field1": "type - description",
  "field2": "type - description"
}

Error Responses:
- 400 Bad Request: [When and what response]
- 401 Unauthorised: [When and what response]
- 404 Not Found: [When and what response]
- 500 Server Error: [When and what response]

Behaviour:
[Processing logic, data validation, side effects]

Edge Cases:
1. [Case]: [Expected response]
2. [Case]: [Expected response]

Examples:
Request Example 1: [Complete request] → [Complete response]
Request Example 2: [Complete request] → [Complete response]

Acceptance Criteria:
- [ ] [Criterion]
- [ ] [Criterion]

Performance Requirements:
- Response time: [Target]
- Rate limits: [Specification]
```

[API versioning helps prevent client services from breaking](https://vfunction.com/blog/microservices-architecture-guide/) because of API changes.

### React Component Specification Template (Intermediate)

For frontend UI components and interactive widgets. Typical length is 200-350 words.

**Template:**

```js
Component: [ComponentName]

Purpose: [What this component does and where it fits in the UI]

Context:
- [Parent component or page context]
- [Design system guidelines]

Props Interface:
{
  propName: type; // description
  propName?: type; // optional prop
}

State Management:
[Component state, what triggers state changes]

Event Handlers:
- [Event type]: [What should happen]

Render Behaviour:
[UI rendering logic, conditional rendering, loading/error states]

Styling Requirements:
- [Key styling requirement]
- [Responsive behaviour]

Accessibility:
- [ARIA labels needed]
- [Keyboard navigation requirements]

Edge Cases:
1. [Case]: [Expected UI behaviour]
2. [Case]: [Expected UI behaviour]

Examples:
Scenario 1: [Props values] → [Rendered output description]
Scenario 2: [Props values] → [Rendered output description]

Acceptance Criteria:
- [ ] [Criterion]
- [ ] [Criterion]

Performance Requirements:
- [Rendering performance targets]
```

[Effective component specifications include data fetching requirements, loading states, error handling, and following existing patterns](https://graphite.dev/guides/ai-pair-programming-best-practices).

### Database Schema and Migration Template (Intermediate)

For database structures, schema changes, and data migrations. Typical length is 150-300 words.

**Template:**

```js
Migration: [Brief description]

Purpose: [What this migration accomplishes and why]

Context:
- [Current database state]
- [Integration with existing tables]

Tables:
Table: [table_name]
Columns:
- [column_name]: [type] [constraints] - [description]

Relationships:
- [Relationship description with foreign keys]

Indexes:
- [Index specification and rationale]

Migration Operations:
UP (Apply):
1. [Operation description]
2. [Operation description]

DOWN (Rollback):
1. [Rollback operation]
2. [Rollback operation]

Data Transformation (if applicable):
[Description of how existing data should be migrated]

Edge Cases:
1. [Case]: [How to handle]
2. [Case]: [How to handle]

Acceptance Criteria:
- [ ] [Criterion]
- [ ] [Criterion]

Performance Impact:
- [Expected migration duration]
- [Downtime requirements]
```

[Dual-write patterns can update both legacy and new databases](https://circleci.com/blog/strangler-pattern-implementation-for-safe-microservices-transition/) during transitions.

### Microservice Specification Template (Advanced)

For complete microservices including API, data layer, and infrastructure. Typical length is 500-800 words.

**Template:**

```js
Service: [ServiceName]

Purpose: [What business capability this service implements]

Context:
- [System architecture context]
- [Bounded context description]

Service Boundaries:
[Clear description of what this service owns]

API Contract:
[Use REST API Endpoint template for each endpoint]

Data Models:
[Use Database Schema template or describe entities]

Dependencies:
Internal Services:
- [Service name]: [What we need from it]

External Services:
- [Service name]: [Integration details]

Configuration:
- [Config parameter]: [Description and default]

Deployment Requirements:
- Runtime: [Platform and version]
- Resources: [CPU, memory, storage]
- Scaling: [Scaling approach]

Observability:
Logging: [What to log]
Metrics: [Key metrics to expose]
Tracing: [Distributed tracing requirements]
Health Checks: [Endpoint and logic]

Inter-Service Communication:
- [Communication pattern: sync/async]
- [Protocol: REST/gRPC/message queue]
- [Error handling and retry logic]

Edge Cases:
1. [Case]: [Expected behaviour]
2. [Case]: [Expected behaviour]

Acceptance Criteria:
- [ ] [Criterion]
- [ ] [Criterion]

Non-Functional Requirements:
- Response time: [Target]
- Availability: [Target]
- Throughput: [Target]
- Security: [Requirements]
```

[Microservices have their own business logic and database](https://www.tatvasoft.com/outsourcing/2023/11/microservices-design-patterns.html), enabling independent deployment and scaling.

### System Architecture Specification Template (Advanced)

For multi-component system design and architectural decisions. Typical length is 600-1000 words.

**Template:**

```js
System: [SystemName]

Purpose: [What business problem this system solves]

Context:
- [Business context and drivers]
- [Technical landscape]
- [Constraints]

System Context:
Users: [Who uses this system]
External Systems: [What external systems it integrates with]

Component Identification:
Component: [ComponentName]
Responsibility: [What it does]
Technology: [Platform/framework]
Interfaces: [APIs it exposes]

Interaction Patterns:
- [Pattern 1]: [When and why it's used]
- [Pattern 2]: [When and why it's used]

Data Flows:
1. [Flow description]
2. [Flow description]

Integration Points:
- [Integration point]: [Protocol, data format, error handling]

Scaling Requirements:
- [Component]: [Scaling approach and targets]

Security Boundaries:
- [Boundary]: [Controls in place]

Operational Characteristics:
- Availability: [Targets and approach]
- Performance: [Targets]
- Disaster Recovery: [RPO/RTO]
- Deployment: [Strategy]

Architecture Decisions:
Decision: [Topic]
Context: [Why we needed to decide]
Decision: [What we decided]
Consequences: [Implications]

Technology Stack:
- [Layer]: [Technology choices]

Acceptance Criteria:
- [ ] [System-level criterion]

Non-Functional Requirements:
- [Requirement]: [Target and measurement]
```

[Architecture Decision Records document decisions with context, decision, and consequences](https://github.com/joelparkerhenderson/architecture-decision-record).

### Code Refactoring Specification Template (Advanced)

For targeted code improvements and technical debt reduction. Typical length is 300-500 words.

**Template:**

```js
Refactoring: [Brief description]

Purpose: [What improvement this achieves]

Context:
- [Current code problems]
- [Business/technical drivers]

Current State:
[Existing code structure and problems]

Target State:
[Desired code structure]

Refactoring Patterns to Apply:
1. [Pattern name]: [Where and how to apply]
2. [Pattern name]: [Where and how to apply]

Constraints to Maintain:
- [Constraint]: [Description]
(e.g., backward compatibility, existing APIs)

Behaviour Preservation:
[Explicit list of behaviours that must not change]

Testing Requirements:
- [Test type]: [What to test]

Before/After Structure Example:
Before: [Brief code structure description]
After: [Brief code structure description]

Edge Cases:
1. [Case to handle during refactoring]

Acceptance Criteria:
- [ ] [Criterion]
- [ ] All existing tests pass

Rollback Considerations:
[How to revert if problems arise]
```

[Refactoring changes code structure without changing functionality](https://www.infoq.com/articles/ddd-in-practice/). [Without good automated tests, refactoring can be counter-productive](https://www.infoq.com/articles/ddd-in-practice/).

### Code Migration Specification Template (Advanced)

For language upgrades, framework migrations, platform transitions. Typical length is 400-700 words.

**Template:**

```js
Migration: [From X to Y]

Purpose: [Why this migration is necessary]

Context:
- [Business drivers]
- [Technical drivers]
- [Timeline]

Source Environment:
- Platform: [Current platform and version]
- Framework: [Current framework]
- Key dependencies: [List]

Target Environment:
- Platform: [Target platform and version]
- Framework: [Target framework]
- Key dependencies: [List]

Migration Strategy:
[Overall approach: big bang, phased, strangler fig]
[Rationale]

Compatibility Requirements:
- [Requirement]: [Description]

Migration Steps:
1. [Step description]
2. [Step description]

Code Transformation Patterns:
- [Pattern]: [From syntax] → [To syntax]

Testing Strategy:
- [Test type]: [Approach]

Phased Rollout Plan:
Phase 1: [Scope and success criteria]
Phase 2: [Scope and success criteria]

Rollback Procedure:
[Detailed steps to revert if migration fails]

Edge Cases and Compatibility Issues:
1. [Known issue]: [How to handle]

Migration Status Tracking:
[How to track progress across files/modules]

Acceptance Criteria:
- [ ] [Criterion]
- [ ] All tests pass in target environment

Risk Assessment:
- [Risk]: [Mitigation]
```

[Google’s AI-driven migration splits the process into targeting locations, edit generation, and review](https://research.google/blog/accelerating-code-migrations-with-ai/). [Airbnb’s migration achieved 75% success rate in bulk migration](https://blog.bytebytego.com/p/inside-airbnbs-ai-powered-pipeline) in under four hours.

## How do I write my first specification?

Start with the Simple Function Specification Template and pick a small function from your codebase. Something you could code yourself in 15 minutes. Here’s your five-step process:

**Step 1: Describe purpose and context (1-2 sentences)**. Example: “This function validates email addresses for user registration. It ensures addresses follow RFC 5322 format.”

**Step 2: Define inputs with types and constraints**. Example: “email: string (1-254 characters, required).”

**Step 3: Describe expected outputs and behaviour**. Example: “Returns boolean. Checks format using regex.”

**Step 4: List 2-3 edge cases explicitly**. Example: “Empty string input, email with spaces, international domain names.”

**Step 5: Provide 2-3 concrete input/output examples**. Example: “validateEmail(‘user@example.com’) → true, validateEmail(‘invalid.email’) → false.”

Aim for 100-150 words total. Before you generate code, validate completeness: Do you have all six components? At least 2-3 concrete examples? Explicit edge cases? Measurable acceptance criteria?

[Start with a rough implementation and iterate](https://graphite.dev/guides/ai-pair-programming-best-practices). Request initial code, review it, request refinements, then validate against requirements.

## How do I choose between natural language and structured specification formats?

Use natural language (Markdown) for simple functions, components, and refactoring tasks where flexibility matters. Use structured formats (OpenAPI for APIs, JSON/YAML for configuration) when you need tool integration or documentation generation.

Consider hybrid approaches: Natural language for context, structured formats for schemas. For example, write API behaviour in prose but define request/response schemas in OpenAPI.

Three factors determine format choice:

**Task complexity**: Simple functions work with natural language. Complex APIs benefit from OpenAPI’s structure.

**Tool requirements**: Need API documentation? Use OpenAPI. Feeding specifications into CI/CD? Use JSON/YAML. Just generating code? Natural language works fine.

**Team familiarity**: Don’t force structured formats on unfamiliar teams. Start with natural language and adopt structured formats as needs evolve.

[OpenAPI provides language-agnostic interface descriptions for REST APIs](https://learn.microsoft.com/en-us/azure/architecture/microservices/model/domain-analysis). [Structured output reduces the likelihood of AI improvising](https://arxiv.org/html/2411.14971v1) beyond your input.

## What common mistakes should I avoid when writing specifications?

The six most common mistakes are: being too vague, being overly prescriptive, missing edge cases, forgetting examples, providing insufficient context, and ignoring non-functional requirements.

**Mistake 1: Too vague**. Write testable criteria. “Must respond within 200ms for 95% of requests” not “must be fast.”

**Mistake 2: Overly prescriptive**. Describe requirements, let AI choose implementation. “Sort users by last login date” not “Use quicksort on users array.”

**Mistake 3: Missing edge cases**. Explicitly list error conditions. “When input is null, throw ArgumentNullException. When array is empty, return empty result.”

**Mistake 4: No concrete examples**. Provide 2-3 concrete scenarios showing actual input/output values. REST API specifications without request/response examples produce incomplete code.

**Mistake 5: Insufficient context**. Add background explaining why you’re building this and how it fits your system. [Providing adequate context significantly improves effectiveness](https://graphite.dev/guides/ai-pair-programming-best-practices) —share relevant parts of your codebase, explain project architecture, specify coding standards.

**Mistake 6: Forgetting non-functional requirements**. Add NFRs like “Must handle 1000 requests/second. Must encrypt sensitive data. Must log errors.”

[When developers hold AI-generated code to the same standards as human-written code](https://assets.amazon.science/bc/ec/8213526e4857b6fa09af53b10c66/evaluating-human-ai-partnership-for-llm-based-code-migration.pdf), these mistakes become obvious during code review.

## How do I use the CARE framework to improve specification effectiveness?

The CARE framework organises specifications into four sections: Context (background and purpose), Action (what to build), Result (expected outputs), Evaluation (validation requirements).

**Context Section**: Background AI needs to make good decisions. Explain project architecture and design decisions, specify coding standards and patterns to follow, define constraints or requirements clearly.

**Action Section**: Functional requirements plus few-shot examples. This is your specification’s core.

**Result Section**: Output specifications and acceptance criteria. Make criteria measurable and testable.

**Evaluation Section**: How to validate generated code. Include non-functional requirements and testing approaches.

Map template components to CARE: Template Context Section → C. Functional Requirements and Examples → A. Outputs and Acceptance Criteria → R. Non-Functional Requirements → E.

Here’s how this works in practice with a simple function specification:

**C (Context)**: “This function validates email addresses for user registration. Our system uses RFC 5322 format.”

**A (Action)**: “Inputs: email: string. Behaviour: Check format using regex. Example: validateEmail(‘user@example.com’) → true”

**R (Result)**: “Returns boolean. True if valid, false otherwise.”

**E (Evaluation)**: “Must validate in under 1ms. Must handle unicode domains. Must reject malformed addresses.”

CARE helps most for complex specifications—microservices, system architectures, migrations. For simple functions, the structure’s implicit.

## How do I maintain and evolve specifications as code changes?

Maintain specifications alongside code in version control. Treat them as first-class artefacts requiring updates when functionality changes.

Three strategies to prevent specification-code drift:

**Link specifications to code files**. Add comments like “// Specification: docs/specs/user-authentication.md”.

**Review specifications during code reviews**. When code changes, update the specification in the same pull request.

**Update specifications before implementing changes**. Update the specification first, get it reviewed, then implement.

Version specifications using Git tags aligned with code releases. Create a maintenance checklist: Update when requirements change, refine after code generation reveals ambiguities, archive obsolete specifications, review quarterly to catch drift.

[Migration status annotations automatically stamp each file](https://blog.bytebytego.com/p/inside-airbnbs-ai-powered-pipeline) with comments recording progress. Adopt similar approaches for specifications—timestamp them, version them, track their status.

[Teams with thorough documentation processes reduce configuration-related issues by 40%](https://moldstud.com/articles/p-top-common-pitfalls-when-implementing-circuit-breaker-pattern-in-microservices). The same applies to specifications.

## FAQ Section

### How detailed should my first specification be?

Start with 100-150 words covering purpose, inputs, outputs, 2-3 edge cases, and 2-3 examples. Use the Simple Function Specification Template as your guide. The template structure tells you what to include—fill in each section with one or two sentences and you’ve got enough detail.

### Can I use natural language or do I need structured formats like OpenAPI?

Natural language (Markdown) works well for most specifications, especially when starting. Use structured formats (OpenAPI, JSON) when you need tool integration, automated validation, or API documentation generation. Start with natural language and adopt structured formats as requirements evolve.

### How do I know if my specification is good enough before generating code?

Use the validation checklist: Verify all required sections present, confirm 2-3 concrete examples exist, ensure edge cases explicit, check acceptance criteria measurable, validate context explains “why” not just “what.” All six components covered? You’re good to generate.

### Should I write tests separately or let AI generate them from specifications?

Include acceptance criteria in specifications to guide AI test generation, but review and augment AI-generated tests. [Automated tests play a vital role](https://www.infoq.com/articles/ddd-in-practice/) in validation. For complex systems, provide test scenarios as part of the specification and let AI implement them.

### How long does it take to write a good specification?

Simple function specifications: 5-10 minutes. API endpoints: 15-20 minutes. Microservices: 30-60 minutes. Time investment is front-loaded but pays dividends through higher quality code generation and fewer debugging iterations.

### Can I reuse specifications across projects?

Yes, specifications are highly reusable. Maintain a team specification library organised by template type. When reusing, update the context section for the new project, adjust examples to match current codebase, and review edge cases for changed requirements.

### What’s the difference between a specification and traditional requirements documentation?

Specifications for AI are more explicit, example-driven, and focused on AI’s interpretation needs. Traditional requirements assume human inference—developers fill in gaps based on experience. Specifications make everything explicit because AI can’t infer unstated details.

### How do I handle specifications for legacy code refactoring?

Use the Code Refactoring Specification Template. Describe current state clearly, specify target improvements, list constraints to maintain (backward compatibility, existing APIs), provide refactoring patterns to apply, and define comprehensive testing requirements. [Refactoring requires strict discipline with automated tests](https://www.infoq.com/articles/ddd-in-practice/).

### When should I progress from beginner to intermediate templates?

Progress when you’ve successfully used the Simple Function Template 3-5 times and feel confident in the six components. Intermediate templates add domain-specific sections (API schemas, component props, database constraints) but follow the same core structure.

### How do specifications differ across programming languages?

Core template structure remains consistent across languages, but examples, type systems, and idioms adapt to language specifics. Python specifications emphasise duck typing and exceptions. TypeScript specifications include interface definitions. Go specifications highlight error handling patterns.

### What if my generated code doesn’t match the specification?

First, validate specification completeness using the checklist. Common causes: missing edge cases, insufficient examples, vague acceptance criteria, inadequate context. Refine the specification addressing gaps, regenerate code, and iterate. Most mismatches trace to specification ambiguity, not AI limitations.

### How do I validate complex system specifications before implementation?

Use the Template Validation Checklist for each component specification. For system-level specifications, additionally verify: Component boundaries are clear, interaction patterns are specified, data flows are documented, non-functional requirements are quantified, and integration points are explicit.

### Related Articles

[![](https://www.softwareseni.com/wp-content/uploads/2022/04/Extended-Team-Model-1024x1024-1-1024x1024.png)](https://www.softwareseni.com/extended-team-model-all-you-need-to-know/)

## [Extended Team Model – all you need to know to build the dev team your business needs](https://www.softwareseni.com/extended-team-model-all-you-need-to-know/)

[

Blog

•

Apr 8, 2022

](https://www.softwareseni.com/extended-team-model-all-you-need-to-know/)How To Future-Proof Your Development Team Without Over-Hiring

![](https://www.softwareseni.com/wp-content/uploads/2025/02/How-To-Future-Proof-Your-Development-Team-Without-Over-Hiring-1024x1024.png)

Business

•

Mar 3, 2025

[View original](https://www.softwareseni.com/how-to-future-proof-your-development-team-without-over-hiring/)AI is going to make remote teams and video calls less frustrating

![](https://www.softwareseni.com/wp-content/uploads/2023/11/AI_is_going_to_make_remote_teams_and_video_calls_less_frustrating-1024x1024.png)

Blog

•

Nov 10, 2023

[View original](https://www.softwareseni.com/ai-is-going-to-make-remote-teams-and-video-calls-less-frustrating/)

#### SYDNEY

55 Pyrmont Bridge Road, Pyrmont, NSW, 2009, Australia

+61 2-8123-0997

#### JAKARTA

Plaza Indonesia, 5th Level Unit E021AB, Jl. M.H. Thamrin Kav. 28-30, Jakarta 10350, Indonesia

+62 858-6514-9577

#### BANDUNG

Jl. Banda No. 30, Bandung 40115, Indonesia

+62 858-6514-9577

#### YOGYAKARTA

Unit A & B Jl. Prof. Herman Yohanes No.1125, Yogyakarta, Daerah Istimewa Yogyakarta 55223, Indonesia

[+62 274-4539660](https://www.softwareseni.com/specification-templates-for-ai-code-generation-from-first-draft-to-production/)