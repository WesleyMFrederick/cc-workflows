# Linking CC-Workflows Tools to External Projects

**Last Updated:** 2025-11-03
**Pattern:** Local Symlink Linking (npm link)
**Status:** Validated

## Overview

This guide documents how to share cc-workflows tools (like citation-manager) with external projects using `npm link`. This pattern enables local development with instant updates while keeping projects independent.

## When to Use This Pattern

**Best For:**
- External projects that need cc-workflows tools during development
- Testing tool changes across multiple projects
- Fast local development iteration

**Not For:**
- Production deployments (use private registry or public npm instead)
- CI/CD pipelines (use workspace pattern or git dependencies)
- Projects requiring stable, versioned dependencies

## Pattern: Local Symlink Linking

This implements **Pattern #2: Local symlink linking** from [Monorepo tool distribution patterns for Node-based CLI tools (2025)](/Users/wesleyfrederick/Documents/ObsidianVaultNew/0_SoftwareDevelopment/cc-workflows/design-docs/research/Monorepo tool distribution patterns for Node‑based CLI tools (2025).md#2-local-symlink-linking--npm-linkyarn-linkpnpm-link).

### How It Works

`npm link` creates two symlinks:
1. **Global symlink**: `@cc-workflows/citation-manager` → cc-workflows tool directory
2. **Local symlink**: External project's `node_modules/@cc-workflows/citation-manager` → global symlink

### Advantages

- **Fast for local development** – Changes to the tool are instantly available in the external project
- **Zero build overhead** – No publishing or registry required
- **Familiar workflow** – Standard npm tooling

### Disadvantages

- **Manual maintenance** – Must manually link and unlink packages
- **Global symlinks can accumulate** – Can lead to "link hell" across multiple projects
- **Not production-ready** – No version management or stability guarantees

## Implementation Steps

### Step 1: Create Global Symlink

Navigate to the tool directory in cc-workflows and create a global symlink:

```bash
cd /path/to/cc-workflows/tools/citation-manager
npm link
```

**What this does:**
- Creates symlink: `/opt/homebrew/lib/node_modules/@cc-workflows/citation-manager` → tool directory
- Creates bin symlink: `/opt/homebrew/bin/citation-manager` → tool's CLI entry point
- Makes the tool globally available as `citation-manager` command

**Verification:**

```bash
npm ls -g --depth=0 @cc-workflows/citation-manager
# Should show: @cc-workflows/citation-manager@1.0.0 -> ./../../../path/to/cc-workflows/tools/citation-manager

which citation-manager
# Should show: /opt/homebrew/bin/citation-manager
```

### Step 2: Link to External Project

Navigate to the external project and link the global package:

```bash
cd /path/to/external-project
npm link "@cc-workflows/citation-manager"
```

**What this does:**
- Creates symlink: `node_modules/@cc-workflows/citation-manager` → global package
- Creates bin symlink: `node_modules/.bin/citation-manager` → tool's CLI
- Makes tool available to npm scripts in the project

**Verification:**

```bash
ls -la node_modules/@cc-workflows/citation-manager
# Should show symlink pointing to global package

ls -la node_modules/.bin/citation-manager
# Should show symlink to citation-manager.js
```

### Step 3: Add npm Scripts

Add tool scripts to the external project's `package.json`:

```json
{
  "name": "external-project",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "citation:validate": "citation-manager validate",
    "citation:ast": "citation-manager ast",
    "citation:base-paths": "sh -c 'citation-manager extract links \"$1\" 2>/dev/null | jq -r \".outgoingLinksReport.processedLinks[] | select(.sourceLink.target.path.absolute) | .sourceLink.target.path.absolute\" | sort -u' --",
    "citation:extract": "citation-manager extract links",
    "citation:extract:content": "sh -c 'citation-manager extract links \"$1\" | jq \".extractedContentBlocks\"' --",
    "citation:extract:header": "sh -c 'citation-manager extract header \"$1\" \"$2\"' --",
    "citation:extract:links": "citation-manager extract links",
    "citation:fix": "citation-manager validate --fix"
  }
}
```

**Key differences from cc-workflows scripts:**
- Use `citation-manager` command instead of `node tools/citation-manager/src/citation-manager.js`
- Relies on npm's bin resolution to find the linked executable
- Identical functionality to cc-workflows workspace scripts

