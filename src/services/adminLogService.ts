import { Inject, Service } from "typedi";
import "reflect-metadata";
import CommunityService from "./communityService";
import postService from "./postService";
import { ObjectId } from "mongodb";
import adminLogsRepository from "../repository/adminLogsRepository";
import AdminLogModel, {
  AdminQueueEntryResult,
  adminAllowedEntries,
} from "../models/adminLogModel";
import { IncomingWebhook } from "@slack/webhook";

export const getSlackWebhook = () => {
  const url = process.env.SLACK_WEBHOOK;
  if (!url) {
    return undefined;
  }
  return new IncomingWebhook(url, {
    username: "Rooki Admin Logs",
    icon_emoji: ":warning:",
  });
};

@Service()
class adminLogService {
  @Inject()
  repository: adminLogsRepository;

  @Inject()
  communityService: CommunityService;

  @Inject()
  postService: postService;

  constructor() {}

  async addAdminLogEntry(
    data: adminAllowedEntries,
    action: AdminQueueEntryResult,
    reason: string,
    predictions: any[] = []
  ) {
    const entry = this.repository.create();
    entry.entry = data;
    entry.result = action;
    entry.reason = reason;
    entry.predictions = predictions;
    const result = await this.repository.save(entry);
    try {
      const webhook = getSlackWebhook();
      if (webhook) {
        await webhook.send({
          text: `*${action}* - ${reason} - https://rooki-bot.lemmy.world/adminlogs/${result.id}  **Actions temporarily disabled**
          ${JSON.stringify(data, null, 2)}}`,
        });
      }
    } catch (e) {
      console.error("Slack Webhook Error:");
      console.error(e);
    }
    return result
  }

  async getAdminLogEntries() {
    return await this.repository.findAll();
  }

  async updateAdminLogEntry(data: AdminLogModel<adminAllowedEntries>) {
    return await this.repository.save(data);
  }

  async fetchCommunities() {
    return await this.repository.find({
      select: { entry: { community: true } },
    });
  }

  async getAdminLogEntryById(id: string) {
    try {
      return await this.repository.findOne({
        where: { _id: { $eq: new ObjectId(id) } },
      });
    } catch (e) {
      console.log("ERROR", e);
    }
  }

  async getAdminLogEntriesByCommunity(communityId: string) {
    return await this.repository.find({
      where: { "entry.community.id": { $eq: communityId } },
    });
  }

  async getAdminLogEntriesByUser(userId: string | number) {
    return await this.repository.find({
      where: { "entry.creator.id": { $eq: userId } },
    });
  }

  async getAdminLogEntryByPostId(postId: number) {
    return await this.repository.findOne({
      where: { "entry.post.id": { $eq: postId } },
    });
  }

  async getAdminLogEntriesAfterId(
    id: string | undefined,
    communityIds: number[] | false,
    limit: number = 20
  ) {
    try {
      const query: any = {};
      if (id) {
        query._id = { $lte: new ObjectId(id) };
      }

      if (communityIds) {
        query["entry.community.id"] = { $in: communityIds };
      }
      return await this.repository.find({
        where: query,
        order: { _id: -1 },
        take: limit,
      });
    } catch (e) {
      console.log(e);
    }
  }

  async removeAdminLogEntry(data: AdminLogModel<adminAllowedEntries>) {
    return await this.repository.delete(data);
  }

  async refreshAdminLogEntry(data: AdminLogModel<adminAllowedEntries>) {
    console.log("REFRESHING ADMIN QUEUE ENTRY", data);
    const entry = await this.postService.getPost(data.entry.post.id, true);

    if (!entry) {
      return null;
    }

    data.entry = entry;

    return await this.updateAdminLogEntry(data);
  }
}

export default adminLogService;
