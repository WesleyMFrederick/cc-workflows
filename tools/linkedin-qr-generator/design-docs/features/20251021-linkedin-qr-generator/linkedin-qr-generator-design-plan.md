# Branded QR Code Generator - Design Plan

**Date**: 2025-10-21
**Status**: Approved
**Author**: Claude Code with Wesley Frederick

## Purpose

Create a command-line tool that generates high-quality QR codes for any URL with an embedded custom logo. The tool provides a simple, scriptable way to create professional-looking branded QR codes optimized for screen display and digital sharing.

## User Value Statement

Eliminates the manual effort of creating branded QR codes by providing a one-command solution that produces professional, scannable QR codes with custom logo embedding and consistent quality. Works with any URL and any PNG logo.

## Requirements Summary

### Functional Requirements
- **FR1**: Accept any URL as command-line argument
- **FR2**: Accept custom PNG logo path as command-line argument (optional - uses default if not provided)
- **FR3**: Validate URL format is valid
- **FR4**: Validate logo file exists and is valid PNG format
- **FR5**: Generate QR code with high error correction to support logo embedding
- **FR6**: Embed custom logo in center of QR code with proper contrast
- **FR7**: Output PNG file to dedicated output directory
- **FR8**: Generate timestamped filenames to prevent overwrites

### Non-Functional Requirements
- **NFR1**: Output resolution optimized for screen display (500x500px at 72-96 DPI)
- **NFR2**: QR codes must be scannable by standard phone cameras
- **NFR3**: Tool must fail fast with clear error messages
- **NFR4**: Follow workspace coding standards and file organization patterns

### Out of Scope (MVP)
- SVG output format
- Batch processing multiple URLs
- Print-quality resolution (300 DPI)
- Interactive prompts
- Configurable output size
- Logo size customization
- QR code color customization

## Architecture Overview

### Technology Stack
- **QR Generation**: `qrcode` npm package (lightweight, reliable)
- **Image Composition**: `sharp` npm package (high-performance, native)
- **Runtime**: Node.js (>= 18.0.0)

### Rationale
The `qrcode + sharp` combination provides the best balance of simplicity, performance, and image quality for the MVP. Sharp's high-performance native bindings deliver excellent PNG quality, while qrcode provides straightforward QR generation with proper error correction support.

## File Structure

```plaintext
tools/linkedin-qr-generator/
├── src/
│   ├── qr-generator.js                # CLI entry point (orchestrator)
│   ├── generateQrCode.js              # Core: Generate base QR code
│   ├── embedLogo.js                   # Core: Overlay custom logo
│   ├── validateUrl.js                 # Validation: URL format validator
│   ├── validateLogo.js                # Validation: Logo file validator
│   ├── ensureOutputDir.js             # Utility: Create output directory
│   └── types.js                       # Data contracts/types
├── assets/
│   └── linkedin-logo.png              # Default logo (LinkedIn logo)
├── output/                            # Generated QR codes (gitignored)
├── test/
│   ├── qr-generator.test.js           # Integration tests
│   └── fixtures/
│       ├── test-logo.png              # Test logo fixture
│       └── invalid-logo.txt           # Invalid file for error testing
├── design-docs/
│   └── features/
│       └── 20251021-linkedin-qr-generator/
│           └── linkedin-qr-generator-plan.md  # This document
├── package.json
└── README.md
```

### Component Responsibilities

Following **Action-Based File Organization** principles:

| File | Primary Function | Input | Output |
|------|-----------------|-------|--------|
| `qr-generator.js` | CLI orchestrator | Command-line args (URL, optional logo path) | Exit code, file path |
| `validateUrl.js` | URL validation | String URL | Boolean/Error |
| `validateLogo.js` | Logo file validation | File path | Boolean/Error |
| `generateQrCode.js` | QR code generation | Validated URL | Buffer (PNG) |
| `embedLogo.js` | Logo composition | QR Buffer + Logo path | Buffer (PNG) |
| `ensureOutputDir.js` | Directory management | None | Directory path |

## Data Flow Pipeline

The tool implements a **linear transformation pipeline**:

```plaintext
Command Line Args (URL, optional logo path)
    ↓
[Validate URL] → validates URL format
    ↓
[Validate Logo] → validates logo file exists and is PNG (uses default if not provided)
    ↓
[Generate QR Code] → creates base QR with high error correction
    ↓
[Embed Logo] → composites custom logo onto QR center
    ↓
[Ensure Output Dir] → creates output/ if needed
    ↓
[Save File] → writes PNG with timestamp
    ↓
Output: qr-{timestamp}.png
```

### Data Contracts

