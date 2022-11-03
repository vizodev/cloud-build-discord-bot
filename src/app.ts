import * as dotenv from "dotenv";
import { version } from "../package.json";
import express, { Request, Response } from "express";
import cors from "cors";
import { DiscordConnection } from "./config/discord";
import { Container } from "typescript-ioc";
import { RegisterRoutes } from "./routes/routes";
import { errorMiddleware } from "./middlewares/errorMiddleware";
dotenv.config();
console.log(`Vizo Google Cloud Platform Bot - Version ${version}`);

export async function setupApp() {
    const app = express();
    const discordClient = await DiscordConnection.connectToDiscord();
    Container.bindName("discordClient").to(discordClient);
    app.use(express.urlencoded());
    app.use(express.json());
    app.use(
        cors({
          origin: "*",
        })
    );

    RegisterRoutes(app);

    app.use("/version", (_req: Request, res: Response) => {
        res.send({version})
    })

    app.use(errorMiddleware);

    return app;
}