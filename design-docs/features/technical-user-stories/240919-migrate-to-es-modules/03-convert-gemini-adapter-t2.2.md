# Task 3: Convert Gemini CLI Adapter - Technical Task 2.2

## Core Problem

- **Current State**: `gemini-cli.js` uses CommonJS `require()`/`module.exports` syntax with dependencies on logger
- **Required State**: File must use ES Modules `import`/`export` syntax and import from converted logger module
- **Integration Requirement**: Must maintain existing API while importing from ESM logger with `.js` extension

## Implementation Requirements

**Files**:
- `src/scripts/gemini-cli.js` (modify)

**Transformation Pattern**:

```javascript
// Current pattern:
const { createLogger } = require('./logger');
const fs = require('fs');
const { promisify } = require('util');
module.exports = { GeminiCLI };

// Target pattern:
import { createLogger } from './logger.js';
import fs from 'fs';
import { promisify } from 'util';
export { GeminiCLI };
```

**Critical Rules**:
- Add `.js` extensions to relative imports (`./logger.js`)
- Use default imports for Node.js built-ins
- Use named imports for Node.js utilities (`{ promisify }` from 'util')

## Key Implementation Elements

1. **Relative Import Transformation**: Replace `require('./logger')` with `import { createLogger } from './logger.js'`
2. **Node.js Built-ins**: Convert to appropriate import syntax for each module type
3. **Export Transformation**: Replace `module.exports` with `export` declarations

## Expected Outcome

```javascript
// Before:
const { createLogger } = require('./logger');
const fs = require('fs');
const { promisify } = require('util');
// ... implementation
module.exports = { GeminiCLI };

// After:
import { createLogger } from './logger.js';
import fs from 'fs';
import { promisify } from 'util';
// ... implementation (unchanged)
export { GeminiCLI };
```

## Immediate Validation

```bash
node --check src/scripts/gemini-cli.js
# Expected result: No syntax errors in ESM mode
```

## Integration Note

This converts the core AI adapter utility that analysis and Q&A scripts depend on. Requires Task 2 (logger conversion) to be completed first. Subsequent tasks will import using `import { GeminiCLI } from './gemini-cli.js'`.
