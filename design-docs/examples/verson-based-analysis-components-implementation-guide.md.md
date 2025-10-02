---

---
<!-- markdownlint-disable MD024 -->
# Implementation Guide Components

## `setupOrchestrator.js`

- **File Path**: `src/scripts/setupOrchestrator.js`
- **Primary Responsibility**: To manage the entire automated pre-processing workflow, serving as the main entry point for version detection and workspace setup.
- **Dependencies**:
  - `child_process`: To execute shell commands.
  - `path`: To handle file paths.
  - `fs`: For the binary copy operation.
  - `./pre-process/directoryManager`: To manage directory creation and rollback.
  - `./pre-process/codeFormatter`: To run the code beautifier.
  - `./logger`: For all console output.
- **Public API / Exports**:
  - `run()`: Executes the end-to-end setup workflow. Returns a promise that resolves with the path to the prepared version directory or rejects if any critical step fails.

### `SetupOrchestrator` Core Logic (Pseudocode)

```tsx
// Orchestration pattern for the transactional analysis setup workflow.
// Manages external tool validation, workspace setup, and failure recovery.
// [Source: design-docs/features/version-based-analysis/version-based-analysis-architecture.md#Code-Processing-Application.SetupOrchestrator]
class SetupOrchestrator is

  // Dependencies represent system boundaries that must be validated and managed.
  constructor SetupOrchestrator(shell: ShellBoundary, directoryManager: DirectoryManagerBoundary,
                                codeFormatter: CodeFormatterBoundary, logger: LoggingBoundary,
                                systemConfig: SystemConfig) is
    // Research: Validate external CLI tool dependencies (claude, biome).
    // Verify: Tools exist in PATH or configured search paths.
    // Integration: Dependency injection enables transactional control and testing.
    ...

  // Executes the end-to-end setup workflow as a single transaction.
  // Returns the path to the prepared workspace or throws on critical failure.
  public method run(): WorkspacePath is
  
    // Transaction pattern: All steps must succeed, or the system rolls back.
    field workspacePath: WorkspacePath = null
    try
      field binaryPath = this.locateBinary()
      field version = this.extractVersion(binaryPath)
      workspacePath = this.prepareWorkspace(version)

      this.stageAndFormatBinary(binaryPath, workspacePath)
      return workspacePath
    catch (error) is
      this.handleFailure(error, workspacePath)

  // --- Private boundaries for orchestration steps ---

  // Boundary for locating the external CLI tool.
  private method locateBinary(): FilePath is
    // Research: System PATH environment variable and configured search paths.
    // Validation: Check for executable permissions on the binary.
    // Fallback: Provide guided error if binary is not found.
    ...

  // Boundary for parsing version info from the external tool.
  private method extractVersion(binaryPath: FilePath): VersionIdentifier is
    // Integration: Shell command execution via ShellBoundary.
    // Validation: Parse version string from unpredictable CLI output.
    // Error handling: Gracefully handle unexpected or missing version format.
    ...

  // Boundary for idempotent workspace creation.
  private method prepareWorkspace(version: VersionIdentifier): WorkspacePath is
    // Integration: Delegates to DirectoryManagerBoundary for idempotent creation.
    // [Source: design-docs/features/version-based-analysis/architecture/verson-based-analysis-components-implementation-guide.md.md#directorymanager.js]
    ...

  // Boundary for file operations and code formatting.
  private method stageAndFormatBinary(binaryPath: FilePath, workspacePath: WorkspacePath): void is
    // Transaction step: Copy binary to workspace.
    // Integration: Delegates to CodeFormatterBoundary to apply project standards.
    // [Source: design-docs/features/version-based-analysis/architecture/verson-based-analysis-components-implementation-guide.md.md#codeformatter.js]
    ...

  // Failure recovery and rollback boundary.
  private method handleFailure(error: Error, workspacePath: WorkspacePath): void is
    // Rollback strategy: Clean up workspace on any setup failure.
    // Integration: Delegates to DirectoryManagerBoundary for rollback.
    // Decision: Original error is logged and re-thrown to notify the caller.
    ...
```

### Dependency Injection
The technique of passing dependencies in from the outside, rather than creating them on the inside, is a design pattern called **Dependency Injection**.

It makes our components more flexible and, most importantly, much easier to test.

#### The "LEGO®" Analogy 🧱

Think of it like building with LEGO® blocks:
- **Direct Imports (The "Glued" Car)**: If the `SetupOrchestrator` `require`'s the `DirectoryManager` directly inside its own file, it's like having a LEGO® car with the wheels permanently glued on. The car is rigidly built and you can't easily swap the wheels out to see how it performs with racing tires instead of standard ones.
- **Dependency Injection (The "Snap-On" Car)**: By passing the `DirectoryManager` into the `SetupOrchestrator`'s constructor, we're building a car with standard axles. We can easily snap on any kind of wheel we want. The car doesn't need to know how the wheels are made; it just knows it will get wheels that work.

