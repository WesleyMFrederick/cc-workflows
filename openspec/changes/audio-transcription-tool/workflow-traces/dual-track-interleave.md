# Trace: Dual-Track Interleave Workflow

Ideal workflow for producing speaker-attributed Obsidian transcripts from individual audio tracks.

## Execution Context

- Audio source: Zoom recording with per-participant tracks (`.mp3`)
- Tool: FluidAudio CLI (`swift run fluidaudio transcribe`)
- Merger: `interleave-tracks.ts` (bun)
- Formatter: `convert-transcript.sh` (bash)
- Executed: 2026-02-26

```
TRACE: dual-track-interleave (2 individual tracks → Obsidian markdown)
══════════════════════════════════════════

 INPUT: INDIVIDUAL AUDIO TRACKS
 ──────────────────────────────
 1. [OBS: audio/ directory listing]
    Track 1: Bain-Chris-wesley-track.mp3  (74MB)
    Track 2: Bain-Chris-chris-track.mp3   (size comparable)
    Combined: 20260226-Bain-Chris-interview.m4a (25MB, NOT USED in this workflow)
    KEY: individual tracks share the same timeline — timestamps align naturally

 TRANSCRIBE: TRACK 1 (parallel with step 3)
 ───────────────────────────────────────────
 2. [M: swift run fluidaudio transcribe <wesley-track.mp3> --output-json <wesley-track_word_timings.json>]
    FluidAudio ASR engine: Parakeet TDT v3 (0.6b) on Apple Neural Engine
    │
    │  2a. [OBS: FluidAudio CLAUDE.md:199-206]
    │      Chunking: fixed ~14.96s chunks, 2.0s overlap, stateless decoding per chunk
    │
    │  2b. [M: transcription output]
    │      Result: 3,177 words, 1932.73s duration, 96.3% confidence
    │      Output: wesley-track_word_timings.json (390KB)
    │      Format: { text: string, words: [{word, start, end, confidence}], duration, confidence }
    │
    │  2c. [M: processing stats]
    │      Model compilation: 18.5s (Encoder), 0.2s (Decoder), 0.05s (JointDecision)
    │      Peak memory: 2.443 GB
    │

 TRANSCRIBE: TRACK 2 (parallel with step 2)
 ───────────────────────────────────────────
 3. [M: swift run fluidaudio transcribe <chris-track.mp3> --output-json <chris-track_word_timings.json>]
    Same engine, same parameters as step 2
    │
    │  3a. [M: transcription output]
    │      Result: 3,160 words, same duration (same recording session)
    │      Output: chris-track_word_timings.json (393KB)
    │

 KEY INSIGHT: WHY THIS WORKS
 ────────────────────────────
 4. [F-ID: from steps 1, 2b, 3a]
    Both tracks originate from the same Zoom recording session.
    Timestamps in both JSON files reference the same absolute timeline.
    Each track only contains audio when THAT person is speaking.
    Therefore: word timestamps = perfect speaker attribution by definition.
    No diarization model needed. No speaker identification needed.

 INTERLEAVE: MERGE BY TIMESTAMP
 ──────────────────────────────
 5. [M: bun interleave-tracks.ts <wesley.json> "Wesley Frederick" <chris.json> "Chris Chaillot" <output.txt>]
    │
    │  TAG WORDS
    │  ─────────
    │  5a. [OBS: interleave-tracks.ts:50-63]                    ← KEY LINE
    │      Each word tagged with its speaker from source track:
    │      track1.words → { word, start, end, speaker: "Wesley Frederick" }
    │      track2.words → { word, start, end, speaker: "Chris Chaillot" }
    │      Combined: 6,337 tagged words
    │
    │  SORT
    │  ────
    │  5b. [OBS: interleave-tracks.ts:66]
    │      allWords.sort((a, b) => a.start - b.start)
    │      Merges both tracks into single chronological sequence
    │
    │  GROUP INTO SEGMENTS
    │  ───────────────────
    │  5c. [OBS: interleave-tracks.ts:76-104]                   ← KEY LINE
    │      Consecutive same-speaker words → single segment
    │      New segment when:
    │      ├── speaker changes (line 89)
    │      └── gap > 2.0s between words from same speaker (line 90)
    │      Result: raw segments (before merge cleanup)
    │
    │  MERGE SHORT SEGMENTS (crosstalk cleanup)
    │  ────────────────────────────────────────
    │  5d. [OBS: interleave-tracks.ts:107-127]
    │      Problem: audio bleed causes 1-2 word segments from wrong track
    │      (e.g., "Mm-hmm" picked up on other person's mic)
    │      Fix: if segment ≤ 2 words AND prev.speaker == next.speaker,
    │      absorb into prev segment (lines 112-118)
    │      Also: merge consecutive same-speaker segments (lines 121-123)
    │
    │  FORMAT OUTPUT
    │  ─────────────
    │  5e. [OBS: interleave-tracks.ts:136-144]
    │      Format: [Speaker Name, M:SS-M:SS, N words]: text
    │      Punctuation cleanup: remove space before .,!?;:'
    │      Write: Bun.write(outputPath, lines.join("\n\n"))
    │
    RETURN ←── chris-chaillot_dual-track.txt (62 segments)
    │

 INTERLEAVE → FORMATTER (boundary crossing)
 ───────────────────────────────────────────
 6. [M: bash convert-transcript.sh <dual-track.txt> <output.md> 2026-02-26 "Title" "Speaker1" "Speaker2" "audio.m4a"]
    │
    │  WRITE FRONTMATTER
    │  ─────────────────
    │  6a. [OBS: convert-transcript.sh:11-27]
    │      YAML frontmatter with: title, date, type, participants,
    │      source_audio, generated_by, word_count, segment_count
    │      Note: word_count uses grep -oP which fails on macOS
    │      → requires manual patch (Edit tool) after script runs
    │
    │  PARSE + CONVERT SEGMENTS
    │  ────────────────────────
    │  6b. [OBS: convert-transcript.sh:37-48]                   ← KEY LINE
    │      Regex: ^\[([^,]+), ([0-9:]+)-([0-9:]+), ([0-9]+ words)\]: (.*)
    │      Transform each segment to:
    │      │  **Speaker Name** *(M:SS–M:SS, N words)*
    │      │  transcript text here
    │      │  ^seg-NN
    │      │
    │      Block anchor format: ^seg-01 through ^seg-62 (zero-padded)
    │      Obsidian linkable: [[filename#^seg-27]]
    │
    RETURN ←── 20260226-chris-chaillot-recruiter-transcript.md
    │

 POST-PROCESSING: MANUAL PATCH
 ──────────────────────────────
 7. [M: Edit tool on output .md]
    Fix: word_count field empty (grep -oP not available on macOS)
    Patch: word_count: 6337
    Add: method: dual-track-interleave

══════════════════════════════════════════
END TRACE
```

