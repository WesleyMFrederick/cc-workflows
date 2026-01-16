**Role:** Extract atomic Evidence Bricks from Job Descriptions—irreducible units of ideal-state requirements with deterministic source pointers.

## Definitions
- **Evidence Brick:** Atomic ideal-state unit from JD (requirement, responsibility, outcome, metric, deliverable, constraint, stakeholder, competency)
- **Context:** The JD section/subsection that provides context (e.g., "Success in 6-12 months", "Responsibilities", "Qualifications")
- **Text Fragment:** Deterministic locator using format `#:~:text=[prefix-,]start,end[,-suffix]`

## Rules
1. Extract distinct ideal-state bricks from JD text
2. **Never speculate** about current state—only capture explicit/unambiguous ideal-state claims
3. **Atomic granularity:** New brick per new requirement/outcome. Merge only single-thought sentences
4. **Verbatim quotes** for brick content (exact text from JD)
5. **Text fragment construction:**
   - `start` = beginning of brick quote (enough words to anchor the start)
   - `end` = ending of brick quote (enough words to anchor the end; same as start if short)
   - Add `prefix-,` (3-5 words immediately before) only if needed to disambiguate
   - Add `,-suffix` (3-5 words immediately after) only if needed to disambiguate

## Output Format

| ID | Source | Brick | Context | Text Fragment |
| :--- | :--- | :--- | :--- | :--- |
| B-001 | [Doc Title] | Exact verbatim quote from JD | Section/Subsection | #:~:text=prefix-,start,end,-suffix |
| B-002 | [Doc Title] | Another exact quote | Section/Subsection | #:~:text=start,end |

**Example:**

| ID | Source | Brick | Context | Text Fragment |
| :--- | :--- | :--- | :--- | :--- |
| B-001 | Virta Tech Ops JD | "Drive strategic planning and execution across cross-functional teams to establish operational excellence" | Responsibilities | #:~:text=You will be-,Drive strategic planning,operational excellence |
| B-002 | Virta Tech Ops JD | "Establish quarterly planning cadence with clear OKRs and success metrics" | Success in 6-12 months | #:~:text=Establish quarterly planning,success metrics |
```

---

## Text Fragment Logic (Step-by-Step)
```
INPUT: Brick quote = "Drive strategic planning across teams"

STEP 1: Define start and end
  start = "Drive strategic planning"  (first few words)
  end = "across teams"                (last few words; or same as start if short)

STEP 2: Is start unique in document?
  YES → skip to STEP 4
  NO → continue to STEP 3

STEP 3: Add prefix (3-5 words before start)
  prefix = "You will be"

STEP 4: Is end unique after start?
  YES → done
  NO → continue to STEP 5

STEP 5: Add suffix (3-5 words after end)
  suffix = "to drive excellence"

OUTPUT: #:~:text=[prefix-,]start,end[,-suffix]
```