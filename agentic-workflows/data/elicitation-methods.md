# Elicitation Methods Data

## Context Gathering Methods (Pre-Draft)

**Identify Constraints & Dependencies**

- What are the technical, business, or resource constraints?
- What existing systems or processes must this integrate with?
- What are the non-negotiable requirements?
- What dependencies could block or delay implementation?

**Clarify Scope & Boundaries**

- What is explicitly in scope vs out of scope?
- What are the MVP requirements vs nice-to-haves?
- What assumptions need validation before proceeding?
- What are the success criteria and acceptance thresholds?

**Gather Missing Context**

- What key information is needed but not yet documented?
- Who are the stakeholders and their specific priorities?
- What business context or background should inform decisions?
- What user research or data is available to guide requirements?

**Explore Prior Art & Patterns**

- What similar solutions exist internally or externally?
- What patterns or conventions should be followed?
- What lessons learned from past implementations apply?
- What existing tools or frameworks could be leveraged?

**Surface Hidden Complexity**

- What edge cases or error scenarios need consideration?
- What performance, scalability, or reliability requirements exist?
- What security, compliance, or regulatory factors apply?
- What integration points or system interactions are needed?

**Validate Core Assumptions**

- What key assumptions are we making about user behavior?
- What technical assumptions need verification?
- What business assumptions could impact feasibility?
- What timeline or resource assumptions require confirmation?

**Define Success Metrics**

- How will we measure success for this section?
- What metrics or KPIs should drive decisions?
- What would failure look like and how do we prevent it?
- What feedback loops or validation points are needed?

## Core Reflective Methods (Post-Draft)

**Expand or Contract for Audience**

- Ask whether to 'expand' (add detail, elaborate) or 'contract' (simplify, clarify)
- Identify specific target audience if relevant
- Tailor content complexity and depth accordingly

**Explain Reasoning (CoT Step-by-Step)**

- Walk through the step-by-step thinking process
- Reveal underlying assumptions and decision points
- Show how conclusions were reached from current role's perspective

**Critique and Refine**
Where did you make assumptions, miss key details or recommend solutions that don't scale well? Be brutally honest. Ultrathink. Present a numbered list.

- Review output for flaws, inconsistencies, or improvement areas
- Identify specific weaknesses from role's expertise
- Suggest refined version reflecting domain knowledge

Keep each critique short, no more than 50 words. List the 5-10 most important critiques. Do not insert a hallucination as one of your critiques. Do not make up a critique based on unknown information. Only critique information in the plan.

For example, if we are working with json, this would be a bad critique if you haven't verified markdown is used in the project:

```text
7. Scaling concern with forced JSON mode: Changing CLI to always output JSON might break other scripts expecting markdown responses.
```

Do not add critiques for critiques sake. Prioritize the risk of what would happen if your critique is not addressed. Risk is a combination of:

- liklihood of the outcome mentioned in your critique
- impact or negative effect of the outcome mentioned in your critique

Rate the risk as [Critical | High | Medium | Low]. List all Critical and High risk items first. Only list at most 1-2 Medium and 1 Low risk items.

Create a brief sentence that outlines how you can mitigate that specific critique's risk.

# Output Format

Use the markdown formatting and output format below:

