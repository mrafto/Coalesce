import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../lib/types';
import { createEmbed, formatUptime, calculateLatency } from '../lib/utils';

export const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Check the bot\'s latency and status');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const startTime = Date.now();
  
  // Defer reply to measure accurate latency
  await interaction.deferReply();

  // Get WebSocket heartbeat
  const wsHeartbeat = interaction.client.ws.ping;

  // Calculate latencies
  const { roundTrip } = calculateLatency(startTime, wsHeartbeat);

  // Get bot uptime
  const uptime = formatUptime(interaction.client.uptime || 0);

  // Create embed with statistics
  const embed = createEmbed('🏓 Pong!', 'Bot latency statistics')
    .addFields(
      {
        name: '⏱️ Round Trip Latency',
        value: `\`${roundTrip}ms\``,
        inline: true,
      },
      {
        name: '💓 WebSocket Heartbeat',
        value: `\`${wsHeartbeat}ms\``,
        inline: true,
      },
      {
        name: '⏰ Uptime',
        value: `\`${uptime}\``,
        inline: true,
      },
      {
        name: '📊 Status',
        value: roundTrip < 200 ? '✅ Excellent' : roundTrip < 500 ? '⚠️ Good' : '❌ Poor',
        inline: true,
      }
    )
    .setFooter({ text: `Requested by ${interaction.user.tag}` });

  await interaction.editReply({ embeds: [embed] });
}

export default { data, execute } as Command;