```javascript
// Input
url: string                    // Any valid URL: "https://example.com/page"
logoPath?: string              // Optional custom logo path: "./my-logo.png"

// Pipeline stages
validateUrl(url) → { valid: boolean, error?: string }
validateLogo(logoPath) → { valid: boolean, error?: string }
generateQrCode(url) → Buffer   // PNG binary data
embedLogo(qrBuffer, logoPath) → Buffer  // Composite PNG
ensureOutputDir() → string     // "./output"
saveFile(buffer, filename) → string  // Full path to saved file
```

## Error Handling Strategy

Following **Fail Fast** and **Safety-First Design Patterns**:

### URL Validation Errors
- Invalid URL format → "Error: Invalid URL format. Expected valid URL (e.g., <https://example.com>)"
- Malformed URL → "Error: URL must include protocol (http:// or https://)"
- Examples:
  - ✅ `https://linkedin.com/in/wesleyfrederick/`
  - ✅ `https://www.example.com/page`
  - ✅ `https://github.com/user/repo`
  - ❌ `not-a-url` → "Error: Invalid URL format"
  - ❌ `example.com` → "Error: URL must include protocol"

### Logo Validation Errors
- Missing logo file → "Error: Logo file not found at {path}"
- Invalid logo format → "Error: Logo file must be PNG format. Received: {extension}"
- Default logo missing → "Error: Default logo not found at assets/linkedin-logo.png"

### File System Errors
- Write permission denied → "Error: Cannot write to output directory. Check permissions."
- Disk space issues → Propagate OS error with context

### QR Generation Errors
- URL too long → "Error: URL exceeds QR code capacity (max ~2953 characters)"
- Invalid characters → "Error: URL contains invalid characters for QR encoding"

### Image Composition Errors
- Logo load failure → "Error: Failed to load logo. File may be corrupted or not a valid PNG."
- Sharp processing error → "Error: Image composition failed: {details}"

All errors include:
- Clear description of what failed
- Actionable suggestion for resolution
- Exit with non-zero status code

## Testing Strategy

Following workspace **MVP-focused testing** with **0.3:1 to 0.5:1 test-to-code ratio**:

### Integration Tests (Primary)

Using real file system operations and actual libraries (no mocks):

```javascript
describe('Branded QR Generator Integration Tests', () => {
  it('should generate QR code with default logo for valid URL', () => {
    // Given: Valid URL
    const url = 'https://www.linkedin.com/in/wesleyfrederick/';

    // When: Tool executes with URL argument only (uses default logo)
    const result = execSync(`node src/qr-generator.js ${url}`);

    // Then: PNG file created in output/ with QR code and default logo
    expect(outputFileExists()).toBe(true);
    expect(isValidPNG(outputFile)).toBe(true);
    expect(result).toContain('Successfully created');
  });

  it('should generate QR code with custom logo when logo path provided', () => {
    // Given: Valid URL and custom logo path
    const url = 'https://example.com/page';
    const logoPath = './test/fixtures/test-logo.png';

    // When: Tool executes with both URL and logo arguments
    const result = execSync(`node src/qr-generator.js ${url} ${logoPath}`);

    // Then: QR code generated with custom logo
    expect(outputFileExists()).toBe(true);
    expect(result).toContain('Successfully created');
  });

  it('should reject malformed URLs with clear error message', () => {
    // Given: Invalid URL format
    const url = 'not-a-url';

    // When: Tool executes
    // Then: Validation fails immediately
    expect(error).toContain('Invalid URL format');
  });

  it('should reject invalid logo file with clear error message', () => {
    // Given: Valid URL but invalid logo file
    const url = 'https://example.com';
    const logoPath = './test/fixtures/invalid-logo.txt';

    // When: Tool executes
    // Then: Logo validation fails
    expect(error).toContain('must be PNG format');
  });

  it('should create output directory if it does not exist', () => {
    // Given: No output/ directory exists (deleted in beforeEach)
    const url = 'https://example.com';

    // When: Tool executes
    // Then: Directory created and file saved
    expect(directoryExists('./output')).toBe(true);
  });
});
```

### Manual Verification Checklist
- [ ] Scan QR code with phone camera - navigates to correct URL
- [ ] Visual inspection - logo centered and clearly visible
- [ ] File size reasonable for screen use (< 100KB)
- [ ] Works with various URL types (LinkedIn, websites, GitHub, etc.)
- [ ] Works with custom logos and default logo

### Out of Scope (MVP)
- Unit tests for individual functions
- Performance benchmarking
- Cross-platform compatibility testing
- Load testing with many URLs

## CLI Interface & User Experience

### Command Execution

```bash
# Generate QR code with default logo (LinkedIn logo)
npm run qr-gen -- https://www.linkedin.com/in/wesleyfrederick/

# Generate QR code with custom logo
npm run qr-gen -- https://example.com ./path/to/my-logo.png

# Generate QR code for any URL
npm run qr-gen -- https://github.com/user/repo
```

