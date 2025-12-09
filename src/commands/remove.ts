import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../lib/types';
import { musicManager } from '../lib/musicManager';
import { createStatusEmbed } from '../lib/musicUtils';
import { NoQueueError, InvalidSongIndexError, EmptyQueueError, MusicError } from '../lib/musicErrors';

export const data = new SlashCommandBuilder()
  .setName('remove')
  .setDescription('Remove a song from the queue')
  .addIntegerOption(option =>
    option
      .setName('position')
      .setDescription('Position of the song in the queue to remove')
      .setRequired(true)
      .setMinValue(1)
  );

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

    if (queue.songs.length === 0) {
      throw new EmptyQueueError();
    }

    const position = interaction.options.getInteger('position', true);
    const index = position - 1; // Convert to 0-indexed

    // Validate position
    if (index < 0 || index >= queue.songs.length) {
      throw new InvalidSongIndexError(position, queue.songs.length);
    }

    // Don't allow removing the currently playing song
    if (index === queue.currentIndex) {
      await interaction.reply({
        content: 'Cannot remove the currently playing song. Use `/skip` to skip to the next song.',
        ephemeral: true,
      });
      return;
    }

    // Remove the song
    const removed = musicManager.removeSong(interaction.guild.id, index);
    if (removed) {
      await interaction.reply({
        embeds: [createStatusEmbed(
          'Removed from Queue',
          `**${removed.title}** has been removed from the queue.`,
          '🗑️'
        )],
      });
    } else {
      throw new InvalidSongIndexError(position, queue.songs.length);
    }
  } catch (error) {
    console.error('[REMOVE] Error:', error);

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

