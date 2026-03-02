# General Workflow Template: Speaker-Labeled Transcripts with Name Mapping

This document provides a reusable workflow template for processing any audio file to generate speaker-labeled transcripts with custom speaker names.

## Overview

This workflow generates speaker-labeled transcripts in 5 steps:
1. Speaker diarization (who spoke when)
2. Word-level transcription
3. Merge diarization and transcription
4. **First run only**: Identify speaker IDs
5. Rename speakers using custom mapping

## One-Time Setup per Audio File

Create a speaker configuration file for your audio:

```bash
cp speaker-config.example.json <audio-name>-config.json
```

Edit `<audio-name>-config.json` after the first run to map speaker IDs to real names.

## Processing Steps

Replace `<audio-file>`, `<name>`, and `<output-dir>` with your specific values.

### Step 1: Generate Diarization

```bash
cd FluidAudio

swift run fluidaudio process <audio-file> \
  --output <output-dir>/<name>_diarization.json
```

**Options**:
- `--threshold <value>`: Clustering threshold (0.0-1.0, default: 0.7)
  - Lower (0.6): Detect more speakers (may over-segment)
  - Higher (0.8): Merge similar speakers (may under-segment)

**Output**: `<output-dir>/<name>_diarization.json`

### Step 2: Generate Word-Level Transcription

```bash
swift run fluidaudio transcribe <audio-file> \
  --output-json <output-dir>/<name>_word_timings.json
```

**Options**:
- `--config <type>`: Configuration type (default, low-latency, high-accuracy)
- `--model-version <version>`: ASR model version (v2, v3)

**Output**: `<output-dir>/<name>_word_timings.json`

### Step 3: Merge Diarization and Transcription

```bash
cd ..

bun FluidAudio/merge-speakers-v2.ts \
  <output-dir>/<name>_diarization.json \
  <output-dir>/<name>_word_timings.json \
  <output-dir>/<name>_generic.txt
```

**Output**: `<output-dir>/<name>_generic.txt` (with generic speaker IDs)

Example:
```
[Speaker 1, 0:08-0:38, 47 words]: Hello...
[Speaker 2, 0:40-1:15, 65 words]: Thanks...
```

### Step 4: Identify Speakers (First Run Only)

Review the generic transcript to identify speaker IDs:

```bash
cat <output-dir>/<name>_generic.txt | head -20
```

Edit `<audio-name>-config.json` to map speaker IDs to names:

```json
{
  "1": "John Doe",
  "2": "Jane Smith",
  "3": "Bob Johnson",
  "default": "Audience"
}
```

**Notes**:
- Map known speakers explicitly (keys "1", "2", "3", etc.)
- Use `"default"` for unmapped speakers (audience, unknown participants)
- The `"default"` key is required

### Step 5: Rename Speakers

```bash
bun FluidAudio/rename-speakers.ts \
  <output-dir>/<name>_generic.txt \
  <audio-name>-config.json \
  <output-dir>/<name>_final.txt
```

**Output**: `<output-dir>/<name>_final.txt` (with custom speaker names)

Example:
```
[John Doe, 0:08-0:38, 47 words]: Hello...
[Jane Smith, 0:40-1:15, 65 words]: Thanks...
[Audience, 1:17-1:45, 28 words]: Question... Another question...
```

### View Final Result

```bash
cat <output-dir>/<name>_final.txt
```

## Complete Example

Process a meeting recording called `team-meeting.m4a`:

```bash
# Setup
mkdir -p output
cp speaker-config.example.json team-meeting-config.json

# Step 1: Diarization
cd FluidAudio
swift run fluidaudio process ../team-meeting.m4a \
  --output ../output/team-meeting_diarization.json \
  --threshold 0.7

# Step 2: Transcription
swift run fluidaudio transcribe ../team-meeting.m4a \
  --output-json ../output/team-meeting_word_timings.json

# Step 3: Merge
cd ..
bun FluidAudio/merge-speakers-v2.ts \
  output/team-meeting_diarization.json \
  output/team-meeting_word_timings.json \
  output/team-meeting_generic.txt

# Step 4: Review and edit team-meeting-config.json
cat output/team-meeting_generic.txt | head -20

# Edit team-meeting-config.json:
# {
#   "1": "Alice (Manager)",
#   "2": "Bob (Engineer)",
#   "3": "Carol (Designer)",
#   "default": "Team Member"
# }

# Step 5: Rename
bun FluidAudio/rename-speakers.ts \
  output/team-meeting_generic.txt \
  team-meeting-config.json \
  output/team-meeting_final.txt

# View result
cat output/team-meeting_final.txt
```

## Automation Script Template

Save this as `process-audio.sh`:

```bash
#!/bin/bash
# Usage: ./process-audio.sh <audio-file> <output-name>

if [ $# -ne 2 ]; then
  echo "Usage: $0 <audio-file> <output-name>"
  echo "Example: $0 meeting.m4a team-meeting"
  exit 1
fi

AUDIO_FILE=$1
NAME=$2
OUTPUT_DIR="output"
CONFIG_FILE="${NAME}-config.json"

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Step 1: Diarization
cd FluidAudio
swift run fluidaudio process "../$AUDIO_FILE" \
  --output "../$OUTPUT_DIR/${NAME}_diarization.json"

# Step 2: Transcription
swift run fluidaudio transcribe "../$AUDIO_FILE" \
  --output-json "../$OUTPUT_DIR/${NAME}_word_timings.json"

# Step 3: Merge
cd ..
bun FluidAudio/merge-speakers-v2.ts \
  "$OUTPUT_DIR/${NAME}_diarization.json" \
  "$OUTPUT_DIR/${NAME}_word_timings.json" \
  "$OUTPUT_DIR/${NAME}_generic.txt"

echo "========================"
echo "Generic transcript created: $OUTPUT_DIR/${NAME}_generic.txt"
echo ""
echo "Next steps:"
echo "1. Review the transcript: cat $OUTPUT_DIR/${NAME}_generic.txt"
echo "2. Create/edit $CONFIG_FILE to map speaker IDs"
echo "3. Run: bun FluidAudio/rename-speakers.ts $OUTPUT_DIR/${NAME}_generic.txt $CONFIG_FILE $OUTPUT_DIR/${NAME}_final.txt"
echo "========================"
```

Make it executable:
```bash
chmod +x process-audio.sh
```

Run it:
```bash
./process-audio.sh meeting.m4a team-meeting
```

## Subsequent Runs

If you need to re-process the same audio file:

1. Run steps 1-3 to regenerate the generic transcript
2. Reuse your existing `<audio-name>-config.json`
3. Run step 5 to rename speakers

No need to identify speakers again - your config is reusable.

## Speaker Config Best Practices

### Simple Scenario (2-3 Known Speakers)

```json
{
  "1": "Host",
  "2": "Guest",
  "default": "Unknown"
}
```

### Multi-Speaker Meeting

```json
{
  "1": "Alice (CEO)",
  "2": "Bob (CTO)",
  "3": "Carol (CFO)",
  "4": "Dave (VP Engineering)",
  "default": "Team Member"
}
```

### Interview with Audience Questions

```json
{
  "1": "Interviewer",
  "2": "Interviewee",
  "default": "Audience"
}
```

### Panel Discussion

```json
{
  "1": "Moderator",
  "2": "Panelist 1",
  "3": "Panelist 2",
  "4": "Panelist 3",
  "default": "Audience"
}
```

## Tips and Tricks

### Diarization Quality

- **Too many speakers detected**: Increase threshold (`--threshold 0.8`)
- **Speakers merged incorrectly**: Decrease threshold (`--threshold 0.6`)
- **Optimal range**: 0.6-0.8 for most audio

### Speaker Identification

1. Read the first 5-10 segments of the generic transcript
2. Look for speaker introductions or distinctive speaking patterns
3. Cross-reference with audio if needed
4. Update config file with mappings

### Segment Merging

The rename script automatically merges consecutive segments from the same speaker within 2 seconds. This is especially useful for:
- Audience Q&A (multiple questions merged into "Audience")
- Interrupted speech (speaker resumes after brief pause)
- Technical glitches (brief silence in audio)

### Output Formats

**Current output** (human-readable):
```
[Speaker Name, 0:08-0:38, 47 words]: text...
```

**Custom formatting**: Edit `rename-speakers.ts` to change output format or export to JSON, CSV, etc.

## Troubleshooting

### Low Coverage (<80%)

Check the merge statistics. Low coverage may indicate:
- Long silence periods in audio
- Gaps in diarization
- Audio quality issues

### Misattributed Segments

If speakers are frequently wrong:
1. Adjust diarization threshold
2. Review audio quality (background noise affects diarization)
3. Check if speakers have similar voices (may require manual correction)

### Missing Speakers

If diarization doesn't detect all speakers:
1. Lower threshold: `--threshold 0.6`
2. Verify audio has distinct speakers (not overlapping speech)
3. Check for audio preprocessing issues

### Script Errors

**Config file not found**:
```
Error loading config file: <name>-config.json
```
Solution: Create config from template: `cp speaker-config.example.json <name>-config.json`

**Invalid JSON**:
```
SyntaxError: Unexpected token...
```
Solution: Validate JSON syntax (no trailing commas, proper quotes)

**Parse errors**:
```
Warning: Could not parse line...
```
Solution: Verify input file is from merge-speakers-v2.ts (correct format)

## Additional Resources

- [Main README](./README.md) - Full project documentation
- [FluidAudio Documentation](./FluidAudio/README.md) - CLI and API details
- [CLAUDE.md](./CLAUDE.md) - AI agent guidance