#### Why It's Better for Us
1. **Makes Testing Easy**: This is the primary benefit for our project. When we test the `SetupOrchestrator`, we don't want to test the real `DirectoryManager` that creates real folders. Instead, we can pass in a **fake `DirectoryManager`** that just pretends to work. This allows us to test the orchestrator's logic in isolation to verify that it calls its helpers correctly, making our tests extremely fast and predictable.
2. **Increases Flexibility**: It decouples our components. If we ever decided to write a new `DirectoryManager` that worked with a cloud file system instead of the local one, we could pass the new version into the `SetupOrchestrator` without changing a single line of the orchestrator's code. It makes our system more adaptable to future changes.

## `directoryManager.js`

This component is a critical helper for the `SetupOrchestrator`. Its main purpose is to handle file system interactions in a predictable and safe way, ensuring that we never leave a partially created directory if a subsequent step in the automation pipeline fails. The design is intentionally simple, relying on injected dependencies to make it fully testable without writing to the actual disk.

- **File Path**: `src/scripts/pre-process/directoryManager.js`
- **Primary Responsibility**: To manage the atomic creation and rollback of version-specific analysis directories, ensuring a clean and predictable workspace.
- **Dependencies**:
  - `fs`: To execute file system operations (`mkdir`, `rm`, `existsSync`).
  - `path`: To construct platform-agnostic file paths.
  - `./logger`: For all console output and logging.
- **Public API / Exports**:
  - `createVersionDirectory(version)`: Creates a new directory named for the version and returns its full path. If it already exists, it returns the existing path.
  - `rollbackDirectory(directoryPath)`: Deletes the specified directory and all its contents.
- **Notes**:
  - This component is instantiated by the main application script. Configuration-derived values, such as `basePath`, are loaded from `config.json` and passed into the constructor during instantiation.

### `DirectoryManager` Core Logic (Pseudocode)

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

### Testing Architecture

The testing strategy validates component behavior at **file system boundaries** using real system interactions with controlled isolation. This approach ensures components work correctly in actual execution environments while maintaining test reliability and speed.

#### Testing Boundary Strategy for DirectoryManager

**Core Testing Philosophy**: Test against real file systems with isolated temporary workspaces to validate actual boundary behavior without mocking critical system interfaces.

**Test Environment Architecture**:

```tsx
// Testing boundary for workspace lifecycle validation
// Strategy: Real file system interactions with isolated temporary environments
// Research: Platform-specific temporary directory behaviors and cleanup patterns
class DirectoryManagerTests is
  // Test isolation boundary configuration
  constructor DirectoryManagerTests(tempDirProvider: TempDirectoryBoundary,
                                   cleanupManager: TestCleanupBoundary) is
    // Research: Cross-platform temporary directory creation strategies
    // Validation: Test environment isolation guarantees
    // Integration: Cleanup coordination with test framework lifecycle
    ...

  // Test environment provisioning boundary
  method setupIsolatedWorkspace(): TestEnvironment is
    // Pattern: Unique namespace generation for concurrent test execution
    // Boundary: Temporary file system allocation with cleanup guarantees
    // Validation: Test workspace permission and accessibility verification
    ...

  // Test environment cleanup boundary
  method teardownIsolatedWorkspace(environment: TestEnvironment): void is
    // Pattern: Guaranteed cleanup regardless of test outcome
    // Boundary: Safe recursive removal with path validation
    // Error handling: Cleanup failure isolation from test results
    ...
```

#### Test Pattern Architecture for DirectoryManager

**Behavioral Validation Patterns**:

```tsx
// Test pattern: Idempotent operation verification
method test_workspaceCreation_idempotentBehavior(): TestResult is
  // Given: Isolated test environment with workspace boundary
  // When: Multiple creation attempts with identical version identifiers
  // Then: Consistent workspace state and path resolution
  // Validation: No side effects from repeated operations
  ...

// Test pattern: Transaction rollback integrity
method test_workspaceRollback_transactionIntegrity(): TestResult is
  // Given: Provisioned workspace with staged content
  // When: Rollback operation triggered by failure scenario
  // Then: Complete workspace removal with no orphaned artifacts
  // Validation: File system state restoration to pre-operation conditions
  ...

// Test pattern: Concurrent operation safety
method test_workspaceOperations_concurrencySafety(): TestResult is
  // Given: Multiple concurrent workspace creation attempts
  // When: Simultaneous operations target the same version identifier
  // Then: Safe conflict resolution with consistent final state
  // Validation: No race conditions or partially created workspaces
  ...

// Test pattern: Permission boundary validation
method test_workspaceCreation_permissionBoundaries(): TestResult is
  // Given: Restricted file system permissions scenario
  // When: Workspace creation attempted in protected directories
  // Then: Graceful failure with meaningful error context
  // Validation: Security boundary respect and error propagation
  ...
```

---

