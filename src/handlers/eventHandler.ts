import { Events } from 'discord.js';
import { ExtendedClient } from '../lib/types';

/**
 * Registers all event handlers for the bot
 */
export function registerEvents(client: ExtendedClient): void {
  // Ready event - fires once when bot is ready
  client.once(Events.ClientReady, (readyClient) => {
    console.log(`[READY] Logged in as ${readyClient.user.tag}`);
    console.log(`[READY] Serving ${readyClient.guilds.cache.size} guild(s)`);
  });

  // Interaction handler - handles all slash commands
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
      console.error(`[ERROR] Command "${interaction.commandName}" not found`);
      return;
    }

    try {
      console.log(`[COMMAND] ${interaction.user.tag} executed: ${interaction.commandName}`);
      await command.execute(interaction);
    } catch (error) {
      console.error(`[ERROR] Error executing ${interaction.commandName}:`, error);
      
      const errorMessage = {
        content: 'There was an error while executing this command!',
        ephemeral: true,
      };

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(errorMessage);
      } else {
        await interaction.reply(errorMessage);
      }
    }
  });

  // Error handler
  client.on(Events.Error, (error) => {
    console.error('[ERROR] Discord client error:', error);
  });

  // Warning handler
  client.on(Events.Warn, (warning) => {
    console.warn('[WARN]', warning);
  });

  console.log('[EVENTS] Registered event handlers');
}

