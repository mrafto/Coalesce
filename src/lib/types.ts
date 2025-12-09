import { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, Client, Collection, User, TextBasedChannel } from 'discord.js';
import { AudioPlayer, VoiceConnection } from '@discordjs/voice';

export interface Command {
  data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

export interface ExtendedClient extends Client {
  commands: Collection<string, Command>;
  musicManager?: MusicManager;
}

/**
 * Represents a song in the queue
 */
export interface Song {
  title: string;
  url: string;
  videoId: string;
  duration: number; // in seconds
  durationFormatted: string;
  thumbnail: string;
  author: string;
  requester: User;
  viewCount?: string;
  likeCount?: string;
}

/**
 * Loop mode for music playback
 */
export type LoopMode = 'none' | 'track' | 'queue';

/**
 * Represents a guild's music queue
 */
export interface MusicQueue {
  guildId: string;
  textChannelId: string;
  voiceChannelId: string;
  songs: Song[];
  currentIndex: number;
  isPlaying: boolean;
  isPaused: boolean;
  volume: number;
  loopMode: LoopMode;
  connection: VoiceConnection | null;
  player: AudioPlayer;
  startTime: Date | null;
  textChannel?: TextBasedChannel;
}

/**
 * Music Manager interface
 */
export interface MusicManager {
  queues: Map<string, MusicQueue>;
  getQueue(guildId: string): MusicQueue | undefined;
  createQueue(guildId: string, textChannelId: string, voiceChannelId: string): MusicQueue;
  deleteQueue(guildId: string): void;
  addSong(guildId: string, song: Song): void;
  removeSong(guildId: string, index: number): Song | undefined;
  clearQueue(guildId: string): void;
  getCurrentSong(guildId: string): Song | undefined;
  getNextSong(guildId: string): Song | undefined;
  getPreviousSong(guildId: string): Song | undefined;
}

