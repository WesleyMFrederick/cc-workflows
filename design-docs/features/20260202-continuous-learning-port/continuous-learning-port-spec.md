# Continuous Learning Port — Specification

**Feature**: Port Continuous Learning from everything-claude-code to cc-workflows
**Phase**: 2 (Design)
**Status**: Draft

> **Context:**
> - [PRD](continuous-learning-port-prd.md)
> - [Phase 1 Whiteboard](1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md)
> - [Phase 2 Design Whiteboard](2-design-phase/phase2-design-whiteboard.md)

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
        - Translate argparse → process.argv parsing (or minimist)
        - Translate pathlib → path module
        - Translate json module → JSON.parse/stringify
        - Port subcommands:
          - status: Read instincts/*.yaml, display with confidence bars
          - import: Fetch from file/URL, deduplicate, merge higher-confidence
          - export: Strip sensitive data (code, paths, session IDs, old timestamps)
        - Use learning-utils.js for file I/O
      </changes>
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
      </changes>
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

    <component name="learn-skill" port_type="new">
      <source>skills/continuous-learning-v2/slash-commands/learn.md (reference only)</source>
      <target>.claude/skills/learn/SKILL.md</target>
      <lines>~60</lines>
      <language>Markdown</language>
      <changes>
        - Create new skill following cc-workflows SKILL.md pattern
        - Trigger: "/learn" invocation
        - Behavior: Analyze session transcript, propose instincts, save with approval
        - Output path: .claude/learned/instincts/personal/
      </changes>
      <satisfies>FR4, FR5</satisfies>
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
    <type name="new" count="3">
      Components: learning-utils.js, learn-skill, instinct-status-skill
      Changes: New files not in source (or significantly different)
    </type>
  </port_type_summary>

  <acceptance_criteria>
    <section name="Observation Capture" fr="FR1">
      - AC1: PreToolUse hook captures tool name, input, session ID as JSONL
      - AC2: PostToolUse hook captures tool name, output, timestamp as JSONL
      - AC3: ALL tools captured via * matcher (analysis phase decides relevance)
      - AC4: Inputs/outputs truncated to 5KB max per entry
    </section>

    <section name="Storage Management" fr="FR2">
      - AC5: Auto-archive observations.jsonl at 10MB threshold
      - AC6: No data loss during archive operation
    </section>

    <section name="Hook Integration" fr="FR3">
      - AC7: observe.sh registered in settings.json PreToolUse/PostToolUse
      - AC8: Existing hooks continue to fire correctly
    </section>

    <section name="Pattern Extraction" fr="FR4">
      - AC9: /learn skill analyzes session transcript
      - AC10: Creates instinct YAML with user approval
    </section>

    <section name="Instinct Persistence" fr="FR5">
      - AC11: YAML format with required fields
      - AC12: Confidence scoring per source system values
      - AC13: 0.7+ auto-applied, below suggested only
    </section>

    <section name="Instinct Visibility" fr="FR6">
      - AC14: /instinct-status displays instincts by domain
      - AC15: Visual confidence bars shown
    </section>

    <section name="Background Pattern Detection" fr="FR7">
      - AC16: Observer daemon analyzes at configurable interval
      - AC17: Detects 4 pattern types
      - AC18: SIGUSR1 signaling for new observations
      - AC19: Clean start/stop with PID management
      - AC20: Stop hook kills daemon
      - AC21: Disabled by default
    </section>

    <section name="Instinct Portability" fr="FR8">
      - AC22: CLI supports status, import, export
      - AC23: Import deduplicates, merges higher-confidence
      - AC24: Export strips sensitive data
    </section>

    <section name="Performance" nfr="NFR1">
      - AC25: Observation hooks complete in under 100ms
    </section>

    <section name="Data Integrity" nfr="NFR2">
      - AC26: Append-only writes for observations
    </section>

    <section name="Convention Compliance" nfr="NFR4">
      - AC27: Observation hook in bash with jq
      - AC28: Instinct CLI in JavaScript
      - AC29: All hooks in .claude/hooks/
    </section>

    <section name="Per-Project Scoping" nfr="NFR5">
      - AC30: All data in .claude/learned/ (not global)
    </section>

    <section name="Translation Risk" nfr="NFR6">
      - AC31: observe.sh python→jq rewrite (low risk)
      - AC32: Python CLI→JS is only language translation
    </section>

    <section name="Configuration" nfr="NFR7">
      - AC33: config.json in .claude/learned/
    </section>
  </acceptance_criteria>

  <risks>
    <risk severity="Medium">
      <description>observe.sh jq rewrite introduces parsing bugs</description>
      <mitigation>Simple JSON ops; test with real Claude hook JSON format</mitigation>
    </risk>
    <risk severity="Medium">
      <description>Hook performance with * matcher on every tool</description>
      <mitigation>jq is fast; append-only write; profile after integration</mitigation>
    </risk>
    <risk severity="Medium">
      <description>instinct-cli.py → JS translation bugs</description>
      <mitigation>Port function-by-function; 494 lines manageable</mitigation>
    </risk>
    <risk severity="Low">
      <description>Observer daemon orphaned processes</description>
      <mitigation>PID file management; evaluate-session.sh cleanup on Stop</mitigation>
    </risk>
    <risk severity="Low">
      <description>.claude/learned/ not in .gitignore</description>
      <mitigation>Add to .gitignore during implementation</mitigation>
    </risk>
  </risks>
</project_specification>
```
