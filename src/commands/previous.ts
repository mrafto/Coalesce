import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../lib/types';
import { musicManager } from '../lib/musicManager';
import { previous as previousSong } from '../lib/audioPlayer';
import { createNowPlayingEmbed } from '../lib/musicUtils';
import { NoQueueError, NoPreviousSongError, MusicError } from '../lib/musicErrors';

export const data = new SlashCommandBuilder()
  .setName('previous')
  .setDescription('Go back to the previous song');

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

    const prevSong = musicManager.getPreviousSong(interaction.guild.id);
    if (!prevSong) {
      throw new NoPreviousSongError();
    }

    // Go to previous song
    const played = await previousSong(interaction.guild.id);
    if (played) {
      await interaction.reply({
        embeds: [createNowPlayingEmbed(played)],
      });
    } else {
      throw new NoPreviousSongError();
    }
  } catch (error) {
    console.error('[PREVIOUS] Error:', error);

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

