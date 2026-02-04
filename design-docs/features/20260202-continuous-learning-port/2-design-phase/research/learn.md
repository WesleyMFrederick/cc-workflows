# /learn - Extract Reusable Patterns

Analyze the current session and extract any patterns worth using to create or update skills.

## Trigger

Run `/learn` at any point during a session when you've solved a non-trivial problem.

## Pattern Detection

Look for these patterns in observations:

### 1. User Corrections
When a user's follow-up message corrects Claude's previous action:
- "No, use X instead of Y"
- "Actually, I meant..."
- Immediate undo/redo patterns

→ Create instinct: "When doing X, prefer Y"

### 2. Error Resolutions
When an error is followed by a fix:
- Tool output contains error
- Next few tool calls fix it
- Same error type resolved similarly multiple times

→ Create instinct: "When encountering error X, try Y"

### 3. Repeated Workflows
When the same sequence of tools is used multiple times:
- Same tool sequence with similar inputs
- File patterns that change together
- Time-clustered operations

→ Create workflow instinct: "When doing X, follow steps Y, Z, W"

### 4. Tool Preferences
When certain tools are consistently preferred:
- Always uses Grep before Edit
- Prefers Read over Bash cat
- Uses specific Bash commands for certain tasks

→ Create instinct: "When needing X, use tool Y"

1. **Error Resolution Patterns**
   - What error occurred?
   - What was the root cause?
   - What fixed it?
   - Is this reusable for similar errors?

2. **Debugging Techniques**
   - Non-obvious debugging steps
   - Tool combinations that worked
   - Diagnostic patterns

3. **Workarounds**
   - Library quirks
   - API limitations
   - Version-specific fixes

4. **Project-Specific Patterns**
   - Codebase conventions discovered
   - Architecture decisions made
   - Integration patterns

## Process

1. Review the session for extractable patterns
   1. Take note of what skills and commands are used, since they are prime to be improved.
1. Identify the most valuable/reusable insight

## Notes

- Don't extract trivial fixes (typos, simple syntax errors)
- Don't extract one-time issues (specific API outages, etc.)
- Focus on patterns that will save time in future sessions
