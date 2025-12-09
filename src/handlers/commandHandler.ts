import { Collection } from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';
import { Command, ExtendedClient } from '../lib/types';

/**
 * Loads all commands from the commands directory
 */
export async function loadCommands(client: ExtendedClient): Promise<void> {
  client.commands = new Collection();

  const commandsPath = join(__dirname, '../commands');
  const commandFiles = readdirSync(commandsPath).filter(file => 
    file.endsWith('.ts') || file.endsWith('.js')
  );

  for (const file of commandFiles) {
    // Skip .gitkeep files
    if (file === '.gitkeep') continue;

    const filePath = join(commandsPath, file);
    const command: Command = require(filePath);

    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
      console.log(`[COMMAND] Loaded: ${command.data.name}`);
    } else {
      console.warn(`[WARNING] Command at ${filePath} is missing required "data" or "execute" property.`);
    }
  }

  console.log(`[COMMAND] Loaded ${client.commands.size} command(s)`);
}

