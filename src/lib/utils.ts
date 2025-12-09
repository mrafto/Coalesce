import { EmbedBuilder } from 'discord.js';

/**
 * Creates a styled embed with consistent branding
 */
export function createEmbed(title: string, description?: string, color: number = 0x5865F2): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle(title)
    .setColor(color)
    .setTimestamp();

  if (description) {
    embed.setDescription(description);
  }

  return embed;
}

/**
 * Formats uptime into a human-readable string
 */
export function formatUptime(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Calculates latency statistics
 */
export function calculateLatency(startTime: number, wsHeartbeat: number): {
  roundTrip: number;
  wsHeartbeat: number;
} {
  const roundTrip = Date.now() - startTime;
  return {
    roundTrip,
    wsHeartbeat,
  };
}

