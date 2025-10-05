# Pseudocode Style Guide

- Covers pseudocode as an architectural communication tool
- Emphasizes interfaces, boundaries, interactions, and integration points
- Provides complete syntax reference

## Philosophy

Pseudocode serves as a **communication bridge** between high-level design decisions and implementation. It should:

- **Focus on "why" and "what"** rather than "how"
- **Define interfaces and boundaries** clearly
- **Highlight integration points** requiring research
- **Show pattern relationships** without implementation noise
- **Assume competent developers** who can fill implementation gaps
- **Provide language-agnostic** representation of concepts

## Abstraction Levels

### HIGH: Interface & Boundary Definitions
Use for system boundaries, component contracts, and external integrations.

### MEDIUM: Pattern Application & Data Flow
Use for architectural patterns, component interactions, and decision points.

### MEDIUM-IMPLEMENTATION: Implementation-Ready Patterns
**Sweet spot for user stories**: Shows specific implementation mechanics while maintaining architectural focus. Provides developers with exact patterns needed for correct implementation without line-by-line code.

**Use when you need to show:**
- Platform-specific implementation strategies
- External tool integration mechanics
- Command execution patterns and responses
- Environment variable manipulation techniques
- Error simulation strategies with specific failure modes
- File system operations with permission handling

**Characteristics:**
- Shows **what** goes inside methods with real examples
- Demonstrates **platform differences** (Windows vs Unix patterns)
- Includes **actual command syntax** and expected responses
- Reveals **decision points** with implementation consequences
- Maintains **architectural boundaries** and integration patterns

### LOW: Implementation Details
Rarely needed - only for architecturally significant algorithms or syntax examples.

## I. Basic Syntax & Structure

### General Structure

- Use fenced code blocks to wrap your pseudocode. Use the `tsx` for the fenced block language, but follow the style conventions below. _Example:_

```tsx
// Some pseudocode
abstract Pseudocode is

// Rest of example
```

- **Blocks**: Code blocks for classes, interfaces, methods, constructors, and control flow statements (like `if`, `foreach`) are indicated by an `is` keyword followed by an indented body, without explicit closing keywords like `end` or curly braces `{}`.
- **Indentation**: **Two spaces** are used for each level of indentation.
- **Line Endings**: Lines do not terminate with semicolons.
- **Comments**:
  - Single-line comments begin with `//`.
  - Comments explaining a line of code can be placed at the end of that line, after `//`.
  - Multi-line comments also use `//` at the start of each line.
  - Ellipses `// ...` are used to represent omitted code within blocks.
  - Comments explaining a unit/block of code should be placed above the block. Do not interrupt a unit mid block with comments.
  - **CRITICAL**: NEVER place a line comment after the `is` declaration. ALWAYS add a line break when adding a new comment for a block. This makes the pseudocode easier to scan.  _For example:_

```tsx
// Defines a Logger class ensuring only one instance exists (Singleton pattern).
// The 'instance' field and 'getInstance' method are static.
class Logger is
  private static field instance: Logger

 // Private to prevent direct instantiation
 private constructor Logger() is
   print "Logger initialized."

 // Global access point to the single instance
  public static method getInstance(): Logger is
    if (Logger.instance == null) then
      Logger.instance = new Logger()
    return Logger.instance
```

### Naming Conventions

- **Class and Interface Names**: Use **TitleCase** (e.g., `Dialog`, `Button`, `Shape`, `GUIFactory`, `Application`).
- **Method Names**: Use **camelCase** (e.g., `createButton`, `render`, `onClick`, `getTaxRate`, `teach`, `makeSound`).
- **Field and Variable Names**: Use **camelCase** (e.g., `student`, `total`, `country`, `order`, `item`).
- **Parameter Names**: Use **camelCase** (e.g., `order`, `country`, `c`, `radius`, `width`).
- **Constants/Enums (Implicit)**: Although not explicitly defined as constants, values acting as such (e.g., "US", "EU", "Windows", "Web") are often in TitleCase or All Caps when used in conditions.

### Declarations

