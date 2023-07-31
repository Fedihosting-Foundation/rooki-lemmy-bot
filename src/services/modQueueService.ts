import { PostView } from "lemmy-js-client";
import { Inject, Service } from "typedi";
import "reflect-metadata";
import CommunityService from "./communityService";
import modQueueRepository from "../repository/modQueueRepository";
import ModQueueEntryModel from "../models/modQueueEntry";

@Service()
class modQueueService {
  @Inject()
  repository: modQueueRepository;

  @Inject()
  communityService: CommunityService;

  constructor() {}

  async addModQueueEntry(post: PostView) {
    const entry = this.repository.create();
    entry.entry = post;
    return await this.repository.save(entry);
  }

  async getModQueueEntries() {
    return await this.repository.findAll();
  }

  async updateModQueueEntry(data: ModQueueEntryModel) {
    return await this.repository.save(data);
  }

  async getModQueueEntriesByCommunity(communityId: string) {
    return await this.repository.find({
      where: { "entry.post.community.id": { $eq: communityId } },
    });
  }

  async getModQueueEntry(postId: number) {
    return await this.repository.findOne({
      where: { "entry.post.id": { $eq: postId } },
    });
  }

  async removeModQueueEntry(data: ModQueueEntryModel) {
    return await this.repository.delete(data);
  }
}

export default modQueueService;