```markdown
1. [**CRITICAL** | **High** | **medium** | low] {{Critique}}: {{Brief expansion sentence}}. [**SUGGESTION**]: {{Suggest action to mitigate risk}}
2. ...

**Mitigation Sequence**
{{Short description of the sequence of the next actions. You do not need to mitigate all risks, particularly if subsequent actions can benefit from the insights of earlier actions. Group together related risks and actions.}}
``

## Structural Analysis Methods

**Analyze Logical Flow and Dependencies**

- Examine content structure for logical progression
- Check internal consistency and coherence
- Identify and validate dependencies between elements
- Confirm effective ordering and sequencing

**Assess Alignment with Overall Goals**

- Evaluate content contribution to stated objectives
- Identify any misalignments or gaps
- Interpret alignment from specific role's perspective
- Suggest adjustments to better serve goals

## Risk and Challenge Methods

**Identify Potential Risks and Unforeseen Issues**

- Brainstorm potential risks from role's expertise
- Identify overlooked edge cases or scenarios
- Anticipate unintended consequences
- Highlight implementation challenges

**Challenge from Critical Perspective**

- Adopt critical stance on current content
- Play devil's advocate from specified viewpoint
- Argue against proposal highlighting weaknesses
- Apply YAGNI principles when appropriate (scope trimming)

## Creative Exploration Methods

**Tree of Thoughts Deep Dive**

- Break problem into discrete "thoughts" or intermediate steps
- Explore multiple reasoning paths simultaneously
- Use self-evaluation to classify each path as "sure", "likely", or "impossible"
- Apply search algorithms (BFS/DFS) to find optimal solution paths

**Hindsight is 20/20: The 'If Only...' Reflection**

- Imagine retrospective scenario based on current content
- Identify the one "if only we had known/done X..." insight
- Describe imagined consequences humorously or dramatically
- Extract actionable learnings for current context

## Human-Centered Discovery Methods

**Emotional & Somatic Exploration**

- "What does this problem/solution feel like in your body?"
- "What emotions come up when you think about this challenge or outcome?"
- Surface physical and emotional responses to uncover deeper insights
- Validate feelings without trying to fix them immediately

**Metaphor & Visual Association**

- "If this problem was a weather pattern or animal, what would it be?"
- "What color, sound, or texture matches how this feels?"
- Use analogies and imagery to reveal hidden meanings and patterns
- Create memorable frameworks through symbolic representation

**Raw Reactions & Authentic Expression**

- "What's the first exclamation, curse, or laugh you make when this happens?"
- "What would your 5-year-old self say about this situation?"
- Capture unfiltered responses before analytical thinking kicks in
- Honor authentic language and immediate reactions

**Personification & Character Development**

- "If you could give this issue a villain's name, what would it be?"
- "If the solution was a superhero/sidekick, what power would it have?"
- Transform abstract concepts into relatable characters
- Explore relationships between different aspects as character interactions

**Life Impact & Ecosystem Analysis**

- "How does this show up in your day-to-day life, relationships, health, or mood?"
- "What would your family/friends notice if this problem disappeared?"
- Explore ripple effects beyond immediate scope
- Consider broader contextual implications and secondary benefits

**Aspirational & Transformation Visioning**

- "If this worked perfectly, what would your life/work feel like a month from now?"
- "What is one almost magical outcome you dream about?"
- Invite bold vision without practical constraints initially
- Connect solutions to deeper hopes and transformative possibilities

**Sensory & Memory Exploration**

- "What would it smell, taste, or sound like if this friction disappeared?"
- "Does this remind you of a specific place, time, or memory?"
- Engage multiple senses to unlock associative thinking
- Draw on embodied experience and memory patterns

**Story & Narrative Construction**

- "Can you tell me the story of someone's best day using this solution?"
- "What would the 'before and after' story look like?"
- Create compelling user journey narratives
- Use storytelling to reveal user motivations and desired outcomes

## Multi-Persona Collaboration Methods

**Agile Team Perspective Shift**

- Rotate through different Scrum team member viewpoints
- Product Owner: Focus on user value and business impact
- Scrum Master: Examine process flow and team dynamics
- Developer: Assess technical implementation and complexity
- QA: Identify testing scenarios and quality concerns

**Stakeholder Round Table**

- Convene virtual meeting with multiple personas
- Each persona contributes unique perspective on content
- Identify conflicts and synergies between viewpoints
- Synthesize insights into actionable recommendations

**Meta-Prompting Analysis**

- Step back to analyze the structure and logic of current approach
- Question the format and methodology being used
- Suggest alternative frameworks or mental models
- Optimize the elicitation process itself

## Advanced 2025 Techniques

**Self-Consistency Validation**

- Generate multiple reasoning paths for same problem
- Compare consistency across different approaches
- Identify most reliable and robust solution
- Highlight areas where approaches diverge and why

**ReWOO (Reasoning Without Observation)**

- Separate parametric reasoning from tool-based actions
- Create reasoning plan without external dependencies
- Identify what can be solved through pure reasoning
- Optimize for efficiency and reduced token usage

**Persona-Pattern Hybrid**

- Combine specific role expertise with elicitation pattern
- Architect + Risk Analysis: Deep technical risk assessment
- UX Expert + User Journey: End-to-end experience critique
- PM + Stakeholder Analysis: Multi-perspective impact review

**Emergent Collaboration Discovery**

- Allow multiple perspectives to naturally emerge
- Identify unexpected insights from persona interactions
- Explore novel combinations of viewpoints
- Capture serendipitous discoveries from multi-agent thinking

## Game-Based Elicitation Methods

**Red Team vs Blue Team**

- Red Team: Attack the proposal, find vulnerabilities
- Blue Team: Defend and strengthen the approach
- Competitive analysis reveals blind spots
- Results in more robust, battle-tested solutions

**Innovation Tournament**

- Pit multiple alternative approaches against each other
- Score each approach across different criteria
- Crowd-source evaluation from different personas
- Identify winning combination of features

**Escape Room Challenge**

- Present content as constraints to work within
- Find creative solutions within tight limitations
- Identify minimum viable approach
- Discover innovative workarounds and optimizations

## Process Control

**Proceed / No Further Actions**

- Acknowledge choice to finalize current work
- Accept output as-is or move to next step
- Prepare to continue without additional elicitation
```
