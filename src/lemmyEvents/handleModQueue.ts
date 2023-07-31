import { LemmyOn } from "../decorators/lemmyPost";
import postViewModel from "../models/postViewModel";
import { LemmyEventArguments } from "../types/LemmyEvents";
import client, { getAuth } from "../main";
import modQueueService from "../services/modQueueService";
import { typeDiDependencyRegistryEngine } from "discordx";

let ModQueueService: modQueueService | undefined;

function getModQueueService() {
  if (!ModQueueService) {
    ModQueueService =
      typeDiDependencyRegistryEngine.getService(modQueueService) || undefined;
  }
  return ModQueueService;
}

class ModQueueHandler {
  @LemmyOn({ event: "postcreated" })
  async handlePost(event: LemmyEventArguments<postViewModel>) {
    const modQueueSettings = event.config?.modQueueSettings;
    if (!modQueueSettings || !modQueueSettings.enabled) return;

    const post = event.data;

    if (modQueueSettings.modQueueType === "active") {
      await client.removePost({
        auth: getAuth(),
        removed: true,
        reason: "Post is in mod queue.",
        post_id: post.post.id,
      });
    }

    const service = getModQueueService();
    if (!service) return;
    console.log("Adding post to mod queue")
    await service.addModQueueEntry(post);
  }
}
