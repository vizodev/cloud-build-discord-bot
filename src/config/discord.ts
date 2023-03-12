import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonComponent,
  ButtonStyle,
  Client,
  EmbedBuilder,
  Events,
  GatewayIntentBits,
} from "discord.js";
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import { DownloadArtifactInteraction } from "./downloadArtifactInteraction";
export class DiscordConnection {
  private constructor() {}

  static async connectToDiscord() {
    const projectNumber = process.env["PROJECT_NUMBER"];
    const secretManagerClient = new SecretManagerServiceClient();

    const [secretAcessed] = await secretManagerClient.accessSecretVersion({
      name: `projects/${projectNumber}/secrets/discord-token/versions/latest`,
    });

    const token = secretAcessed.payload?.data?.toString();
    const client = new Client({ intents: [GatewayIntentBits.Guilds] });
    await client.login(token);
    client.on(Events.InteractionCreate, async (interaction) => {
        console.log("interaction received");
      if (!interaction.isButton()) return;
      console.log("Interaction is button");
      if (
        (interaction.component as ButtonComponent).customId?.startsWith(
          "artifact-"
        )
      ) {
        console.log("interaction has url", (interaction.component as ButtonComponent).customId!.replace(
            "artifact-",
            ""
          ));
        const tempEmbedBuilder = new EmbedBuilder().setAuthor({name: "Generating download URL..."});
        await interaction.reply({embeds: [tempEmbedBuilder.toJSON()]});
        const downloadUrl = await DownloadArtifactInteraction.execute(
          (interaction.component as ButtonComponent).customId!.replace(
            "artifact-",
            ""
          )
        );
        console.log("download Url", downloadUrl);
        const embedBuilder = new EmbedBuilder()
          .setAuthor({
            name: "Click the button below to download the build artifact",
            iconURL:
              "https://freeiconshop.com/wp-content/uploads/edd/download-flat.png",
          })
          .setDescription(
            ":warning: Because of how Github's Artifact Download links work, this message will self-destruct in 1 minute :warning:"
          );
        if (!downloadUrl) {
            await interaction.editReply({
                embeds: [new EmbedBuilder().setAuthor({name: ':x: Sorry, the artifact link has expired'}).toJSON()],
                components: []
            })
            return;
        }
        const actionRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setURL(downloadUrl)
            .setLabel("Download Artifact")
            .setStyle(ButtonStyle.Link)
        );
        console.log("sending message");
        await interaction.editReply({
          embeds: [embedBuilder.toJSON()],
          components: [(actionRow.toJSON() as any)],
        });
        setTimeout(() => {
            console.log("link expired, editing message");
          interaction.editReply({
            content: "The link has expired, but you can generate a new one.",
            embeds: [],
            components: []
          });
        }, 60000);
      }
    });
    return client;
  }
}
