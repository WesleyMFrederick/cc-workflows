# Continuous Learning Port — Specification

**Feature**: Port Continuous Learning from everything-claude-code to cc-workflows
**Phase**: 2 (Design)
**Status**: Draft

> **Context:**
> - [PRD](continuous-learning-port-prd.md)%%force-extract%%
> - [Phase 1 Whiteboard](1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md)
> - [Phase 2 Design Whiteboard](2-design-phase/phase2-design-whiteboard.md)%%force-extract%%
> - [Phase 3 Sequencing Whiteboard](3-sequencing-phase/phase3-sequencing-whiteboard.md)%%force-extract%%

---

```xml
<project_specification>
  <project_name>Continuous Learning Port</project_name>

  <overview>
    Port continuous learning system from everything-claude-code to cc-workflows.
    Enables pattern detection, instinct creation, and behavioral memory across sessions.
    Pipeline: Tool Call → observe.sh → observations.jsonl → Observer/Learn → instincts/*.yaml
  </overview>

  <source_system>
    <repository>everything-claude-code</repository>
    <base_path>skills/continuous-learning-v2/</base_path>
  </source_system>

  <target_system>
    <repository>cc-workflows</repository>
    <base_path>.claude/</base_path>
  </target_system>

  <components>
    <component name="observe.sh" port_type="rewrite">
      <source>skills/continuous-learning-v2/hooks/observe.sh</source>
      <target>.claude/hooks/observe.sh</target>
      <lines>153 → ~80</lines>
      <language>Bash + Python3 → Bash + jq</language>
      <changes>
        - Rewrite 3 python3 blocks to jq:
          - Lines 60-98: JSON parsing for tool input extraction
          - Lines 102-109: Timestamp formatting
          - Lines 124-141: Output truncation logic
        - Change CONFIG_DIR: ~/.claude/homunculus → $CLAUDE_PROJECT_DIR/.claude/learned
        - Change OBSERVATIONS_FILE path accordingly
        - Remove python3 dependency entirely
      </changes>
      <satisfies>FR1, FR2, FR3, NFR1, NFR4</satisfies>
      <hook_registration>
        PreToolUse: matcher "*", command "$CLAUDE_PROJECT_DIR/.claude/hooks/observe.sh pre"
        PostToolUse: matcher "*", command "$CLAUDE_PROJECT_DIR/.claude/hooks/observe.sh post"
      </hook_registration>
    </component>

    <component name="instinct-cli.js" port_type="translation">
      <source>skills/continuous-learning-v2/scripts/instinct-cli.py</source>
      <target>.claude/scripts/instinct-cli.js</target>
      <lines>494</lines>
      <language>Python3 → Node.js</language>
      <changes>
        - Translate argparse → process.argv (status has no args; minimist for Phase 4 if needed)
        - Translate pathlib → path module
        - Translate json module → JSON.parse/stringify
        - Port subcommands:
          - status: Read instincts/*.yaml, display with confidence bars
          - import: Fetch from file/URL, deduplicate, merge higher-confidence
          - export: Strip sensitive data (code, paths, session IDs, old timestamps)
        - Use learning-utils.js for file I/O
        - Export functions for testability (ES modules)
      </changes>
      <testing>Vitest unit tests (*.test.js) + bash E2E test for CLI</testing>
      <satisfies>FR6, FR8, NFR4</satisfies>
    </component>

    <component name="learning-utils.js" port_type="new">
      <source>N/A (inspired by scripts/lib/utils.js)</source>
      <target>.claude/scripts/lib/learning-utils.js</target>
      <lines>~50</lines>
      <language>Node.js</language>
      <changes>
        - Create fresh (don't port 80% unused source utils)
        - Functions:
          - ensureDir(dirPath) — mkdir recursive
          - readFile(filePath) — safe fs.readFileSync
          - writeFile(filePath, content) — writeFileSync with ensureDir
          - appendFile(filePath, content) — appendFileSync with ensureDir
          - findFiles(dir, pattern) — readdirSync + filter
          - log(message) — stderr output
          - output(data) — stdout output (JSON-aware)
        - Export functions for testability (ES modules)
      </changes>
      <testing>Vitest unit tests (*.test.js)</testing>
      <satisfies>Supporting for FR6, FR8</satisfies>
    </component>

    <component name="start-observer.sh" port_type="copy_modify">
      <source>skills/continuous-learning-v2/agents/start-observer.sh</source>
      <target>.claude/scripts/start-observer.sh</target>
      <lines>135</lines>
      <language>Bash</language>
      <changes>
        - Path changes only:
          - ~/.claude/homunculus/ → $CLAUDE_PROJECT_DIR/.claude/learned/
          - PID file: .observer.pid
          - Log file: observer.log
        - Pass $CLAUDE_PROJECT_DIR for project-aware operation
      </changes>
      <satisfies>FR7</satisfies>
    </component>

    <component name="observer.md" port_type="copy_modify">
      <source>skills/continuous-learning-v2/agents/observer.md</source>
      <target>.claude/agents/observer.md</target>
      <lines>138</lines>
      <language>Markdown</language>
      <changes>
        - Path references: ~/.claude/homunculus/ → .claude/learned/
        - No logic changes (agent prompt)
      </changes>
      <satisfies>FR7</satisfies>
    </component>

    <component name="evaluate-session.sh" port_type="rewrite">
      <source>scripts/hooks/evaluate-session.js</source>
      <target>.claude/hooks/evaluate-session.sh</target>
      <lines>79 → ~30</lines>
      <language>Node.js → Bash</language>
      <changes>
        - Rewrite JS to bash (cc-workflows convention)
        - Source imports 5 utils.js functions — all trivial in bash:
          - getLearnedSkillsDir → LEARNED_DIR="$CLAUDE_PROJECT_DIR/.claude/learned"
          - ensureDir → mkdir -p
          - readFile → cat
          - countInFile → wc -l
          - log → echo >&2
        - Core logic: Count observations, log readiness signal if threshold met
      </changes>
      <satisfies>FR7, NFR4</satisfies>
      <hook_registration>
        Stop: matcher "", command "$CLAUDE_PROJECT_DIR/.claude/hooks/evaluate-session.sh"
      </hook_registration>
    </component>


    <component name="instinct-status-skill" port_type="new">
      <source>skills/continuous-learning-v2/slash-commands/instinct-status.md (reference only)</source>
      <target>.claude/skills/instinct-status/SKILL.md</target>
      <lines>~40</lines>
      <language>Markdown</language>
      <changes>
        - Create new skill following cc-workflows SKILL.md pattern
        - Trigger: "/instinct-status" invocation
        - Behavior: Call instinct-cli.js status, format output
      </changes>
      <satisfies>FR6</satisfies>
    </component>

    <component name="evolve-skill" port_type="adapt">
      <source>commands/evolve.md</source>
      <target>.claude/skills/evolve/SKILL.md</target>
      <lines>~80</lines>
      <language>Markdown</language>
      <changes>
        - Adapt slash command to cc-workflows SKILL.md pattern
        - Trigger: "/evolve" invocation
        - Behavior: Call instinct-cli.js evolve, cluster 3+ related instincts
        - Output: Creates skills/commands/agents in .claude/learned/evolved/
      </changes>
      <satisfies>FR9</satisfies>
    </component>

    <component name="config.json" port_type="copy_modify">
      <source>skills/continuous-learning-v2/config.json</source>
      <target>.claude/learned/config.json</target>
      <lines>42</lines>
      <language>JSON</language>
      <changes>
        - All paths: ~/.claude/homunculus/ → relative to .claude/learned/
        - Remove: integration.skill_creator_api (not relevant)
        - Remove: integration.backward_compatible_v1 (no v1 exists)
        - Keep: observer.enabled: false (disabled by default)
        - Keep: observer.min_observations_to_analyze: 20
        - Keep: observation.capture_tools as reference (but observe.sh uses * matcher)
      </changes>
      <satisfies>NFR7</satisfies>
    </component>
  </components>

  <data_schemas>
    <schema name="observation">
      <format>JSONL (one entry per line)</format>
      <location>.claude/learned/observations.jsonl</location>
      <fields>
        - timestamp: ISO 8601 datetime
        - event: "tool_start" | "tool_complete"
        - tool: Tool name (Edit, Write, Bash, Read, etc.)
        - input: Truncated to 5KB max
        - output: Truncated to 5KB max
        - session: Session ID
      </fields>
      <archiving>Auto-archive to observations.archive/ at 10MB</archiving>
    </schema>

    <schema name="instinct">
      <format>YAML with frontmatter</format>
      <location>.claude/learned/instincts/personal/*.yaml</location>
      <fields>
        - id: Unique identifier (slug format)
        - trigger: When to apply this instinct
        - confidence: 0.3 (tentative) → 0.9 (near-certain)
        - domain: code-style | testing | git | workflow | debugging
        - source: "session-observation" | "imported"
        - action: What to do (markdown body)
        - evidence: Supporting observations (markdown body)
      </fields>
      <confidence_scoring>
        - +0.05 per confirming observation
        - -0.10 per contradicting observation (user correction)
        - -0.02 per week without observation (decay)
        - 0.7+ = auto-applied; below = suggested only
      </confidence_scoring>
    </schema>

    <schema name="config">
      <format>JSON</format>
      <location>.claude/learned/config.json</location>
      <sections>
        - observation: enabled, max_file_size_mb, archive_after_days
        - instincts: personal_path, inherited_path, min_confidence, auto_approve_threshold
        - observer: enabled, model, run_interval_minutes, min_observations_to_analyze
        - evolution: cluster_threshold, evolved_path, auto_evolve (future)
      </sections>
    </schema>
  </data_schemas>

  <integration>
    <hook_registration>
      <file>.claude/settings.json</file>
      <additions>
        PreToolUse: Add entry with matcher "*" for observe.sh pre
        PostToolUse: Add entry with matcher "*" for observe.sh post
        Stop: Add entry with matcher "" for evaluate-session.sh
      </additions>
      <note>* matcher creates independent hook group — no conflict with existing matchers</note>
    </hook_registration>

    <directory_structure>
      <path>.claude/learned/</path>
      <contents>
        - observations.jsonl — Tool event captures (append-only)
        - observations.archive/ — Archived observations
        - instincts/personal/ — Auto-learned instincts
        - instincts/inherited/ — Imported instincts
        - evolved/ — Future: clustered instincts (commands/, skills/, agents/)
        - config.json — Learning pipeline settings
        - .observer.pid — Daemon PID file
        - observer.log — Daemon log
      </contents>
      <gitignore>Add .claude/learned/ to .gitignore (personal learning data)</gitignore>
    </directory_structure>

    <path_mapping>
      <entry>
        <source>~/.claude/homunculus/observations.jsonl</source>
        <target>$PROJECT/.claude/learned/observations.jsonl</target>
      </entry>
      <entry>
        <source>~/.claude/homunculus/instincts/personal/</source>
        <target>$PROJECT/.claude/learned/instincts/personal/</target>
      </entry>
      <entry>
        <source>~/.claude/homunculus/instincts/inherited/</source>
        <target>$PROJECT/.claude/learned/instincts/inherited/</target>
      </entry>
      <entry>
        <source>~/.claude/homunculus/evolved/</source>
        <target>$PROJECT/.claude/learned/evolved/</target>
      </entry>
      <entry>
        <source>~/.claude/homunculus/config.json</source>
        <target>$PROJECT/.claude/learned/config.json</target>
      </entry>
      <entry>
        <source>~/.claude/homunculus/.observer.pid</source>
        <target>$PROJECT/.claude/learned/.observer.pid</target>
      </entry>
      <entry>
        <source>~/.claude/homunculus/observer.log</source>
        <target>$PROJECT/.claude/learned/observer.log</target>
      </entry>
      <note>$PROJECT = $CLAUDE_PROJECT_DIR</note>
    </path_mapping>
  </integration>

  <port_type_summary>
    <type name="copy_modify" count="3">
      Components: start-observer.sh, observer.md, config.json
      Changes: Path updates only, no logic changes
    </type>
    <type name="rewrite" count="2">
      Components: observe.sh, evaluate-session.sh
      Changes: Language/tool changes (python→jq, JS→bash), structural rewrite
    </type>
    <type name="translation" count="1">
      Components: instinct-cli.js
      Changes: Language translation (Python→JS), same logic
    </type>
    <type name="adapt" count="1">
      Components: evolve-skill
      Changes: Format change (slash command → skill), same functionality
    </type>
    <type name="new" count="2">
      Components: learning-utils.js, instinct-status-skill
      Changes: New files not in source (or significantly different)
      Note: learn-skill DEFERRED (v1 behavior)
    </type>
  </port_type_summary>

  <implementation_sequence>
    <phase number="1" name="Foundation + Observation Capture">
      <goal>Prove tool capture works without breaking existing hooks or impacting performance</goal>
      <components>
        - config.json (COPY+MODIFY) — foundation for all components
        - observe.sh (REWRITE) — Python→jq, core capture mechanism
        - settings.json updates — hook registration for PreToolUse/PostToolUse
        - .gitignore update — exclude .claude/learned/
      </components>
      <validates>
        - observations.jsonl populates with tool events
        - No performance degradation (&lt;100ms per hook)
        - Existing hooks still fire correctly
      </validates>
      <risk>Medium — observe.sh jq rewrite is highest technical risk. Validate early.</risk>
      <acceptance_criteria>AC1-AC13</acceptance_criteria>
    </phase>

    <phase number="2" name="Observer Daemon">
      <goal>Prove automatic pattern detection creates instincts from observations</goal>
      <components>
        - start-observer.sh (COPY+MODIFY) — daemon lifecycle management
        - observer.md (COPY+MODIFY) — Haiku agent prompt
        - evaluate-session.sh (REWRITE) — JS→Bash, Stop hook cleanup
      </components>
      <validates>
        - Instinct YAML files appear in .claude/learned/instincts/personal/
        - Daemon starts/stops cleanly with PID management
        - Stop hook kills daemon on session end
      </validates>
      <risk>Low — mostly path changes, daemon already proven in source</risk>
      <dependency>Phase 1 (needs observations.jsonl to analyze)</dependency>
      <acceptance_criteria>AC14-AC22</acceptance_criteria>
    </phase>

    <phase number="3" name="Visibility">
      <goal>Users can see learned instincts with confidence bars</goal>
      <components>
        - learning-utils.js (NEW) — JS file I/O utilities
        - instinct-cli.js (TRANSLATE) — Python→JS, status subcommand
        - instinct-status skill (NEW) — /instinct-status entry point
      </components>
      <validates>
        - /instinct-status displays instincts grouped by domain
        - Confidence bars render correctly
        - CLI runs without errors
      </validates>
      <risk>Medium — 494-line Python→JS translation</risk>
      <dependency>Phase 2 (needs instincts to display)</dependency>
      <acceptance_criteria>AC23-AC27</acceptance_criteria>
    </phase>

    <phase number="4" name="Evolution + Portability">
      <goal>Full pipeline — instincts become skills, import/export works</goal>
      <components>
        - instinct-cli.js evolve subcommand
        - instinct-cli.js import/export subcommands
        - evolve skill (ADAPT) — /evolve entry point
      </components>
      <validates>
        - /evolve clusters 3+ related instincts into skills
        - Export strips sensitive data
        - Import deduplicates, merges higher-confidence
      </validates>
      <risk>Low — building on proven CLI from Phase 3</risk>
      <dependency>Phase 3 (extends instinct-cli.js)</dependency>
      <acceptance_criteria>AC28-AC33</acceptance_criteria>
    </phase>

    <dependency_graph>
      config.json
          ↓
      observe.sh ←── settings.json hooks
          ↓
      observations.jsonl
          ↓
      ┌───────────────────────────────┐
      │ start-observer.sh + observer.md │
      │ evaluate-session.sh            │
      └───────────────────────────────┘
          ↓
      instincts/*.yaml
          ↓
      learning-utils.js → instinct-cli.js
                              ↓
                    ┌─────────┴─────────┐
                    ↓                   ↓
          instinct-status skill    evolve skill
    </dependency_graph>
  </implementation_sequence>

  <acceptance_criteria>
    <note>Formalized ACs with block anchors for traceability. Each AC links to FR from PRD.</note>

    <phase number="1" name="Foundation + Observation Capture">
      - AC1: PreToolUse hook captures tool name, input, session ID as JSONL entries appended to .claude/learned/observations.jsonl (FR1) ^AC1
      - AC2: PostToolUse hook captures tool name, output, timestamp as JSONL entries appended to .claude/learned/observations.jsonl (FR1) ^AC2
      - AC3: ALL tools captured via * matcher — analysis phase decides relevance (FR1) ^AC3
      - AC4: Observation inputs/outputs truncated to 5KB max per entry (FR2) ^AC4
      - AC5: Auto-archive observations.jsonl to .claude/learned/observations.archive/ when file exceeds 10MB (FR2) ^AC5
      - AC6: No data loss during archive operation (NFR2) ^AC6
      - AC7: observe.sh registered in .claude/settings.json PreToolUse and PostToolUse arrays (FR3) ^AC7
      - AC8: Existing hooks (citation-validator, plan-path-sync, etc.) continue to fire correctly (FR3) ^AC8
      - AC9: Observation hooks complete in under 100ms (NFR1) ^AC9
      - AC10: Append-only writes for observations — no in-place modification (NFR2) ^AC10
      - AC11: Observation hook written in bash with jq (no python3) (NFR4) ^AC11
      - AC12: All learned data stored in .claude/learned/ (not global ~/.claude/) (NFR5) ^AC12
      - AC13: config.json in .claude/learned/ for all configurable parameters (NFR7) ^AC13
    </phase>

    <phase number="2" name="Observer Daemon">
      - AC14: Observer daemon analyzes observations at configurable interval using Haiku model (FR7) ^AC14
      - AC15: Detects four pattern types: user corrections, error resolutions, repeated workflows (3+), tool preferences (FR7) ^AC15
      - AC16: System signals daemon via SIGUSR1 when new observations written (FR7) ^AC16
      - AC17: Daemon starts/stops cleanly with PID file management (FR7) ^AC17
      - AC18: Stop hook kills daemon (FR7) ^AC18
      - AC19: Disabled by default, opt-in via config (FR7) ^AC19
      - AC20: Instincts stored in YAML format with required fields: id, trigger, confidence, domain, source, action, evidence (FR5) ^AC20
      - AC21: Confidence scoring: +0.05 per confirming observation, -0.10 per contradiction, -0.02 per week decay (FR5) ^AC21
      - AC22: Confidence ≥ 0.7 = auto-applied; below = suggested only (FR5) ^AC22
    </phase>

    <phase number="3" name="Visibility">
      - AC23: /instinct-status skill displays all instincts grouped by domain (FR6) ^AC23
      - AC24: Visual confidence bars shown for each instinct (FR6) ^AC24
      - AC25: Instinct CLI (JS) supports status subcommand (FR6) ^AC25
      - AC26: Instinct CLI written in JavaScript (avoid Python dependency) (NFR4) ^AC26
      - AC27: All hook scripts located in .claude/hooks/ (NFR4) ^AC27
    </phase>

    <phase number="4" name="Evolution + Portability">
      - AC28: Instinct CLI supports import and export subcommands (FR8) ^AC28
      - AC29: Import detects duplicates, updates only if higher-confidence version found (FR8) ^AC29
      - AC30: Export strips sensitive data: code, file paths, session IDs, timestamps older than 1 week (FR8) ^AC30
      - AC31: /evolve skill clusters 3+ related instincts into discoverable skills (FR9) ^AC31
      - AC32: Generated skills placed in .claude/learned/evolved/skills/ (FR9) ^AC32
      - AC33: Evolved skills auto-discoverable by Claude via standard skill discovery (FR9) ^AC33
    </phase>
  </acceptance_criteria>

  <risks>
    <note>Risks organized by implementation phase for targeted mitigation</note>

    <phase number="1" severity="Medium">
      <risk>
        <description>observe.sh jq rewrite introduces parsing bugs</description>
        <mitigation>Simple JSON ops; test with real Claude hook JSON format</mitigation>
      </risk>
      <risk>
        <description>Hook performance with * matcher on every tool call</description>
        <mitigation>jq is fast; append-only write; profile after integration</mitigation>
      </risk>
      <risk severity="Low">
        <description>.claude/learned/ not in .gitignore</description>
        <mitigation>Add to .gitignore during implementation</mitigation>
      </risk>
    </phase>

    <phase number="2" severity="Low">
      <risk>
        <description>Observer daemon orphaned processes</description>
        <mitigation>PID file management; evaluate-session.sh cleanup on Stop hook</mitigation>
      </risk>
    </phase>

    <phase number="3" severity="Medium">
      <risk>
        <description>instinct-cli.py → JS translation bugs (494 lines)</description>
        <mitigation>Port function-by-function with test validation; manageable scope</mitigation>
      </risk>
    </phase>

    <phase number="4" severity="Low">
      <risk>
        <description>Evolution features building on Phase 3 CLI</description>
        <mitigation>Incremental extension of proven Phase 3 implementation</mitigation>
      </risk>
    </phase>
  </risks>
</project_specification>
```
