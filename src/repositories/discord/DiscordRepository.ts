import { Singleton, InjectValue } from "typescript-ioc";
import { Client, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, TextBasedChannel, TextChannel } from "discord.js";
import { format } from "date-fns";
@Singleton
export class DiscordRepository {
    @InjectValue("discordClient")
    client: Client;

    async handleMessage(status: string, projectId: string, startTime: string, finishTime: string, steps: any[], logUrl: string) {
        const embedBuilder = new EmbedBuilder().setAuthor(this.getTitleForEmbed({ status, projectId }))
            .setDescription(this.getDescriptionForEmbed({ status, projectId, startTime, finishTime, steps }));
        const actionRow = this.getActionRow({ logUrl });

        const channelId = process.env["DISCORD_CHANNEL_ID"];
        if (!channelId) throw new Error("DISCORD_CHANNEL_ID variable must be set");
        const channel = (await this.client.channels.fetch(
            channelId
        )) as TextChannel;

        await channel.send({ embeds: [embedBuilder.toJSON()], components: [(actionRow.toJSON() as any)] })
    }


    async handleGithubEvent(artifactsUrl: string, repoName: string, commitMessage: string) {
        const embedBuilder = new EmbedBuilder().setAuthor({name: `New build available for project ${repoName}`, iconURL: "https://images.emojiterra.com/twitter/v13.1/512px/1f6e0.png"})
            .setDescription(`Last commit message: \`${commitMessage}\``);
        
        
        const actionRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`artifact-${artifactsUrl}`).setLabel("Generate Download URL").setStyle(ButtonStyle.Primary)
        );
        const channelId = process.env["DISCORD_CHANNEL_ID"];
        if (!channelId) throw new Error("DISCORD_CHANNEL_ID variable must be set");
        const channel = (await this.client.channels.fetch(
            channelId
        )) as TextChannel;

        await channel.send({embeds: [embedBuilder.toJSON()], components: [(actionRow.toJSON() as any)]})
    }

    getTitleForEmbed(data: { status: string, projectId: string }) {
        const { status, projectId } = data;
        let name;
        let iconURL;
        switch (status) {
            case "SUCCESS":
                name = `Build completed for project ${projectId}`;
                iconURL = "https://emojipedia-us.s3.amazonaws.com/source/skype/289/check-mark-button_2705.png";
                break;
            case "FAILURE":
                name = `Build failed for project ${projectId}`;
                iconURL = "https://cdn.icon-icons.com/icons2/1380/PNG/512/vcsconflicting_93497.png";
                break;
            case "WORKING":
                name = `Build started for project ${projectId}`;
                iconURL = "https://images.emojiterra.com/twitter/v13.1/512px/1f6e0.png";
                break;
            default:
                name = `Build queued for project ${projectId}`;
                iconURL = "https://images.emojiterra.com/google/android-10/512px/23f3.png";
        }
        return { name, iconURL };
    }

    getDescriptionForEmbed(data: { status: string, projectId: string, startTime: string, finishTime: string, steps: any[] }) {
        const { status, projectId, startTime, finishTime, steps } = data;
        let description = `- Project ${projectId}\n`;
        switch (status) {
            case "SUCCESS":
                description += `- Start Time: ${format(new Date(startTime), "dd/MM/yyyy HH:mm")}\n- Finish Time: ${format(new Date(finishTime), "dd/MM/yyyy HH:mm")}`;
                break;
            case "FAILURE": {
                const stepIndex = steps.findIndex((el) => el.status == "FAILURE");
                description += `- Start Time: ${format(new Date(startTime), "dd/MM/yyyy HH:mm")}\n- Finish Time: ${format(new Date(finishTime), "dd/MM/yyyy HH:mm")}\n- Failed Step: #${stepIndex + 1}`;
                break;
            }
            case "WORKING":
                description += `- Start Time: ${format(new Date(startTime), "dd/MM/yyyy HH:mm")}`;
                break;
        }
        return description;
    }

    getActionRow(data: { logUrl: string }) {
        return new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setURL(data.logUrl)
                .setLabel("View Logs")
                .setStyle(ButtonStyle.Link)
        );
    }
}