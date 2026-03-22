# Claude CLI ↔ Telegram Bot Bridge

A lightweight, secure Node.js service that acts as a bridge between a specific Telegram chat and the Anthropic Claude CLI tool. This allows you to securely send prompts to Claude from anywhere via Telegram, using your machine's local `claude-code` CLI.

## Features
- **Secure by Default:** Only accepts messages from a specific authorized Telegram Chat ID (yours). It actively logs and ignores commands from unauthorized IDs.
- **Background Execution:** Transparently bridges your Telegram texts to Claude's CLI, passing inputs and capturing responses.
- **Robust Daily Logging:** Uses `winston` and `winston-daily-rotate-file` to keep highly organized daily log files (14-day history). Logs contain all communication, including access attempts from unauthorized users.
- **No Hangs:** Perfectly structured non-interactive `child_process.exec` calls that won't randomly hang expecting TTY input (using `--dangerously-skip-permissions` & `< /dev/null`).

## Prerequisites

1. **Node.js**
2. **Claude Code CLI** globally installed (`npm install -g @anthropic-ai/claude-code`) AND authenticated on your local machine.
3. A **Telegram Bot Token**. (Talk to [@BotFather](https://t.me/botfather) on Telegram to create a new bot and get its HTTP API token).
4. Your **Telegram Chat ID**. (You can message a bot like `@userinfobot` to retrieve your numeric ID).

## Setup & Installation

1. Clone or download this project.
2. Install the necessary project dependencies:
   ```bash
   npm install
   ```
3. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
4. Open the `.env` file and insert your configuration:
   - `TELEGRAM_BOT_TOKEN="your_bot_token_here"`
   - `TELEGRAM_CHAT_ID="your_personal_chat_id_here"`
   - `DEFAULT_DIRECTORY="/path/to/the/folder/where/claude/should/start"`

## Usage

Simply start the bridge application:
```bash
node index.js
```

Then, send a message to your newly made Telegram bot! 
- You will receive a real-time acknowledgment: `Processing your request with Claude...`
- The bot triggers a command in the background running the Claude CLI in your specified directory.
- The entire output from Claude is captured and formatted directly back to you in your Telegram chat. 

## Logging

Check the automatically generated `./logs` directory for rotated activity logs. New files are generated per day and old logs are completely rotated out after 14 days.
