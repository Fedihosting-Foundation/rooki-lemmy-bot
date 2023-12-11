import { Inject, Service } from "typedi";
import "reflect-metadata";
import CommunityService from "./communityService";
import postService from "./postService";
import client, { getAuth } from "../main";
import userInfoRepository from "../repository/userInfoRepository";

@Service()
class userInfoService {
  @Inject()
  repository: userInfoRepository;

  @Inject()
  communityService: CommunityService;

  @Inject()
  postService: postService;

  async getUserInfo(
    user: number,
    forceRefresh: boolean = false
  ) {
    const foundResults = await this.repository.findOne({
      where: { userId: { $eq: user } },
    });
    if (!forceRefresh) {
      if (foundResults) {
        return foundResults;
      }
    }
    const personDetails = await client.getPersonDetails({
      auth: getAuth(),
      person_id: user,
    });
    if (personDetails) {
      const entry = foundResults || this.repository.create();
      entry.userId = user;
      entry.flaged
      entry.person = personDetails;
      return await this.repository.save(entry);
    }
  }
}

export default userInfoService;
