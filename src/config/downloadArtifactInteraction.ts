import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import { Octokit } from "octokit";

export class DownloadArtifactInteraction {
    public static async execute(artifactsUrl: string) {
        const projectNumber = process.env["PROJECT_NUMBER"];
        const secretManagerClient = new SecretManagerServiceClient();

        const [secretAcessed] = await secretManagerClient.accessSecretVersion({
        name: `projects/${projectNumber}/secrets/github-token/versions/latest`,
        });

        const token = secretAcessed.payload?.data?.toString();
        const octokit = new Octokit({
            auth: token
        });

        const response = await octokit.request(`GET ${artifactsUrl}`);
        if (response.data['expired']) return;
        const artifactDownloadUrl = response.data['artifacts'][0]['archive_download_url'];
        const downloadResponse = await octokit.request(`GET ${artifactDownloadUrl}`);
        return downloadResponse.url;
    }
}