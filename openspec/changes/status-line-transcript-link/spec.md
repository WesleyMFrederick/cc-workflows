```xml
<patch_specification>
  <patch_name>status-line-transcript-link</patch_name>

  <overview>
    Patch the status line script to (1) auto-copy the session transcript to the project directory,
    and (2) make the session ID in the status bar a clickable OSC 8 hyperlink pointing to that local copy.
    No new files, no new dependencies — edits to one shell script plus a .gitignore entry.
  </overview>

  <artifacts>
    <primary_target>~/.claude/scripts/status-line/statusline-script.sh</primary_target>
    <secondary_target>{project_dir}/.gitignore</secondary_target>
    <new_directory>{project_dir}/claude-code-transcripts/</new_directory>
    <context>
      <!-- Dev agent MUST read these before implementing -->
      <file role="baseline_trace">../baseline.md</file>
      <file role="ideal_trace">../ideal.md</file>
      <file role="delta">../delta.md</file>
    </context>
  </artifacts>

  <!-- ═══════════════════════════════════════════════════════ -->
  <!-- INTERFACE BOUNDARIES                                    -->
  <!-- Tech lead sketches the seams. Dev agent fleshes out.    -->
  <!-- ═══════════════════════════════════════════════════════ -->

  <interface_boundaries>
    <description>
      Logical blocks to add or modify in statusline-script.sh.
      These are shell functions or inline blocks — not necessarily named functions.
      The spec defines inputs, outputs, and placement. The dev agent writes the body.
    </description>

    <boundary id="B1" type="extract" location="baseline step 5 (field extraction block)">
      <name>extract_transcript_path</name>
      <in>$input (JSON blob from stdin)</in>
      <out>$transcript_path (string, path to JSONL file, or empty)</out>
      <pattern>Same jq pattern as existing extractions: .transcript_path // ""</pattern>
    </boundary>

    <boundary id="B2" type="new_block" location="after baseline step 11 (active task), before output assembly">
      <name>copy_transcript</name>
      <in>$transcript_path, $project_dir, $session_id</in>
      <out>$dest_file (string, path to local copy — used by B3 for hyperlink)</out>
      <constraints>
        - Guard: skip if $transcript_path empty or file doesn't exist
        - mkdir -p for dest dir (idempotent)
        - Timestamp guard: only cp when source -nt dest
        - Must complete in &lt;10ms for typical transcript (&lt;500KB)
      </constraints>
    </boundary>

    <boundary id="B3" type="modify" location="baseline step 12 (output assembly, session ID segment)">
      <name>wrap_session_id_osc8</name>
      <in>$session_id, $dest_file</in>
      <out>OSC 8 escaped string: \e]8;;file://${dest_file}\a🔑 ${session_id}\e]8;;\a</out>
      <constraints>
        - Display text unchanged (🔑 UUID)
        - Only wrap when $dest_file is non-empty (fallback to plain text)
      </constraints>
    </boundary>

    <boundary id="B4" type="modify" location="baseline step 13 (final printf)">
      <name>printf_format_switch</name>
      <in>$final_output (string containing OSC 8 escapes)</in>
      <out>stdout (rendered escape sequences)</out>
      <change>printf "%s" → printf '%b'</change>
      <risk>Audit all variables in $final_output for unintended backslash sequences</risk>
    </boundary>

    <boundary id="B5" type="new_block" location="within B2 or as separate block">
      <name>ensure_gitignore_entry</name>
      <in>$project_dir</in>
      <out>void (side effect: appends claude-code-transcripts/ to .gitignore if not present)</out>
      <constraints>
        - Idempotent: grep before append
        - Only touch .gitignore if it exists (don't create one)
      </constraints>
    </boundary>
  </interface_boundaries>

  <!-- ═══════════════════════════════════════════════════════ -->
  <!-- TEST CONTRACT                                           -->
  <!-- ═══════════════════════════════════════════════════════ -->

  <test_contract>
    <description>
      Single end-to-end test that verifies all observable outcomes of the patch.
      This test serves as BOTH the dev agent's TDD target AND the code reviewer's acceptance gate.
    </description>

    <fixtures>
      <fixture name="input_json">
        JSON blob mimicking Claude Code's status line input. Must include:
        - .model.display_name: "TestModel"
        - .workspace.current_dir: "{tmp_dir}/project"
        - .workspace.project_dir: "{tmp_dir}/project"
        - .session_id: "test-session-abc123"
        - .transcript_path: "{tmp_dir}/transcript-source.jsonl"
      </fixture>
      <fixture name="source_transcript">
        A small JSONL file (3-5 lines) at {tmp_dir}/transcript-source.jsonl.
        Content doesn't matter — only existence and byte-for-byte copy fidelity.
      </fixture>
      <fixture name="project_dir">
        A temp directory at {tmp_dir}/project/ with a git repo initialized
        (the script calls git commands). Must have a .gitignore file.
      </fixture>
    </fixtures>

    <assertions>
      <assertion id="A1" name="transcript_copied" boundary="B2">
        File exists: {tmp_dir}/project/claude-code-transcripts/test-session-abc123.jsonl
        Content matches source: diff returns 0
      </assertion>
      <assertion id="A2" name="osc8_hyperlink_in_output" boundary="B3,B4">
        stdout contains the OSC 8 escape sequence wrapping the session ID:
        \e]8;;file://{tmp_dir}/project/claude-code-transcripts/test-session-abc123.jsonl\a
        followed by the session ID text, followed by \e]8;;\a
      </assertion>
      <assertion id="A3" name="gitignore_entry" boundary="B5">
        {tmp_dir}/project/.gitignore contains the line: claude-code-transcripts/
      </assertion>
    </assertions>

    <negative_assertions>
      <assertion id="N1" name="no_copy_when_unchanged" boundary="B2">
        When script runs a second time without modifying the source transcript,
        the dest file's mtime does NOT change (timestamp guard prevents redundant cp).
      </assertion>
    </negative_assertions>
  </test_contract>

  <!-- ═══════════════════════════════════════════════════════ -->
  <!-- TASKS                                                    -->
  <!-- Each task = one TodoList item, ends with a commit.       -->
  <!-- ═══════════════════════════════════════════════════════ -->

  <task id="1" name="Implement transcript link patch" agent="dev_agent">
    <description>
      Write tests and implement boundaries B1-B5. Ends with a commit.
    </description>

    <step number="1" phase="RED">
      <title>Write end-to-end test</title>
      <scope>
        - Create test script that sets up fixtures (tmp dir, git repo, source JSONL, input JSON)
        - Pipe input JSON to statusline-script.sh, capture stdout
        - Assert A1 (transcript copied), A2 (OSC 8 in output), A3 (gitignore entry), N1 (no redundant copy)
        - Run test — expect FAIL on A1, A2, A3
      </scope>
    </step>

    <step number="2" phase="GREEN">
      <title>Implement boundaries B1-B5</title>
      <scope>
        - Implement each boundary per interface_boundaries section
        - Read baseline.md for exact line numbers and insertion points
        - Run test — expect PASS on all assertions
      </scope>
    </step>

    <step number="3" phase="COMMIT">
      <title>Commit test + implementation</title>
    </step>
  </task>

  <task id="2" name="Review transcript link patch" agent="reviewer" blocked_by="1">
    <description>
      Review the commit from task 1 against this spec's contract.
    </description>

    <inputs>
      <input name="patch_spec">This file (patch-spec.md)</input>
      <input name="test_file">Path to the test script created in task 1</input>
      <input name="commit_range">BASE_SHA..HEAD_SHA of the task 1 commit</input>
      <input name="script_path">~/.claude/scripts/status-line/statusline-script.sh</input>
    </inputs>

    <checklist>
      - [ ] All 4 assertions (A1, A2, A3, N1) pass when test is executed
      - [ ] git diff shows changes ONLY to statusline-script.sh (no unrelated modifications)
      - [ ] Each boundary (B1-B5) is implemented at the correct location per interface_boundaries
      - [ ] No items from delta's Scope Boundary section were violated
      - [ ] Risk mitigations from delta are addressed (printf '%b' escape audit, tmux fallback consideration)
    </checklist>

    <verdict>APPROVED | FIX_REQUIRED</verdict>
    <on_fix_required>Dev agent fixes → re-commits → re-review (max 2 cycles)</on_fix_required>
    <on_escalation>Same issue fails 2x → escalate to stronger model</on_escalation>
  </task>

  <!-- ═══════════════════════════════════════════════════════ -->
  <!-- SUCCESS CRITERIA                                        -->
  <!-- ═══════════════════════════════════════════════════════ -->

  <success_criteria>
    <pass>All assertions (A1, A2, A3, N1) pass. Reviewer verdict: APPROVED.</pass>
    <fail>Any assertion fails, or reviewer finds scope violation.</fail>
  </success_criteria>
</patch_specification>
```
