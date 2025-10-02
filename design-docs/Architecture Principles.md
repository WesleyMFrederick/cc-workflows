
# Core Architecture Principles

---
## Modular Design Principles
**Replaceable by Design**: Modularity keeps systems flexible, replaceable, and understandable. Each part should do one thing well, interact only through well-defined boundaries, and remain simple enough to be swapped, extended, or recombined without ripple effects. ^modular-design-principles-definition

- **Black Box Interfaces**: Expose clean, documented APIs and hide implementation details. ^black-box-interfaces
- **Single Responsibility**: Give each class, module, or file one clear concern. ^single-responsibility
- **Replaceable Parts**: Design components so they can be swapped out using only their interfaces. ^replaceable-parts
- **Extension Over Modification**: Add functionality by extending, not altering existing code. ^extension-over-modification
- **Dependency Abstraction**: Depend on abstractions instead of concrete implementations. ^dependency-abstraction
- **Composition Over Inheritance**: Combine parts to adapt behavior without fragile hierarchies. ^composition-over-inheritance
- **Avoid Duplication**: Centralize shared functionality to reduce maintenance burden. ^avoid-duplication

---
## Data-First Design Principles
**Shape Data, Shape System:** Data is the foundation of system reliability. Clean models make code simple, predictable, and resilient. By defining strong primitives, capturing relationships explicitly, and enforcing invariants in the data itself, you reduce logic overhead and prevent entire classes of errors. ^data-first-principles-definition
### Core Data Principles
- **Primitive-First Design**: Define simple, consistent primitives and compose complexity from them. ^primitive-first-design
- **Data Model First**: Clean structures and relationships lead to clean code. ^data-model-first
- **Illegal States Unrepresentable**: Use types, schemas, and constraints to prevent invalid states. ^illegal-states-unrepresentable
- **Explicit Relationships**: Encode links directly (enums, unions, keys) instead of scattered checks. ^explicit-relationships
### Data Fit & Stability
- **Access-Pattern Fit**: Choose structures aligned with expected reads/writes. ^access-pattern-fit
- **Shift Complexity to Data**: Precompute or index so runtime logic stays simple. ^shift-complexity-to-data
- **Stable Schemas**: Version and migrate carefully; prioritize backward compatibility. ^stable-schemas
- **Behavior as Data**: Represent rules/configs declaratively instead of branching logic. ^behavior-as-data
- **One Source of Truth**: Keep an authoritative dataset with projections, not duplicates. ^one-source-of-truth
- **One Invariant, One Place**: Enforce each constraint in schema or type system, not in code paths. ^one-invariant-one-place

### Applied Data Rules
**Data Shapes Behavior:** When systems feel complex, look first to the data. Clean representations simplify logic, align the happy path with real use, and let measurement guide structure instead of guesswork. ^applied-data-rules

- **Refactor Representation First**: If logic feels tangled, reshape the data before rewriting the code. ^refactor-representation-first
- **Straight-Line Happy Path**: Choose representations that make the common case simple and linear. ^straight-line-happy-path
- **Measure, Then Model**: Base structures on observed patterns and error modes, not assumptions. ^measure-then-model

---
## Format/Interface Design
**Clarity Before Flexibility:** Interfaces are the touchpoints where systems and people connect. Good ones reduce errors, lower cognitive load, and make the system easier to extend. Keep them simple, focused, and role-specific to prevent bloat and confusion. ^format-interface-design-definition

- **Simplicity First**: - Make interfaces as simple as possible to implement. Favor simple designs that reduce complexity and potential for errors. Prefer one good way over multiple complex options. ^simplicity-first
- **Interface Segregation**: - Design small, role-specific interfaces rather than broad, catch-all ones. ^interface-segregation

