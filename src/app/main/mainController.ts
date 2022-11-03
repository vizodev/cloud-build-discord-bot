import { Route, Post, Body, Controller } from "tsoa";
import { Inject } from "typescript-ioc";
import { MainService } from "./mainService";
@Route("")
export class MainController extends Controller {

    @Inject
    private _service: MainService;

    @Post("/")
    public async handleGCPMessage(@Body() message: {message: {data: string}}) {
        return this._service.handleGCPMessage(message);
    }
}