import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../lib/types';
import { musicManager } from '../lib/musicManager';
import { skip as skipSong } from '../lib/audioPlayer';
import { disconnectFromChannel } from '../lib/voiceManager';
import { createNowPlayingEmbed, createStatusEmbed } from '../lib/musicUtils';
import { NoQueueError, NoNextSongError, MusicError } from '../lib/musicErrors';

export const data = new SlashCommandBuilder()
  .setName('skip')
  .setDescription('Skip to the next song in the queue');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.guild) {
    await interaction.reply({ content: 'This command can only be used in a server!', ephemeral: true });
    return;
  }

  try {
    const queue = musicManager.getQueue(interaction.guild.id);
    if (!queue) {
      throw new NoQueueError();
    }

    const nextSong = musicManager.getNextSong(interaction.guild.id);
    if (!nextSong) {
      // No next song, end playback
      disconnectFromChannel(interaction.guild.id);
      musicManager.deleteQueue(interaction.guild.id);
      
      await interaction.reply({
        embeds: [createStatusEmbed('Queue Ended', 'No more songs in the queue. Stopped playback.', '⏭️')],
      });
      return;
    }

    // Skip to next song
    const skipped = await skipSong(interaction.guild.id);
    if (skipped) {
      await interaction.reply({
        embeds: [createNowPlayingEmbed(skipped)],
      });
    } else {
      throw new NoNextSongError();
    }
  } catch (error) {
    console.error('[SKIP] Error:', error);

    if (error instanceof MusicError) {
      await interaction.reply({ embeds: [error.toEmbed()], ephemeral: true });
    } else {
      await interaction.reply({
        content: `An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ephemeral: true,
      });
    }
  }
}

export default { data, execute } as Command;

