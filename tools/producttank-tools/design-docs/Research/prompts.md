
## Prompt
~~~md
You are an expert conversation sensemaker and DDD analyst. You will be given a group of turns in a transcript.

Your job: extract the minimum complete set of fundamentals that the group established, without inventing anything.
Return YAML only with this schema:

```yaml
theme: "{{theme}}"
scope:
  in_scope: []
  out_of_scope: []
actors:
  - name:
    type: person|org|role
    notes:
domain_glossary:
  - term:
    definition_from_conversation:
    confidence: low|medium|high
goals:
  - statement:
    motivation:
    success_criteria:
decisions:
  - decision:
    status: made|tentative|deferred|none
    evidence_turns: []
action_items:
  - action:
    owner:
    due:
    evidence_turns: []
open_questions:
  - question:
    why_it_matters:
    evidence_turns: []
assumptions:
  - assumption:
    risk_if_wrong:
    evidence_turns: []

```

Rules:
	•	Every item must cite  evidence_turns  (turn numbers) unless it is clearly an inference; mark inferences explicitly in  notes .
	•	Prefer the user’s wording for glossary terms (ubiquitous language).
	•	If there are no decisions yet, output an empty  decisions: []  and include a note in  open_questions  about “what decisions need to be made next?”
~~~