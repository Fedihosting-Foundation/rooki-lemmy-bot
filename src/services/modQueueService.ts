import { Inject, Service } from "typedi";
import "reflect-metadata";
import CommunityService from "./communityService";
import modQueueRepository from "../repository/modQueueRepository";
import ModQueueEntryModel, {
  allowedEntries,
} from "../models/modQueueEntryModel";
import postService from "./postService";
import client, { getAuth } from "../main";
import { asyncForEach } from "../utils/AsyncForeach";
import { ObjectId } from "mongodb";

@Service()
class modQueueService {
  @Inject()
  repository: modQueueRepository;

  @Inject()
  communityService: CommunityService;

  @Inject()
  postService: postService;

  constructor() {}

  async addModQueueEntry(data: allowedEntries) {
    const entry = this.repository.create();
    entry.entry = data;
    return await this.repository.save(entry);
  }

  async getModQueueEntries() {
    return await this.repository.findAll();
  }

  async updateModQueueEntry(data: ModQueueEntryModel<allowedEntries>) {
    return await this.repository.save(data);
  }

  async getModQueueEntryById(id: string) {
    return await this.repository.findOne({
      where: { _id: { $eq: new ObjectId(id) } },
    });
  }

  async getModQueueEntriesByCommunity(communityId: string) {
    return await this.repository.find({
      where: { "entry.community.id": { $eq: communityId } },
    });
  }

  async getModQueueEntriesByUser(userId: string | number) {
    return await this.repository.find({
      where: { "entry.creator.id": { $eq: userId } },
    });
  }
  async getModQueueEntryByPostId(postId: number) {
    return await this.repository.findOne({
      where: { "entry.post.id": { $eq: postId } },
    });
  }
  async getModQueueEntryByCommentReportId(commentReportId: number) {
    return await this.repository.findOne({
      where: { "entry.comment_report.id": { $eq: commentReportId } },
    });
  }
  async getModQueueEntryByPostReportId(postReportId: number) {
    return await this.repository.findOne({
      where: { "entry.post_report.id": { $eq: postReportId } },
    });
  }

  async getModQueueEntriesAfterId(
    id: string | undefined,
    communityIds: number[] | false,
    limit: number = 20
  ) {
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
  }

  async removeModQueueEntry(data: ModQueueEntryModel<allowedEntries>) {
    return await this.repository.delete(data);
  }

  async refreshModQueueEntry(data: ModQueueEntryModel<allowedEntries>) {
    console.log("REFRESHING MOD QUEUE ENTRY", data);
    if ("comment_report" in data.entry) {
      const list = (
        await client.listCommentReports({
          auth: getAuth(),
          unresolved_only: false,
          community_id: data.entry.community.id,
        })
      ).comment_reports;
      await asyncForEach(list, async (report) => {
        const foundReport = await this.getModQueueEntryByCommentReportId(
          report.comment_report.id
        );
        if (foundReport) {
          foundReport.entry = report;
          await this.updateModQueueEntry(foundReport);
        } else {
          console.log("NOT FOUND REPORT Creating:", report);
          await this.addModQueueEntry(report);
        }
      });
      return;
    } else if ("post_report" in data.entry) {
      const list = (
        await client.listPostReports({
          auth: getAuth(),
          unresolved_only: false,
          community_id: data.entry.community.id,
        })
      ).post_reports;
      console.log("UPADTING POST REPORT");
      await asyncForEach(list, async (report) => {
        const foundReport = await this.getModQueueEntryByPostReportId(
          report.post_report.id
        );
        console.log("FOUND REPORT", foundReport);
        if (foundReport) {
          foundReport.entry = report;
          await this.updateModQueueEntry(foundReport);
        } else {
          console.log("NOT FOUND REPORT Creating:", report);
          await this.addModQueueEntry(report);
        }
      });

      return;
    }

    const entry = await this.postService.getPost(data.entry.post.id, true);

    if (!entry) {
      return null;
    }

    data.entry = entry;

    return await this.updateModQueueEntry(data);
  }
}

export default modQueueService;
