import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../lib/types';
import { musicManager } from '../lib/musicManager';
import { pause as pauseAudio } from '../lib/audioPlayer';
import { createStatusEmbed } from '../lib/musicUtils';
import { NoQueueError, NoSongPlayingError, MusicError } from '../lib/musicErrors';

export const data = new SlashCommandBuilder()
  .setName('pause')
  .setDescription('Pause the currently playing song');

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

    if (queue.isPaused) {
      await interaction.reply({
        embeds: [createStatusEmbed('Already Paused', 'The music is already paused.', '⏸️')],
        ephemeral: true,
      });
      return;
    }

    pauseAudio(interaction.guild.id);

    await interaction.reply({
      embeds: [createStatusEmbed('Paused', `Paused: **${currentSong.title}**`, '⏸️')],
    });
  } catch (error) {
    console.error('[PAUSE] Error:', error);

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

