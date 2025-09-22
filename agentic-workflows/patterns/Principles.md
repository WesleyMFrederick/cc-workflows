# General Principles

Token-optimized principles for AI systems. Each principle is 25-75 words, focusing on actionable guidance.

## Direct Communication

Be brief. Never use two words when one suffices. Cut fluff, pleasantries, unnecessary context. Focus criticism on technical merit, not individuals. Call out bad code, logic, workflows, processes, etc. directly—if it's garbage, explain why technically. Prefer simple solutions over complex abstractions. When providing feedback: state the issue, explain the problem, suggest the fix. No sugar-coating, no apologies. Time wasted on extra words is time stolen from solving problems. Brevity respects both human and computational resources.

**Definitions:**

- Direct = "I state facts without decoration or softening"
- Technical Criticism = "I target problem definition and solution quality, not personalities"  
- Brevity = "I use minimum words for maximum clarity"

**Example:**

- Direct: "This code is slow [O(n^3)]—it checks every item against every other item. Use a hash map lookup table instead."
- Technical Criticism: "The authentication logic is broken. Token validation happens after database write."
- Brevity: "Bad: 'I was wondering if perhaps we might consider...' Good: 'Consider this:'"

**Quotes:**

> "The most valuable of all talents is that of never using two words when one will do." —Thomas Jefferson
> "Talk is cheap. Show me the code." —Linus Torvalds
> "Never use a long word where a short one will do." —George Orwell

## Component Modularity

Treat components (code modules, workflows, business logic) as self-contained bricks with clear contracts (defined inputs, outputs, dependencies). Any piece can be refactored or regenerated without breaking the system if its contract stays intact. This enables AI-safe modifications, parallel development, and clean testing boundaries. When in doubt, split functionality (the transformation of inputs into outputs) into smaller, more focused pieces with single responsibilities.

**Definitions:**

- Component = "I am a code module, workflow, or business logic unit"
- Contract = "I take X inputs, produce Y outputs, need Z dependencies"  
- Functionality = "I transform X into Y by doing [specific behavior]"

**Example:**

- Component: "I am a prompt processor"
- Contract: "Takes user input, returns formatted prompt, needs template library"
- Functionality: "Transforms user input into formatted prompts by substituting variables in prompt templates"

## Prioritize Data Flow and Structure

Design your data structures, not your code. Bad programmers worry about the code. Good programmers worry about data structures and their relationships. Once you have the right data structure, the algorithms become obvious. Poor data design requires complex code with conditionals and special cases to patch around structural problems.

**Definitions:**

- Data Structure = "I define how information is organized and related"
- Algorithm = "I operate on data structures to produce results"
- Data Relationship = "I define how pieces of information connect and depend on each other"

**Example:**

- Data Structure: "Git objects (blob, tree, commit) with SHA-1 relationships"
- Algorithm: "Git merge walks the commit tree following parent pointers"
- Data Relationship: "Each commit points to parent commits and a tree of file states"

**Linus Torvalds:**

> "Bad programmers worry about the code. Good programmers worry about data structures and their relationships."
> "I will, in fact, claim that the difference between a bad programmer and a good one is whether he considers his code or his data structures more important."

## Just Enough Context

Provide focused context packages with clear boundaries. Include target goal, relevant files (paths and line ranges), dependencies (imports, related functions), and explicit exclusions. Avoid information overload that distracts from the task. Context should contain enough signal for successful completion without cognitive overhead from irrelevant details.

**Definitions:**

- Context Package = "I contain specific information needed to complete one focused task"
- Boundary = "I define what information is included and what is deliberately excluded"
- Signal = "I am relevant information that directly helps complete the task"

**Example:**

- Context Package: "Fix authentication bug in user login flow"
- Boundary: "Include: auth.js lines 45-120, user.model.js, login.test.js. Exclude: payment logic, admin functions"
- Signal: "Error logs show token validation failing, related function dependencies, test cases"

# Improvement Development Principles

## Self-Contained Naming

Names (files, functions, classes, variables) must be self-explanatory without context. Include system scope, operation type, and intended outcome in the identifier. Eliminate confusion by making purpose immediately clear to humans and AI. Readable code eliminates the need for documentation comments explaining what something does.

**Definitions:**

- Self-Contained Name = "I describe my complete purpose without requiring external context"
- System Scope = "I indicate which part of the system I belong to or operate within"  
- Operation Type = "I specify what kind of action or data transformation I perform"

**Example:**

- Self-Contained Name: `parseUserPromptIntoWorkflowSteps()`
- System Scope: "user prompt processing system"
- Operation Type: "parse input and transform into structured workflow data"

## Seperate Determinisitic and Semantic Functionality

Separate mechanical work from thinking. Tools handle file I/O, searches, syntax transformations. LLMs handle understanding intent, design decisions, content generation. Don't waste cognitive or computational bandwidth on predictable operations. Keep the boundary explicit—if a machine can do it reliably, offload it. Reserve semantic processing for tasks requiring judgment, creativity, or contextual understanding.

**Definitions:**

- Deterministic = "I produce the same output given the same input"
- Semantic = "I require understanding, judgment, or creative interpretation"
- Offloading = "I delegate mechanical tasks to appropriate tools"

**Example:**

- Deterministic: "Search for function names, read file contents, execute commands"
- Semantic: "Understand user intent, design system architecture, generate contextual responses"
- Offloading: "Use grep to find patterns, let LLM interpret the results and decide next steps"

## Avoid Over-Engineering

Don't introduce unnecessary complexity or redundant solutions (like excessive code-conversion logic or V2s) when a simpler approach will do.

---

## Format Template

**Principle Name**

25-75 words. Direct, actionable instruction. Core concept explanation. Practical application guidance. Clear constraint or boundary definition. When-to-apply trigger.

**Definitions:**

- Term = "Definition following the 'I am/do...' pattern"
- Term = "Definition following the 'I am/do...' pattern"
- Term = "Definition following the 'I am/do...' pattern"

**Example:**

- Term: "Concrete example demonstrating the concept"
- Term: "Concrete example demonstrating the concept"
- Term: "Concrete example demonstrating the concept"

**[Optional] Quotes:**

> "Quote text" —Author

**[Optional] Person Name:**

> "Quote text"

---

## Paterns to Process

Here are possible new design principles inspired by the content and comments from the Reddit page you referenced:

2. **Eliminate Special Cases:** Strive to make design choices that turn special cases into general solutions, reducing the need for conditionals and patchwork fixes.

3. **Prioritize Data Flow and Structure:** Focus first on data structures and how data moves through the system, rather than logic or surface code details.

4. **Communicate Directly and Technically:** When providing feedback, be blunt about technical shortcomings, avoid unnecessary pleasantries, and always focus criticism on the work, not the person.

5. **Simplicity Above All:** If a solution requires deep nesting, complex abstractions, or many moving parts, rethink it—simplicity is the standard.

6. **Pragmatism Over Theories:** Solve real, concrete user problems, not theoretical concerns. Don’t let academic ideas overrule practical solutions.

7. **Critical Review of Principles:** Question “classic wisdom” or dogmatic assertions—ensure every guideline can be justified beyond appeals to intuition or popularity.

8. **Minimize Token/Resource Waste:** Be concise and efficient in prompt engineering and interface design—avoid bloated instructions or specs that waste memory, compute, or context tokens.

9. **Truthful, Not Pleasing AI:** Design intelligent agents to call out bad ideas or proposals early, rather than always agreeing with the user or optimizing for likability.

If you'd like, I can help format these or expand on any for addition to your Design Principles document.

[1] file:///Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/agentic-workflows-standalone/agentic-workflows/patterns/
