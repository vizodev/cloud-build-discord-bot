import { DiscordRepository } from "../../repositories";
import { Singleton } from "typescript-ioc";
@Singleton
export class MainService {

    private _repo: DiscordRepository;

    constructor(repo: DiscordRepository) {
        this._repo = repo ?? new DiscordRepository();
    }

    async handleGCPMessage(message: {message: {data: string}}) {
        try {
            const data = JSON.parse(Buffer.from(message.message.data, "base64").toString());
            const { status, projectId, startTime, finishTime, steps, logUrl, tags } = data;
            return this._repo.handleMessage(status, projectId, startTime, finishTime, steps, logUrl, tags)
        } catch (error) {
            console.error(error);
        }
    }
}