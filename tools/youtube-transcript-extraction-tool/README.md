# YouTube Transcript Extraction Tool

This folder contains a Python tool for extracting transcripts from YouTube videos using the `youtube-transcript-api` library.

## Contents

- `get_transcript.py` - Simple script for extracting YouTube transcripts (current directory)
- `extract_any_video.py` - Interactive script with custom directory support
- `extract_to_directory.py` - Command-line script for extracting to specific directories
- `transcript.txt` - Example output file containing the extracted transcript
- `youtube_transcript_env/` - Python virtual environment with required dependencies
- `README.md` - This documentation file

## Usage

### Prerequisites

The virtual environment is already set up with the required dependencies:
- `youtube-transcript-api`
- `requests`
- `defusedxml`

### Running the Scripts

1. **Activate the virtual environment:**
   ```bash
   source youtube_transcript_env/bin/activate
   ```

2. **Choose your method:**

   **Option A: Interactive script with directory support**
   ```bash
   python extract_any_video.py
   # Prompts for URL, filename, and output directory
   ```

   **Option B: Command line with custom directory**
   ```bash
   python extract_to_directory.py "https://youtube.com/watch?v=VIDEO_ID" "/path/to/output/" "filename.txt"
   ```

   **Option C: Simple script (current directory only)**
   ```bash
   python get_transcript.py
   # Edit the video_url variable first
   ```

### Script Features

- **Automatic video ID extraction** - Works with both `youtube.com/watch?v=` and `youtu.be/` URL formats
- **Custom output directories** - Save transcripts to any folder you specify
- **Flexible filename options** - Auto-generate or specify custom filenames
- **Error handling** - Gracefully handles API errors and missing transcripts
- **Text output** - Combines all transcript segments into readable text
- **Directory creation** - Automatically creates output directories if they don't exist

### Example Output

The script will:
1. Extract the video ID from the URL
2. Fetch the transcript using YouTube's API
3. Combine all text segments
4. Display the transcript in the terminal
5. Save the full transcript to `transcript.txt`

### Troubleshooting

- **No transcript available**: Some videos don't have transcripts or have them disabled
- **Private/restricted videos**: The API cannot access transcripts for private or region-restricted content
- **Rate limiting**: YouTube may temporarily block requests if too many are made quickly

### Dependencies

The tool uses the `youtube-transcript-api` package which handles:
- YouTube's transcript API
- Multiple language support
- Automatic retry logic
- Error handling

## Created

This tool was created on 2025-06-13 to extract the transcript from a "Behind the Bastards" podcast episode about Carl Schmidt and the destruction of liberal democracy.