---
## Minimum Viable Product (MVP) Principles
**Minimum for Momentum**: MVPs prove concepts. The goal is to validate ideas quickly, minimize wasted effort, and avoid building beyond what’s required. Keep scope tight, solutions simple, and lean on existing foundations so you can adapt fast. ^mvp-principles-definition
### Build the Right Thing
- **MVP-First Approach**: Build functionality that demonstrates the concept works, not bulletproof systems ^mvp-first
- **Reality Check**: Validate that each solution serves core functional requirements without unnecessary complexity ^reality-check
### Stay Within Scope
- **Scope Adherence**: Respect the PRD’s stated scope and non-goals — never exceed them ^scope-adherence
- **Implement When Needed**: Avoid implementing features until they are necessary to prevent over-engineering ^implement-when-needed
### Bias Toward Simplicity
- **Simplicity First**: Favor the most direct, straightforward implementation path when multiple options meet requirements, ensuring the system remains easy to build, test, and adapt ^simplicity-first
### Leverage What Exists
- **Foundation Reuse**: Leverage existing setup work instead of recreating infrastructure to create one source of truth ^foundation-reuse
- **Service Layer Separation**: Separate data access, business logic, and presentation layers ^service-layer-separation

---
## Deterministic Offloading Principles
**Consistency from Tools, Flexibility from LLMs**: LLMs are powerful but unreliable at rigid work, while deterministic tools are fast but brittle at semantics. Diversify execution by offloading predictable tasks to tools and keeping LLMs for judgment, maximizing strengths while reducing weaknesses. ^deterministic-offloading-principles-definition

- **Mechanical Separation**: Route deterministic tasks (I/O, parsing, validation, search, transforms) to tools, and reserve LLMs for semantic work (intent, design choices, contextual content). ^mechanical-separation
- **Focused Context**: - Keep the LLM’s context window filled with high-value, semantic information. Offloading deterministic details improves clarity, relevance, and reasoning performance. ^context-window-preservation
- **Tool-First Design**: Use/build specialized tools for repetitive operations instead of LLM brute force. ^tool-first-design
- **No Surprises**: Identical inputs and instructions yield consistent results ^prioritize-deterministic-operations

---
## Self-Contained Naming Principles
**Names as Contracts**: A name should stand on its own, clearly signaling purpose, scope, and intent without extra lookup. Good names act as lightweight contracts between humans, AI, and code—preventing confusion, speeding comprehension, and aligning with shared conventions. ^self-contained-naming-principles-definition

- **Descriptive Labels**: Distinguish system scope, operation type, and/or intended outcome without requiring documentation lookup ^descriptive-labels
- **Immediate Understanding**: Any human or AI should understand purpose from the identifier alone. ^immediate-understanding
- **Confusion Prevention**: Provide enough detail in names to eliminate ambiguity about function or responsibility ^confusion-prevention
- **Contextual Comments**: Include docstrings and inline comments that provide sufficient context for AI to understand file purpose and usage patterns ^contextual-comments
- **Follow Conventions**: Design systems to behave as users and developers expect, minimizing surprises ^follow-conventions

---
## Safety-First Design Patterns
**Safety as Default**: Systems should protect themselves and their users by default. Build layers of defense that **prevent** data loss, **expose** errors early, and **recover** when things go wrong. **Reliability** comes from redundancy, validation, and clear contracts—not luck. ^safety-first-principles-definition

- **Backup Creation**: Automatic timestamped backups before modifications ^backup-creation
- **Dry-Run Capability**: Preview changes without file modification ^dry-run-capability
- **Atomic Operations**: All changes succeed or fail together ^atomic-operations
- **Input Validation**: Multi-layer validation before processing ^input-validation
- **Error Recovery**: Graceful rollback on failure ^error-recovery
- **Fail Fast**: Catch errors as early as possible to simplify debugging and improve reliability ^fail-fast
- **Clear Contracts**: Specify preconditions, postconditions, and invariants between components for reliable cooperation ^clear-contracts

---
## Anti-Patterns to Avoid
**Clarity Over Cleverness**: Most failures come not from missing features, but from hidden complexity. Avoid patterns that obscure intent, spread logic across the system, or create fragile dependencies. Keep design choices obvious, simple, and easy to reason about. ^anti-patterns-definition

- **Scattered Checks**: Enforce invariants in schemas, not code. ^scattered-checks
- **Branch Explosion**: Replace deep if-else logic with declarative tables or data-driven dispatch ^branch-explosion
- **Over-Engineered Structures**: Avoid exotic data models before they’re needed. ^over-engineered-structures
- **Leaky Flags**: Avoid ambiguous enums/flags that require out-of-band knowledge to interpret ^leaky-flags
- **Hidden Global State**: Keep state explicit and localized to preserve clarity and testability ^hidden-global-state

---
