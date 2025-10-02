# Task 5: Convert Analysis Pipeline Scripts - Technical Task 2.3b

## Core Problem

- **Current State**: `config-learn-chunks.js`, `merge-again.js`, and `improve-merged-chunks.js` use CommonJS syntax with dependencies on utilities
- **Required State**: All three files must use ES Modules syntax and import from converted utility modules
- **Integration Requirement**: These scripts depend on logger and gemini-cli utilities, requiring careful import management

## Implementation Requirements

**Files**:
- `src/scripts/config-learn-chunks.js` (modify)
- `src/scripts/merge-again.js` (modify)
- `src/scripts/improve-merged-chunks.js` (modify)

**Transformation Pattern**:

```javascript
// Current pattern:
const fs = require('fs');
const path = require('path');
const { createLogger } = require('./logger');
const { GeminiCLI } = require('./gemini-cli');
const cliProgress = require('cli-progress');

// Target pattern:
import fs from 'fs';
import path from 'path';
import { createLogger } from './logger.js';
import { GeminiCLI } from './gemini-cli.js';
import cliProgress from 'cli-progress';
```

**Critical Rules**:
- Add `.js` extensions to all relative imports
- Use default imports for external packages (`cliProgress`)
- Use named imports for local utility modules
- Maintain existing function export patterns

## Key Implementation Elements

1. **Utility Dependencies**: Import from converted logger and gemini-cli modules with `.js` extensions
2. **External Packages**: Convert external package imports to appropriate ESM syntax
3. **Cross-file Dependencies**: Handle any imports between these pipeline scripts

## Expected Outcome

```javascript
// Before (config-learn-chunks.js example):
const fs = require('fs');
const { createLogger } = require('./logger');
const { GeminiCLI } = require('./gemini-cli');
const cliProgress = require('cli-progress');

// After (config-learn-chunks.js example):
import fs from 'fs';
import { createLogger } from './logger.js';
import { GeminiCLI } from './gemini-cli.js';
import cliProgress from 'cli-progress';
```

## Immediate Validation

```bash
node --check src/scripts/config-learn-chunks.js
node --check src/scripts/merge-again.js
node --check src/scripts/improve-merged-chunks.js
# Expected result: No syntax errors in ESM mode for all three files
```

## Integration Note

These scripts form the core analysis pipeline and require Tasks 2-3 (logger and gemini-cli conversion) to be completed first. They enable the main AI-powered analysis functionality of the system.
