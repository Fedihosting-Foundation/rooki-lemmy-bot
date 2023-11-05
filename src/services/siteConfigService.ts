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

  static getDefaultSiteConfig(): Omit<SiteConfigModel, "id"> {

    return {
      nsfwFilter: {
        enabled: false,
        banAgeHours: 0,
        thresholds: {
          hentai: 1,
          hentaiWarning: 1,
          porn: 1,
          pornWarning: 1,
          combined: 1,
          combinedWarning: 1,
        }
      }

    }
  }

  async getConfig(
  ) {
    const foundResults = await this.repository.findAll()
    console.log("foundResults")
    console.log(foundResults)
    if (foundResults.length > 0) {
      return foundResults[0];
    }
    return this.updateConfig({ ... this.repository.create(), ...siteConfigService.getDefaultSiteConfig() });
  }

  async updateConfig(
    data: SiteConfigModel
  ) {
    return await this.repository.save(data);
  }
}

export default siteConfigService;
