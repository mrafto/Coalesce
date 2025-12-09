import { EmbedBuilder } from 'discord.js';

/**
 * Base class for music-related errors
 */
export class MusicError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toEmbed(): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle('❌ Error')
      .setDescription(this.message)
      .setColor(0xFF0000)
      .setTimestamp();
  }
}

/**
 * User is not in a voice channel
 */
export class NotInVoiceChannelError extends MusicError {
  constructor() {
    super('You must be in a voice channel to use this command!');
  }

  toEmbed(): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle('🔊 Not in Voice Channel')
      .setDescription('Please join a voice channel first, then try again.')
      .setColor(0xFFA500)
      .setTimestamp();
  }
}

/**
 * No queue exists for this guild
 */
export class NoQueueError extends MusicError {
  constructor() {
    super('There is no music queue for this server.');
  }

  toEmbed(): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle('📜 No Queue')
      .setDescription('There is no music playing right now. Use `/play` to start playing music!')
      .setColor(0xFFA500)
      .setTimestamp();
  }
}

/**
 * No song is currently playing
 */
export class NoSongPlayingError extends MusicError {
  constructor() {
    super('No song is currently playing.');
  }

  toEmbed(): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle('🎵 Nothing Playing')
      .setDescription('No song is currently playing.')
      .setColor(0xFFA500)
      .setTimestamp();
  }
}

/**
 * Invalid song index/position in queue
 */
export class InvalidSongIndexError extends MusicError {
  constructor(index: number, queueLength: number) {
    super(`Invalid song position: ${index}. Queue has ${queueLength} song(s).`);
  }

  toEmbed(): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle('❌ Invalid Position')
      .setDescription(this.message)
      .setColor(0xFF0000)
      .setTimestamp();
  }
}

/**
 * YouTube-related errors (search, fetch, etc.)
 */
export class YouTubeError extends MusicError {
  constructor(message: string) {
    super(message);
  }

  toEmbed(): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle('▶️ YouTube Error')
      .setDescription(this.message)
      .setColor(0xFF0000)
      .setTimestamp();
  }
}

/**
 * Bot is not connected to a voice channel
 */
export class NotConnectedError extends MusicError {
  constructor() {
    super('The bot is not connected to a voice channel.');
  }

  toEmbed(): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle('🔌 Not Connected')
      .setDescription('The bot is not currently connected to a voice channel.')
      .setColor(0xFFA500)
      .setTimestamp();
  }
}

/**
 * Queue is empty
 */
export class EmptyQueueError extends MusicError {
  constructor() {
    super('The queue is empty.');
  }

  toEmbed(): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle('📜 Empty Queue')
      .setDescription('The queue is empty. Add songs using `/play`!')
      .setColor(0xFFA500)
      .setTimestamp();
  }
}

/**
 * No next song in queue
 */
export class NoNextSongError extends MusicError {
  constructor() {
    super('There is no next song in the queue.');
  }

  toEmbed(): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle('⏭️ No Next Song')
      .setDescription('There are no more songs in the queue.')
      .setColor(0xFFA500)
      .setTimestamp();
  }
}

/**
 * No previous song in queue
 */
export class NoPreviousSongError extends MusicError {
  constructor() {
    super('There is no previous song in the queue.');
  }

  toEmbed(): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle('⏮️ No Previous Song')
      .setDescription('This is the first song in the queue.')
      .setColor(0xFFA500)
      .setTimestamp();
  }
}

