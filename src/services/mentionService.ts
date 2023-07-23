import "reflect-metadata";
import { PersonMentionView, PostView } from "lemmy-js-client";
import { Inject, Service } from "typedi";
import baseService from "./baseService";
import client, { getAuth } from "../main";
import personMetionViewRepository from "../repository/personMetionViewRepository";
import personMentionViewModel from "../models/personMentionViewModel";
import emitEvent from "../helpers/eventHelper";
import communityConfigService from "./communityConfigService";

@Service()
class mentionService extends baseService<
  PersonMentionView,
  personMentionViewModel
> {
  @Inject()
  repository: personMetionViewRepository;

  @Inject()
  CommunityConfigService: communityConfigService;

  constructor() {
    super(
      async (input, cb) => {
        const mention = input as PersonMentionView;
        try {
          const config = await this.CommunityConfigService.getCommunityConfig(
            mention.community
          );
          const foundMention = await this.repository.findOne({
            where: { "comment.id": { $eq: mention.comment.id } },
          });
          if (foundMention) {
            cb(null, foundMention);
            return;
          }
          const repositoryMention = this.repository.create();
          const createdMention = { ...repositoryMention, ...mention };

          const result = await this.repository.save(createdMention);
          emitEvent("personmentioned", result, config);

          // TODO: Handle Post
          console.log("Handled mention", mention.post.id);

          cb(null, result);
        } catch (e) {
          console.log(e);
          cb(e);
        }
      },
      {
        concurrent: 4,
      }
    );
  }

  async fetchAndUpdate() {
    const mentions: PersonMentionView[] = [];
    try {
      const result = await client.getPersonMentions({
        auth: getAuth(),
        sort: "New",
      });
      console.log("Fetched Mentions");
      this.push(...result.mentions);
      mentions.push(...result.mentions);
    } catch (e) {
      console.log(e);
    }
    return mentions;
  }
}

export default mentionService;
