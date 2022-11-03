import { Client, GatewayIntentBits } from "discord.js";
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
export class DiscordConnection {
    private constructor() {}

    static async connectToDiscord() {
        const projectNumber = process.env["PROJECT_NUMBER"];
        const secretManagerClient = new SecretManagerServiceClient();

        const [secretAcessed] = await secretManagerClient.accessSecretVersion({
            name: `projects/${projectNumber}/secrets/discord-token/versions/latest`,
        });
        
        const token = secretAcessed.payload?.data?.toString();
        const client = new Client({intents: [GatewayIntentBits.Guilds]});
        await client.login(token);
        return client;
        
    }
}