- **Classes**: Declared using `class ClassName is`.
- **Inheritance**: `class SubClass extends SuperClass is`.
- **Implementation**: `class ClassName implements InterfaceName is`.
- **Interfaces**: Declared using `interface InterfaceName is`.
- **Methods**: Declared using `method methodName(parameter1: Type, parameter2: Type): ReturnType is`.
  - Parameter and return types are optional but can be specified with a colon `:`.
- **Abstract Methods**: Declared using `abstract method methodName(parameters): ReturnType`.
- **Constructors**: Declared using `constructor ConstructorName(parameters) is` or `constructor ConstructorName(parameters) { ... }`.
  - `super(source)` is used to call a parent constructor.
- **Fields**: Declared using `field fieldName: Type`.
- **Access Modifiers**: `private`, `protected`, `public`, `static` are used before `field` or `method` (e.g., `private field student`, `public static method getInstance()`).
  - `private static field` for static fields.

### Syntax and Keywords

- **Assignment**: `variable = value`.
- **Comparison**: Operators such as `==`, `!=`, `>=`, `<` are used.
- **Arithmetic**: Operators such as `+`, `-`, `*`, `/` are used.
- **Logical Operations**: `&&` (and), `||` (or), `!` (not) are used.
- **Control Flow**:
  - `if (condition) then ... else if (condition) then ... else ...`. The `then` keyword is often used after `if` and `else if` conditions, but can sometimes be omitted.
  - `foreach (item in collection) do ...`. The `do` keyword is used after the `foreach` statement.
  - `switch (variable)` with `case` and `break` keywords.
- **Object Instantiation**: `new ClassName()`.
- **Self-Reference**: `this.fieldName` for current object's fields.
- **Type Casting (Implicit)**: Sometimes implied in comments for clarity, e.g., `(City) node`.
- **Return Values**: `return value`.
- **Exception Handling**: `throw new Exception("Error message.")`.
- **Thread Synchronization**: `acquireThreadLock() and then` for concurrency control.
- **Special Values**: `null` for absence of value. `true`, `false` for boolean values.

### Data Types

- **Primitive Types**: `int`, `string`, `bool`.
- **Collection Types**: `array of Type`, `collection of Type`, `hash map of KeyType and ValueType`.
- **Custom Types**: Class and interface names are used as types (e.g., `Dialog`, `Button`, `Shape`).

## II. Architectural Extensions

### Research Integration Points
Mark external dependencies and validation needs:

```tsx
// Environment validation boundary
method validateCLITool(toolName: string): ValidationResult is
  // Research: which ${toolName}
  // Verify: ${toolName} --version >= required_version
  // Fallback: Installation instructions or alternative approach
  ...
```

### Comprehensive Comment Taxonomy

Use standardized comment categories for consistent architectural communication:

#### **Core Categories**

```tsx
// Research: External investigation or validation needed
// Validation: Verification requirements and constraints
// Integration: Cross-boundary coordination and dependencies
// Pattern: Architectural pattern identification and application
// Decision: Choice points requiring architectural consideration
// Boundary: System interface and interaction definitions
// Error handling: Failure scenario management and recovery
// Security: Access control, validation, and protection requirements
// Performance: Optimization considerations and constraints
// Fallback: Alternative approaches for failure scenarios
```

#### **Usage Examples**

```tsx
// Component initialization with comprehensive context
class PaymentProcessor is
  constructor PaymentProcessor(gatewayProvider: PaymentBoundary,
                              securityValidator: SecurityBoundary) is
    // Research: Payment provider API documentation and rate limits
    // Validation: API key format and merchant account verification
    // Integration: External payment gateway coordination
    // Security: PCI compliance requirements and data handling
    // Fallback: Offline payment queuing for gateway unavailability
    ...

  // Transaction processing with decision points
  method processPayment(transaction: PaymentTransaction): PaymentResult is
    // Decision: Payment routing based on amount and merchant rules
    // Boundary: External payment gateway interaction
    // Validation: Transaction limits and fraud detection
    // Error handling: Partial payment scenarios and reversal strategies
    // Performance: Response time requirements for user experience
    ...
```

### Source Documentation References
Always include architecture source references:

