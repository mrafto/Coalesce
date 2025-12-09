# Coalesce - Pterodactyl/Pelican Panel Setup Guide

This guide will help you deploy the Coalesce Discord Music Bot on a Pterodactyl or Pelican panel.

## Features of This Egg

- ✅ Automatic Git cloning from GitHub
- ✅ Automatic dependency installation (npm packages, FFmpeg, yt-dlp)
- ✅ TypeScript compilation support
- ✅ Automatic command deployment on startup
- ✅ Optional auto-update on restart
- ✅ Support for private repositories
- ✅ Multiple Node.js versions (18, 20, 21, 22)

## Prerequisites

- Access to a Pterodactyl or Pelican panel as an administrator
- Discord Bot Token and Client ID ([Get them here](https://discord.com/developers/applications))
- Sufficient server resources:
  - **Minimum**: 512MB RAM, 1GB storage
  - **Recommended**: 1GB RAM, 2GB storage

## Installation Steps

### 1. Import the Egg

1. **Download the Egg File**
   - Download `egg-coalesce.json` from this repository

2. **Access Panel Admin Area**
   - Log in to your Pterodactyl/Pelican panel as an administrator
   - Navigate to **Admin Panel** → **Nests**

3. **Import the Egg**
   - Select an existing nest (e.g., "Bots" or "Discord") or create a new one
   - Click **"Import Egg"**
   - Upload the `egg-coalesce.json` file
   - Click **"Import"**

### 2. Create a New Server

1. **Go to Servers Section**
   - Navigate to **Admin Panel** → **Servers**
   - Click **"Create New"**

2. **Configure Server Details**
   - **Server Name**: Choose a name (e.g., "Coalesce Music Bot")
   - **Owner**: Select the server owner
   - **Nest**: Select the nest where you imported the egg
   - **Egg**: Select "Coalesce Discord Music Bot"

3. **Allocate Resources**
   - **Memory**: At least 512MB (1024MB recommended)
   - **Disk Space**: At least 1024MB (2048MB recommended)
   - **CPU**: 100% or more

4. **Network Settings**
   - Assign an IP allocation (required but not used by Discord bots)

5. **Click "Create Server"**

### 3. Configure Environment Variables

After creating the server, go to the server's page and navigate to **"Startup"** tab:

#### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DISCORD_TOKEN` | Your Discord bot token | `MTIzNDU2Nzg5MDEyMzQ1Njc4.GhIJkL.MnOpQrStUvWxYz` |
| `CLIENT_ID` | Your Discord application ID | `1234567890123456789` |

#### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GUILD_ID` | Discord server ID for instant command deployment | (empty) |
| `AUTO_UPDATE` | Pull latest changes on startup | `0` |
| `BRANCH` | Git branch to use | `main` |
| `USERNAME` | Git username for private repos | (empty) |
| `ACCESS_TOKEN` | Personal access token for private repos | (empty) |

#### Where to Find Discord Credentials

1. **DISCORD_TOKEN & CLIENT_ID**:
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Select your application (or create a new one)
   - **CLIENT_ID**: Copy from "General Information" → "Application ID"
   - **DISCORD_TOKEN**: Go to "Bot" section → Click "Reset Token" → Copy the token

2. **GUILD_ID** (Optional):
   - Open Discord
   - Enable Developer Mode: Settings → Advanced → Developer Mode
   - Right-click your server → "Copy Server ID"

### 4. Start the Server

1. Go to the **"Console"** tab
2. Click **"Start"**
3. Monitor the console output for:
   ```
   Installing yt-dlp...
   Installing npm packages...
   Building TypeScript project...
   Commands deployed successfully!
   Bot is ready!
   ```

### 5. Verify Installation

1. **Check Console Output**
   - Look for `Bot is ready!` message
   - Check for any error messages

2. **Test in Discord**
   - Go to your Discord server
   - Type `/ping` to verify the bot responds
   - Try `/play <song name>` to test music functionality

## Troubleshooting

### Bot doesn't start

**Check environment variables**:
- Ensure `DISCORD_TOKEN` and `CLIENT_ID` are set correctly
- Verify there are no extra spaces or quotes

**Check console for errors**:
- Look for authentication errors
- Check for missing dependencies

### Commands not appearing in Discord

**Deploy commands manually**:
1. Stop the bot
2. Check that `CLIENT_ID` is set correctly
3. Optionally set `GUILD_ID` for instant deployment (guild commands deploy instantly)
4. Start the bot (commands are deployed on startup)

**Wait for global commands**:
- If `GUILD_ID` is not set, global commands can take up to 1 hour to propagate

### Music doesn't play

**FFmpeg issues**:
- FFmpeg is automatically installed during server creation
- Check console for FFmpeg-related errors

**yt-dlp issues**:
- yt-dlp is automatically installed with the server
- If issues persist, reinstall the server

### Connection issues

**Voice channel permissions**:
- Ensure bot has "Connect" and "Speak" permissions
- Check that bot can see the voice channel

**Bot token invalid**:
- Regenerate token in Discord Developer Portal
- Update `DISCORD_TOKEN` in panel
- Restart the server

## Advanced Configuration

### Using a Private Repository

If you're using a private fork:

1. **Generate a Personal Access Token**:
   - GitHub: Settings → Developer settings → Personal access tokens → Generate new token
   - Grant "repo" permissions

2. **Configure Variables**:
   - `USERNAME`: Your GitHub username
   - `ACCESS_TOKEN`: The token you generated
   - `GIT_ADDRESS`: Your private repository URL

### Auto-Update on Restart

To pull the latest changes every time the bot restarts:

1. Set `AUTO_UPDATE` to `1`
2. Restart the bot

**Warning**: This will overwrite any manual changes made to files!

### Custom Branch

To use a different branch (e.g., development):

1. Set `BRANCH` to your desired branch name
2. Reinstall or restart the bot

## Docker Image Versions

The egg supports multiple Node.js versions:

- **Node 22** (Recommended)
- **Node 21**
- **Node 20**
- **Node 18**

To change the Node.js version:
1. Go to **Admin Panel** → **Servers** → Your Server
2. Navigate to **"Startup"** tab
3. Select different Docker image from the dropdown
4. Restart the server

## Resource Allocation

### Minimum Requirements

- **RAM**: 512MB
- **Disk**: 1GB
- **CPU**: 50%

### Recommended Requirements

- **RAM**: 1GB (allows for larger queues and better stability)
- **Disk**: 2GB (for temporary files and caching)
- **CPU**: 100% (for smooth audio playback)

### For Large Servers (100+ users)

- **RAM**: 2GB+
- **Disk**: 3GB+
- **CPU**: 150%+

## Support

### Common Issues

1. **"Bot is not responding"**
   - Check bot is online in Discord
   - Verify token is correct
   - Ensure bot is in your server

2. **"Audio is choppy or laggy"**
   - Increase CPU allocation
   - Increase RAM allocation
   - Check server latency in panel

3. **"Installation failed"**
   - Check console for error messages
   - Verify server has internet access
   - Try reinstalling the server

### Getting Help

- **GitHub Issues**: [https://github.com/mrafto/Coalesce/issues](https://github.com/mrafto/Coalesce/issues)
- **Discord Developer Portal**: [https://discord.com/developers/docs](https://discord.com/developers/docs)

## Updating the Bot

### Method 1: Auto-Update (Recommended)

1. Set `AUTO_UPDATE` to `1` in Startup variables
2. Restart the bot whenever you want to update

### Method 2: Reinstall

1. Navigate to **"Settings"** tab
2. Click **"Reinstall Server"**
3. Confirm the reinstall

**Note**: Reinstalling will delete all local changes but preserve environment variables.

## Security Best Practices

1. **Never share your bot token** - Treat it like a password
2. **Use environment variables** - Don't hardcode credentials
3. **Regenerate tokens if compromised** - Get a new token immediately
4. **Limit bot permissions** - Only grant necessary Discord permissions
5. **Use private repos for sensitive data** - Keep custom configurations private

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Credits

- **Coalesce Bot**: [https://github.com/mrafto/Coalesce](https://github.com/mrafto/Coalesce)
- **Discord.js**: [https://discord.js.org/](https://discord.js.org/)
- **Pterodactyl Panel**: [https://pterodactyl.io/](https://pterodactyl.io/)
- **Pelican Panel**: [https://pelican.dev/](https://pelican.dev/)

