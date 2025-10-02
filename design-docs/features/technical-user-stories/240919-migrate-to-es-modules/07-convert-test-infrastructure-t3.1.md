# Task 7: Convert Test Infrastructure - Technical Task 3.1

## Core Problem

- **Current State**: Test helper utilities `testUtils.js` and `mockBinary.js` use CommonJS syntax
- **Required State**: Test utilities must use ES Modules syntax to work with converted source modules
- **Integration Requirement**: Test files must be able to import and test the converted ESM source modules

## Implementation Requirements

**Files**:
- `test/helpers/testUtils.js` (modify)
- `test/helpers/mockBinary.js` (modify)

**Transformation Pattern**:

```javascript
// Current pattern:
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
module.exports = { createMockBinary, cleanupTest };

// Target pattern:
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
export { createMockBinary, cleanupTest };
```

**Critical Rules**:
- Use default imports for Node.js built-ins
- Use named imports for Node.js utilities (`{ spawn }` from 'child_process')
- Replace `module.exports` with `export` declarations
- Maintain test utility API compatibility

## Key Implementation Elements

1. **Node.js Built-ins**: Convert Node.js module imports to ESM syntax
2. **Export Transformation**: Replace `module.exports` with `export` declarations
3. **Test Compatibility**: Ensure test utilities work with ESM test environment

## Expected Outcome

```javascript
// Before (testUtils.js example):
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
module.exports = { createMockBinary, cleanupTest };

// After (testUtils.js example):
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
export { createMockBinary, cleanupTest };
```

## Immediate Validation

```bash
node --check test/helpers/testUtils.js
node --check test/helpers/mockBinary.js
# Expected result: No syntax errors in ESM mode for both files
```

## Integration Note

Test infrastructure conversion enables writing ESM-compatible tests for the converted application modules. This can be done in parallel with application script conversion once the foundation is in place.
