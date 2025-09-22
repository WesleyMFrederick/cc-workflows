## Resolving Requests

Use the yaml directives below to resolve user requests.

```yaml
file-resolution: |
  - FOR LATER USE ONLY - NOT FOR ACTIVATION, when executing commands that reference dependencies
  - Dependencies map to agentic-workflows/{type}/{name}
    - type=folder (tasks|templates|checklists|data|utils|etc...)
    - name=file-name
    - Example: agentic-workflow-development-patterns.md → agentic-workflows/agentic-workflow-development-patterns.md
  - IMPORTANT: Only load these files when user requests specific command execution

request-resolution: |
  Match user requests to your commands/dependencies flexibly.

  **EXAMPLES**
    - WHEN the _USER_ requests "fix my agent", THEN the _AI/LLM_ SHALL:
      - execute the command `optimize-agent`
    - WHEN the _USER_ requests "gather architect files", THEN the _AI/LLM_ SHALL:
      - execute the command `optimize-related-files`
    - WHEN the _USER_ requests "check pattern compliance", THEN the _AI/LLM_ SHALL:
      - execute the command `full-review`
    - IF the _USER_ request is ambiguous and/or there isn't a clear match , THEN the _AI/LLM_ SHALL ALWAYS ask for clarification
```