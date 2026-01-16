#!/usr/bin/env python3
"""
YouTube Transcript Extractor - Interactive Version

Usage:
    python extract_any_video.py

This script will prompt you for a YouTube URL and extract its transcript.
"""

from youtube_transcript_api import YouTubeTranscriptApi
import sys
import os
from datetime import datetime

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
    # Remove or replace problematic characters
    safe_chars = []
    for char in text:
        if char.isalnum() or char in [' ', '-', '_']:
            safe_chars.append(char)
        elif char in [':', '/', '\\', '?', '*', '<', '>', '|']:
            safe_chars.append('-')
    
    filename = ''.join(safe_chars).strip()
    # Limit length and remove extra spaces
    filename = ' '.join(filename.split())[:100]
    return filename

def get_transcript(video_url, output_filename=None, output_dir=None):
    """Get transcript from YouTube video"""
    try:
        video_id = get_video_id_from_url(video_url)
        print(f"Getting transcript for video ID: {video_id}")
        
        # Get transcript
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        
        # Combine all text
        full_text = ""
        for entry in transcript:
            full_text += entry['text'] + " "
        
        full_text = full_text.strip()
        
        # Generate filename if not provided
        if not output_filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_filename = f"transcript_{video_id}_{timestamp}.txt"
        
        # Handle output directory
        if output_dir:
            from pathlib import Path
            output_path = Path(output_dir)
            output_path.mkdir(parents=True, exist_ok=True)
            full_output_path = output_path / output_filename
        else:
            full_output_path = output_filename
        
        # Save to file
        with open(full_output_path, "w", encoding="utf-8") as f:
            f.write(f"YouTube Video: {video_url}\n")
            f.write(f"Video ID: {video_id}\n")
            f.write(f"Extracted: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            if output_dir:
                f.write(f"Output Directory: {output_dir}\n")
            f.write("=" * 80 + "\n\n")
            f.write(full_text)
        
        return full_text, str(full_output_path)
    
    except Exception as e:
        print(f"Error getting transcript: {e}")
        return None, None

def main():
    """Interactive main function"""
    print("YouTube Transcript Extractor")
    print("=" * 40)
    
    # Get URL from user
    video_url = input("Enter YouTube URL: ").strip()
    
    if not video_url:
        print("No URL provided. Exiting.")
        return
    
    # Optional custom filename
    custom_filename = input("Custom filename (optional, press Enter for auto): ").strip()
    if custom_filename and not custom_filename.endswith('.txt'):
        custom_filename += '.txt'
    
    # Optional output directory
    output_dir = input("Output directory (optional, press Enter for current dir): ").strip()
    if output_dir and not os.path.exists(output_dir):
        create_dir = input(f"Directory '{output_dir}' doesn't exist. Create it? (y/n): ").strip().lower()
        if create_dir != 'y':
            output_dir = None
    
    print("\nExtracting transcript...")
    transcript, filename = get_transcript(video_url, custom_filename, output_dir)
    
    if transcript:
        print(f"\nSuccess! Transcript saved to: {filename}")
        print(f"Length: {len(transcript)} characters")
        
        # Show preview
        preview_length = 200
        if len(transcript) > preview_length:
            print(f"\nPreview (first {preview_length} characters):")
            print("-" * 50)
            print(transcript[:preview_length] + "...")
        else:
            print(f"\nFull transcript:")
            print("-" * 50)
            print(transcript)
    else:
        print("Failed to extract transcript.")

if __name__ == "__main__":
    main()
