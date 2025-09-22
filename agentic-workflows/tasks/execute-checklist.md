---
type: task
task-name: execute-checklist.md
description: Validate documents against checklists with interactive or batch processing modes
required-inputs:
  - agentic-workflows-path: /Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/claude-code-knowledgebase/agentic-workflows
  - name: config-file
    description: Optional configuration file with outputBase and featurePrefix values
    expected-type: config
    path: config.yaml
  - name: checklist
    description: Checklist file containing validation criteria and requirements
    expected-type: checklist
    validation: file-exists
---

# Checklist Validation Task

This task provides instructions for validating documentation against checklists. The agent MUST follow these instructions to ensure thorough and systematic validation of documents.

## Available Checklists

If the user asks or does not specify a specific checklist, list the checklists available to the agent persona in chat window. If the task is being run not with a specific agent, tell the user in chat window to check the {{agentic-workflows-path}}/checklists folder to select the appropriate one to run.

## Instructions

1. **Initial Assessment**
   - If user or the task being run provides a checklist name:
     - Try fuzzy matching (e.g. "architecture checklist" -> "architect-checklist")
     - If multiple matches found, ask user to clarify in chat window
     - Load the appropriate checklist from {{paths.bmadCore}}/checklists/
   - If no checklist specified:
     - Ask the user which checklist they want to use in chat window
     - Present the available options from the files in the checklists folder in chat window
   - Confirm if they want to work through the checklist in chat window:
     - Section by section (interactive mode - very time consuming)
     - All at once (YOLO mode - recommended for checklists, there will be a summary of sections at the end to discuss)

2. **Document and Artifact Gathering**
   - Each checklist will specify its required documents/artifacts at the beginning
   - Follow the checklist's specific instructions for what to gather, generally a file can be resolved in the docs folder, if not or unsure, halt and ask or confirm with the user in chat window.

3. **Checklist Processing**

   If in interactive mode:
   - Work through each section of the checklist one at a time
   - For each section:
     - Review all items in the section following instructions for that section embedded in the checklist
     - Check each item against the relevant documentation or artifacts as appropriate
     - Update/Save summary of findings for that section to validation report file, highlighting warnings, errors and non applicable items (rationale for non-applicability).
     - Get user confirmation in chat window before proceeding to next section or if any thing major do we need to halt and take corrective action

   If in YOLO mode:
   - Process all sections at once
   - Create a comprehensive report of all findings
   - Update/Save the complete analysis to validation report file

4. **Validation Approach**

   For each checklist item:
   - Read and understand the requirement
   - Look for evidence in the documentation that satisfies the requirement
   - Consider both explicit mentions and implicit coverage
   - Aside from this, follow all checklist llm instructions
   - Mark items as:
     - ✅ PASS: Requirement clearly met
     - ❌ FAIL: Requirement not met or insufficient coverage
     - ⚠️ PARTIAL: Some aspects covered but needs improvement
     - N/A: Not applicable to this case

5. **Section Analysis**

   For each section:
   - think step by step to calculate pass rate
   - Identify common themes in failed items
   - Provide specific recommendations for improvement
   - In interactive mode, discuss findings with user in chat window
   - Document any user decisions or explanations

6. **Final Report**

   Update/Save a summary to validation report file that includes:
   - Overall checklist completion status
   - Pass rates by section
   - List of failed items with context
   - Specific recommendations for improvement
   - Any sections or items marked as N/A with justification

## Checklist Execution Methodology

Each checklist now contains embedded LLM prompts and instructions that will:

1. **Guide thorough thinking** - Prompts ensure deep analysis of each section
2. **Request specific artifacts** - Clear instructions on what documents/access is needed
3. **Provide contextual guidance** - Section-specific prompts for better validation
4. **Generate comprehensive reports** - Final summary with detailed findings

The LLM will:

- Execute the complete checklist validation
- Update/Save a final report with pass/fail rates and key findings to validation report file
- Offer to provide detailed analysis of any section in chat window, especially those with warnings or failures