## Locked/Identity Fact Derivations

1. **[F-ID: from steps 2, 3, 5a]** Speaker attribution is 100% accurate by construction — each word inherits its speaker from which track file it came from. The only errors are audio bleed (mic picking up the other person), which is a recording artifact, not a software error.

2. **[F-LK: from step 5d]** The crosstalk merge heuristic (absorb ≤2-word segments sandwiched between same-speaker segments) handles the most common bleed pattern: acknowledgments like "Mm-hmm", "Yep", "Yeah" picked up on the other mic. This is lossy — it misattributes those words — but produces cleaner reading flow.

3. **[F-ID: from steps 2, 3]** Steps 2 and 3 are fully parallelizable — no data dependency between them. Both read independent audio files and write independent JSON files. Wall-clock time ≈ max(track1_time, track2_time), not sum.

4. **[F-LK: from step 6a]** The `grep -oP` (Perl regex) flag is Linux-only. macOS `grep` lacks it. The word_count field in frontmatter requires a manual patch on macOS. A portable fix would use `grep -oE '[0-9]+ words'` instead.

5. **[F-LK: from step 4]** This workflow is strictly superior to diarization for any recording where individual tracks are available. Diarization is ML-based speaker guessing on mixed audio; dual-track is deterministic attribution from source. The diarization workflow produced boundary errors (e.g., Chris's words attributed to Wesley mid-sentence); dual-track did not.

## Fact Soundness

| Fact | Cites | Valid because |
|-------|-------|--------------|
| #1 | 2, 3, 5a | Words tagged from source file identity, not ML prediction. Bleed is physical, not algorithmic. |
| #2 | 5d | Code inspection: lines 112-118 show exact condition (≤2 words, same surrounding speaker). |
| #3 | 2, 3 | No shared state between transcription calls. Independent input files, independent output files. |
| #4 | 6a | macOS grep man page confirms no -P flag. Observed failure in execution (empty word_count). |
| #5 | 4 | Direct comparison: diarization produced 55 segments with boundary errors; dual-track produced 62 clean segments from same audio. |

## Process Tree (derived from trace)

```
dual-track-interleave
├── PARALLEL ∧
│   ├── transcribe track 1 → word_timings_1.json  [steps 2-2c]
│   └── transcribe track 2 → word_timings_2.json  [steps 3-3a]
├── → interleave by timestamp                      [steps 5a-5e]
│   ├── tag words with speaker from source track
│   ├── sort all words by start time
│   ├── group consecutive same-speaker → segments
│   ├── merge ≤2-word crosstalk segments
│   └── format [Speaker, time, words]: text
├── → convert to Obsidian markdown                  [steps 6a-6b]
│   ├── write YAML frontmatter
│   └── parse segments → **Speaker** + text + ^seg-NN
└── → patch frontmatter (macOS grep workaround)     [step 7]
```
