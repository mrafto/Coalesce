import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../lib/types';
import { musicManager } from '../lib/musicManager';
import { createStatusEmbed } from '../lib/musicUtils';
import { NoQueueError, MusicError } from '../lib/musicErrors';
import type { LoopMode } from '../lib/types';

export const data = new SlashCommandBuilder()
  .setName('loop')
  .setDescription('Set loop mode for music playback')
  .addStringOption(option =>
    option
      .setName('mode')
      .setDescription('Loop mode: none, track, or queue')
      .setRequired(true)
      .addChoices(
        { name: 'None - Disable loop', value: 'none' },
        { name: 'Track - Loop current track', value: 'track' },
        { name: 'Queue - Loop entire queue', value: 'queue' }
      )
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

    const mode = interaction.options.getString('mode', true) as LoopMode;
    queue.loopMode = mode;

    let emoji = '🔁';
    let description = '';

    switch (mode) {
      case 'none':
        emoji = '➡️';
        description = 'Loop disabled. Songs will play normally.';
        break;
      case 'track':
        emoji = '🔂';
        description = 'Now looping the current track.';
        break;
      case 'queue':
        emoji = '🔁';
        description = 'Now looping the entire queue.';
        break;
    }

    console.log(`[LOOP] Set loop mode to "${mode}" in guild ${interaction.guild.id}`);

    await interaction.reply({
      embeds: [createStatusEmbed('Loop Mode Updated', description, emoji)],
    });
  } catch (error) {
    console.error('[LOOP] Error:', error);

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

