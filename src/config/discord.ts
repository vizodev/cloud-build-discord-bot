import { Client, GatewayIntentBits } from "discord.js";

export class DiscordConnection {
    private constructor() {}

    static async connectToDiscord() {
        const token = process.env["DISCORD_TOKEN"];
        const client = new Client({intents: [GatewayIntentBits.Guilds]});
        await client.login(token);
        return client;
        
    }
}