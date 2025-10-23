# CC Workflows

A monorepo framework for refined, repeatable, and robust development workflows. This toolkit centralizes development practices, reduces manual effort, and provides shared infrastructure for building CLI tools.

## Why CC Workflows?

This project eliminates repetitive tasks and maintains consistency across development projects. It provides:

- **Shared infrastructure** for testing, linting, and building
- **Reusable patterns** for scaffolding new tools
- **Quality automation** that catches errors before they reach production
- **Centralized documentation** as a single source of truth

## Tools

### [Citation Manager](./tools/citation-manager/README.md)

Validates and manages markdown citations in documentation projects. The tool detects broken links, validates anchor references, and auto-fixes common citation errors.

**Key features:**
- Three-tier validation (errors, warnings, informational)
- Smart path resolution with folder scope
- Auto-fix with backup creation
- Support for Obsidian-style wiki links
- Header anchor validation
- JSON output for CI/CD integration

**Quick usage:**

```bash
# Validate citations in a file
npm run citation:validate path/to/file.md

# Auto-fix with scope
npm run citation:validate path/to/file.md -- --fix --scope /path/to/docs

# Generate JSON report
npm run citation:validate path/to/file.md -- --format json
```

### [LinkedIn QR Generator](./tools/linkedin-qr-generator/README.md)

Generates branded QR codes with custom logo embedding for any URL. The tool creates scannable QR codes optimized for digital sharing and screen display.

**Key features:**
- Custom logo embedding with any PNG image
- Default LinkedIn logo included
- High error correction (30% recovery)
- Screen-optimized 500x500px resolution
- Timestamped output filenames
- Automatic directory creation

**Quick usage:**

```bash
# Generate QR code with default logo
npm run qr-gen -- https://www.linkedin.com/in/yourname/

# Generate with custom logo
npm run qr-gen -- https://example.com ./path/to/logo.png
```

## Quick Start

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd cc-workflows

# Install all workspace dependencies
npm install
```

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run specific tool tests
npm run test:citation
```

### Check Code Quality

```bash
# Lint and format all files
npx biome check .

# Auto-fix issues
npx biome check --write .
```

## Project Structure

```text
cc-workflows/
├── tools/                      # CLI tools (npm workspaces)
│   ├── citation-manager/       # Markdown citation validator
│   ├── linkedin-qr-generator/  # QR code generator
│   └── mock-tool/              # Proof-of-concept tool
├── design-docs/                # Architecture and planning docs
│   ├── features/               # Feature specifications
│   ├── Architecture - Baseline.md
│   └── Project Overview.md
├── agentic-workflows/          # Multi-agent workflow patterns
├── bmad-core/                  # Business Model Architecture Design framework
├── vitest.config.js           # Shared test configuration
├── biome.json                 # Shared linting configuration
└── package.json               # Workspace root configuration
```

## Technology Stack

- **Node.js** (≥18.0.0) - Runtime environment
- **NPM Workspaces** - Monorepo dependency management
- **Vitest** - Test framework with UI and coverage
- **Biome** - Fast linting and formatting
- **Commander.js** - CLI framework
- **marked** - Markdown parsing (citation-manager)
- **qrcode** + **sharp** - QR generation and image processing (qr-generator)

## Development

### Adding a New Tool

1. Create a new directory under `tools/`
2. Initialize with `package.json` using the workspace pattern
3. Follow the action-based file organization pattern
4. Add tests using Vitest
5. Update root scripts in `package.json` for CLI access

### Testing Strategy

This project uses a lean testing approach with 0.3:1 to 0.5:1 test-to-code ratio:

- **Integration-first**: Test real workflows, not mocked components
- **Real systems**: Use actual filesystem and shell commands
- **Given-When-Then**: Structure tests with BDD-style comments
- **Fail-fast validation**: Validate inputs early and provide clear error messages

### Code Standards

- **File naming**: kebab-case for tools, camelCase for modules
- **Indentation**: Tabs (developer flexibility)
- **Quotes**: Double quotes
- **Imports**: Organized automatically by Biome
- **Test descriptions**: Natural language with spaces

## Documentation

- **[WORKSPACE-SETUP.md](./WORKSPACE-SETUP.md)** - Technical setup and patterns
- **[CLAUDE.md](./CLAUDE.md)** - Command reference
- **[design-docs/](./design-docs/)** - Architecture and planning documentation
- **Tool READMEs** - Detailed documentation for each tool

## License

See individual tool directories for licensing information.