### Command Arguments

| Position | Argument | Required | Description | Example |
|----------|----------|----------|-------------|---------|
| 1 | URL | Yes | Any valid URL to encode in QR code | `https://example.com` |
| 2 | Logo Path | No | Path to custom PNG logo (defaults to LinkedIn logo if not provided) | `./my-logo.png` |

### Expected Output

**With default logo:**

```plaintext
✓ Validating URL...
✓ Validating logo...
✓ Generating QR code...
✓ Embedding logo...
✓ Saving to output/qr-20251021-143052.png

Successfully created branded QR code!
Scan with your phone camera to test: output/qr-20251021-143052.png
```

**With custom logo:**

```plaintext
✓ Validating URL...
✓ Validating custom logo...
✓ Generating QR code...
✓ Embedding logo...
✓ Saving to output/qr-20251021-143052.png

Successfully created branded QR code!
Scan with your phone camera to test: output/qr-20251021-143052.png
```

### Package Configuration

**Root `package.json`** (workspace level):

```json
{
  "scripts": {
    "qr-gen": "node tools/linkedin-qr-generator/src/qr-generator.js"
  }
}
```

**Tool `package.json`**:

```json
{
  "name": "@cc-workflows/branded-qr-generator",
  "version": "1.0.0",
  "type": "module",
  "description": "Generate branded QR codes with custom logo embedding for any URL",
  "main": "src/qr-generator.js",
  "dependencies": {
    "qrcode": "^1.5.3",
    "sharp": "^0.33.0"
  },
  "devDependencies": {
    "vitest": "*"
  }
}
```

## Technical Specifications

| Specification | Value | Rationale |
|---------------|-------|-----------|
| Image Size | 500x500px | Optimized for screen display (72-96 DPI) |
| QR Error Correction | High (30% recovery) | Supports logo embedding while maintaining scannability |
| Logo Size | ~100px (20% of QR) | Balances visibility with scan reliability |
| Output Format | PNG | Universal compatibility, transparency support |
| Filename Pattern | `qr-{timestamp}.png` | Prevents overwrites, enables multiple outputs |
| Output Location | `./output/` | Keeps workspace clean, organizes generated files |
| Default Logo | LinkedIn logo | Provides branded default when no custom logo specified |
| Supported Logo Formats | PNG only | Simplifies MVP, ensures transparency support |

### QR Code Parameters

```javascript
{
  errorCorrectionLevel: 'H',  // 30% recovery - supports logo
  type: 'png',
  width: 500,
  margin: 2
}
```

### Logo Composition

```javascript
{
  logoSize: 100,              // 20% of QR code
  logoPosition: 'center',
  backgroundCircle: {
    color: 'white',
    radius: 60               // Padding around logo for contrast
  }
}
```

## Implementation Phases

### Phase 1: Core Pipeline
1. Set up tool package structure
2. Implement URL validation (generic, not LinkedIn-specific)
3. Implement logo validation (PNG format check, file existence)
4. Implement QR code generation
5. Implement logo embedding with default fallback
6. Implement file output

### Phase 2: Testing & Polish
1. Write integration tests (default logo and custom logo scenarios)
2. Add error handling for URL and logo validation
3. Manual QR code scanning verification with various URLs
4. Documentation (README with usage examples)

### Phase 3: Integration
1. Add npm script to root package.json
2. Update workspace documentation
3. Commit and merge

## Success Criteria

- [ ] Tool generates scannable QR codes with embedded logo
- [ ] QR codes navigate to correct URL when scanned (any valid URL)
- [ ] Tool accepts any valid URL (not restricted to LinkedIn)
- [ ] Tool accepts custom PNG logos via command-line argument
- [ ] Tool uses default LinkedIn logo when no custom logo provided
- [ ] Clear error messages for invalid URL formats
- [ ] Clear error messages for invalid logo files (missing or non-PNG)
- [ ] Integration tests pass with > 0.3:1 test-to-code ratio
- [ ] Tests cover both default logo and custom logo scenarios
- [ ] Follows workspace coding standards and patterns
- [ ] Documentation complete (README with usage examples for both scenarios)

## Alignment with Workspace Principles

| Principle | Implementation |
|-----------|----------------|
| **Action-Based File Organization** | Files named by transformation: `generateQrCode.js`, `embedLogo.js` |
| **Modular Design** | Each component has single responsibility with clear interfaces |
| **MVP-First** | Focused scope: PNG only, CLI args only, screen resolution only |
| **Fail Fast** | Multi-layer validation with immediate error reporting |
| **Real Systems, Fake Fixtures** | Tests use actual qrcode/sharp libraries, real file system |
| **Simplicity First** | Linear pipeline, minimal dependencies, straightforward CLI |

---

**This design is ready for implementation.**
