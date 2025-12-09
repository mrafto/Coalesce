import yts from 'yt-search';
import type { SearchResult, VideoSearchResult } from 'yt-search';
import { User } from 'discord.js';
import { Song } from './types';
import { fetchYoutubeData } from './fetchyoutubedata';
import { YouTubeError } from './musicErrors';

/**
 * Search YouTube for videos
 */
export async function searchYouTube(query: string, limit: number = 5): Promise<VideoSearchResult[]> {
  try {
    const results: SearchResult = await yts(query);
    return results.videos.slice(0, limit);
  } catch (error) {
    console.error('[YOUTUBE] Search error:', error);
    throw new YouTubeError(`Failed to search YouTube: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract video ID from various YouTube URL formats
 */
export function extractVideoId(input: string): string | null {
  // If it's already just a video ID (11 characters)
  const videoIdPattern = /^[a-zA-Z0-9_-]{11}$/;
  if (videoIdPattern.test(input)) {
    return input;
  }

  // Try to extract from various URL formats
  const urlPatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/.*[?&]v=([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of urlPatterns) {
    const match = input.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Check if input is a YouTube URL
 */
export function isYouTubeUrl(input: string): boolean {
  const urlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//;
  return urlPattern.test(input);
}

/**
 * Format duration from seconds to HH:MM:SS or MM:SS
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Parse duration string (e.g., "3:45" or "1:23:45") to seconds
 */
export function parseDuration(duration: string): number {
  const parts = duration.split(':').map(Number);
  
  if (parts.length === 3) {
    // HH:MM:SS
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    // MM:SS
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 1) {
    // SS
    return parts[0];
  }
  
  return 0;
}

/**
 * Create Song object from video search result
 */
export function createSongFromSearchResult(video: VideoSearchResult, requester: User): Song {
  return {
    videoId: video.videoId,
    title: video.title,
    url: video.url,
    thumbnail: video.thumbnail,
    duration: video.seconds,
    durationFormatted: formatDuration(video.seconds),
    author: video.author.name,
    viewCount: video.views.toString(),
    requester,
  };
}

/**
 * Create Song object from fetchYoutubeData result
 */
export async function createSongFromUrl(url: string, requester: User): Promise<Song> {
  try {
    const videoId = extractVideoId(url);
    if (!videoId) {
      throw new YouTubeError('Invalid YouTube URL');
    }

    // First try to get data from yt-search for quick info
    const searchResults = await yts({ videoId });
    if (searchResults.videos.length > 0) {
      return createSongFromSearchResult(searchResults.videos[0], requester);
    }

    // Fallback to fetchYoutubeData for more detailed info
    const data = await fetchYoutubeData(url);
    
    // Try to parse duration from description or use a default
    const duration = 0; // Will be set when we actually process the stream
    
    return {
      videoId: data.videoId,
      title: data.title,
      url: `https://www.youtube.com/watch?v=${data.videoId}`,
      thumbnail: `https://img.youtube.com/vi/${data.videoId}/maxresdefault.jpg`,
      duration,
      durationFormatted: formatDuration(duration),
      author: data.author,
      viewCount: data.viewCount,
      likeCount: data.likeCount,
      requester,
    };
  } catch (error) {
    console.error('[YOUTUBE] Error creating song from URL:', error);
    throw new YouTubeError(`Failed to fetch video data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get stream URL using yt-dlp via Python
 */
export async function getStreamUrl(videoId: string): Promise<string> {
  try {
    const { spawn } = require('child_process');
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    return new Promise((resolve, reject) => {
      const args = [
        '-m', 'yt_dlp',
        videoUrl,
        '-f', 'bestaudio/best',
        '-g', // Get URL
        '--no-playlist',
        '--geo-bypass',
      ];
      
      const ytdlp = spawn('python', args);
      let output = '';
      let errorOutput = '';
      
      ytdlp.stdout.on('data', (data: Buffer) => {
        output += data.toString();
      });
      
      ytdlp.stderr.on('data', (data: Buffer) => {
        errorOutput += data.toString();
      });
      
      ytdlp.on('close', (code: number) => {
        if (code !== 0) {
          console.error('[YT-DLP] Error output:', errorOutput);
          reject(new Error(`yt-dlp exited with code ${code}: ${errorOutput}`));
        } else {
          const streamUrl = output.trim();
          if (streamUrl) {
            resolve(streamUrl);
          } else {
            reject(new Error('No stream URL returned from yt-dlp'));
          }
        }
      });
      
      ytdlp.on('error', (error: Error) => {
        reject(error);
      });
    });
  } catch (error) {
    console.error('[YT-DLP] Error getting stream URL:', error);
    throw new YouTubeError(`Failed to get audio stream: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Search and get first result as Song
 */
export async function searchAndGetSong(query: string, requester: User): Promise<Song> {
  try {
    const results = await searchYouTube(query, 1);
    if (results.length === 0) {
      throw new YouTubeError(`No results found for "${query}"`);
    }
    return createSongFromSearchResult(results[0], requester);
  } catch (error) {
    if (error instanceof YouTubeError) {
      throw error;
    }
    throw new YouTubeError(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

