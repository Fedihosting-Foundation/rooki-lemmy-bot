import "reflect-metadata";
import { PersonMentionView, PostView } from "lemmy-js-client";
import { Inject, Service } from "typedi";
import getConfig from "../helpers/configHelper";
import baseService from "./baseService";
import client, { getAuth } from "../main";
import { sleep } from "../helpers/lemmyHelper";
import personMetionViewRepository from "../repository/personMetionViewRepository";
import personMentionViewModel from "../models/personMentionViewModel";
import emitEvent from "../helpers/eventHelper";

@Service()
class mentionService extends baseService<
  PersonMentionView,
  personMentionViewModel
> {
  @Inject()
  repository: personMetionViewRepository;
  constructor() {
    super(
      async (input, cb) => {
        const mention = input as PersonMentionView 
        try {
          const config = getConfig(mention.community);
          const foundMention = await this.repository.findOne({
            where: { "comment.id": { $eq: mention.comment.id } },
          });
          if (foundMention) {
            console.log(
              "Mention already exists in database " + mention.comment.id
            );
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
      await sleep(1000);
    } catch (e) {
      console.log(e);
    }
    return mentions;
  }
}

export default mentionService;