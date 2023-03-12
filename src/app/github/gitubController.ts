import { Body, Controller, Post, Route } from "tsoa";
import { Inject } from "typescript-ioc";
import { GithubService } from "./githubService";

@Route("github")
export class GithubController extends Controller {

    @Inject
    private _service: GithubService;

    @Post("/")
    public async handleGithubEvent(@Body() event: any) {
        return this._service.handleRepoEvent(event);
    }
}