```tsx
// Authentication boundary [Source: architecture/security.md#auth-patterns]
interface AuthService is
  method authenticate(credentials: Credentials): AuthResult is
    // Integration: External OAuth provider coordination
    // Error handling: Network timeouts, invalid tokens, rate limiting
    // Security: Token validation and session management
    // Fallback: Cached authentication for service unavailability
    ...
```

## III. Architectural Patterns

### Component Boundaries

```tsx
// Frontend-Backend boundary definition
interface APIGateway is
  // Request validation and transformation layer
  method handleRequest(request: HTTPRequest): APIResponse is
    // Validate: Input sanitization, authentication
    // Route: Based on endpoint patterns
    // Transform: Response format standardization
    ...

// Data persistence boundary
interface DataRepository is
  method save(entity: DomainEntity): OperationResult is
    // Transaction: Database consistency rules
    // Validation: Domain constraints
    ...
```

### Integration Points

```tsx
// External service integration
class ExternalServiceClient is
  method connect(): ConnectionResult is
    // Research: Service API documentation
    // Validate: API key format and permissions
    // Fallback: Retry logic, circuit breaker
    ...

  method executeOperation(operation: ServiceOperation) is
    // Boundary: Network call with timeout
    // Error handling: Service unavailable, rate limits
    // Logging: Request/response for debugging
    ...
```

### Decision Points

```tsx
// Architecture decision with alternatives
class DataProcessor is
  method processLargeDataset(data: Dataset): ProcessResult is
    // Decision: Streaming vs batch processing
    // Criteria: Memory constraints, processing time
    if (data.size > MEMORY_THRESHOLD) then
      // Stream processing approach
      ...
    else
      // In-memory batch processing
      ...
```

## IV. Testing Architecture Patterns

Architectural pseudocode extends to testing strategies, emphasizing behavioral validation over implementation verification.

### Given-When-Then Pattern

Use BDD-style specification for test behavioral validation:

```tsx
// Test pattern: Component boundary behavior verification
method test_userAuthentication_boundaryValidation(): TestResult is
  // Given: User credentials with known validation requirements
  // When: Authentication boundary processes credential validation
  // Then: Security policy enforcement and session establishment
  // Validation: Token generation and authorization state verification
  ...

// Test pattern: Error propagation across system boundaries
method test_paymentProcessing_errorPropagation(): TestResult is
  // Given: Invalid payment credentials and network connectivity
  // When: Payment boundary attempts external gateway communication
  // Then: Meaningful error context propagated to orchestration layer
  // Validation: Error boundary isolation and user feedback accuracy
  ...
```

### Testing Boundary Architecture

Define testing strategies that focus on architectural concerns:

```tsx
// Testing boundary for external service integration validation
// Strategy: Real service calls with controlled test data environments
class ExternalServiceTests is
  constructor ExternalServiceTests(testDataManager: TestDataBoundary,
                                  networkSimulator: NetworkBoundary,
                                  cleanupCoordinator: TestCleanupBoundary) is
    // Research: Service test environment setup and data isolation requirements
    // Validation: Test data lifecycle and cleanup verification
    // Integration: Network simulation for failure scenario testing
    ...

  // Test environment provisioning with controlled external dependencies
  method setupServiceTestEnvironment(): TestEnvironment is
    // Pattern: Isolated test data provisioning with service coordination
    // Boundary: External service test account and data management
    // Validation: Service availability and test data accessibility
    ...
```

### Behavioral Validation Patterns

Focus on architectural behavior rather than implementation details:

```tsx
// Test pattern: Idempotent operation verification
method test_workspaceCreation_idempotentBehavior(): TestResult is
  // Given: Isolated test environment with workspace boundary
  // When: Multiple creation attempts with identical version identifiers
  // Then: Consistent workspace state and path resolution
  // Validation: No side effects from repeated operations
  ...

// Test pattern: Transaction integrity verification
method test_dataTransaction_rollbackIntegrity(): TestResult is
  // Given: Multi-step transaction with intentional failure point
  // When: Transaction boundary encounters failure during processing
  // Then: Complete state rollback with no partial modifications
  // Validation: Data consistency and cleanup verification
  ...

// Test pattern: Concurrent boundary safety
method test_resourceAccess_concurrencySafety(): TestResult is
  // Given: Multiple concurrent requests to shared resource boundary
  // When: Simultaneous operations attempt resource modification
  // Then: Safe conflict resolution with deterministic final state
  // Validation: No race conditions or data corruption
  ...
```

