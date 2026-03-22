require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { exec } = require('child_process');
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

// Read environment variables
const token = process.env.TELEGRAM_BOT_TOKEN;
const allowedChatId = process.env.TELEGRAM_CHAT_ID;
const defaultDirectory = process.env.DEFAULT_DIRECTORY;

if (!token || !allowedChatId || !defaultDirectory) {
  console.error('Missing required environment variables. Please check your .env file.');
  process.exit(1);
}

// Setup Logger
const transport = new DailyRotateFile({
  filename: 'logs/claude-telegram-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d' // retain logs for 14 days
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    transport,
    new winston.transports.Console()
  ]
});

// Create Telegram Bot
const bot = new TelegramBot(token, { polling: true });

logger.info(`Bot started. Listening for messages from chat ID: ${allowedChatId}`);

// Send startup notification to the configured Telegram ID
bot.sendMessage(allowedChatId, '🤖 Claude Telegram Bot is now online!');

bot.on('message', (msg) => {
  const chatId = msg.chat.id.toString();
  const text = msg.text;

  if (!text) return;

  // Log all communication
  logger.info(`Received message from Telegram ID ${chatId}: ${text}`);

  if (chatId !== allowedChatId) {
    logger.warn(`Unauthorized access attempt from Telegram ID: ${chatId}. Message ignored.`);
    return; // Ignore unauthorized messages
  }

  // Acknowledge receipt to the user so they know it's processing
  bot.sendMessage(chatId, `Processing your request with Claude...`);

  // Escape single quotes and proper escaping for CLI
  // We'll use JSON.stringify to safely escape the incoming text string for bash execution
  // However, JSON.stringify wraps in double quotes, we need to be careful with bash parsing.
  // Instead, it's safer to escape double quotes and inject it inside the double-quoted string.
  const escapedText = text.replace(/"/g, '\\"');

  const command = `cd "${defaultDirectory}" && claude -c --dangerously-skip-permissions -p "${escapedText}" < /dev/null`;
  
  logger.info(`Executing command for Telegram ID ${chatId}: ${command}`);

  exec(command, (error, stdout, stderr) => {
    if (error) {
      const errorMsg = `Error executing Claude request:\n${error.message}\n${stderr}`;
      logger.error(`Command failed for Telegram ID ${chatId}: ${errorMsg}`);
      
      // Since it's a known error condition, still notify the user
      bot.sendMessage(chatId, `Failed to process request:\n${error.message}`);
      return;
    }

    const output = stdout.trim();
    logger.info(`Claude returned response for Telegram ID ${chatId}:\n${output}`);

    // Send the reply back to Telegram
    // If output is too long (Telegram limit is 4096), we might need to split it
    const MAX_LENGTH = 4000;
    if (output.length > MAX_LENGTH) {
      for (let i = 0; i < output.length; i += MAX_LENGTH) {
        bot.sendMessage(chatId, output.substring(i, i + MAX_LENGTH));
      }
    } else {
      if (output) {
        bot.sendMessage(chatId, output);
      } else {
        bot.sendMessage(chatId, "Claude processed the command but returned no output.");
      }
    }
  });
});

bot.on("polling_error", (error) => {
  logger.error(`Polling Error: ${error.code} - ${error.message}`);
});