### Step 4: Test the Setup

Run a command to verify the link is working:

```bash
npm run citation:validate -- <file-path>
```

**Expected behavior:**
- Command runs without errors
- Tool reads from the linked source in cc-workflows
- Changes to cc-workflows tool code are immediately available

## Real-World Example: cc-workflows-site

This pattern was successfully implemented for the `cc-workflows-site` project.

**Setup:**

```bash
# Step 1: Create global link
cd /Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/cc-workflows/tools/citation-manager
npm link

# Step 2: Link to cc-workflows-site
cd /Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/cc-workflows-site
npm link "@cc-workflows/citation-manager"
```

**Result:**

```bash
# Verify symlinks
ls -la node_modules/@cc-workflows/citation-manager
# lrwxr-xr-x@ ... -> ../../../cc-workflows/tools/citation-manager

# Test command
npm run citation:validate -- design-docs/features/251103-two-column-layout/251103-two-column-layout-requirements.md
# ✅ Works!
```

## Unlinking

When you no longer need the link, remove it properly to avoid "link hell":

```bash
# In the external project
cd /path/to/external-project
npm unlink "@cc-workflows/citation-manager"

# Optionally, remove the global link
cd /path/to/cc-workflows/tools/citation-manager
npm unlink
```

**Note:** Unlinking from the external project removes the local symlink but leaves the global symlink intact. This allows other projects to still use the global link.

## Troubleshooting

### Command not found

**Symptom:** `citation-manager: command not found`

**Cause:** Global symlink not created or `PATH` not configured

**Fix:**

```bash
# Recreate global link
cd /path/to/cc-workflows/tools/citation-manager
npm link

# Verify PATH includes npm bin directory
echo $PATH | grep -o '/opt/homebrew/bin'
```

### Module not found

**Symptom:** `Error: Cannot find module '@cc-workflows/citation-manager'`

**Cause:** Local symlink not created

**Fix:**

```bash
cd /path/to/external-project
npm link "@cc-workflows/citation-manager"
```

### Changes not reflecting

**Symptom:** Tool changes in cc-workflows don't appear in external project

**Cause:** Symlinks broken or pointing to wrong location

**Fix:**

```bash
# Verify symlink chain
ls -la node_modules/@cc-workflows/citation-manager
ls -la /opt/homebrew/lib/node_modules/@cc-workflows/citation-manager

# If broken, recreate links
npm unlink "@cc-workflows/citation-manager"
cd /path/to/cc-workflows/tools/citation-manager
npm unlink && npm link
cd /path/to/external-project
npm link "@cc-workflows/citation-manager"
```

## Alternative Patterns

If `npm link` doesn't meet your needs, consider these alternatives:

### For Production Use

#### Private Registry (Verdaccio, GitHub Packages)

- Proper versioning and stability
- Caching and controlled access
- Requires infrastructure setup

See: [Monorepo tool distribution patterns](../research/Monorepo tool distribution patterns for Node‑based CLI tools (2025).md#5-private-package-registries)

### For CI/CD

#### Git Dependencies

- Install directly from repository
- Pin to specific commits or branches
- No registry required

```bash
npm install git+https://github.com/user/cc-workflows#branch
```

See: [Monorepo tool distribution patterns](../research/Monorepo tool distribution patterns for Node‑based CLI tools (2025).md#3-git-based-installation-monorepo-packages-via-git)

### For Monorepo Integration

#### Move External Project into Workspace

- Add to cc-workflows `workspaces` array
- Use `workspace:` protocol for dependencies
- Best for tightly coupled projects

See: [cc-workflows WORKSPACE-SETUP.md](../../WORKSPACE-SETUP.md)

## References

- **Research:** [Monorepo tool distribution patterns for Node-based CLI tools (2025)](../research/Monorepo tool distribution patterns for Node‑based CLI tools (2025).md)
- **Workspace Setup:** [cc-workflows WORKSPACE-SETUP.md](../../WORKSPACE-SETUP.md)
- **Citation Manager:** [tools/citation-manager](../../tools/citation-manager/)
- **npm link documentation:** <https://docs.npmjs.com/cli/v8/commands/npm-link>

## See Also

- **Local Development:** Fastest iteration for tool development
- **Testing Across Projects:** Validate tool changes before releasing
- **Temporary Integration:** Link for feature work, unlink when done
