import { Client, GatewayIntentBits } from 'discord.js';
import { config } from 'dotenv';
import { ExtendedClient } from './lib/types';
import { loadCommands } from './handlers/commandHandler';
import { registerEvents } from './handlers/eventHandler';
import { musicManager } from './lib/musicManager';

// Load environment variables
config();

// Validate required environment variables
if (!process.env.DISCORD_TOKEN) {
  console.error('[ERROR] DISCORD_TOKEN is required in .env file');
  process.exit(1);
}

// Create Discord client with necessary intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates, // Required for voice channel access
  ],
}) as ExtendedClient;

// Attach music manager to client
client.musicManager = musicManager;

// Initialize bot
async function main() {
  try {
    console.log('[INIT] Starting bot...');

    // Load commands
    await loadCommands(client);

    // Register event handlers
    registerEvents(client);

    // Login to Discord
    await client.login(process.env.DISCORD_TOKEN);
  } catch (error) {
    console.error('[ERROR] Failed to start bot:', error);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n[SHUTDOWN] Received SIGINT, shutting down gracefully...');
  client.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n[SHUTDOWN] Received SIGTERM, shutting down gracefully...');
  client.destroy();
  process.exit(0);
});

// Start the bot
main();

