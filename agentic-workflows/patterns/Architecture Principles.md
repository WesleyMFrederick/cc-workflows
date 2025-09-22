
## Core Architecture Principles

### Modular Design Principles
- **Single File Responsibility**: Each class, module, and/or file should handle one specific concern or domain
- **Component Isolation**: Create small, focused components rather than large monolithic files
- **Service Layer Separation**: Separate data access, business logic, and presentation layers
- **Extension Over Modification**: Enable new functionality through extension rather than altering existing code
- **Interface Segregation**: Create small, role-specific interfaces rather than requiring dependencies on unused functionality
- **Dependency Abstraction**: Design high-level modules to depend on abstractions rather than concrete implementations
- **Composition Over Inheritance**: Combine small parts to adapt behavior without fragile hierarchies
- **Avoid Duplication**: Abstract repeated functionality to improve maintainability
- **Simplicity First**: Favor simple designs that reduce complexity and potential for errors
- **Implement When Needed**: Avoid implementing features until they are necessary to prevent over-engineering

### Deterministic Offloading Principles
- **Mechanical Separation**: Tools handle predictable operations (file I/O, parsing, validation) while LLMs focus on interpretation and decision-making
- **Context Preservation**: Minimize LLM token usage on deterministic tasks to maximize cognitive bandwidth for complex reasoning
- **Tool-First Design**: Create specialized tools for repetitive operations rather than relying on LLM processing power
- **Prioritize Deterministic Operations**: Identical inputs and instructions yield consistent results

### Data-First Principles
- **Data Model First**: Nail the data structures and relationships; clean code follows from a clean representation
- **Illegal States Unrepresentable**: Encode invariants in types, schemas, and constraints so bad states can’t exist
- **Explicit Relationships**: Prefer clear, typed links (enums, unions, foreign keys) over implicit, scattered checks
- **Access-Pattern Fit**: Choose structures that match reads/writes (e.g., adjacency lists, LSM trees, columnar formats)
- **Shift Complexity to Data**: Precompute, index, and parameterize so runtime logic stays simple and predictable
- **Stable Schemas**: Evolve via versioning and migrations; prioritize backward compatibility and clear change paths
- **Behavior as Data**: Represent rules, configs, and transitions declaratively to minimize branching in code

### Self-Contained Naming Principles
- **Descriptive Labels**: Names help distinguish system scope, operation type, and/or intended outcome without requiring documentation lookup
- **Immediate Understanding**: Any human or AI should understand purpose from the identifier alone
- **Confusion Prevention**: Provide enough detail in names to eliminate ambiguity about function or responsibility
- **Contextual Comments**: Include docstrings and inline comments that provide sufficient context for AI to understand file purpose and usage patterns
- **Follow Conventions**: Design systems to behave as users and developers expect, minimizing surprises

### Quick Heuristics
- **Refactor Representation First**: If logic feels tangled, reshape the data before rewriting the code
- **One Invariant, One Place**: Each critical constraint should live in the schema or type system, not in call sites
- **One Source of Truth**: Prefer authoritative data plus projections over duplicated, drifting copies
- **Straight-Line Happy Path**: Pick representations that turn the common case into simple, linear code
- **Measure, Then Model**: Let observed access patterns and error modes guide structure choices

### Safety-First Design Patterns
Tools implement multiple safety layers:
- **Backup Creation**: Automatic timestamped backups before modifications
- **Dry-Run Capability**: Preview changes without file modification
- **Atomic Operations**: All changes succeed or fail together
- **Input Validation**: Multi-layer validation before processing
- **Error Recovery**: Graceful rollback on failure
- **Fail Fast**: Catch errors as early as possible to simplify debugging and improve reliability
- **Clear Contracts**: Specify preconditions, postconditions, and invariants between components for reliable cooperation

### Anti-Patterns to Avoid
- **Code-Enforced Invariants**: Don’t rely on scattered checks; enforce constraints in the data layer
- **Branch Explosion**: Replace deep if-else logic with declarative tables or data-driven dispatch
- **Premature Exotic Structures**: Choose the simplest representation that cleanly captures requirements
- **Leaky Flags**: Avoid ambiguous enums/flags that require out-of-band knowledge to interpret
- **Hidden Global State**: Keep state explicit and localized to preserve clarity and testability
