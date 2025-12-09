import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../lib/types';
import { musicManager } from '../lib/musicManager';
import { resume as resumeAudio } from '../lib/audioPlayer';
import { createStatusEmbed } from '../lib/musicUtils';
import { NoQueueError, NoSongPlayingError, MusicError } from '../lib/musicErrors';

export const data = new SlashCommandBuilder()
  .setName('continue')
  .setDescription('Resume the paused song');

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

    if (!queue.isPaused) {
      await interaction.reply({
        embeds: [createStatusEmbed('Not Paused', 'The music is not paused.', '▶️')],
        ephemeral: true,
      });
      return;
    }

    resumeAudio(interaction.guild.id);

    await interaction.reply({
      embeds: [createStatusEmbed('Resumed', `Resumed: **${currentSong.title}**`, '▶️')],
    });
  } catch (error) {
    console.error('[CONTINUE] Error:', error);

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

