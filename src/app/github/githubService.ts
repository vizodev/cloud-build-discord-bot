import { DiscordRepository } from "../../repositories";
import { Singleton } from "typescript-ioc";

@Singleton
export class GithubService {
    private _repo: DiscordRepository;

    constructor(repo: DiscordRepository) {
        this._repo = repo ?? new DiscordRepository();
    }
    async handleRepoEvent(event:any) {
        try {
            if (event['action'] == 'completed') {
                const artifactsUrl = event['workflow_run']['artifacts_url'];
                const repoName = event['workflow_run']['repository']['name'];
                const commitMessage = event['workflow_run']['head_commit']['message'];
                return this._repo.handleGithubEvent(artifactsUrl, repoName, commitMessage);
            }
            return;
        } catch (error) {
            console.error(error);
        }
    }
}