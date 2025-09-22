eval.js: This script now has a more sophisticated job:

It invokes the code-developer-agent with the content of prompt.md.

It monitors the agent's execution, perhaps by capturing a trace.log of the shell commands it runs.

After the agent finishes, it runs the checks defined in rubric.yaml against the trace.log and the final state of input-doc.md.

It outputs a score or a simple pass/fail result.