import { PostView } from "lemmy-js-client";
import postRepository from "../repository/postRepository";
import Queue from "better-queue";
import { Inject } from "typedi";
import postViewModel from "../models/postViewModel";

export default class postService {
  queue: Queue<PostView, postViewModel>;
  @Inject()
  repository: postRepository;
  constructor() {
    const serviceThis = this;
    this.queue = new Queue(async function (input, cb) {
      try {
        const foundPost = await serviceThis.repository.findOne({where: {post: {id: input.post.id}}});
        if (foundPost) {
            cb("Post already exists in database")
            return
        }
        const result = await serviceThis.repository.save(input);

        // TODO: Handle Post

        console.log("Handled post", input.post.id);

        cb(null, result);
      } catch (e) {
        cb(e);
      }
    }, {autoResume: true});
  }
}
