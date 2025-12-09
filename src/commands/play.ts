import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../lib/types';
import { musicManager } from '../lib/musicManager';
import { getUserVoiceChannel, createNowPlayingEmbed, createAddedToQueueEmbed } from '../lib/musicUtils';
import { connectToChannel } from '../lib/voiceManager';
import { searchAndGetSong, isYouTubeUrl, createSongFromUrl } from '../lib/youtubeUtils';
import { play as playAudio } from '../lib/audioPlayer';
import { MusicError } from '../lib/musicErrors';

export const data = new SlashCommandBuilder()
  .setName('play')
  .setDescription('Play a song from YouTube')
  .addStringOption(option =>
    option
      .setName('query')
      .setDescription('YouTube URL or search query')
      .setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.guild) {
    await interaction.reply({ content: 'This command can only be used in a server!', ephemeral: true });
    return;
  }

  try {
    // Defer reply as this might take a moment
    await interaction.deferReply();

    // Check if user is in a voice channel
    const voiceChannel = getUserVoiceChannel(interaction);
    const query = interaction.options.getString('query', true);

    // Get or create queue
    let queue = musicManager.getQueue(interaction.guild.id);
    const isNewQueue = !queue;

    if (isNewQueue) {
      queue = musicManager.createQueue(
        interaction.guild.id,
        interaction.channel!.id,
        voiceChannel.id
      );
    }

    // At this point queue is definitely defined
    if (!queue) {
      throw new Error('Failed to create queue');
    }

    // Fetch song data
    let song;
    if (isYouTubeUrl(query)) {
      // Direct URL
      song = await createSongFromUrl(query, interaction.user);
    } else {
      // Search query
      song = await searchAndGetSong(query, interaction.user);
    }

    // Add song to queue
    musicManager.addSong(interaction.guild.id, song);

    // Connect to voice channel if not connected
    if (isNewQueue || !queue.connection) {
      await connectToChannel(voiceChannel, interaction.guild.id);
    }

    // If queue was empty, start playing
    if (queue.songs.length === 1) {
      await playAudio(interaction.guild.id, song);
      await interaction.editReply({
        embeds: [createNowPlayingEmbed(song)],
      });
    } else {
      // Song added to queue
      await interaction.editReply({
        embeds: [createAddedToQueueEmbed(song, queue.songs.length)],
      });
    }
  } catch (error) {
    console.error('[PLAY] Error:', error);

    if (error instanceof MusicError) {
      await interaction.editReply({ embeds: [error.toEmbed()] });
    } else {
      await interaction.editReply({
        content: `An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }
}

export default { data, execute } as Command;

