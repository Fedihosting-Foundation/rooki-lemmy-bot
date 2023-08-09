import { LemmyHttp } from "lemmy-js-client";
import client from "../main";

const lemmyClients = new Map<string, LemmyHttp>();
lemmyClients.set("https://lemmy.world", client)

export function getLemmyClient(instance: string) {
    if (lemmyClients.has(instance)) {
        return lemmyClients.get(instance);
    } else {
        const client = new LemmyHttp(instance, {
        headers: {
            "User-Agent": "rooki-bot",
        },
        });
        lemmyClients.set(instance, client);
        return client;
    }
}