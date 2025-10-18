# Quick Command Reference

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run citation manager tests
npm run test:citation
```

## Linting and Formatting

```bash
# Check all files with Biome
npx biome check .

# Auto-fix Biome issues
npx biome check --write .

# Check markdown files
markdownlint "**/*.md"

# Fix markdown issues
markdownlint "**/*.md" --fix
```

## Citation Manager

```bash
# Validate citations in a file
npm run citation:validate <file-path>

# Validate with JSON output
npm run citation:validate <file-path> -- --format json

# Validate specific line range
npm run citation:validate <file-path> -- --lines 150-160

# Validate with folder scope
npm run citation:validate <file-path> -- --scope /path/to/docs

# Auto-fix citation issues
npm run citation:fix <file-path>

# Parse and display AST
npm run citation:ast <file-path>

# Get base paths from citations
npm run citation:base-paths <file-path>

# Get base paths as JSON
npm run citation:base-paths <file-path> -- --format json
```

## Mock Tool

```bash
# Run mock tool with default argument
npm run mock:run

# Run with custom argument
npm run mock:run -- <argument>
```

## Dependency Management

```bash
# Install all workspace dependencies
npm install

# Install dependency for specific workspace package
npm install <package-name> -w @cc-workflows/tool-name

# List all workspace packages
npm list --workspaces
```
