import { Song } from './types';
import { musicManager } from './musicManager';
import { 
  createAudioResource, 
  StreamType, 
  AudioPlayerStatus,
  AudioResource
} from '@discordjs/voice';
import { disconnectFromChannel } from './voiceManager';
import { spawn } from 'child_process';

// Track which guilds have event listeners set up
const guildsWithListeners = new Set<string>();

/**
 * Create audio resource by streaming from yt-dlp
 */
async function createAudioStream(videoId: string, volume: number = 100): Promise<AudioResource> {
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  
  // Use yt-dlp to stream audio directly
  const ytDlpProcess = spawn('python', [
    '-m', 'yt_dlp',
    videoUrl,
    '-f', 'bestaudio/best',
    '-o', '-', // Output to stdout
    '--no-playlist',
    '--geo-bypass',
    '--no-check-certificate',
    '--quiet',
    '--no-warnings'
  ]);

  // Create audio resource from the stdout stream
  const resource = createAudioResource(ytDlpProcess.stdout, {
    inputType: StreamType.Arbitrary,
    inlineVolume: true,
  });

  if (resource.volume) {
    resource.volume.setVolume(volume / 100);
  }

  // Handle process errors
  ytDlpProcess.stderr.on('data', (data) => {
    console.error(`[YT-DLP] Error: ${data.toString()}`);
  });

  ytDlpProcess.on('error', (error) => {
    console.error(`[YT-DLP] Process error:`, error);
  });

  return resource;
}

/**
 * Setup audio player event listeners for a guild
 */
function setupPlayerEvents(guildId: string): void {
  // Only set up once per guild
  if (guildsWithListeners.has(guildId)) {
    return;
  }

  const queue = musicManager.getQueue(guildId);
  if (!queue?.player) {
    return;
  }

  const player = queue.player;

  // Handle when song finishes (Idle state)
  player.on(AudioPlayerStatus.Idle, async () => {
    console.log(`[AUDIO] Player idle in guild ${guildId}`);
    
    const currentQueue = musicManager.getQueue(guildId);
    if (!currentQueue) return;

    // Handle loop modes
    if (currentQueue.loopMode === 'track') {
      // Loop current track
      const currentSong = musicManager.getCurrentSong(guildId);
      if (currentSong) {
        console.log(`[AUDIO] Looping track: ${currentSong.title}`);
        await play(guildId, currentSong);
        return;
      }
    }

    const nextSong = musicManager.getNextSong(guildId);
    if (nextSong) {
      // Auto-play next song
      console.log(`[AUDIO] Auto-playing next song: ${nextSong.title}`);
      await skip(guildId);
    } else if (currentQueue.loopMode === 'queue' && currentQueue.songs.length > 0) {
      // Loop entire queue - go back to first song
      console.log(`[AUDIO] Looping queue - restarting from first song`);
      currentQueue.currentIndex = 0;
      const firstSong = currentQueue.songs[0];
      await play(guildId, firstSong);
    } else {
      // Queue ended
      console.log(`[AUDIO] Queue ended in guild ${guildId}`);
      disconnectFromChannel(guildId);
      musicManager.deleteQueue(guildId);
      guildsWithListeners.delete(guildId);
    }
  });

  // Handle when song starts playing
  player.on(AudioPlayerStatus.Playing, () => {
    console.log(`[AUDIO] Now playing in guild ${guildId}`);
    musicManager.setPlaying(guildId, true);
    musicManager.setPaused(guildId, false);
  });

  // Handle when song is paused
  player.on(AudioPlayerStatus.Paused, () => {
    console.log(`[AUDIO] Paused in guild ${guildId}`);
    musicManager.setPaused(guildId, true);
  });

  // Handle errors
  player.on('error', async (error) => {
    console.error(`[AUDIO] Player error in guild ${guildId}:`, error);
    
    // Try to skip to next song on error
    const nextSong = musicManager.getNextSong(guildId);
    if (nextSong) {
      console.log(`[AUDIO] Skipping to next song due to error`);
      await skip(guildId);
    } else {
      console.log(`[AUDIO] No next song, stopping playback`);
      disconnectFromChannel(guildId);
      musicManager.deleteQueue(guildId);
      guildsWithListeners.delete(guildId);
    }
  });

  guildsWithListeners.add(guildId);
  console.log(`[AUDIO] Event listeners set up for guild ${guildId}`);
}

/**
 * Play a song in a guild
 */
