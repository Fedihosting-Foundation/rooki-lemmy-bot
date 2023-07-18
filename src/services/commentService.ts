import { CommentView, PostView } from "lemmy-js-client";
import { Inject, Service } from "typedi";
import getConfig from "../helpers/configHelper";
import { CommunityConfig } from "../models/iConfig";
import baseService from "./baseService";
import commentViewModel from "../models/commentViewModel";
import commentViewRepository from "../repository/commentViewRepository";
import { activeCommunities } from "../config";
import client, { getAuth } from "../main";
import { getCommunity, sleep } from "../helpers/lemmyHelper";
import "reflect-metadata";
import emitEvent from "../helpers/eventHelper";

@Service()
class commentService extends baseService<
  CommentView & { config?: CommunityConfig },
  commentViewModel
> {
  @Inject()
  repository: commentViewRepository;
  constructor() {
    super(
      async (input, cb) => {
        const comment = input as CommentView
        try {
          const config = getConfig(comment.community.name);

          const foundComment = await this.repository.findOne({
            where: { "comment.id": { $eq: comment.comment.id } },
          });
          if (foundComment) {
            console.log(
              "Comment already exists in database " + comment.comment.id
            );
            const updatedComment = { ...foundComment, ...comment };
            const result = await this.repository.save(updatedComment);
            if (comment.comment.deleted !== foundComment.comment.deleted) {
              emitEvent("commentdeleted", result, config);
            } else if (comment.comment.updated !== foundComment.comment.updated) {
              emitEvent("commentupdated", result, config);
            }
            cb(null, result);
            return;
          }
          const repositoryComment = this.repository.create();
          const createdComment = { ...repositoryComment, ...comment };

          const result = await this.repository.save(createdComment);
          emitEvent("commentcreated", result, config);

          // TODO: Handle Post

          console.log("Handled Comment", comment.post.id);

          cb(null, result);
        } catch (e) {
          cb(e);
        }
      },
      {
        concurrent: 4,
      }
    );
  }

  async fetchAndUpdate() {
    const comments: CommentView[] = [];
    for (const community of activeCommunities) {
      try {
        const result = await client.getComments({
          community_id: (
            await getCommunity({ name: community })
          ).community_view.community.id,
          auth: getAuth(),
          sort: "New",
          type_: "Local",
        });
        this.push(...result.comments);
        comments.push(...result.comments);
        await sleep(1000);
      } catch (e) {
        console.log(e);
      }
    }
    return comments;
  }
}

export default commentService;
