import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../lib/types';
import { musicManager } from '../lib/musicManager';
import { createQueueEmbed } from '../lib/musicUtils';
import { NoQueueError, EmptyQueueError, MusicError } from '../lib/musicErrors';

export const data = new SlashCommandBuilder()
  .setName('queue')
  .setDescription('Display the current music queue')
  .addIntegerOption(option =>
    option
      .setName('page')
      .setDescription('Page number to display')
      .setRequired(false)
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

    const page = (interaction.options.getInteger('page') || 1) - 1; // Convert to 0-indexed
    const songsPerPage = 10;
    const maxPage = Math.ceil(Math.max(0, queue.songs.length - 1) / songsPerPage);

    // Validate page number
    if (page < 0 || page > maxPage) {
      await interaction.reply({
        content: `Invalid page number. Please choose a page between 1 and ${maxPage + 1}.`,
        ephemeral: true,
      });
      return;
    }

    const embed = createQueueEmbed(queue, page, songsPerPage);
    await interaction.reply({ embeds: [embed] });
  } catch (error) {
    console.error('[QUEUE] Error:', error);

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

