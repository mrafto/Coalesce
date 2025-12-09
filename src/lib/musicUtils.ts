import { EmbedBuilder, GuildMember, ChatInputCommandInteraction, VoiceBasedChannel } from 'discord.js';
import { Song, MusicQueue } from './types';
import { formatDuration } from './youtubeUtils';
import { NotInVoiceChannelError } from './musicErrors';

/**
 * Create a music-themed embed
 */
export function createMusicEmbed(title: string, description?: string, color: number = 0x1DB954): EmbedBuilder {
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
 * Create an embed for a song
 */
export function createSongEmbed(song: Song, options?: {
  title?: string;
  showRequester?: boolean;
  showStats?: boolean;
  position?: number;
}): EmbedBuilder {
  const embed = createMusicEmbed(
    options?.title || '🎵 Now Playing',
    undefined,
    0x1DB954
  );

  embed.setDescription(`**[${song.title}](${song.url})**`);
  embed.setThumbnail(song.thumbnail);

  const fields: { name: string; value: string; inline?: boolean }[] = [];

  fields.push({
    name: '👤 Channel',
    value: song.author,
    inline: true,
  });

  fields.push({
    name: '⏱️ Duration',
    value: song.durationFormatted,
    inline: true,
  });

  if (options?.position !== undefined) {
    fields.push({
      name: '📊 Position',
      value: `#${options.position}`,
      inline: true,
    });
  }

  if (options?.showStats && song.viewCount) {
    fields.push({
      name: '👁️ Views',
      value: formatNumber(parseInt(song.viewCount)),
      inline: true,
    });
  }

  if (options?.showStats && song.likeCount) {
    fields.push({
      name: '👍 Likes',
      value: formatNumber(parseInt(song.likeCount)),
      inline: true,
    });
  }

  if (options?.showRequester !== false) {
    fields.push({
      name: '📝 Requested by',
      value: song.requester.tag,
      inline: true,
    });
  }

  embed.addFields(fields);

  return embed;
}

/**
 * Create an embed for the queue
 */
export function createQueueEmbed(queue: MusicQueue, page: number = 0, songsPerPage: number = 10): EmbedBuilder {
  const currentSong = queue.songs[queue.currentIndex];
  const upcomingSongs = queue.songs.slice(queue.currentIndex + 1);

  const embed = createMusicEmbed('📜 Music Queue', undefined, 0x5865F2);

  // Current song
  if (currentSong) {
    embed.addFields({
      name: '🎵 Currently Playing',
      value: `**[${currentSong.title}](${currentSong.url})**\n` +
             `Duration: ${currentSong.durationFormatted} | Requested by: ${currentSong.requester.tag}`,
      inline: false,
    });
  }

  // Upcoming songs
  if (upcomingSongs.length > 0) {
    const startIndex = page * songsPerPage;
    const endIndex = Math.min(startIndex + songsPerPage, upcomingSongs.length);
    const pageSongs = upcomingSongs.slice(startIndex, endIndex);

    const queueText = pageSongs
      .map((song, idx) => {
        const position = startIndex + idx + 1;
        return `**${position}.** [${song.title}](${song.url})\n` +
               `    ⏱️ ${song.durationFormatted} | 👤 ${song.requester.tag}`;
      })
      .join('\n\n');

    embed.addFields({
      name: `⏭️ Up Next (${upcomingSongs.length} song${upcomingSongs.length !== 1 ? 's' : ''})`,
      value: queueText || 'No upcoming songs',
      inline: false,
    });

    // Pagination info
    const totalPages = Math.ceil(upcomingSongs.length / songsPerPage);
    if (totalPages > 1) {
      embed.setFooter({ text: `Page ${page + 1} of ${totalPages}` });
    }
  } else {
    embed.addFields({
      name: '⏭️ Up Next',
      value: 'No upcoming songs in the queue',
      inline: false,
    });
  }

  // Total stats
  const totalDuration = queue.songs.reduce((sum, song) => sum + song.duration, 0);
  const loopEmoji = queue.loopMode === 'track' ? '🔂' : queue.loopMode === 'queue' ? '🔁' : '➡️';
  const loopText = queue.loopMode === 'track' ? 'Track' : queue.loopMode === 'queue' ? 'Queue' : 'Off';
  
  embed.addFields({
    name: '📊 Queue Stats',
    value: `Total Songs: **${queue.songs.length}**\n` +
           `Total Duration: **${formatDuration(totalDuration)}**\n` +
           `Status: ${queue.isPaused ? '⏸️ Paused' : queue.isPlaying ? '▶️ Playing' : '⏹️ Stopped'}\n` +
           `Loop: ${loopEmoji} **${loopText}**`,
    inline: false,
  });

  return embed;
}

/**
 * Create a progress bar
 */
export function createProgressBar(current: number, total: number, length: number = 15): string {
  if (total === 0) return '▬'.repeat(length);
  
  const progress = Math.min(Math.max(current / total, 0), 1);
  const filled = Math.round(length * progress);
  const empty = length - filled;

  const filledBar = '▬'.repeat(Math.max(0, filled - 1));
  const emptyBar = '▬'.repeat(Math.max(0, empty));
  
  return `${filledBar}🔘${emptyBar}`;
}

/**
 * Create an embed showing current song with progress
 */
export function createCurrentSongEmbed(song: Song, queue: MusicQueue): EmbedBuilder {
  const embed = createSongEmbed(song, {
    title: '🎵 Currently Playing',
    showRequester: true,
    showStats: true,
  });

  // Calculate progress if we have a start time
  if (queue.startTime && song.duration > 0) {
    const elapsed = Math.floor((Date.now() - queue.startTime.getTime()) / 1000);
    const progress = Math.min(elapsed, song.duration);
    const progressBar = createProgressBar(progress, song.duration);
    
    embed.addFields({
      name: '⏯️ Progress',
      value: `${formatDuration(progress)} ${progressBar} ${song.durationFormatted}`,
      inline: false,
    });
  }

  // Status info
  const statusEmoji = queue.isPaused ? '⏸️' : queue.isPlaying ? '▶️' : '⏹️';
  const statusText = queue.isPaused ? 'Paused' : queue.isPlaying ? 'Playing' : 'Stopped';
  const loopEmoji = queue.loopMode === 'track' ? '🔂' : queue.loopMode === 'queue' ? '🔁' : '➡️';
  const loopText = queue.loopMode === 'track' ? 'Track' : queue.loopMode === 'queue' ? 'Queue' : 'Off';
  
  embed.addFields({
    name: '📊 Status',
    value: `${statusEmoji} ${statusText} | Volume: ${queue.volume}%\nLoop: ${loopEmoji} ${loopText}`,
    inline: false,
  });

  return embed;
}

/**
 * Validate that user is in a voice channel
 */
export function getUserVoiceChannel(interaction: ChatInputCommandInteraction): VoiceBasedChannel {
  const member = interaction.member as GuildMember;
  
  if (!member.voice.channel) {
    throw new NotInVoiceChannelError();
  }

  return member.voice.channel;
}

/**
 * Format large numbers with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

/**
 * Create an embed for added song
 */
export function createAddedToQueueEmbed(song: Song, position: number): EmbedBuilder {
  const embed = createMusicEmbed(
    '✅ Added to Queue',
    undefined,
    0x00FF00
  );

  embed.setDescription(`**[${song.title}](${song.url})**`);
  embed.setThumbnail(song.thumbnail);

  embed.addFields(
    {
      name: '👤 Channel',
      value: song.author,
      inline: true,
    },
    {
      name: '⏱️ Duration',
      value: song.durationFormatted,
      inline: true,
    },
    {
      name: '📊 Position in Queue',
      value: `#${position}`,
      inline: true,
    }
  );

  return embed;
}

/**
 * Create an embed for now playing
 */
export function createNowPlayingEmbed(song: Song): EmbedBuilder {
  return createSongEmbed(song, {
    title: '▶️ Now Playing',
    showRequester: true,
    showStats: false,
  });
}

/**
 * Create simple status embed
 */
export function createStatusEmbed(title: string, description: string, emoji: string = '✅'): EmbedBuilder {
  return createMusicEmbed(
    `${emoji} ${title}`,
    description,
    emoji === '❌' ? 0xFF0000 : emoji === '⚠️' ? 0xFFA500 : 0x00FF00
  );
}

