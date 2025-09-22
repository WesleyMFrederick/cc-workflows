---
type: task
task-name: create-document-from-yaml-template
description: Create document from YAML template with mandatory elicitation workflow and user interaction for content generation
required-inputs:
  - name: template-file
    description: Path to YAML template file defining document structure and sections
    expected-type: template
    validation: file-exists
  - name: config-file
    description: Optional configuration file with outputBase and featurePrefix values
    expected-type: config
    validation: optional
---

# Create Document from Template (YAML Driven)

## ⚠️ CRITICAL EXECUTION NOTICE ⚠️

**THIS IS AN EXECUTABLE WORKFLOW - NOT REFERENCE MATERIAL**
When this task is invoked:

1. **DISABLE ALL EFFICIENCY OPTIMIZATIONS** - This workflow requires full user interaction
2. **MANDATORY STEP-BY-STEP EXECUTION** - Each section must be processed sequentially with user feedback
3. **ELICITATION IS REQUIRED** - When `elicit: true`, you MUST use the 1-9 format and wait for user response
4. **NO SHORTCUTS ALLOWED** - Complete documents cannot be created without following this workflow

**VIOLATION INDICATOR:** If you create a complete document without user interaction, you have violated this workflow.

## CRITICAL: Dual-Mode Elicitation

**Pre-Draft Gathering (PREVENTS HALLUCINATIONS):**
- ALWAYS present context-gathering options BEFORE drafting any content when elicit: true
- Use "Context Gathering Methods (Pre-Draft)" from data/elicitation-methods.md
- Purpose: Gather requirements, reduce assumptions, clarify ambiguities
- The agent should generate section-appropriate questions based on the method selected
- Options 1-2 are always "Skip gathering" and "Provide context directly"
- Options 3-9 use context gathering methods to help agents ask relevant questions

**Post-Draft Refinement (IMPROVES QUALITY):**
- Present refinement options AFTER content is drafted and saved
- Use "Core Reflective Methods (Post-Draft)" from data/elicitation-methods.md
- Purpose: Critique, expand, refine the drafted content
- Options 1-2 are always "Proceed to next section" and "Respond to in-document comments"
- Options 3-9 use post-draft methods for content improvement

**NEVER skip pre-draft gathering for elicit:true sections!**
**This is the primary mechanism to prevent LLM hallucinations and assumptions.**

## Critical: Configuration and Template Discovery

**FIRST:** Load configuration values from `agentic-workflows/config.yaml` for `outputBase`, `featurePrefix`, and `analysisExclusions` to construct proper output file paths using `${outputBase}/${featurePrefix}/` + template filename pattern.

If configuration file is missing or incomplete, use fallback values: `outputBase: "docs/"`, `featurePrefix: "default"`, and `analysisExclusions: []`.

**CRITICAL: Analysis Exclusions:** When analyzing the codebase for architectural insights, research, or code references, ALWAYS apply the `analysisExclusions` patterns from config.yaml. These patterns exclude non-core functionality (IDE tooling, logs, build artifacts) to keep analysis focused on core system architecture.

**Exclusion Application:**
- Before using Read, Glob, Grep, or Bash tools to examine codebase files
- Skip any paths matching patterns in `analysisExclusions`
- When listing directories or searching for examples, filter out excluded paths
- Document which exclusions were applied in the analysis rationale

If a YAML Template has not been provided, list all templates from `agentic-workflows/templates/` or ask the user to provide another.

## CRITICAL: Mandatory Elicitation Format

**When `elicit: true`, this is a HARD STOP requiring user interaction:**

**YOU MUST:**

1. Update/Save section content to document file
2. Update/Save detailed rationale to document file (explain trade-offs, assumptions, decisions made)
3. **STOP and present numbered options 1-9 in chat window:**
   - **Option 1:** Always "Proceed to next section"
   - **Option 2:** Always "Respond to in-document comments"
   - **Options 3-9:** Select 7 methods from data/elicitation-methods.md
     - Example output format:
       **Option 3:** {{method name}}, {{5-8 word description of method}}
   - End with: "Select 1-9 or just type your question/feedback:"
4. **WAIT FOR USER RESPONSE** - Do not proceed until user selects option or provides feedback

**WORKFLOW VIOLATION:** Creating content for elicit=true sections without user interaction violates this task.

**NEVER ask yes/no questions or use any other format.**

## Processing Flow

1. **Parse YAML template** - Load template metadata and sections
2. **Set preferences** - Show current mode (Interactive), construct output file path using config values
3. **Generate Document Processing Status** - Create checkbox list from template sections with elicit indicators:

   ```markdown
   ## Document Processing Status
   
   - [ ] Section Name
   - [ ] Section Name (elicit: true) 
   - [ ] Section Name
   ```

