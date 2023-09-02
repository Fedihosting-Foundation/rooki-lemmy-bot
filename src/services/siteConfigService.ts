import { Inject, Service } from "typedi";
import "reflect-metadata";
import CommunityService from "./communityService";
import postService from "./postService";
import siteConfigRepository from "../repository/siteConfigRepository";
import SiteConfigModel from "../models/siteConfigModel";

@Service()
class siteConfigService {
  @Inject()
  repository: siteConfigRepository;

  @Inject()
  communityService: CommunityService;

  @Inject()
  postService: postService;

  async getConfig(
  ) {
    const foundResults = await this.repository.findAll()
    if (foundResults.length > 0) {
      return foundResults[0];
    }
    return this.repository.create();
  }

  async updateConfig(
    data: SiteConfigModel
  ) {
    return await this.repository.save(data);
  }
}

export default siteConfigService;