### Test Quality Markers

Use consistent markers for test architectural concerns:

```tsx
// Test quality indicators in architectural tests
method test_systemIntegration_performanceBoundary(): TestResult is
  // Performance: Response time requirements under load
  // Research: Load testing tool setup and baseline establishment
  // Boundary: External service response time dependencies
  // Fallback: Degraded service behavior verification
  // Validation: Service level agreement compliance
  ...
```

## V. User Story Integration

### In Dev Notes Section
Use architectural pseudocode to clarify complex interactions:

```tsx
// Story implementation overview
class UserRegistrationWorkflow is
  method registerUser(userData: UserData): RegistrationResult is
    // Step 1: Validation boundary [Source: architecture/validation.md#user-data]
    // Step 2: Database transaction [Source: architecture/data-models.md#user-schema]
    // Step 3: Email service integration [Source: architecture/external-apis.md#email]
    // Step 4: Success response formatting
    ...
```

### Technical Readiness Indicators
Show what needs research or clarification:

```tsx
// Requires clarification in story
method integratePaymentProcessor() is
  // Research needed: Which payment provider (Stripe, PayPal, Square)?
  // Config required: API credentials and webhook endpoints
  // Testing: Sandbox environment setup
  ...
```

### When to Use Architectural Pseudocode
- **Complex component interactions** requiring clarity
- **External system boundaries** needing research
- **Pattern application** where structure matters
- **Decision points** affecting multiple components

### When NOT to Use
- **Simple CRUD operations** - prose description sufficient
- **Standard implementations** - reference existing patterns
- **UI component structure** - use component hierarchy instead

### Integration with Story Templates
Place architectural pseudocode in:
- **Dev Notes section**: For complex technical context
- **Tasks/Subtasks**: To clarify implementation approach
- **Technical Constraints**: To show system boundaries

## VI. Examples

### System Boundary Definition

```tsx
// Application security boundary
interface SecurityLayer is
  method authorizeAccess(user: User, resource: Resource): AuthResult is
    // Policy evaluation [Source: architecture/security.md#rbac]
    // Session validation
    // Audit logging
    ...

  method encryptSensitiveData(data: SensitiveData): EncryptedData is
    // Encryption standard [Source: architecture/security.md#encryption]
    // Key management integration
    ...
```

### Component Interaction Pattern

```tsx
// MVC interaction flow
class UserController is
  method handleUserRequest(request: HTTPRequest): HTTPResponse is
    // Request validation and parsing
    // Business logic delegation to UserService
    // Response formatting and error handling
    ...

class UserService is
  method processUserOperation(operation: UserOperation): ServiceResult is
    // Domain logic execution
    // Data persistence via UserRepository
    // Business rule validation
    ...
```

### Integration Research Points

```tsx
// External tool integration requiring research
class CLIToolIntegration is
  method setupDevelopmentEnvironment(): SetupResult is
    // Research: Installation requirements
    //   - which node && node --version >= 18.0.0
    //   - which npm && npm --version >= 8.0.0
    //   - which git && git --version >= 2.30.0
    // Validation: Tool compatibility matrix
    // Fallback: Installation guidance or Docker alternative
    ...
```

## VII. Complete Example: Implementation vs. Architectural Comparison

### Original Implementation-Focused Version

```tsx
// The DirectoryManager class encapsulates all file system operations
// related to the creation and cleanup of versioned workspaces.
class DirectoryManager is
 private field fs: FileSystem
 private field path: Path
 private field logger: Logger
 private field basePath: string

 constructor DirectoryManager(fs, path, logger, basePath) is
  this.fs = fs
  this.path = path
  this.logger = logger
  this.basePath = basePath

 public method createVersionDirectory(version: string): string is
  field directoryPath = this.path.join(this.basePath, "v" + version)
  this.logger.info("Preparing workspace at " + directoryPath)

  if (this.fs.existsSync(directoryPath)) then
   this.logger.warn("Directory already exists, reusing.")
   return directoryPath

  try
   this.fs.mkdirSync(directoryPath, { recursive: true })
   this.logger.info("Successfully created workspace directory.")
   return directoryPath
  catch (error) is
   this.logger.error("Failed to create directory: " + error.message)
   throw error
```

