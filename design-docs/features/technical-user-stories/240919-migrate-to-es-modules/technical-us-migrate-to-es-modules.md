# Technical Story: Migrate Project to ES Modules

**Critical LLM Initialization Instructions**: When first reading this file, you MUST IMMEDIATELY run citation manager to extract base paths: `npm run citation:base-paths <this-file-path> -- --format json`. Read ALL discovered base path files to gather complete architectural context before proceeding.

## Status
Ready for Implementation

## Story
As a Technical Leader,
I want to migrate the entire codebase from CommonJS (require/module.exports) to the modern ES Modules (import/export) standard,
so that we establish a consistent, forward-looking foundation, simplify tooling configuration, and align with the broader JavaScript ecosystem before new feature development begins.

## Acceptance Criteria
1. WHEN the migration is complete, THEN the root `package.json` SHALL be configured with `"type": "module"`. ^AC1
2. WHEN the migration is complete, THEN all JavaScript files within the `src/` directory and its subdirectories SHALL use ESM syntax (`import`/`export`). ^AC2
3. WHEN the migration is complete, THEN all JavaScript files within the `test/` directory and its subdirectories SHALL use ESM syntax (`import`/`export`). ^AC3
4. WHEN the migration is complete, THEN the `interactive-analysis.js` script SHALL execute without errors and the full test suite (`npm test`) SHALL pass, indicating no regressions were introduced. ^AC4
5. WHEN the migration is complete, THEN the architecture documentation SHALL be updated to reflect this as the new standard. ^AC5

