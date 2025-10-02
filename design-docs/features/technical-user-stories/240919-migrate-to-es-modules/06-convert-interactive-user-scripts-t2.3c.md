# Task 6: Convert Interactive User Scripts - Technical Task 2.3c

## Core Problem

- **Current State**: `ask-enhanced.js` and `interactive-analysis.js` use CommonJS syntax with complex dependencies
- **Required State**: Both files must use ES Modules syntax with all dependencies converted to ESM imports
- **Integration Requirement**: These are the most complex user-facing scripts requiring all previous conversions to be complete

## Implementation Requirements

**Files**:
- `src/scripts/ask-enhanced.js` (modify)
- `src/scripts/interactive-analysis.js` (modify)

**Transformation Pattern**:

```javascript
// Current pattern:
const fs = require('fs');
const readline = require('readline');
const { createLogger } = require('./logger');
const { GeminiCLI } = require('./gemini-cli');
const marked = require('marked');
const { markedTerminal } = require('marked-terminal');

// Target pattern:
import fs from 'fs';
import readline from 'readline';
import { createLogger } from './logger.js';
import { GeminiCLI } from './gemini-cli.js';
import { marked } from 'marked';
import { markedTerminal } from 'marked-terminal';
```

**Critical Rules**:
- Add `.js` extensions to all relative imports
- Use default imports for Node.js built-ins
- Use named imports for external packages that support ESM
- Handle any dynamic imports or conditional requires

## Key Implementation Elements

1. **Complex Dependencies**: Convert all utility imports with proper `.js` extensions
2. **External Packages**: Convert marked and other external packages to ESM syntax
3. **Interactive Features**: Ensure readline and other interactive features work with ESM

## Expected Outcome

```javascript
// Before (ask-enhanced.js example):
const fs = require('fs');
const readline = require('readline');
const { createLogger } = require('./logger');
const { GeminiCLI } = require('./gemini-cli');
const marked = require('marked');

// After (ask-enhanced.js example):
import fs from 'fs';
import readline from 'readline';
import { createLogger } from './logger.js';
import { GeminiCLI } from './gemini-cli.js';
import { marked } from 'marked';
```

## Immediate Validation

```bash
node --check src/scripts/ask-enhanced.js
node --check src/scripts/interactive-analysis.js
# Expected result: No syntax errors in ESM mode for both files
```

## Integration Note

These are the primary user-facing scripts that depend on all other converted modules. They must be converted last in the application code sequence to ensure all dependencies are available in ESM format.
