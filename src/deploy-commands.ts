import { REST } from '@discordjs/rest';
import { Routes } from 'discord.js';
import { config } from 'dotenv';
import { readdirSync } from 'fs';
import { join } from 'path';
import { Command } from './lib/types';

// Load environment variables
config();

// Validate required environment variables
if (!process.env.DISCORD_TOKEN || !process.env.CLIENT_ID) {
  console.error('[ERROR] DISCORD_TOKEN and CLIENT_ID are required in .env file');
  process.exit(1);
}

// Store validated environment variables
const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const commands: any[] = [];

// Load all command files
const commandsPath = join(__dirname, 'commands');
const commandFiles = readdirSync(commandsPath).filter(file => 
  file.endsWith('.ts') || file.endsWith('.js')
);

for (const file of commandFiles) {
  const filePath = join(commandsPath, file);
  const command: Command = require(filePath);

  if ('data' in command && 'execute' in command) {
    commands.push(command.data.toJSON());
    console.log(`[DEPLOY] Loaded command: ${command.data.name}`);
  } else {
    console.warn(`[WARNING] Command at ${filePath} is missing required "data" or "execute" property.`);
  }
}

// Construct and prepare an instance of the REST module
const rest = new REST({ version: '10' }).setToken(TOKEN);

// Deploy commands
async function deployCommands() {
  try {
    console.log(`[DEPLOY] Started refreshing ${commands.length} application (/) commands.`);

    // Check if we should deploy to a specific guild (faster for testing) or globally
    if (GUILD_ID) {
      // Deploy to specific guild (instant update)
      const data = await rest.put(
        Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
        { body: commands }
      ) as any[];

      console.log(`[DEPLOY] Successfully reloaded ${data.length} guild commands for guild ${GUILD_ID}`);
    } else {
      // Deploy globally (can take up to an hour to propagate)
      const data = await rest.put(
        Routes.applicationCommands(CLIENT_ID),
        { body: commands }
      ) as any[];

      console.log(`[DEPLOY] Successfully reloaded ${data.length} global commands`);
      console.log('[DEPLOY] Note: Global commands can take up to an hour to update across all servers');
    }
  } catch (error) {
    console.error('[ERROR] Failed to deploy commands:', error);
    process.exit(1);
  }
}

deployCommands();