## Tasks / Subtasks
- [x] **1. Configure Project and Tooling for ES Modules**
  - [x] 1.1 Update `package.json` to enable ESM support.
    - **Objective**: Add the `"type": "module"` property to the root `package.json` file. This is the foundational step that instructs Node.js to treat all `.js` files as ES Modules.
    - **Input**: Current `package.json` file configuration
    - **Output**: `package.json` with `"type": "module"` property, enabling ESM support project-wide
    - **File to Modify**: `package.json`
    - **Test**: Verify `node --check src/scripts/logger.js` reports ES module syntax errors (confirming ESM mode is active)
    - *Requirements*: [[#^AC1|AC1]]
    - *Implement Details*: [01-enable-esm-foundation-t1.1](01-enable-esm-foundation-t1.1.md)
- [x] **2. Refactor Application Source Code (`src`)**
  - [x] 2.1 Refactor the core `logger.js` utility to use ESM syntax.
    - **Objective**: Convert the module's export from `module.exports = { ... }` to `export { Logger, createLogger }`.
    - **Input**: Current CommonJS `logger.js` with `require()` and `module.exports`
    - **Output**: ESM-compatible `logger.js` with `import` statements and `export` declarations
    - **File to Modify**: `src/scripts/logger.js`
    - **Test**: `node --check src/scripts/logger.js` should pass without syntax errors
    - *Requirements*: [[#^AC2|AC2]]
    - *Implement Details*: [02-convert-core-logger-t2.1](02-convert-core-logger-t2.1.md)
  - [x] 2.2 Refactor the `gemini-cli.js` adapter to use ESM syntax.
    - **Objective**: Convert all `require()` statements to `import` statements. Remember to add the `.js` extension to relative imports (e.g., `import { createLogger } from './logger.js';`). Update exports to use the `export` keyword.
    - **Input**: Current CommonJS `gemini-cli.js` and converted ESM `logger.js` from task 2.1
    - **Output**: ESM-compatible `gemini-cli.js` that imports from `logger.js` using proper ESM syntax
    - **File to Modify**: `src/scripts/gemini-cli.js`
    - **Test**: `node --check src/scripts/gemini-cli.js` should pass without syntax errors
    - *Requirements*: [[#^AC2|AC2]]
    - *Implement Details*: [03-convert-gemini-adapter-t2.2](03-convert-gemini-adapter-t2.2.md)
  - [x] 2.3 Refactor the remaining pipeline and utility scripts to use ESM syntax.
    - **Objective**: Systematically convert all remaining `.js` files in `src/scripts/` from CommonJS to ES Modules, ensuring all `require` calls are replaced with `import` and `module.exports` is replaced with `export`.
    - **Input**: All remaining CommonJS files in `src/scripts/` and converted ESM modules from tasks 2.1 and 2.2
    - **Output**: Complete ESM migration of all source files with proper import/export syntax and `.js` extensions
    - **Files to Modify**: `ask-enhanced.js`, `config-learn-chunks.js`, `fix-malformed-json.js`, `generate-unified-json.js`, `improve-merged-chunks.js`, `interactive-analysis.js`, `merge-again.js`, `split.js`
    - **Test**: `node --check src/scripts/*.js` should pass for all files without syntax errors
    - *Requirements*: [[#^AC2|AC2]]
    - *Implement Details*: [04-convert-independent-pipeline-scripts-t2.3a](04-convert-independent-pipeline-scripts-t2.3a.md), [05-convert-analysis-pipeline-scripts-t2.3b](05-convert-analysis-pipeline-scripts-t2.3b.md), [06-convert-interactive-user-scripts-t2.3c](06-convert-interactive-user-scripts-t2.3c.md)
- [x] **3. Refactor Test Infrastructure and Tests (`test`)**
  - [x] 3.1 Refactor the test helper utilities to use ESM syntax.
    - **Objective**: Convert the test utility modules (`testUtils.js`, `mockBinary.js`) from CommonJS to ES Modules to ensure a consistent environment for writing and running tests.
    - **Input**: Current CommonJS test helper files and fully converted ESM source code from Task 2
    - **Output**: ESM-compatible test utilities that can import and test the converted source modules
    - **Files to Modify**: `test/helpers/testUtils.js`, `test/helpers/mockBinary.js`
    - **Test**: `node --check test/helpers/*.js` should pass without syntax errors
    - *Requirements*: [[#^AC3|AC3]]
    - *Implement Details*: [07-convert-test-infrastructure-t3.1](07-convert-test-infrastructure-t3.1.md)
- [x] **4. Update Architecture Decision Records (ADRs)**
  - [x] 4.1 Supersede ADR-006 and create ADR-007.
    - **Objective**: Update the architecture documentation to reflect the decision to migrate. Change the status of **ADR-006** to "Superseded" and create a new **ADR-007: Migration to ES Modules** with the new decision and rationale.
    - **Input**: Current architecture document with ADR-006 and completed ESM migration from Tasks 1-3
    - **Output**: Updated architecture documentation with ADR-006 marked as "Superseded" and new ADR-007 documenting ESM adoption
    - **File to Modify**: [ADR-006: Module System Selection (CommonJS vs ES6)](<../../../version-based-analysis-architecture.md#ADR-006 Module System Selection (CommonJS vs ES6)>)
    - **Test**: Verify documentation accurately reflects completed migration status and new architectural standard
    - *Requirements*: [[#^AC5|AC5]]
    - *Implement Details*: [08-update-architecture-documentation-t4.1](08-update-architecture-documentation-t4.1.md)
- [x] **5. Validate Migration**
  - [x] 5.1 Run the interactive analysis script to ensure end-to-end functionality.
    - **Objective**: Execute the main user-facing script to confirm the application runs correctly after the module system refactor.
    - **Input**: Fully migrated ESM codebase from Tasks 1-4
    - **Output**: Successful execution of interactive analysis demonstrating functional ESM integration
    - **Command**: `node src/scripts/interactive-analysis.js`
    - **Test**: Script runs without module loading errors and presents normal interactive menu
    - *Requirements*: [[#^AC4|AC4]]
    - *Implement Details*: [09-validate-complete-migration-t5.1-5.2](09-validate-complete-migration-t5.1-5.2.md)
  - [x] 5.2 Execute the full test suite to verify no regressions.
    - **Objective**: Run all tests using Vitest to confirm that the refactoring of application and test code did not break any existing functionality.
    - **Requirements**: [[#^AC4|AC4]]
    - **Input**: Complete ESM migration including test infrastructure from Task 3.1
    - **Output**: All tests pass, confirming no functional regressions from ESM migration
    - **Command**: `npm test`
    - **Test**: Test suite completes with 0 failures and demonstrates ESM compatibility in test environment
    - *Implement Details*: [09-validate-complete-migration-t5.1-5.2](09-validate-complete-migration-t5.1-5.2.md)

## Dev Notes

### Architectural Context
This refactoring directly addresses the technical debt identified in **ADR-006** [cite: design-docs/features/version-based-analysis/version-based-analysis-architecture.md]. By performing this migration before significant new code is written, we minimize the cost and complexity of the change, adhering to the **Simplicity First** design principle [cite: design-docs/Design Principles.md].

### Refactoring Pattern Example
The primary pattern for this refactoring will be:
**Before (CommonJS):**

```js
// logger.js
const fs = require('fs');
// ...
module.exports = { Logger, createLogger };
// gemini-cli.js
const { createLogger } = require('./logger');
```

**After (ESM):**

```js
// logger.js
import fs from 'fs';
// ...
export { Logger, createLogger };
// gemini-cli.js
import { createLogger } from './logger.js'; // Note the required file extension
```

### Change Log

|   |   |   |   |
|---|---|---|---|
|**Date**|**Version**|**Description**|**Author**|
|2025-09-19|1.0|Initial story creation for ESM migration.|Application Tech Lead|

## Related Links
- [micro-implement-details-template](../../../../../../agentic-workflows/templates/task-implement-details-template.md): Template for creating self-contained task instructions that enable dev agents to execute implementation tasks without external documentation
