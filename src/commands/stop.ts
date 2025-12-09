import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../lib/types';
import { musicManager } from '../lib/musicManager';
import { stop as stopAudio } from '../lib/audioPlayer';
import { disconnectFromChannel } from '../lib/voiceManager';
import { createStatusEmbed } from '../lib/musicUtils';
import { NoQueueError, MusicError } from '../lib/musicErrors';

export const data = new SlashCommandBuilder()
  .setName('stop')
  .setDescription('Stop playing music and clear the queue');

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

    // Stop playback
    stopAudio(interaction.guild.id);

    // Clear queue
    musicManager.clearQueue(interaction.guild.id);

    // Disconnect from voice
    disconnectFromChannel(interaction.guild.id);

    // Delete queue
    musicManager.deleteQueue(interaction.guild.id);

    await interaction.reply({
      embeds: [createStatusEmbed('Stopped', 'Playback stopped and queue cleared.', '⏹️')],
    });
  } catch (error) {
    console.error('[STOP] Error:', error);

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

