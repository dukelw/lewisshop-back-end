require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const { DISCORD_CHANNEL_ID, DISCORD_BOT_TOKEN } = process.env;

class LoggerService {
  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });

    // Add channel id
    this.channelId = DISCORD_CHANNEL_ID;

    this.client.on("ready", () => {
      console.log(`Logger is as ${this.client.user.tag}`);
    });

    this.client.login(DISCORD_BOT_TOKEN);
  }

  sendToFormatCode(logData) {
    const {
      code,
      message = "This is some additional information about the code",
      title = "Code example",
    } = logData;

    const codeMessage = {
      content: message,
      embeds: [
        {
          color: parseInt("00ff00", 16),
          title,
          description: "```json\n" + JSON.stringify(code, null, 2) + "\n```",
        },
      ],
    };

    this.sendToMessage(codeMessage);
  }

  sendToMessage(message = "messgage") {
    const channel = this.client.channels.cache.get(this.channelId);
    if (!channel) {
      console.error(`Could not find the channel ${this.channelId}`);
      return;
    }
    channel.send(message).catch((e) => console.error(e));
  }
}

module.exports = new LoggerService();
