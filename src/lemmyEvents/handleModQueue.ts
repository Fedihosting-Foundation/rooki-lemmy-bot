import { LemmyOn } from "../decorators/lemmyPost";
import postViewModel from "../models/postViewModel";
import { LemmyEventArguments } from "../types/LemmyEvents";
import client, { getAuth } from "../main";
import modQueueService from "../services/modQueueService";
import { typeDiDependencyRegistryEngine } from "discordx";
import commentReportViewModel from "../models/commentReportViewModel";
import postReportViewModel from "../models/postReportViewModel";

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
    console.log("Adding post to mod queue");
    await service.addModQueueEntry(post);
  }

  @LemmyOn({ event: "postupdated" })
  async handlePostUpdate(event: LemmyEventArguments<postViewModel>) {
    const modQueueSettings = event.config?.modQueueSettings;
    if (!modQueueSettings || !modQueueSettings.enabled) return;

    const post = event.data;

    const service = getModQueueService();
    if (!service) return;

    const foundEntry = await service.getModQueueEntryByPostId(post.post.id);
    if (!foundEntry) return;

    foundEntry.entry = post;
    await service.updateModQueueEntry(foundEntry);
  }

  @LemmyOn({ event: "postreportcreated" })
  async handlePostReport(event: LemmyEventArguments<postReportViewModel>) {
    const modQueueSettings = event.config?.modQueueSettings;

    if (!modQueueSettings || !modQueueSettings.enabled) return;

    const report = event.data;

    const service = getModQueueService();
    if (!service) return;

    console.log("Adding post report to mod queue");
    await service.addModQueueEntry(report);
  }

  @LemmyOn({ event: "commentreportcreated" })
  async handleCommentReport(
    event: LemmyEventArguments<commentReportViewModel>
  ) {
    const modQueueSettings = event.config?.modQueueSettings;

    if (!modQueueSettings || !modQueueSettings.enabled) return;

    const report = event.data;

    const service = getModQueueService();
    if (!service) return;

    console.log("Adding comment report to mod queue");
    await service.addModQueueEntry(report);
  }
}
