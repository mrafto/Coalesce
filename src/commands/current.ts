import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../lib/types';
import { musicManager } from '../lib/musicManager';
import { createCurrentSongEmbed } from '../lib/musicUtils';
import { NoQueueError, NoSongPlayingError, MusicError } from '../lib/musicErrors';

export const data = new SlashCommandBuilder()
  .setName('current')
  .setDescription('Display the currently playing song with details');

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

    const currentSong = musicManager.getCurrentSong(interaction.guild.id);
    if (!currentSong) {
      throw new NoSongPlayingError();
    }

    const embed = createCurrentSongEmbed(currentSong, queue);
    await interaction.reply({ embeds: [embed] });
  } catch (error) {
    console.error('[CURRENT] Error:', error);

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

