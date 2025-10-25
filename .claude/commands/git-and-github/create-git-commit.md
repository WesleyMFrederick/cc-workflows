---
description: "Create git commit using your `git-and-github/create-git-commit` skill"
argument-hint: "<feature-branch-name>"
---

# Execute Tasks
Create git commit using your `git-and-github/create-git-commit` skill.

## Input Validation

- IF <feature-branch-name> is provided ($1 is populated):
  - Respond with: "Warning: No feature branch provided. Committing message to current branch"
- ELSE IF no <feature-branch-name> is provided ($1 is empty):
  - Respond with: "Creating commit for $1 branch"

<feature-branch-name>
Arguments: $1
<feature-branch-name>

## Load Skill & Execute Plan
1. Load `git-and-github/create-git-commit` skill
2. Commit branch defined during ## Input Validation
