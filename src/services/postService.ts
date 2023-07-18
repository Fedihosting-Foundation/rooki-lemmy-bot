import "reflect-metadata";
import { PostView } from "lemmy-js-client";
import postViewRepository from "../repository/postViewRepository";
import { Inject, Service } from "typedi";
import postViewModel from "../models/postViewModel";
import getConfig from "../helpers/configHelper";
import { CommunityConfig } from "../models/iConfig";
import baseService from "./baseService";
import { activeCommunities } from "../config";
import client, { getAuth } from "../main";
import { getCommunity, sleep } from "../helpers/lemmyHelper";
import emitEvent from "../helpers/eventHelper";

@Service()
class postService extends baseService<
  PostView,
  postViewModel
> {
  @Inject()
  repository: postViewRepository;
  constructor() {
    super(
      async (input, cb) => {
        const post = input as PostView;
        try {
          const config = getConfig(post.community.name);
          const foundPost = await this.repository.findOne({
            where: { "post.id": { $eq: post.post.id } },
          });
          if (foundPost) {
            console.log("Post already exists in database " + foundPost.post.id);
            const updatedPost = { ...foundPost, ...post };
            const result = await this.repository.save(updatedPost);
            if (post.post.deleted !== foundPost.post.deleted) {
              emitEvent("postdeleted", result, config);
            } else if (post.post.updated !== foundPost.post.updated) {
              emitEvent("postupdated", result, config);
            }
            cb(null, result);
            return;
          }
          const repositoryPost = this.repository.create();
          const createdPost = { ...repositoryPost, ...post };

          const result = await this.repository.save(createdPost);
          emitEvent("postcreated", result, config);

          console.log("Handled post", post.post.id);

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
    const posts: PostView[] = [];
    for (const community of activeCommunities) {
      try {
        const result = await client.getPosts({
          community_id: (await getCommunity({name: community})).community_view.community.id,
          auth: getAuth(),
          sort: "New",
          type_: "Local",
        });
        console.log("Fetched posts for", community);
        this.push(...result.posts);
        posts.push(...result.posts);
        await sleep(1000);
      } catch (e) {
        console.log(e);
      }
    }
    return posts;
  }
}

export default postService;
