#!/usr/bin/env python3
"""
YouTube Transcript Extractor - Custom Directory Version

Usage:
    python extract_to_directory.py <youtube_url> <output_directory> [filename]

Examples:
    python extract_to_directory.py "https://youtube.com/watch?v=abc123" "/path/to/output/"
    python extract_to_directory.py "https://youtube.com/watch?v=abc123" "/path/to/output/" "my_transcript.txt"

This script extracts YouTube transcripts and saves them to a specified directory.
"""

import sys
from datetime import datetime
from pathlib import Path

from youtube_transcript_api import YouTubeTranscriptApi

def get_video_id_from_url(url):
    """Extract video ID from YouTube URL"""
    if "watch?v=" in url:
        return url.split("watch?v=")[1].split("&")[0]
    elif "youtu.be/" in url:
        return url.split("youtu.be/")[1].split("?")[0]
    else:
        return url  # Assume it's already a video ID

def sanitize_filename(text):
    """Create a safe filename from text"""
    safe_chars = []
    for char in text:
        if char.isalnum() or char in [' ', '-', '_', '.']:
            safe_chars.append(char)
        elif char in [':', '/', '\\', '?', '*', '<', '>', '|']:
            safe_chars.append('-')
    
    filename = ''.join(safe_chars).strip()
    # Limit length and remove extra spaces
    filename = ' '.join(filename.split())[:100]
    return filename

def get_transcript_to_directory(video_url, output_dir, custom_filename=None):
    """Get transcript from YouTube video and save to specified directory"""
    try:
        video_id = get_video_id_from_url(video_url)
        print(f"Getting transcript for video ID: {video_id}")
        
        # Create output directory if it doesn't exist
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        
        # Get transcript
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        
        # Combine all text
        full_text = ""
        for entry in transcript:
            full_text += entry['text'] + " "
        
        full_text = full_text.strip()
        
        # Generate filename if not provided
        if custom_filename:
            if not custom_filename.endswith('.txt'):
                custom_filename += '.txt'
            filename = sanitize_filename(custom_filename)
        else:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"transcript_{video_id}_{timestamp}.txt"
        
        # Full path for output file
        output_file = output_path / filename
        
        # Save to file
        with open(output_file, "w", encoding="utf-8") as f:
            f.write(f"YouTube Video: {video_url}\n")
            f.write(f"Video ID: {video_id}\n")
            f.write(f"Extracted: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"Output Directory: {output_dir}\n")
            f.write("=" * 80 + "\n\n")
            f.write(full_text)
        
        return full_text, str(output_file)
    
    except Exception as e:
        print(f"Error getting transcript: {e}")
        return None, None

def main():
    """Main function with command line arguments"""
    if len(sys.argv) < 3:
        print("Usage: python extract_to_directory.py <youtube_url> <output_directory> [filename]")
        print("\nExamples:")
        print('  python extract_to_directory.py "https://youtube.com/watch?v=abc123" "/path/to/output/"')
        print('  python extract_to_directory.py "https://youtube.com/watch?v=abc123" "/path/to/output/" "my_transcript.txt"')
        sys.exit(1)
    
    video_url = sys.argv[1]
    output_dir = sys.argv[2]
    custom_filename = sys.argv[3] if len(sys.argv) > 3 else None
    
    print("YouTube Transcript Extractor - Custom Directory")
    print("=" * 50)
    print(f"Video URL: {video_url}")
    print(f"Output Directory: {output_dir}")
    if custom_filename:
        print(f"Custom Filename: {custom_filename}")
    print()
    
    print("Extracting transcript...")
    transcript, output_file = get_transcript_to_directory(video_url, output_dir, custom_filename)
    
    if transcript:
        print(f"\n✅ Success! Transcript saved to: {output_file}")
        print(f"📊 Length: {len(transcript)} characters")
        
        # Show preview
        preview_length = 200
        if len(transcript) > preview_length:
            print(f"\n📖 Preview (first {preview_length} characters):")
            print("-" * 50)
            print(transcript[:preview_length] + "...")
        else:
            print("\n📖 Full transcript:")
            print("-" * 50)
            print(transcript)
    else:
        print("❌ Failed to extract transcript.")
        sys.exit(1)

if __name__ == "__main__":
    main()
