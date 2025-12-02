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
citation-manager validate <file-path>

# Validate with JSON output
citation-manager validate <file-path> --format json

# Validate specific line range
citation-manager validate <file-path> --lines 150-160

# Validate with folder scope and auto-fix
citation-manager validate <file-path> --fix --scope /path/to/docs

# Extract content from all citations in a file
citation-manager extract links <file-path>

# Extract with full file content (not just sections)
citation-manager extract links <file-path> --full-files

# Extract specific header section from a file
citation-manager extract header <file-path> "Header Name"

# Extract entire file content
citation-manager extract file <file-path>

# Display AST for debugging
citation-manager ast <file-path>
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
