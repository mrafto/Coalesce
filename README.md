# Coalesce - Discord Music Bot

A feature-rich Discord music bot built with TypeScript, Discord.js v14, and yt-dlp. Play music from YouTube without API keys!

## Features

- 🎵 Play music from YouTube (search or direct links)
- ⏸️ Pause/Resume playback
- ⏭️ Skip/Previous track navigation
- 📜 Queue management
- 🎼 Current song display with progress bar
- 🔊 Voice channel integration
- 🐳 Docker support for easy deployment
- 📊 Detailed embeds for all interactions

## Commands

| Command | Description |
|---------|-------------|
| `/play <query>` | Play a song from YouTube (URL or search query) |
| `/pause` | Pause the currently playing song |
| `/continue` | Resume the paused song |
| `/stop` | Stop playing and clear the queue |
| `/skip` | Skip to the next song |
| `/previous` | Go back to the previous song |
| `/loop <mode>` | Set loop mode: none, track, or queue |
| `/queue [page]` | Display the current music queue |
| `/current` | Show the currently playing song with details |
| `/remove <position>` | Remove a song from the queue |
| `/ping` | Check bot latency and status |

## Prerequisites

- [Node.js](https://nodejs.org/) 22.x or higher
- [FFmpeg](https://ffmpeg.org/) installed and in PATH
- [Python 3](https://www.python.org/) with [yt-dlp](https://github.com/yt-dlp/yt-dlp) installed
- Discord Bot Token ([Create one here](https://discord.com/developers/applications))

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Install System Dependencies

#### FFmpeg

**Windows:**
- Download from [ffmpeg.org](https://ffmpeg.org/download.html) or [gyan.dev](https://www.gyan.dev/ffmpeg/builds/)
- Extract to `C:\ffmpeg`
- Add `C:\ffmpeg\bin` to PATH

**macOS:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt update
sudo apt install ffmpeg
```

#### yt-dlp

```bash
pip install yt-dlp
```

Or on Windows:
```bash
python -m pip install yt-dlp
```

### 3. Configure Environment

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` and add your Discord credentials:
```env
DISCORD_TOKEN=your_discord_bot_token_here
CLIENT_ID=your_application_client_id_here
GUILD_ID=your_guild_id_for_testing (optional)
```

**Where to find these:**
- `DISCORD_TOKEN`: Discord Developer Portal → Your Application → Bot → Token
- `CLIENT_ID`: Discord Developer Portal → Your Application → General Information → Application ID
- `GUILD_ID`: Right-click your Discord server → Copy ID (requires Developer Mode enabled)

### 4. Register Commands

Deploy slash commands to Discord:
```bash
npm run deploy-commands
```

If `GUILD_ID` is set, commands will be registered to that server instantly.
Otherwise, they'll be registered globally (may take up to 1 hour to propagate).

### 5. Run the Bot

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

## Docker Deployment

### Using Docker Compose (Recommended)

1. **Build and run:**
```bash
docker-compose up -d
```

2. **View logs:**
```bash
docker-compose logs -f
```

3. **Stop:**
```bash
docker-compose down
```

### Using Docker directly

1. **Build the image:**
```bash
docker build -t coalesce-bot .
```

2. **Run the container:**
```bash
docker run -d \
  --name coalesce-bot \
  --env-file .env \
  coalesce-bot
```

3. **View logs:**
```bash
docker logs -f coalesce-bot
```

4. **Stop and remove:**
```bash
docker stop coalesce-bot
docker rm coalesce-bot
```

## Project Structure

```
coalesce/
├── src/
│   ├── commands/          # Slash command implementations
│   │   ├── ping.ts
│   │   ├── play.ts
│   │   ├── pause.ts
│   │   ├── continue.ts
│   │   ├── stop.ts
│   │   ├── skip.ts
│   │   ├── previous.ts
│   │   ├── queue.ts
│   │   ├── current.ts
│   │   └── remove.ts
│   ├── handlers/          # Event and command handlers
│   │   ├── commandHandler.ts
│   │   └── eventHandler.ts
│   ├── lib/               # Core functionality
│   │   ├── types.ts
│   │   ├── utils.ts
│   │   ├── musicManager.ts
│   │   ├── musicUtils.ts
│   │   ├── musicErrors.ts
│   │   ├── voiceManager.ts
│   │   ├── audioPlayer.ts
│   │   ├── youtubeUtils.ts
│   │   └── fetchyoutubedata.ts
│   ├── types/             # TypeScript type declarations
│   │   └── yt-search.d.ts
│   ├── index.ts           # Bot entry point
│   └── deploy-commands.ts # Command registration script
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## Architecture

The bot follows a modular architecture:

- **Commands**: Individual command implementations
- **Handlers**: Load commands and handle Discord events
- **Music Manager**: Manages per-guild music queues
- **Voice Manager**: Handles voice channel connections
- **Audio Player**: Controls audio playback
- **YouTube Utils**: Fetches YouTube data and stream URLs

## Troubleshooting

### FFmpeg not found
- Ensure FFmpeg is installed and in your system PATH
- Run `ffmpeg -version` to verify installation
- On Windows, you may need to restart your terminal/IDE after adding to PATH

### yt-dlp not found
- Ensure Python and yt-dlp are installed
- Run `python -m yt_dlp --version` to verify
- On Windows, ensure Python Scripts directory is in PATH

### Voice encryption errors
- The bot uses `libsodium-wrappers` for voice encryption
- Ensure `@discordjs/voice` is version 0.19.0 or higher

### Bot doesn't respond to commands
- Verify commands are deployed: `npm run deploy-commands`
- Check bot has necessary permissions in your server
- Ensure bot token is correct in `.env`

### Audio doesn't play
- Check FFmpeg is installed correctly
- Verify yt-dlp is working: `python -m yt_dlp --version`
- Check bot has permission to connect and speak in voice channels

## Development

### Building
```bash
npm run build
```

### Type Checking
```bash
npx tsc --noEmit
```

### Linting
```bash
npx eslint src/
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Acknowledgments

- [Discord.js](https://discord.js.org/) - Discord API library
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - YouTube downloader
- [FFmpeg](https://ffmpeg.org/) - Audio processing

## Support

For issues and feature requests, please use the GitHub issue tracker.

