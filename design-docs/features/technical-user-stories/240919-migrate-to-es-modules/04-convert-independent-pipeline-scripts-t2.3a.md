# Task 4: Convert Independent Pipeline Scripts - Technical Task 2.3a

## Core Problem

- **Current State**: `split.js`, `generate-unified-json.js`, and `fix-malformed-json.js` use CommonJS syntax
- **Required State**: All three files must use ES Modules syntax with proper Node.js built-in imports
- **Integration Requirement**: These scripts have minimal cross-dependencies and can be converted in parallel

## Implementation Requirements

**Files**:
- `src/scripts/split.js` (modify)
- `src/scripts/generate-unified-json.js` (modify)
- `src/scripts/fix-malformed-json.js` (modify)

**Transformation Pattern**:

```javascript
// Current pattern:
const fs = require('fs');
const path = require('path');
const acorn = require('acorn');
const { createLogger } = require('./logger');

// Target pattern:
import fs from 'fs';
import path from 'path';
import * as acorn from 'acorn';
import { createLogger } from './logger.js';
```

**Critical Rules**:
- Add `.js` extensions to relative imports
- Use default imports for Node.js built-ins (`fs`, `path`)
- Use namespace imports for external packages (`import * as acorn from 'acorn'`)
- Use named imports for local modules (`import { createLogger } from './logger.js'`)

## Key Implementation Elements

1. **Node.js Built-ins**: Convert `require('fs')` to `import fs from 'fs'`
2. **External Packages**: Convert `require('acorn')` to `import * as acorn from 'acorn'`
3. **Local Dependencies**: Convert `require('./logger')` to `import { createLogger } from './logger.js'`

## Expected Outcome

```javascript
// Before (split.js example):
const fs = require('fs');
const path = require('path');
const acorn = require('acorn');
const { createLogger } = require('./logger');

// After (split.js example):
import fs from 'fs';
import path from 'path';
import * as acorn from 'acorn';
import { createLogger } from './logger.js';
```

## Immediate Validation

```bash
node --check src/scripts/split.js
node --check src/scripts/generate-unified-json.js
node --check src/scripts/fix-malformed-json.js
# Expected result: No syntax errors in ESM mode for all three files
```

## Integration Note

These scripts are largely independent and can be converted in parallel after the logger utility is available. They form the foundation for more complex pipeline scripts that depend on them.
