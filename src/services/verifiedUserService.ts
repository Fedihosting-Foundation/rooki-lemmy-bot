import { Inject, Service } from "typedi";
import "reflect-metadata";
import { User } from "discord.js";
import CommunityService from "./communityService";

@Service()
class verifiedUserService {

  @Inject()
  communityService: CommunityService;
  async isModeratorOf(discordUser: User, communityId: number) {
    return true
  }
}

export default verifiedUserService;
