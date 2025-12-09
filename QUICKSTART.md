# Quick Start Guide

Get your Discord music bot up and running in 5 minutes!

## Prerequisites Checklist

- [ ] Node.js 22.x installed
- [ ] FFmpeg installed and in PATH
- [ ] Python 3 with yt-dlp installed
- [ ] Discord Bot Token ready

## Step-by-Step Setup

### 1. Install System Dependencies

**FFmpeg (Windows):**
```powershell
# Download from https://www.gyan.dev/ffmpeg/builds/
# Extract to C:\ffmpeg
# Add C:\ffmpeg\bin to PATH
ffmpeg -version  # Verify
```

**yt-dlp:**
```bash
pip install yt-dlp
python -m yt_dlp --version  # Verify
```

### 2. Configure Bot

```bash
# Install Node dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and add your credentials
notepad .env  # Windows
nano .env     # Linux/Mac
```

Add to `.env`:
```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
GUILD_ID=your_guild_id_here
```

### 3. Deploy Commands

```bash
npm run deploy-commands
```

### 4. Start Bot

```bash
npm run dev
```

## Using Docker (Alternative)

```bash
# Create .env file first (see step 2)

# Build and run
docker-compose up -d

# View logs
docker-compose logs -f
```

## Test Your Bot

1. Join a voice channel in Discord
2. Use `/play never gonna give you up`
3. Bot joins and plays music! 🎵

## Common Issues

**"FFmpeg not found"**
- Restart terminal after installing FFmpeg
- Verify with `ffmpeg -version`

**"yt-dlp not found"**
- Restart terminal after installing
- Verify with `python -m yt_dlp --version`

**"Commands not showing up"**
- Wait a few seconds after deploying
- Try restarting Discord
- Check bot has applications.commands permission

## Next Steps

- Read the full [README.md](README.md) for all commands
- Explore the code in `src/commands/`
- Join a voice channel and try `/play <song name>`!

## Quick Command Reference

```
/play <song>    - Play music
/pause          - Pause
/continue       - Resume
/skip           - Next song
/queue          - Show queue
/stop           - Stop and clear queue
/current        - Show current song
```

Happy listening! 🎶

