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
import {
  CommentReportResponse,
  CommentReportView,
  ListPostReportsResponse,
  PostReportView,
} from "lemmy-js-client";
import { sleep } from "../helpers/lemmyHelper";

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

  async fetchCommunities() {
    return await this.repository.find({
      select: { entry: { community: true } },
    });
  }

  async getModQueueEntryById(id: string) {
    try {
      return await this.repository.findOne({
        where: { _id: { $eq: new ObjectId(id) } },
      });
    } catch (e) {
      console.log("ERROR", e);
    }
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
  async getModQueueEntryByPostId(postId: number, ignoreReports: boolean = false) {
    const query: any = {
      where: { "entry.post.id": { $eq: postId } },
    };
    if (ignoreReports) {
      query.where["entry.post_report"] = { $exists: false };
      query.where["entry.comment_report"] = { $exists: false };
    }
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

  async removeModQueueEntry(data: ModQueueEntryModel<allowedEntries>) {
    return await this.repository.delete(data);
  }

  async refreshModQueueEntry(data: ModQueueEntryModel<allowedEntries>) {
    if ("comment_report" in data.entry) {
      const list: CommentReportView[] = [];
      let i = 1;
      for (i; i < 5; i++) {
        const reports = await client.listCommentReports({
          auth: getAuth(),
          unresolved_only: false,
          community_id: data.entry.community.id,
        });

        list.push(...reports.comment_reports);
        i++;
        await sleep(2000)
      }
      await asyncForEach(list, async (report) => {
        const foundReport = await this.getModQueueEntryByCommentReportId(
          report.comment_report.id
        );
        if (foundReport) {
          foundReport.entry = report;
          await this.updateModQueueEntry(foundReport);
        } else {
          console.log("NOT FOUND COMMENT REPORT Creating:", report);
          await this.addModQueueEntry(report);
        }
      });
      return;
    } else if ("post_report" in data.entry) {
      const list: PostReportView[] = [];
      let i = 1;
      for (i; i < 5; i++) {
        const reports = await client.listPostReports({
          auth: getAuth(),
          unresolved_only: false,
          community_id: data.entry.community.id,
        });

        list.push(...reports.post_reports);
        i++;
        await sleep(2000)
      }
      await asyncForEach(list, async (report) => {
        const foundReport = await this.getModQueueEntryByPostReportId(
          report.post_report.id
        );
        if (foundReport) {
          foundReport.entry = report;
          await this.updateModQueueEntry(foundReport);
        } else {
          console.log("NOT FOUND POST REPORT Creating:", report);
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
