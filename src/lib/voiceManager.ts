import {
  joinVoiceChannel,
  VoiceConnection,
  VoiceConnectionStatus,
  entersState,
} from '@discordjs/voice';
import { VoiceBasedChannel } from 'discord.js';
import { musicManager } from './musicManager';

/**
 * Connect to a voice channel
 */
export async function connectToChannel(
  channel: VoiceBasedChannel,
  guildId: string
): Promise<VoiceConnection> {
  const connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: guildId,
    adapterCreator: channel.guild.voiceAdapterCreator as any,
  });

  try {
    // Wait for connection to be ready
    await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
    console.log(`[VOICE] Connected to channel ${channel.name} in guild ${guildId}`);

    // Store connection in queue
    const queue = musicManager.getQueue(guildId);
    if (queue) {
      queue.connection = connection;
      
      // Subscribe player to connection if player exists
      if (queue.player) {
        connection.subscribe(queue.player);
      }
    }

    // Handle connection state changes
    connection.on(VoiceConnectionStatus.Disconnected, async () => {
      console.log(`[VOICE] Disconnected from guild ${guildId}`);
      try {
        await Promise.race([
          entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
          entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
        ]);
        // Reconnecting
      } catch {
        // Connection is probably destroyed
        connection.destroy();
        disconnectFromChannel(guildId);
      }
    });

    connection.on(VoiceConnectionStatus.Destroyed, () => {
      console.log(`[VOICE] Connection destroyed for guild ${guildId}`);
      // Don't call disconnectFromChannel here as it will try to destroy again
      // Just cleanup the queue's connection reference
      const queue = musicManager.getQueue(guildId);
      if (queue) {
        queue.connection = null;
      }
    });

    return connection;
  } catch (error) {
    connection.destroy();
    throw error;
  }
}

/**
 * Disconnect from voice channel and cleanup
 */
export function disconnectFromChannel(guildId: string): void {
  const queue = musicManager.getQueue(guildId);
  
  if (queue) {
    // Stop playback
    if (queue.player) {
      queue.player.stop();
    }

    // Destroy connection if it's not already destroyed
    if (queue.connection) {
      try {
        if (queue.connection.state.status !== VoiceConnectionStatus.Destroyed) {
          queue.connection.destroy();
        }
      } catch (error) {
        console.error(`[VOICE] Error destroying connection:`, error);
      }
      queue.connection = null;
    }

    console.log(`[VOICE] Cleaned up voice connection for guild ${guildId}`);
  }
}

/**
 * Check if bot is connected to voice in a guild
 */
export function isConnected(guildId: string): boolean {
  const queue = musicManager.getQueue(guildId);
  return queue?.connection?.state.status === VoiceConnectionStatus.Ready;
}

/**
 * Get the voice connection for a guild
 */
export function getConnection(guildId: string): VoiceConnection | null {
  const queue = musicManager.getQueue(guildId);
  return queue?.connection || null;
}

