import { MusicQueue, Song, MusicManager as IMusicManager } from './types';
import { createAudioPlayer } from '@discordjs/voice';

/**
 * Music Manager - Manages all guild music queues
 */
class MusicManagerClass implements IMusicManager {
  public queues: Map<string, MusicQueue>;

  constructor() {
    this.queues = new Map();
  }

  /**
   * Get queue for a guild
   */
  getQueue(guildId: string): MusicQueue | undefined {
    return this.queues.get(guildId);
  }

  /**
   * Create a new queue for a guild
   */
  createQueue(guildId: string, textChannelId: string, voiceChannelId: string): MusicQueue {
    const queue: MusicQueue = {
      guildId,
      textChannelId,
      voiceChannelId,
      songs: [],
      currentIndex: 0,
      isPlaying: false,
      isPaused: false,
      volume: 100,
      loopMode: 'none',
      connection: null,
      player: createAudioPlayer(),
      startTime: null,
    };

    this.queues.set(guildId, queue);
    console.log(`[MUSIC] Created queue for guild ${guildId}`);
    return queue;
  } 

  /**
   * Delete a queue for a guild
   */
  deleteQueue(guildId: string): void {
    const queue = this.queues.get(guildId);
    if (queue) {
      // Cleanup voice connection and player
      if (queue.connection) {
        queue.connection.destroy();
      }
      if (queue.player) {
        queue.player.stop();
      }
      this.queues.delete(guildId);
      console.log(`[MUSIC] Deleted queue for guild ${guildId}`);
    }
  }

  /**
   * Add a song to the queue
   */
  addSong(guildId: string, song: Song): void {
    const queue = this.queues.get(guildId);
    if (queue) {
      queue.songs.push(song);
      console.log(`[MUSIC] Added "${song.title}" to queue in guild ${guildId}`);
    }
  }

  /**
   * Remove a song from the queue by index
   */
  removeSong(guildId: string, index: number): Song | undefined {
    const queue = this.queues.get(guildId);
    if (queue && index >= 0 && index < queue.songs.length) {
      const removed = queue.songs.splice(index, 1)[0];
      console.log(`[MUSIC] Removed "${removed.title}" from queue in guild ${guildId}`);
      
      // Adjust current index if needed
      if (index < queue.currentIndex) {
        queue.currentIndex--;
      } else if (index === queue.currentIndex && queue.currentIndex >= queue.songs.length) {
        queue.currentIndex = Math.max(0, queue.songs.length - 1);
      }
      
      return removed;
    }
    return undefined;
  }

  /**
   * Clear all songs from the queue
   */
  clearQueue(guildId: string): void {
    const queue = this.queues.get(guildId);
    if (queue) {
      queue.songs = [];
      queue.currentIndex = 0;
      queue.isPlaying = false;
      queue.isPaused = false;
      queue.startTime = null;
      console.log(`[MUSIC] Cleared queue for guild ${guildId}`);
    }
  }

  /**
   * Get the currently playing song
   */
  getCurrentSong(guildId: string): Song | undefined {
    const queue = this.queues.get(guildId);
    if (queue && queue.currentIndex >= 0 && queue.currentIndex < queue.songs.length) {
      return queue.songs[queue.currentIndex];
    }
    return undefined;
  }

  /**
   * Get the next song in the queue
   */
  getNextSong(guildId: string): Song | undefined {
    const queue = this.queues.get(guildId);
    if (queue) {
      const nextIndex = queue.currentIndex + 1;
      if (nextIndex < queue.songs.length) {
        return queue.songs[nextIndex];
      }
    }
    return undefined;
  }

  /**
   * Get the previous song in the queue
   */
  getPreviousSong(guildId: string): Song | undefined {
    const queue = this.queues.get(guildId);
    if (queue) {
      const prevIndex = queue.currentIndex - 1;
      if (prevIndex >= 0) {
        return queue.songs[prevIndex];
      }
    }
    return undefined;
  }

  /**
   * Move to the next song
   */
  moveToNext(guildId: string): boolean {
    const queue = this.queues.get(guildId);
    if (queue && queue.currentIndex + 1 < queue.songs.length) {
      queue.currentIndex++;
      queue.startTime = new Date();
      return true;
    }
    return false;
  }

  /**
   * Move to the previous song
   */
  moveToPrevious(guildId: string): boolean {
    const queue = this.queues.get(guildId);
    if (queue && queue.currentIndex > 0) {
      queue.currentIndex--;
      queue.startTime = new Date();
      return true;
    }
    return false;
  }

  /**
   * Set queue playing state
   */
  setPlaying(guildId: string, isPlaying: boolean): void {
    const queue = this.queues.get(guildId);
    if (queue) {
      queue.isPlaying = isPlaying;
      if (isPlaying && !queue.startTime) {
        queue.startTime = new Date();
      }
    }
  }

  /**
   * Set queue paused state
   */
  setPaused(guildId: string, isPaused: boolean): void {
    const queue = this.queues.get(guildId);
    if (queue) {
      queue.isPaused = isPaused;
    }
  }

  /**
   * Get total queue duration in seconds
   */
  getTotalDuration(guildId: string): number {
    const queue = this.queues.get(guildId);
    if (queue) {
      return queue.songs.reduce((total, song) => total + song.duration, 0);
    }
    return 0;
  }

  /**
   * Get remaining queue duration from current song
   */
  getRemainingDuration(guildId: string): number {
    const queue = this.queues.get(guildId);
    if (queue) {
      let duration = 0;
      for (let i = queue.currentIndex; i < queue.songs.length; i++) {
        duration += queue.songs[i].duration;
      }
      return duration;
    }
    return 0;
  }
}

// Export singleton instance
export const musicManager = new MusicManagerClass();