export async function play(guildId: string, song: Song): Promise<void> {
  try {
    console.log(`[AUDIO] Playing: "${song.title}" in guild ${guildId}`);
    
    const queue = musicManager.getQueue(guildId);
    if (!queue) {
      throw new Error('No queue found for guild');
    }

    if (!queue.player) {
      throw new Error('No audio player found for guild');
    }

    if (!queue.connection) {
      throw new Error('No voice connection found for guild');
    }

    // Setup event listeners if not already done
    setupPlayerEvents(guildId);

    // Create audio resource by streaming from yt-dlp
    console.log(`[AUDIO] Creating audio stream for ${song.videoId}`);
    const resource = await createAudioStream(song.videoId, queue.volume);

    // Play the resource
    queue.player.play(resource);
    
    // Ensure connection is subscribed to player
    queue.connection.subscribe(queue.player);

    // Update queue state
    musicManager.setPlaying(guildId, true);
    musicManager.setPaused(guildId, false);
    const currentQueue = musicManager.getQueue(guildId);
    if (currentQueue) {
      currentQueue.startTime = new Date();
    }

    console.log(`[AUDIO] Started playback of "${song.title}" in guild ${guildId}`);
  } catch (error) {
    console.error(`[AUDIO] Error playing song in guild ${guildId}:`, error);
    throw error;
  }
}

/**
 * Pause playback in a guild
 */
export function pause(guildId: string): void {
  console.log(`[AUDIO] Pausing playback in guild ${guildId}`);
  
  const queue = musicManager.getQueue(guildId);
  if (queue?.player) {
    queue.player.pause();
    musicManager.setPaused(guildId, true);
    musicManager.setPlaying(guildId, false);
  }
}

/**
 * Resume playback in a guild
 */
export function resume(guildId: string): void {
  console.log(`[AUDIO] Resuming playback in guild ${guildId}`);
  
  const queue = musicManager.getQueue(guildId);
  if (queue?.player) {
    queue.player.unpause();
    musicManager.setPaused(guildId, false);
    musicManager.setPlaying(guildId, true);
  }
}

/**
 * Stop playback in a guild
 */
export function stop(guildId: string): void {
  console.log(`[AUDIO] Stopping playback in guild ${guildId}`);
  
  const queue = musicManager.getQueue(guildId);
  if (queue?.player) {
    queue.player.stop();
    musicManager.setPlaying(guildId, false);
    musicManager.setPaused(guildId, false);
    
    const currentQueue = musicManager.getQueue(guildId);
    if (currentQueue) {
      currentQueue.startTime = null;
    }
  }
  
  // Remove event listeners
  guildsWithListeners.delete(guildId);
}

/**
 * Skip to next song
 */
export async function skip(guildId: string): Promise<Song | null> {
  console.log(`[AUDIO] Skipping to next song in guild ${guildId}`);
  
  const queue = musicManager.getQueue(guildId);
  if (!queue) return null;
  
  // Stop current playback
  if (queue.player) {
    queue.player.stop(true); // Force stop
  }
  
  // Move to next song
  const hasNext = musicManager.moveToNext(guildId);
  if (hasNext) {
    const nextSong = musicManager.getCurrentSong(guildId);
    if (nextSong) {
      await play(guildId, nextSong);
      return nextSong;
    }
  }
  
  return null;
}

/**
 * Go back to previous song
 */
export async function previous(guildId: string): Promise<Song | null> {
  console.log(`[AUDIO] Playing previous song in guild ${guildId}`);
  
  const queue = musicManager.getQueue(guildId);
  if (!queue) return null;
  
  // Stop current playback
  if (queue.player) {
    queue.player.stop(true); // Force stop
  }
  
  // Move to previous song
  const hasPrev = musicManager.moveToPrevious(guildId);
  if (hasPrev) {
    const prevSong = musicManager.getCurrentSong(guildId);
    if (prevSong) {
      await play(guildId, prevSong);
      return prevSong;
    }
  }
  
  return null;
}

/**
 * Get current playback position in seconds
 */
export function getCurrentPosition(guildId: string): number {
  const queue = musicManager.getQueue(guildId);
  if (!queue || !queue.startTime) return 0;
  
  // Try to get from player state first
  if (queue.player?.state.status === AudioPlayerStatus.Playing) {
    const state: any = queue.player.state;
    if (state.resource?.playbackDuration !== undefined) {
      return Math.floor(state.resource.playbackDuration / 1000);
    }
  }
  
  // Fallback to time-based calculation
  const elapsed = Date.now() - queue.startTime.getTime();
  return Math.floor(elapsed / 1000);
}

// Export setupPlayerEvents for external use if needed
export { setupPlayerEvents };