### Architectural Version (Recommended)

```tsx
// Workspace lifecycle management boundary
// Handles versioned directory creation with idempotent operations and rollback strategy
class DirectoryManager is
  // Dependencies represent system boundaries requiring validation
  constructor DirectoryManager(fileSystem: FileSystemBoundary, pathResolver: PathBoundary,
                              logger: LoggingBoundary, workspaceConfig: WorkspaceConfig) is
    // Research: Validate file system permissions and constraints
    // Research: Check available disk space vs. expected workspace size
    // Integration: Dependency injection enables testing isolation
    ...

  // Idempotent workspace creation pattern
  // Returns existing workspace or creates new one based on version identifier
  public method createVersionDirectory(version: VersionIdentifier): WorkspacePath is
    // Decision point: Workspace path generation strategy
    field targetPath = this.resolveWorkspacePath(version)

    // Idempotent operation: Safe to call multiple times
    if (this.workspaceExists(targetPath)) then
      // Validation: Verify workspace integrity and permissions
      return this.validateExistingWorkspace(targetPath)

    // Creation boundary: File system interaction point
    return this.provisionNewWorkspace(targetPath)

  // Failure recovery pattern for workspace cleanup
  // Part of transactional workspace management strategy
  public method rollbackDirectory(workspacePath: WorkspacePath): void is
    // Rollback strategy: Prioritize original error over cleanup errors
    // Security boundary: Validate path is within allowed workspace area
    // Integration: Cleanup must not interfere with concurrent operations
    ...

  // Private boundaries for workspace management
  private method resolveWorkspacePath(version: VersionIdentifier): WorkspacePath is
    // Research: Path length limits on target file systems
    // Validation: Version identifier format and safety
    ...

  private method workspaceExists(path: WorkspacePath): boolean is
    // Boundary: File system existence check
    ...

  private method validateExistingWorkspace(path: WorkspacePath): WorkspacePath is
    // Validation: Workspace structure integrity
    // Security: Permission verification
    // Error handling: Corrupted workspace recovery
    ...

  private method provisionNewWorkspace(path: WorkspacePath): WorkspacePath is
    // Transaction pattern: Atomic directory creation
    // Error handling: Partial creation rollback
    // Integration: Post-creation validation hooks
    ...
```

### Implementation-Ready Example (MEDIUM-IMPLEMENTATION Level)

Here's an example that demonstrates the **MEDIUM-IMPLEMENTATION** abstraction level - showing specific implementation mechanics while maintaining architectural focus:

```tsx
// Mock binary system for controlled version detection testing
// Creates platform-specific executable scripts with PATH integration
class MockBinaryManager is
  constructor MockBinaryManager(testWorkspace: TestWorkspaceBoundary) is
    // Integration: Leverage existing createTestWorkspace() from infrastructure
    ...

  // Creates executable mock binary responding to `claude --version` commands
  public method createMockBinary(version: VersionString, testName: TestIdentifier): MockBinaryResult is
    field workspace = this.createTestWorkspace(testName)

    // Platform decision: Windows .bat vs Unix shell script
    field binaryName = this.isWindows() ? "claude.bat" : "claude"
    field binaryPath = path.join(workspace.tempDir, binaryName)

    // Script content generation with specific command handling
    field scriptContent = this.generateScriptContent(version)
    // Windows: @echo off\nif "%1"=="--version" echo ${version}\n
    // Unix: #!/bin/bash\nif [ "$1" = "--version" ]; then echo "${version}"; fi

    // File system: Create executable script
    this.writeExecutableScript(binaryPath, scriptContent)
    // Unix: fs.chmodSync(binaryPath, '755')
    // Windows: No chmod needed for .bat files

    return { binaryPath, cleanup: workspace.cleanup }

  // PATH manipulation for `which claude` resolution
  public method setupMockBinaryInPath(mockBinary: MockBinaryResult): PathEnvironment is
    // Environment variable manipulation with restoration
    field originalPath = process.env.PATH
    field binaryDirectory = path.dirname(mockBinary.binaryPath)

    // Prepend mock directory to PATH
    // Windows: PATH = binaryDirectory + ";" + originalPath
    // Unix: PATH = binaryDirectory + ":" + originalPath
    process.env.PATH = binaryDirectory + path.delimiter + originalPath

    // Return restoration function
    return {
      restore: () => { process.env.PATH = originalPath },
      verify: () => this.testWhichClaude() // Verification: `which claude` finds mock
    }

  // Platform-specific script generation with actual content patterns
  private method generateScriptContent(version: VersionString): ScriptContent is
    if (this.isWindows()) then
      // Windows batch script responding to --version
      return `@echo off
