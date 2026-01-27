#!/usr/bin/env python3

import sys

from youtube_transcript_api import YouTubeTranscriptApi


def get_video_id_from_url(url):
    """Extract video ID from YouTube URL"""
    if "watch?v=" in url:
        return url.split("watch?v=")[1].split("&")[0]
    elif "youtu.be/" in url:
        return url.split("youtu.be/")[1].split("?")[0]
    else:
        return url  # Assume it's already a video ID

def get_transcript(video_url):
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

        return full_text.strip()

    except Exception as e:
        print(f"Error getting transcript: {e}")
        return None

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python get_transcript.py <youtube_url>")
        print("Example: python get_transcript.py 'https://www.youtube.com/watch?v=abc123'")
        sys.exit(1)

    video_url = sys.argv[1]

    print("Getting YouTube transcript...")
    transcript = get_transcript(video_url)

    if transcript:
        print("\nTranscript:")
        print("=" * 80)
        print(transcript)
        print("=" * 80)

        # Save to file
        with open("transcript.txt", "w", encoding="utf-8") as f:
            f.write(transcript)
        print("\nTranscript saved to transcript.txt")
    else:
        print("Failed to get transcript")
