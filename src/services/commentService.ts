import { CommentView, PostView } from "lemmy-js-client";
import { Inject, Service } from "typedi";
import baseService from "./baseService";
import commentViewModel from "../models/commentViewModel";
import commentViewRepository from "../repository/commentViewRepository";
import client, { getAuth } from "../main";
import "reflect-metadata";
import emitEvent from "../helpers/eventHelper";
import CommunityService from "./communityService";
import communityConfigModel from "../models/communityConfigModel";
import communityConfigService from "./communityConfigService";
import { sleep } from "../helpers/lemmyHelper";

@Service()
class commentService extends baseService<
  CommentView & { config?: communityConfigModel },
  commentViewModel
> {
  @Inject()
  repository: commentViewRepository;

  @Inject()
  CommunityService: CommunityService;

  @Inject()
  CommunityConfigService: communityConfigService;

  constructor() {
    super(async (input, cb) => {
      const comment = input as CommentView;
      try {
        const config = await this.CommunityConfigService.getCommunityConfig(
          comment.community
        );
        if (!config) return;
        const foundComment = await this.repository.findOne({
          where: { "comment.id": { $eq: comment.comment.id } },
        });
        if (foundComment) {
          const updatedComment = { ...foundComment, ...comment };
          const result = await this.repository.save(updatedComment);
          if (comment.comment.deleted !== foundComment.comment.deleted) {
            emitEvent("commentdeleted", { data: result, config: config });
          } else if (comment.comment.updated !== foundComment.comment.updated) {
            emitEvent("commentupdated", { data: result, config: config });
          }
          cb(null, result);
          return;
        }
        const repositoryComment = this.repository.create();
        const createdComment = { ...repositoryComment, ...comment };

        const result = await this.repository.save(createdComment);
        emitEvent("commentcreated", { data: result, config: config });

        console.log("Handled Comment", comment.comment.id);

        cb(null, result);
      } catch (e) {
        cb(e);
      }
    }, {});
  }

  async fetchAndUpdate() {
    const comments: CommentView[] = [];
    try {
      const communities = await this.CommunityConfigService.getCommunities();
      for (let i = 1; i <= 5; i++) {
        const result = {
          comments: (
            await client.getComments({
              auth: getAuth(),
              sort: "New",
              type_: "Local",
              limit: 20,
              page: i,
            })
          ).comments.filter((x) =>
            communities.some((y) => y.community.id === x.community.id)
          ),
        };
        this.push(...result.comments);
        comments.push(...result.comments);
      await sleep(15000);
      }
    } catch (e) {
      console.log("Comment Fetch Error");
      console.log(e);
    }
    // for (const configCommunity of await this.CommunityConfigService.getCommunities()) {
    //   try {
    //     if (!configCommunity) continue;
    //     const result = await client.getComments({
    //       community_id: configCommunity.community.id,
    //       auth: getAuth(),
    //       sort: "New",
    //       type_: "Local",
    //     });
    //     this.push(...result.comments);
    //     comments.push(...result.comments);
    //   } catch (e) {
    //     console.log("Comment Fetch Error")
    //     console.log(e);
    //   }
    //   await sleep(15000);
    // }
    return comments;
  }
}

export default commentService;
