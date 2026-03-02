# Whiteboard: audio-transcription-tool

## Original Request

> We did work to transcribe audio recordings to text using fluid-audio. It was piecemeal. We want to organize this work, create a repeatable tool where I can pass in an audio transcript (or point to a folder even better) and have it create transcripts and save to a folder.
>
> In this case, I want to get a transcription of my interview with Chris Chaillot. I'd like to save a text transcript to the audio parent folder, with my responses (Wesley Frederick) and Chris's responses delimited, similar to matt-lemay_final.txt.
>
> I want the output to be a markdown file with frontmatter and each transcript block ending in a ^block-anchor so we can link to it in Obsidian.

**Synthesized Goal:** Create a repeatable CLI/script that wraps fluid-audio's 5-step pipeline into a single command, producing Obsidian-native markdown transcripts with YAML frontmatter and block anchors. First use case: transcribe the Bain recruiter screen with Chris Chaillot.



## Artifacts & Paths

**fluid-audio project:**
- [WORKFLOW-template.md](/Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/fluid-audio/WORKFLOW-template.md) — 5-step pipeline: diarize → transcribe → merge → identify → rename
- [WORKFLOW-matt-lemay.md](/Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/fluid-audio/WORKFLOW-matt-lemay.md) — concrete example of pipeline execution
- `matt-lemay-config.json` — speaker config example: `{"1": "Matt Lemay", "2": "Christina Woodtke", "default": "Audience"}`
- `FluidAudio/` — Swift framework + CLI (`swift run fluidaudio process/transcribe`)
- `FluidAudio/merge-speakers-v2.ts` — merges diarization + transcription (bun)
- `FluidAudio/rename-speakers.ts` — maps speaker IDs to names, merges consecutive segments (bun)
- `output/matt-lemay_final.txt` — reference output format: `[Speaker Name, 0:08-0:38, 47 words]: text...`

**Target audio:**
- `ResumeCoach/data/2026/Bain/interviews/20260226-chris-chaillot-recruiter/audio/20260226-Bain-Chris-interview.m4a` (25MB)
- `.aif` version also exists (325MB) — m4a is the compressed version

**Interview context:**
- [coaching_state.md](/Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/ResumeCoach/data/2026/Bain/coaching_state.md) — Bain recruiter screen, Chris Chaillot, 30min off-camera Zoom
- Two speakers: Wesley Frederick, Chris Chaillot

## Recon Findings

### Baseline: Current Pipeline (5 manual steps)

1. **Diarize** — `swift run fluidaudio process <audio> --output <diarization.json>` [OBS]
2. **Transcribe** — `swift run fluidaudio transcribe <audio> --output-json <word_timings.json>` [OBS]
3. **Merge** — `bun FluidAudio/merge-speakers-v2.ts <diarization> <word_timings> <generic.txt>` [OBS]
4. **Identify speakers** — manual review of generic.txt, edit config JSON [OBS]
5. **Rename** — `bun FluidAudio/rename-speakers.ts <generic.txt> <config.json> <final.txt>` [OBS]

- Steps 1-3 produce a generic transcript with `Speaker 1`, `Speaker 2` labels [OBS]
- Steps 4-5 require human identification of which speaker ID = which person [OBS]
- Output format is plain text: `[Speaker Name, 0:08-0:38, 47 words]: text...` [OBS]
- No frontmatter, no block anchors, no markdown [OBS]
- All intermediate files go to `output/` directory in fluid-audio project [OBS]
- Process shell script exists in WORKFLOW-template.md but is never automated end-to-end [OBS]
- Steps 1+2 are slow (Swift compilation + model inference on audio) — the heavy lifting [F-LK]
- Step 4 (speaker identification) is inherently manual for first run [OBS]

### Ideal: What We Want

- Single command: point to audio file (or folder of audio files) → get markdown transcripts [OBS from request]
- Output location: transcript saved to audio's parent folder (not fluid-audio's output dir) [OBS from request]
- Output format: markdown with YAML frontmatter + `^block-anchor` on each block [OBS from request]
- Speaker labels: real names, delimited per block [OBS from request]
- [Q] For folder mode — should it recurse into subdirectories looking for audio files, or just process files in the given folder?
- [Q] For speaker config — should it auto-detect 2-person interviews and prompt for names, or always require a config file?

### Delta: What Needs to Change

- New script/tool that orchestrates the 5-step pipeline [D]
- New output formatter that converts `[Speaker, time, words]: text` → markdown with frontmatter + anchors [D]
- Speaker config needs to be co-located with audio (not in fluid-audio project) [D]
- Placeholder until baseline and ideal artifacts are fleshed out [D]
