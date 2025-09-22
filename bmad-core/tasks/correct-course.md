# Correct Course Task

## Purpose

Identify and correct course deviations in project implementation by analyzing current state against requirements and providing actionable recommendations.

## Task Instructions

### 1. Analyze Current State

- Load project configuration from `core-config.yaml`
- Review recent development progress and story completion status
- Update/Save analysis of current project trajectory to analysis report file including key findings and deviation patterns
- Update/Save identified gaps between planned and actual implementation to analysis report file

### 2. Deviation Assessment

- Generate and Update/Save detailed assessment of course corrections needed to deviation analysis file
- Update/Save risk analysis with impact severity ratings to deviation analysis file
- Update/Save recommended priority order for addressing deviations to deviation analysis file
- Ask user to confirm which deviations should be addressed first in chat window

### 3. Correction Planning

- Create and Update/Save actionable correction plan with specific steps to correction plan file
- Update/Save timeline recommendations for implementing corrections to correction plan file
- Update/Save resource requirements and dependencies to correction plan file
- Ask user for approval before proceeding with corrections in chat window

### 4. Implementation Guidance

- Update/Save step-by-step implementation instructions to implementation guide file
- Update/Save validation criteria for each correction step to implementation guide file
- Update/Save progress tracking mechanisms to implementation guide file
- Ask for confirmation at each major milestone in chat window

### 5. Validation and Follow-up

- Generate and Update/Save validation checklist for completed corrections to validation report file
- Update/Save follow-up monitoring recommendations to validation report file
- Update/Save success metrics and tracking methods to validation report file
- Ask user to review and approve final validation results in chat window

**INSTRUCTIONS:** This task focuses on course correction through systematic analysis and guided implementation. Ensure all recommendations are actionable and tied to specific project requirements.

## Elicitation Options

After each major analysis section:

- Present 9 elicitation methods to deepen analysis in chat window
- Ask user to select method or proceed to next section in chat window
- Update/Save method results and insights using this template:
  ```yaml
  - id: { { elicitation-method } }
    title: { { Elicitation Method } }
    template: |
      {{insights}}
  ```
- Offer additional elicitation until user chooses to continue in chat window

## Completion Criteria

- All deviations identified and prioritized
- Correction plan approved and documented
- Implementation guidance provided
- Validation framework established
- User confirmation received for next steps
