import axios from "axios";

interface ErrorDetails {
  message: string;
  stack?: string;
  context?: {
    studyMaterialId?: string;
    operation?: string;
    timestamp?: string;
    [key: string]: any;
  };
}

export class DiscordErrorNotifier {
  private webhookUrl: string;

  constructor(webhookUrl?: string) {
    this.webhookUrl = webhookUrl || process.env.DISCORD_ERROR_WEBHOOK_URL!;

    if (!this.webhookUrl) {
      console.warn(
        "Discord webhook URL not configured. Error notifications will not be sent.",
      );
    }
  }

  async sendErrorNotification(error: Error, context?: any): Promise<void> {
    if (!this.webhookUrl) {
      console.log("Discord webhook not configured, skipping notification");
      return;
    }

    try {
      const errorDetails: ErrorDetails = {
        message: error.message,
        stack: error.stack,
        context: {
          ...context,
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV || "development",
        },
      };

      // Create Discord embed
      const embed = {
        title: "🚨 Summary Generation Error",
        color: 0xff0000, // Red color
        fields: [
          {
            name: "Error Message",
            value: `\`\`\`\n${errorDetails.message}\n\`\`\``,
            inline: false,
          },
          {
            name: "Timestamp",
            value: errorDetails.context?.timestamp || "Unknown",
            inline: true,
          },
          {
            name: "Environment",
            value: errorDetails.context?.environment || "Unknown",
            inline: true,
          },
        ],
        timestamp: new Date().toISOString(),
      };

      // Add context fields if available
      if (errorDetails.context?.studyMaterialId) {
        embed.fields.push({
          name: "Study Material ID",
          value: errorDetails.context.studyMaterialId,
          inline: true,
        });
      }

      if (errorDetails.context?.operation) {
        embed.fields.push({
          name: "Operation",
          value: errorDetails.context.operation,
          inline: true,
        });
      }

      // Add stack trace if available (truncated for Discord's character limit)
      if (errorDetails.stack) {
        const truncatedStack =
          errorDetails.stack.length > 1000
            ? errorDetails.stack.substring(0, 1000) + "..."
            : errorDetails.stack;

        embed.fields.push({
          name: "Stack Trace",
          value: `\`\`\`\n${truncatedStack}\n\`\`\``,
          inline: false,
        });
      }

      // Send to Discord
      await axios.post(this.webhookUrl, {
        username: "Error Bot",
        avatar_url: "https://cdn.discordapp.com/emojis/1234567890123456789.png", // Optional: custom avatar
        embeds: [embed],
      });

      console.log("Error notification sent to Discord successfully");
    } catch (discordError) {
      console.error("Failed to send Discord notification:", discordError);
      // Don't throw here to avoid infinite error loops
    }
  }

  async sendSuccessNotification(message: string, context?: any): Promise<void> {
    if (!this.webhookUrl) return;

    try {
      const embed = {
        title: "✅ Summary Generation Success",
        color: 0x00ff00, // Green color
        fields: [
          {
            name: "Message",
            value: message,
            inline: false,
          },
          {
            name: "Timestamp",
            value: new Date().toISOString(),
            inline: true,
          },
        ],
      };

      // Add context fields if available
      if (context?.studyMaterialId) {
        embed.fields.push({
          name: "Study Material ID",
          value: context.studyMaterialId,
          inline: true,
        });
      }

      await axios.post(this.webhookUrl, {
        username: "Success Bot",
        embeds: [embed],
      });
    } catch (discordError) {
      console.error(
        "Failed to send Discord success notification:",
        discordError,
      );
    }
  }
}

// Singleton instance
export const discordNotifier = new DiscordErrorNotifier();
