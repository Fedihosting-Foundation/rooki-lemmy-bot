import "reflect-metadata";
import { PostView } from "lemmy-js-client";
import postViewRepository from "../repository/postViewRepository";
import { Inject, Service } from "typedi";
import postViewModel from "../models/postViewModel";
import baseService from "./baseService";
import client, { getAuth } from "../main";
import { sleep } from "../helpers/lemmyHelper";
import emitEvent from "../helpers/eventHelper";
import CommunityService from "./communityService";
import communityConfigService from "./communityConfigService";

@Service()
class postService extends baseService<PostView, postViewModel> {
  @Inject()
  repository: postViewRepository;

  @Inject()
  CommunityService: CommunityService;

  @Inject()
  CommunityConfigService: communityConfigService;

  postCache: { [key: number]: PostView } = {};

  constructor() {
    super(
      async (input, cb) => {
        const post = input as PostView;
        try {
          const config = await this.CommunityConfigService.getCommunityConfig(
            post.community
          );
          if (!config) return;
          const foundPost = await this.repository.findOne({
            where: { "post.id": { $eq: post.post.id } },
          });
          if (foundPost) {
            const updatedPost = { ...foundPost, ...post };
            const result = await this.repository.save(updatedPost);
            if (post.post.deleted !== foundPost.post.deleted) {
              emitEvent("postdeleted", { data: result, config: config });
            } else if (post.post.updated !== foundPost.post.updated) {
              emitEvent("postupdated", { data: result, config: config });
            }
            cb(null, result);
            return;
          }
          const repositoryPost = this.repository.create();
          const createdPost = { ...repositoryPost, ...post };

          const result = await this.repository.save(createdPost);
          emitEvent("postcreated", { data: result, config: config });

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
    setInterval(() => {
      this.postCache = {};
    }, 1000 * 60 * 15);
  }

  async fetchAndUpdate() {
    const posts: PostView[] = [];
    for (const community of await this.CommunityConfigService.getCommunities()) {
      try {
        const result = await client.getPosts({
          community_id: community.community.id,
          auth: getAuth(),
          sort: "New",
          type_: "Local",
        });
        console.log("Fetched posts for", community.community.name);
        this.push(...result.posts);
        posts.push(...result.posts);
      } catch (e) {
        console.log("Post Fetch Error")
        console.log(e);
      }
      await sleep(10000);
    }
    return posts;
  }

  async getPost(id: number, force: boolean = false) {
    if (!force && this.postCache[id]) return this.postCache[id];
    if (force) {
      const dbPost = await this.repository.findOne({
        where: { "post.id": { $eq: id } },
      });
      if (dbPost) {
        this.postCache[id] = dbPost;
        return dbPost;
      }
    }

    const post = await client.getPost({ id: id, auth: getAuth() });

    if (post) this.postCache[id] = post.post_view;
    return post.post_view;
  }
}

export default postService;