4. **Present processing options:**
   - **Option 1:** Process sections in template order
   - **Option 2:** Start with appendices/references for context gathering (document structure unchanged)
   - Wait for user selection before proceeding
5. **Process each section** (in chosen order, but insert into correct document positions):
   - Skip if condition unmet
   - Check agent permissions (owner/editors) - note if section is restricted to specific agents
   - **Handle user-specified references** - When users provide file paths, URLs, or document names, attempt to read/access content
   - **IF elicit: true:**
     a. **PRE-DRAFT ELICITATION:**
        - Present numbered options 1-9 using Context Gathering methods from data/elicitation-methods.md
        - Option 1: "Skip gathering, draft with current context"
        - Option 2: "Provide specific requirements/context directly"
        - Options 3-9: Context gathering methods from elicitation-methods.md
        - WAIT for user response and incorporate feedback
     b. **DRAFT CONTENT** using section instruction + gathered context
     c. **Update/Save content and detailed rationale** to document file
     d. **POST-DRAFT ELICITATION:**
        - Present numbered options 1-9 using Post-Draft refinement methods
        - Option 1: "Proceed to next section"
        - Option 2: "Respond to in-document comments"
        - Options 3-9: Post-draft refinement methods from elicitation-methods.md
        - Process user selection and apply changes
   - **IF elicit: false:**
     - Draft content using section instruction
     - Update/Save content and detailed rationale to document file
6. **Continue until complete**

## Detailed Rationale Requirements

When processing section content, ALWAYS update/save rationale to document file that explains:

- Trade-offs and choices made (what was chosen over alternatives and why)
- Key assumptions made during drafting
- Interesting or questionable decisions that need user attention
- Areas that might need validation

## Elicitation Results Flow

### Option 2: Respond to In-Document Comments

When user selects option 2:

1. **Scan document** for comments, feedback, or questions marked with standard comment patterns:
   - `<!-- comment text -->`
   - `[comment: text]`
   - `// comment text`
   - Any text that appears to be requesting feedback or clarification
2. **List all comments** found in the document with their context
3. **Address each comment** by updating relevant content in the document
4. **Save changes** and return to options menu
5. If no comments found, inform user and return to options menu

### Options 3-9: Elicitation Methods

After user selects elicitation method (3-9):

1. Execute method from data/elicitation-methods.md
2. Update/Save results with insights to a new section using this template:

   ```yaml
   - id: { { elicitation-method } }
     title: { { Elicitation Method } }
     template: |
       {{insights}}
   ```

3. Present options in chat window:
   - **1. Apply changes and update section**
   - **2. Return to elicitation menu**
   - **3. Ask any questions or engage further with this elicitation**

## Agent Permissions

When processing sections with agent permission fields:

- **owner**: Note which agent role initially creates/populates the section
- **editors**: List agent roles allowed to modify the section
- **readonly**: Mark sections that cannot be modified after creation

**For sections with restricted access:**

- Update/Save a note in the generated document indicating the responsible agent
- Example: "_(This section is owned by implementation workflow and can only be modified by implementation workflow)_"

## User-Specified Reference Handling

When users provide references to organizational guidance:

**File Path References:**
- Use Read tool to access files like `@agentic-workflows/patterns/Principles.md`
- Support relative paths, absolute paths, and @ shortcuts
- If file cannot be accessed, ask user to provide content directly

**URL References:**
- Use WebFetch tool to retrieve content from external URLs
- Handle enterprise documentation systems when accessible

**Direct Content:**
- When users provide content directly in chat, capture it verbatim
- Preserve formatting and structure as provided

**Integration Approach:**
- Always ask users what guidance sources are relevant before assuming
- Support multiple sources per project (team + enterprise standards)
- Allow users to reference any organizational level or format
- Document source references for future updates

## YOLO Mode

User can type `#yolo` to toggle to YOLO mode (process all sections at once).

## CRITICAL REMINDERS

**❌ NEVER:**

- Ask yes/no questions for elicitation
- Use any format other than 1-9 numbered options
- Create new elicitation methods

**✅ ALWAYS:**

- Use exact 1-9 format when elicit: true
- Option 1: "Proceed to next section"
- Option 2: "Respond to in-document comments"
- Options 3-9: Select 7 methods from data/elicitation-methods.md only
- Update/Save detailed rationale explaining decisions to document file
- End with "Select 1-9 or just type your question/feedback:"