## `codeFormatter.js`

This component acts as a simple, dedicated wrapper around the project's standard Biome formatter. Its purpose is to provide a consistent and testable interface for formatting files within the automated pipeline, ensuring that all code adheres to the project's defined style rules.

- **File Path**: `src/scripts/pre-process/codeFormatter.js`
- **Primary Responsibility**: To execute the project's standard Biome formatter on a target file to ensure consistent code style.
- **Dependencies**:
  - `child_process`: To execute the `biome` shell command.
  - `path`: To construct and resolve file paths.
  - `./logger`: For all console output and logging.
- **Public API / Exports**:
  - `formatCode(filePath)`: Takes the path to a file and formats it in place. Throws an error if formatting fails.

### `CodeFormatter` Core Logic (Pseudocode)

```tsx
// Code formatting boundary for applying project-wide style standards.
// Encapsulates the interaction with an external, deterministic code formatter.
// [Source: design-docs/features/version-based-analysis/version-based-analysis-architecture.md#Code-Processing-Application.CodeFormatter]
class CodeFormatter is

  // The constructor defines the component's dependencies on system-level services.
  constructor CodeFormatter(shell: ShellBoundary, logger: LoggingBoundary) is
    // Research: Verify biome CLI is installed and meets version requirements.
    // Integration: Dependency injection enables testing with a mock shell.
    ...

  // Applies formatting to a single file in-place.
  public method formatFile(target: FilePath): void is
    // Boundary: Shell command execution to an external formatter tool.
    // Validation: The target file path must be valid and writable.
    // On failure: Throws an error to halt the parent orchestration process.
    ...
```

### `CodeFormatter` Testing Guidance

We will follow the "Real Systems, Fake Fixtures" principle. The test will execute the **real** `biome` command but on a **fake** (temporary) source file that we create and destroy during the test's lifecycle.

#### Testing Boundary Strategy for CodeFormatter

**Core Testing Philosophy**: Execute real external formatter commands against controlled test fixtures to validate shell command integration and file transformation behavior without mocking critical tool interactions.

**Test Environment Architecture**:

```tsx
// Testing boundary for external code formatter integration
// Strategy: Real tool execution with isolated temporary file fixtures
// Research: External tool availability validation and version compatibility testing
class CodeFormatterTests is
  // Test fixture boundary configuration
  constructor CodeFormatterTests(fixtureManager: TestFixtureBoundary,
                                shellProvider: ShellBoundary,
                                cleanupCoordinator: TestCleanupBoundary) is
    // Research: External formatter tool installation verification strategies
    // Validation: Tool version compatibility and command availability
    // Integration: Test isolation with deterministic fixture management
    ...

  // Test fixture provisioning boundary
  method createFormattingFixture(content: CodeContent, format: FileFormat): TestFixture is
    // Pattern: Controlled unformatted content generation
    // Boundary: Temporary file creation with specific formatting violations
    // Validation: File accessibility and writability verification
    ...

  // Test fixture cleanup boundary
  method destroyFormattingFixture(fixture: TestFixture): void is
    // Pattern: Guaranteed cleanup with error isolation
    // Boundary: Safe file removal without affecting other tests
    // Error handling: Cleanup failure isolation from test results
    ...
```

#### Test Pattern Architecture for CodeFormatter

**External Tool Integration Patterns**:

```tsx
// Test pattern: Successful formatting transformation verification
method test_codeFormatting_transformationSuccess(): TestResult is
  // Given: Unformatted code fixture with known formatting violations
  // When: Formatter boundary executes external tool command
  // Then: File content transformation matches expected formatting standards
  // Validation: Content modification verification through boundary comparison
  ...

// Test pattern: External tool failure propagation
method test_codeFormatting_toolFailurePropagation(): TestResult is
  // Given: Invalid file path or inaccessible target file
  // When: Formatter attempts external tool execution
  // Then: Tool failure propagated as meaningful error context
  // Validation: Error boundary behavior and orchestration halt verification
  ...

// Test pattern: Tool dependency validation
method test_codeFormatting_toolDependencyValidation(): TestResult is
  // Given: Missing or incompatible external formatter installation
  // When: Formatter initialization or execution attempted
  // Then: Clear dependency failure with actionable error information
  // Validation: Environment prerequisite checking and error reporting
  ...

// Test pattern: Shell command integration verification
method test_codeFormatting_shellIntegrationVerification(): TestResult is
  // Given: Valid formatter configuration and accessible target file
  // When: Shell boundary executes formatting command with parameters
  // Then: Command construction and execution follows expected patterns
  // Validation: Shell integration behavior and command parameter handling
  ...

// Test pattern: File modification boundary verification
method test_codeFormatting_fileModificationBoundary(): TestResult is
  // Given: Writable file with unformatted content
  // When: Formatting operation completes successfully
  // Then: File system state reflects in-place modification
  // Validation: File system boundary interaction and state verification
  ...
```
