# Task 2: Convert Core Logger Utility - Technical Task 2.1

## Core Problem

- **Current State**: `logger.js` uses CommonJS `require()`/`module.exports` syntax
- **Required State**: File must use ES Modules `import`/`export` syntax per package.json `"type": "module"`
- **Integration Requirement**: Must maintain existing API for dependent files importing logger functionality

## Implementation Requirements

**Files**:
- `src/scripts/logger.js` (modify)

**Transformation Pattern**:

```javascript
// Current pattern:
const fs = require('fs');
const path = require('path');
module.exports = { Logger, createLogger };

// Target pattern:
import fs from 'fs';
import path from 'path';
export { Logger, createLogger };
```

**Critical Rules**:
- Use default imports for Node.js built-ins (`import fs from 'fs'`)
- Replace `module.exports = { ... }` with `export { ... }`
- Maintain existing export structure for API compatibility

## Key Implementation Elements

1. **Import Transformation**: Replace all `require()` statements with `import` statements
2. **Export Transformation**: Replace `module.exports` with `export` declarations
3. **Node.js Built-ins**: Use default imports for Node.js modules (`fs`, `path`, etc.)

## Expected Outcome

```javascript
// Before:
const fs = require('fs');
const path = require('path');
// ... logger implementation
module.exports = { Logger, createLogger };

// After:
import fs from 'fs';
import path from 'path';
// ... logger implementation (unchanged)
export { Logger, createLogger };
```

## Immediate Validation

```bash
node --check src/scripts/logger.js
# Expected result: No syntax errors in ESM mode
```

## Integration Note

This converts the core logging utility that most other scripts depend on. All dependent files will need to import using `import { createLogger } from './logger.js'` with required `.js` extension in subsequent tasks.
