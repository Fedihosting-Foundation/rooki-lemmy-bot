import { Inject, Service } from "typedi";
import "reflect-metadata";
import CommunityService from "./communityService";
import postService from "./postService";
import client, { getAuth } from "../main";
import modLogRepository from "../repository/modLogsRepository";
import RemovedModLogViewModel from "../models/removedModLogModel";
import baseService from "./baseService";
import { GetModlogResponse } from "lemmy-js-client";
import removedModLogRepository from "../repository/removedModLogsRepository";
import emitEvent from "../helpers/eventHelper";
import { sleep } from "../helpers/lemmyHelper";

@Service()
class modLogService extends baseService<GetModlogResponse, RemovedModLogViewModel> {
  @Inject()
  repository: modLogRepository;

  @Inject()
  removedModLogRepository: removedModLogRepository;

  @Inject()
  communityService: CommunityService;

  @Inject()
  postService: postService;

  constructor() {
    super(
      async (input, cb) => {
        const modLog = input as GetModlogResponse;

        modLog.removed_comments.forEach(async (removed_comment) => {
          const foundRepository = await this.removedModLogRepository.repository.findOne({
            where: { "removed_comment.mod_remove_comment.id": { $eq: removed_comment.mod_remove_comment.id } },
          });
          if (!foundRepository) {
            const entry = this.removedModLogRepository.repository.create();
            entry.removed_comment = removed_comment;
            await this.removedModLogRepository.repository.save(entry);
            emitEvent("modlogcreated", { data: entry })
          }
        });
        modLog.removed_posts.forEach(async (removed_post) => {
          const foundRepository = await this.removedModLogRepository.repository.findOne({
            where: { "removed_post.mod_remove_post.id": { $eq: removed_post.mod_remove_post.id } },
          });
          if (!foundRepository) {
            const entry = this.removedModLogRepository.repository.create();
            entry.removed_post = removed_post;
            await this.removedModLogRepository.repository.save(entry);
            emitEvent("modlogcreated", { data: entry })
          }
        })
        modLog.removed_communities.forEach(async (removed_community) => {
          const foundRepository = await this.removedModLogRepository.repository.findOne({
            where: { "removed_community.mod_remove_community.id": { $eq: removed_community.mod_remove_community.id } },
          });
          if (!foundRepository) {
            const entry = this.removedModLogRepository.repository.create();
            entry.removed_community = removed_community;
            await this.removedModLogRepository.repository.save(entry);
            emitEvent("modlogcreated", { data: entry })
          }
        })
      }
    )
  }

  async getModLogEntriesForUser(
    auth: string,
    user: number,
    community?: number,
    page: number = 1,
    limit: number = 50,
    forceRefresh: boolean = false
  ) {
    const foundResults = await this.repository.findOne({
      where: { userId: { $eq: user } },
      order: { createdAt: "DESC" },
    });
    if (!forceRefresh && foundResults) {
      return foundResults;
    }
    const logs = await client.getModlog({
      auth: auth,
      other_person_id: user,
      community_id: community,
      limit,
      page,
    });
    if (logs) {
      const entry = foundResults || this.repository.create();
      entry.userId = user;
      entry.entries = logs;
      entry.createdAt = new Date().getTime();
      return await this.repository.save(entry);
    }
  }

  async fetchAndUpdate() {
    try {
      for (let i = 1; i <= 3; i++) {
        this.push(await client.getModlog({
          auth: getAuth(),
          limit: 20,
          page: i,
        }));

        await sleep(5000);
      }
    } catch (e) {
      console.log("Mod Log Fetch Error");
      console.log(e);
    }

  }
}

export default modLogService;