if "%1"=="--version" (
  echo ${version}
  exit /b 0
)
echo Error: Unknown command
exit /b 1`
    else
      // Unix shell script responding to --version
      return `#!/bin/bash
if [ "$1" = "--version" ]; then
  echo "${version}"
  exit 0
fi
echo "Error: Unknown command" >&2
exit 1`
```

**This example demonstrates MEDIUM-IMPLEMENTATION characteristics:**
- **Shows what goes inside methods**: Real script content with platform differences
- **Platform-specific patterns**: Windows .bat vs Unix shell syntax
- **Command execution mechanics**: How `claude --version` responds and PATH manipulation works
- **Integration boundaries**: Clear connection to existing test infrastructure
- **Decision points**: Platform detection and error handling strategies

**vs. HIGH level which would show:**

```tsx
// Mock binary boundary for version detection testing
class MockBinaryManager is
  public method createMockBinary(version: VersionString): MockBinaryResult is
    // Boundary: Platform-aware binary creation
    // Integration: Test workspace isolation
    // Pattern: Resource cleanup coordination
    ...
```

**vs. LOW level which would show:**

```tsx
// Complete implementation details (avoid this in user stories)
public method createMockBinary(version, testName) {
  const workspace = createTestWorkspace(testName);
  const isWin = process.platform === 'win32';
  const binaryName = isWin ? 'claude.bat' : 'claude';
  const binaryPath = path.join(workspace.tempDir, binaryName);
  const scriptContent = isWin ?
    `@echo off\nif "%1"=="--version" echo ${version}` :
    `#!/bin/bash\nif [ "$1" = "--version" ]; then echo "${version}"; fi`;
  fs.writeFileSync(binaryPath, scriptContent);
  if (!isWin) fs.chmodSync(binaryPath, '755');
  return { binaryPath, cleanup: workspace.cleanup };
}
```

### Why the Architectural Version is Better for User Stories

**For Junior Developers:**
- **Pattern Learning**: Teaches idempotent operations, transaction patterns, boundary management
- **Research Guidance**: Explicitly identifies what needs investigation (permissions, disk space, path limits)
- **Decision Points**: Highlights where architectural choices matter
- **Security Awareness**: Points out validation and security boundaries

**For Competent Developers:**
- **Implementation Flexibility**: Can choose appropriate APIs and error handling strategies
- **Focus on Architecture**: Emphasizes system design over specific syntax
- **Integration Context**: Shows how component fits into larger system
- **Testing Strategy**: Boundary-focused design enables better test isolation

**For User Stories:**
- **Reduced Tokens**: ~60% less detailed content in Dev Notes sections
- **Higher Abstraction**: Focuses on what developers need to decide, not implement
- **Research Integration**: Natural fit with validation commands and external dependencies
- **Pattern Reuse**: Establishes consistent architectural thinking across stories

## VIII. Quality Standards

### Required Elements
- **Clear boundary definitions** between components
- **Integration points** marked with research needs
- **Source references** to architecture documents
- **Decision rationale** for pattern choices

### Avoid
- **Line-by-line implementation** details
- **Language-specific** syntax unless architecturally relevant
- **Complete method bodies** unless showing critical patterns
- **Invented technical details** not found in architecture docs

### Example-Specific Details
- Pseudocode often includes numbered lines on the right side, which are part of the book's presentation and not the pseudocode syntax itself.

---

_This comprehensive guide serves competent developers who need both basic syntax reference and architectural clarity to implement user stories efficiently._
