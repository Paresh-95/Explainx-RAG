import axios from 'axios';
export async function sendDiscordNotification(content: string, statusUpdate?: boolean | string) {
    let webhookURL: string | undefined;

    if (typeof statusUpdate === 'boolean') {
        // Handle existing case
        webhookURL = statusUpdate ? process.env.RESOURCE_DISCORD_WEBHOOK_OLLY : process.env.RESOURCE_DISCORD_WEBHOOK_OLLY;
    } else if (typeof statusUpdate === 'string') {
        // Handle new case with custom webhook URL
        webhookURL = statusUpdate;
    } else {
        // Default case
        webhookURL = process.env.RESOURCE_DISCORD_WEBHOOK_OLLY;
    }
    if (!webhookURL) {
        console.error('Webhook URL is not defined.');
        throw new Error('Webhook URL is not defined.');
    }

    const finalContent = `${content}`;

    try {
        const response = await axios.post(webhookURL, {
            content: finalContent
        });
        return response;
    } catch (error) {
        console.error('Error sending Discord notification:', error);
        throw error;
    }
}