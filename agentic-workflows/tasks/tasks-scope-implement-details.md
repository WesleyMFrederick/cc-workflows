# Scope Task Implement Details

## Goal
Use the template to create a self-contained context file an agent can run without needing to read any other files. Implement details bridges the gap between information in a task list to the information needed to implement. It **assumes** the implement agent can:
- Research documentation and codebases
- Make reasonable technical decisions
- Follow established patterns
- Ask for clarification when truly stuck

**REMEMBER:** We're checking for SUFFICIENT guidance, not the actual implement.

**PRINCIPLES:**
1. Clarity - A developer should understand WHAT to build
2. Context - WHY this is being built and how it fits
3. Guidance - Key technical decisions and patterns to follow
4. Testability - How to verify the implementation works
5. Self-Contained - Most info needed is in the story itself

## Workflow
1. Read @/Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/claude-code-knowledgebase/agentic-workflows/templates/task-implement-details-template.md.
2. The goal is to use the template to create a self-contained context file the agent can run without needing to read any other files.
3. Follow the format and instructions in the template file.
4. Populate the template with information in your context window. If any input files are not in your context window, scan the files for enhanced context.
5. Use research tools like Context 7 or a web search to validate any unknown technologies or implement patterns.
6. Save the file to the tasks/ folder relative to the user story file. If the user story file is in a tasks/ folder, then save in the same location. Use this filename convention: {{task number, ie. 01, 01-2, 02-1, 22-1, etc.}}-{{task name}}-{{user story number if it exists}}.md
- Example: 01-enable-esm-foundation-t1.1.md
- Example: 01-1-auto-fix-short-file-names.md

## Implement Details Requirements Checklist
