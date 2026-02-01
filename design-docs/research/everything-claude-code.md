# The Longform Guide to Everything Claude Code

[](https://github.com/affaan-m/everything-claude-code/tree/main#the-longform-guide-to-everything-claude-code)

[![Header: The Longform Guide to Everything Claude Code](https://github.com/affaan-m/everything-claude-code/raw/main/assets/images/longform/01-header.png)](https://github.com/affaan-m/everything-claude-code/blob/main/assets/images/longform/01-header.png)

---

> **Prerequisite**: This guide builds on [The Shorthand Guide to Everything Claude Code](https://github.com/affaan-m/everything-claude-code/blob/main/the-shortform-guide.md). Read that first if you haven't set up skills, hooks, subagents, MCPs, and plugins.

[![Reference to Shorthand Guide](https://github.com/affaan-m/everything-claude-code/raw/main/assets/images/longform/02-shortform-reference.png)](https://github.com/affaan-m/everything-claude-code/blob/main/assets/images/longform/02-shortform-reference.png)_The Shorthand Guide - read it first_

In the shorthand guide, I covered the foundational setup: skills and commands, hooks, subagents, MCPs, plugins, and the configuration patterns that form the backbone of an effective Claude Code workflow. That was the setup guide and the base infrastructure.

This longform guide goes into the techniques that separate productive sessions from wasteful ones. If you haven't read the shorthand guide, go back and set up your configs first. What follows assumes you have skills, agents, hooks, and MCPs already configured and working.

The themes here: token economics, memory persistence, verification patterns, parallelization strategies, and the compound effects of building reusable workflows. These are the patterns I've refined over 10+ months of daily use that make the difference between being plagued by context rot within the first hour, versus maintaining productive sessions for hours.

Everything covered in the shorthand and longform guides is available on GitHub: `github.com/affaan-m/everything-claude-code`

---

## Tips and Tricks

[](https://github.com/affaan-m/everything-claude-code/tree/main#tips-and-tricks)

### Some MCPs are Replaceable and Will Free Up Your Context Window

[](https://github.com/affaan-m/everything-claude-code/tree/main#some-mcps-are-replaceable-and-will-free-up-your-context-window)

For MCPs such as version control (GitHub), databases (Supabase), deployment (Vercel, Railway) etc. - most of these platforms already have robust CLIs that the MCP is essentially just wrapping. The MCP is a nice wrapper but it comes at a cost.

To have the CLI function more like an MCP without actually using the MCP (and the decreased context window that comes with it), consider bundling the functionality into skills and commands. Strip out the tools the MCP exposes that make things easy and turn those into commands.

Example: instead of having the GitHub MCP loaded at all times, create a `/gh-pr`command that wraps `gh pr create` with your preferred options. Instead of the Supabase MCP eating context, create skills that use the Supabase CLI directly.

With lazy loading, the context window issue is mostly solved. But token usage and cost is not solved in the same way. The CLI + skills approach is still a token optimization method.

---

## IMPORTANT STUFF

[](https://github.com/affaan-m/everything-claude-code/tree/main#important-stuff)

### Context and Memory Management

[](https://github.com/affaan-m/everything-claude-code/tree/main#context-and-memory-management)

For sharing memory across sessions, a skill or command that summarizes and checks in on progress then saves to a `.tmp` file in your `.claude` folder and appends to it until the end of your session is the best bet. The next day it can use that as context and pick up where you left off, create a new file for each session so you don't pollute old context into new work.

[![Session Storage File Tree](https://github.com/affaan-m/everything-claude-code/raw/main/assets/images/longform/03-session-storage.png)](https://github.com/affaan-m/everything-claude-code/blob/main/assets/images/longform/03-session-storage.png)_Example of session storage -> [https://github.com/affaan-m/everything-claude-code/tree/main/examples/sessions](https://github.com/affaan-m/everything-claude-code/tree/main/examples/sessions)_

Claude creates a file summarizing current state. Review it, ask for edits if needed, then start fresh. For the new conversation, just provide the file path. Particularly useful when you're hitting context limits and need to continue complex work. These files should contain:

- What approaches worked (verifiably with evidence)
- Which approaches were attempted but did not work
- Which approaches have not been attempted and what's left to do

**Clearing Context Strategically:**

Once you have your plan set and context cleared (default option in plan mode in Claude Code now), you can work from the plan. This is useful when you've accumulated a lot of exploration context that's no longer relevant to execution. For strategic compacting, disable auto compact. Manually compact at logical intervals or create a skill that does so for you.

**Advanced: Dynamic System Prompt Injection**

One pattern I picked up: instead of solely putting everything in CLAUDE.md (user scope) or `.claude/rules/` (project scope) which loads every session, use CLI flags to inject context dynamically.

```shell
claude --system-prompt "$(cat memory.md)"
```

This lets you be more surgical about what context loads when. System prompt content has higher authority than user messages, which have higher authority than tool results.

**Practical setup:**

```shell
# Daily development
alias claude-dev='claude --system-prompt "$(cat ~/.claude/contexts/dev.md)"'

# PR review mode
alias claude-review='claude --system-prompt "$(cat ~/.claude/contexts/review.md)"'

# Research/exploration mode
alias claude-research='claude --system-prompt "$(cat ~/.claude/contexts/research.md)"'
```

**Advanced: Memory Persistence Hooks**

There are hooks most people don't know about that help with memory:

- **PreCompact Hook**: Before context compaction happens, save important state to a file
- **Stop Hook (Session End)**: On session end, persist learnings to a file
- **SessionStart Hook**: On new session, load previous context automatically

I've built these hooks and they're in the repo at `github.com/affaan-m/everything-claude-code/tree/main/hooks/memory-persistence`

---

### Continuous Learning / Memory

[](https://github.com/affaan-m/everything-claude-code/tree/main#continuous-learning--memory)

If you've had to repeat a prompt multiple times and Claude ran into the same problem or gave you a response you've heard before - those patterns must be appended to skills.

**The Problem:** Wasted tokens, wasted context, wasted time.

**The Solution:** When Claude Code discovers something that isn't trivial - a debugging technique, a workaround, some project-specific pattern - it saves that knowledge as a new skill. Next time a similar problem comes up, the skill gets loaded automatically.

I've built a continuous learning skill that does this: `github.com/affaan-m/everything-claude-code/tree/main/skills/continuous-learning`

**Why Stop Hook (Not UserPromptSubmit):**

The key design decision is using a **Stop hook**instead of UserPromptSubmit. UserPromptSubmit runs on every single message - adds latency to every prompt. Stop runs once at session end - lightweight, doesn't slow you down during the session.

---

### Token Optimization

[](https://github.com/affaan-m/everything-claude-code/tree/main#token-optimization)

**Primary Strategy: Subagent Architecture**

Optimize the tools you use and subagent architecture designed to delegate the cheapest possible model that is sufficient for the task.

**Model Selection Quick Reference:**

[![Model Selection Table](https://github.com/affaan-m/everything-claude-code/raw/main/assets/images/longform/04-model-selection.png)](https://github.com/affaan-m/everything-claude-code/blob/main/assets/images/longform/04-model-selection.png)_Hypothetical setup of subagents on various common tasks and reasoning behind the choices_

|Task Type|Model|Why|
|---|---|---|
|Exploration/search|Haiku|Fast, cheap, good enough for finding files|
|Simple edits|Haiku|Single-file changes, clear instructions|
|Multi-file implementation|Sonnet|Best balance for coding|
|Complex architecture|Opus|Deep reasoning needed|
|PR reviews|Sonnet|Understands context, catches nuance|
|Security analysis|Opus|Can't afford to miss vulnerabilities|
|Writing docs|Haiku|Structure is simple|
|Debugging complex bugs|Opus|Needs to hold entire system in mind|

Default to Sonnet for 90% of coding tasks. Upgrade to Opus when first attempt failed, task spans 5+ files, architectural decisions, or security-critical code.

**Pricing Reference:**

[![Claude Model Pricing](https://github.com/affaan-m/everything-claude-code/raw/main/assets/images/longform/05-pricing-table.png)](https://github.com/affaan-m/everything-claude-code/blob/main/assets/images/longform/05-pricing-table.png)_Source: [https://platform.claude.com/docs/en/about-claude/pricing](https://platform.claude.com/docs/en/about-claude/pricing)_

**Tool-Specific Optimizations:**

Replace grep with mgrep - ~50% token reduction on average compared to traditional grep or ripgrep:

[![mgrep Benchmark](https://github.com/affaan-m/everything-claude-code/raw/main/assets/images/longform/06-mgrep-benchmark.png)](https://github.com/affaan-m/everything-claude-code/blob/main/assets/images/longform/06-mgrep-benchmark.png)_In our 50-task benchmark, mgrep + Claude Code used ~2x fewer tokens than grep-based workflows at similar or better judged quality. Source: [https://github.com/mixedbread-ai/mgrep](https://github.com/mixedbread-ai/mgrep)_

**Modular Codebase Benefits:**

Having a more modular codebase with main files being in the hundreds of lines instead of thousands of lines helps both in token optimization costs and getting a task done right on the first try.

---

### Verification Loops and Evals

[](https://github.com/affaan-m/everything-claude-code/tree/main#verification-loops-and-evals)

**Benchmarking Workflow:**

Compare asking for the same thing with and without a skill and checking the output difference:

Fork the conversation, initiate a new worktree in one of them without the skill, pull up a diff at the end, see what was logged.

**Eval Pattern Types:**

- **Checkpoint-Based Evals**: Set explicit checkpoints, verify against defined criteria, fix before proceeding
- **Continuous Evals**: Run every N minutes or after major changes, full test suite + lint

**Key Metrics:**

```
pass@k: At least ONE of k attempts succeeds
        k=1: 70%  k=3: 91%  k=5: 97%

pass^k: ALL k attempts must succeed
        k=1: 70%  k=3: 34%  k=5: 17%
```

Use **pass@k** when you just need it to work. Use **pass^k** when consistency is essential.

---

## PARALLELIZATION

[](https://github.com/affaan-m/everything-claude-code/tree/main#parallelization)

When forking conversations in a multi-Claude terminal setup, make sure the scope is well-defined for the actions in the fork and the original conversation. Aim for minimal overlap when it comes to code changes.

**My Preferred Pattern:**

Main chat for code changes, forks for questions about the codebase and its current state, or research on external services.

**On Arbitrary Terminal Counts:**

[![Boris on Parallel Terminals](https://github.com/affaan-m/everything-claude-code/raw/main/assets/images/longform/07-boris-parallel.png)](https://github.com/affaan-m/everything-claude-code/blob/main/assets/images/longform/07-boris-parallel.png)_Boris (Anthropic) on running multiple Claude instances_

Boris has tips on parallelization. He's suggested things like running 5 Claude instances locally and 5 upstream. I advise against setting arbitrary terminal amounts. The addition of a terminal should be out of true necessity.

Your goal should be: **how much can you get done with the minimum viable amount of parallelization.**

**Git Worktrees for Parallel Instances:**

```shell
# Create worktrees for parallel work
git worktree add ../project-feature-a feature-a
git worktree add ../project-feature-b feature-b
git worktree add ../project-refactor refactor-branch

# Each worktree gets its own Claude instance
cd ../project-feature-a && claude
```

IF you are to begin scaling your instances AND you have multiple instances of Claude working on code that overlaps with one another, it's imperative you use git worktrees and have a very well-defined plan for each. Use `/rename <name here>` to name all your chats.

[![Two Terminal Setup](https://github.com/affaan-m/everything-claude-code/raw/main/assets/images/longform/08-two-terminals.png)](https://github.com/affaan-m/everything-claude-code/blob/main/assets/images/longform/08-two-terminals.png)_Starting Setup: Left Terminal for Coding, Right Terminal for Questions - use /rename and /fork_

**The Cascade Method:**

When running multiple Claude Code instances, organize with a "cascade" pattern:

- Open new tasks in new tabs to the right
- Sweep left to right, oldest to newest
- Focus on at most 3-4 tasks at a time

---

## GROUNDWORK

[](https://github.com/affaan-m/everything-claude-code/tree/main#groundwork)

**The Two-Instance Kickoff Pattern:**

For my own workflow management, I like to start an empty repo with 2 open Claude instances.

**Instance 1: Scaffolding Agent**

- Lays down the scaffold and groundwork
- Creates project structure
- Sets up configs (CLAUDE.md, rules, agents)

**Instance 2: Deep Research Agent**

- Connects to all your services, web search
- Creates the detailed PRD
- Creates architecture mermaid diagrams
- Compiles the references with actual documentation clips

**llms.txt Pattern:**

If available, you can find an `llms.txt` on many documentation references by doing `/llms.txt` on them once you reach their docs page. This gives you a clean, LLM-optimized version of the documentation.

**Philosophy: Build Reusable Patterns**

From @omarsar0: "Early on, I spent time building reusable workflows/patterns. Tedious to build, but this had a wild compounding effect as models and agent harnesses improved."

**What to invest in:**

- Subagents
- Skills
- Commands
- Planning patterns
- MCP tools
- Context engineering patterns

---

## Best Practices for Agents & Sub-Agents

[](https://github.com/affaan-m/everything-claude-code/tree/main#best-practices-for-agents--sub-agents)

**The Sub-Agent Context Problem:**

Sub-agents exist to save context by returning summaries instead of dumping everything. But the orchestrator has semantic context the sub-agent lacks. The sub-agent only knows the literal query, not the PURPOSE behind the request.

**Iterative Retrieval Pattern:**

1. Orchestrator evaluates every sub-agent return
2. Ask follow-up questions before accepting it
3. Sub-agent goes back to source, gets answers, returns
4. Loop until sufficient (max 3 cycles)

**Key:** Pass objective context, not just the query.

**Orchestrator with Sequential Phases:**

```md
Phase 1: RESEARCH (use Explore agent) → research-summary.md
Phase 2: PLAN (use planner agent) → plan.md
Phase 3: IMPLEMENT (use tdd-guide agent) → code changes
Phase 4: REVIEW (use code-reviewer agent) → review-comments.md
Phase 5: VERIFY (use build-error-resolver if needed) → done or loop back
```

**Key rules:**

1. Each agent gets ONE clear input and produces ONE clear output
2. Outputs become inputs for next phase
3. Never skip phases
4. Use `/clear` between agents
5. Store intermediate outputs in files

---

## FUN STUFF / NOT CRITICAL JUST FUN TIPS

[](https://github.com/affaan-m/everything-claude-code/tree/main#fun-stuff--not-critical-just-fun-tips)

### Custom Status Line

[](https://github.com/affaan-m/everything-claude-code/tree/main#custom-status-line)

You can set it using `/statusline` - then Claude will say you don't have one but can set it up for you and ask what you want in it.

See also: [https://github.com/sirmalloc/ccstatusline](https://github.com/sirmalloc/ccstatusline)

### Voice Transcription

[](https://github.com/affaan-m/everything-claude-code/tree/main#voice-transcription)

Talk to Claude Code with your voice. Faster than typing for many people.

- superwhisper, MacWhisper on Mac
- Even with transcription mistakes, Claude understands intent

### Terminal Aliases

[](https://github.com/affaan-m/everything-claude-code/tree/main#terminal-aliases)

```shell
alias c='claude'
alias gb='github'
alias co='code'
alias q='cd ~/Desktop/projects'
```

---

## Milestone

[](https://github.com/affaan-m/everything-claude-code/tree/main#milestone)

[![25k+ GitHub Stars](https://github.com/affaan-m/everything-claude-code/raw/main/assets/images/longform/09-25k-stars.png)](https://github.com/affaan-m/everything-claude-code/blob/main/assets/images/longform/09-25k-stars.png)_25,000+ GitHub stars in under a week_

---

## Resources

[](https://github.com/affaan-m/everything-claude-code/tree/main#resources)

**Agent Orchestration:**

- [https://github.com/ruvnet/claude-flow](https://github.com/ruvnet/claude-flow) - Enterprise orchestration platform with 54+ specialized agents

**Self-Improving Memory:**

- [https://github.com/affaan-m/everything-claude-code/tree/main/skills/continuous-learning](https://github.com/affaan-m/everything-claude-code/tree/main/skills/continuous-learning)
- rlancemartin.github.io/2025/12/01/claude_diary/ - Session reflection pattern

**System Prompts Reference:**

- [https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools](https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools) - Collection of system prompts (110k stars)

**Official:**

- Anthropic Academy: anthropic.skilljar.com

---

## References

[](https://github.com/affaan-m/everything-claude-code/tree/main#references)

- [Anthropic: Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)
- [YK: 32 Claude Code Tips](https://agenticcoding.substack.com/p/32-claude-code-tips-from-basics-to)
- [RLanceMartin: Session Reflection Pattern](https://rlancemartin.github.io/2025/12/01/claude_diary/)
- @PerceptualPeak: Sub-Agent Context Negotiation
- @menhguin: Agent Abstractions Tierlist
- @omarsar0: Compound Effects Philosophy

---

_Everything covered in both guides is available on GitHub at [everything-claude-code](https://github.com/affaan-m/everything-claude-code)_