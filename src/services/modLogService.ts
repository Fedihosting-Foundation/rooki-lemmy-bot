import { Inject, Service } from "typedi";
import "reflect-metadata";
import CommunityService from "./communityService";
import postService from "./postService";
import client, { getAuth } from "../main";
import modLogRepository from "../repository/modLogsRepository";

@Service()
class modLogService {
  @Inject()
  repository: modLogRepository;

  @Inject()
  communityService: CommunityService;

  @Inject()
  postService: postService;

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
    if (!forceRefresh) {
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
}

export default modLogService;
