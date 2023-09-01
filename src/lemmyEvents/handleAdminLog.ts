import { LemmyOn } from "../decorators/lemmyPost";
import postViewModel from "../models/postViewModel";
import { LemmyEventArguments } from "../types/LemmyEvents";
import client, { getAuth } from "../main";
import { typeDiDependencyRegistryEngine } from "discordx";
import adminLogService from "../services/adminLogService";
import analysePicture from "../utils/DetectNSFW";
import CommunityService from "../services/communityService";
import { AdminQueueEntryResult } from "../models/adminLogModel";
import BetterQueue from "better-queue";
import { PostView } from "lemmy-js-client";

let adminLogServ: adminLogService | undefined;

function getAdminLogService() {
  if (!adminLogServ) {
    adminLogServ =
      typeDiDependencyRegistryEngine.getService(adminLogService) || undefined;
  }
  return adminLogServ;
}
let communityServ: CommunityService | undefined;

function getCommunityService() {
  if (!communityServ) {
    communityServ =
      typeDiDependencyRegistryEngine.getService(CommunityService) || undefined;
  }
  return communityServ;
}

const handleProcess = async (
  data: {
    url: string;
    post: PostView;
    service: adminLogService;
  },
  cb: BetterQueue.ProcessFunctionCb<any>
) => {
  try {
    if (data.url) {
      const community = data.post.community;
      if (community.nsfw) {
        cb();
        return;
      }
      let predictions: any[];
      try {
        predictions = await analysePicture(data.url);
      } catch (e) {
        console.log(
          "Something went wrong with NSFW detection - High Possibility NOT a picture"
        );
        console.log(data.url);
        console.log(e);
        cb(e, undefined);
        return;
      }
      console.log(data.url);
      console.log(predictions);

      const hentai = predictions.find((x) => x.className === "Hentai");
      const porn = predictions.find((x) => x.className === "Porn");
      console.log(
        "Is tooo sexy: " +
          (hentai.probability > 0.95 ||
            porn.probability > 0.95 ||
            porn.probability + hentai.probability > 0.9)
      );

      if (
        hentai.probability > 0.95 ||
        porn.probability > 0.95 ||
        porn.probability + hentai.probability > 0.9
      ) {
        try {
          // await client.removePost({
          //   auth: getAuth(),
          //   post_id: data.post.post.id,
          //   removed: true,
          //   reason: "NSFW in not NSFW community!",
          // });
        } catch (e) {
          console.log(e);
          console.log("Not an admin / mod");
        }
        if (
          Date.now() - new Date(data.post.creator.published).getTime() <
          1000 * 60 * 60
        ) {
          console.log("NSFW AND YOUNG ACCOUNT BANNING", data.post.creator);
          try {
            // await client.banPerson({
            //   auth: getAuth(),
            //   ban: true,
            //   person_id: data.post.creator.id,
            //   reason: "NSFW in not NSFW community!",
            //   remove_data: true,
            // });
          } catch (e) {
            console.log(e);
            console.log("Not an admin");
          }
          await data.service.addAdminLogEntry(
            data.post,
            AdminQueueEntryResult.Banned,
            "NSFW in not NSFW community + Account was too young (<2 hours)!",
            predictions
          );
        } else {
          await data.service.addAdminLogEntry(
            data.post,
            AdminQueueEntryResult.Removed,
            "NSFW in not NSFW community!",
            predictions
          );
        }
      }else{
        if(     hentai.probability > 0.75 ||
          porn.probability > 0.75 ||
          porn.probability + hentai.probability > 0.75)
        await data.service.addAdminLogEntry(
          data.post,
          AdminQueueEntryResult.Nothing,
          "NSFW in not NSFW community BUT not too nsfw!",
          predictions
        );
      }
    } else {
      console.log("No URL????");
    }
  } catch (e) {
    console.log("Something went wrong with NSFW detection");
    console.log(e);
  }
  cb(undefined, undefined);
};
const queue = new BetterQueue<{
  url: string;
  post: PostView;
  service: adminLogService;
}>({
  process: handleProcess,
  afterProcessDelay: 10000,
  maxTimeout: 20000,
});
const FastQueue = new BetterQueue<{
  url: string;
  post: PostView;
  service: adminLogService;
}>({
  process: handleProcess,
  afterProcessDelay: 2000,
  maxTimeout: 20000,
});
queue.resume();
FastQueue.resume();

class AdminLogHandler {
  @LemmyOn({ event: "postcreated" })
  async handlePost(event: LemmyEventArguments<postViewModel>) {
    const post = event.data;
    if (!post.community.local) return;

    const service = getAdminLogService();
    if (!service) return;

    const url = post.post.thumbnail_url || post.post.url;
    if (!url) return;

    const isFastPass = [
      "lemmy.world/pictrs/image/",
      "media.kbin.social/media/",
    ].some((x) => url?.includes(x));
    if (isFastPass) {
      console.log("FastPassing " + url);
      FastQueue.push({ url, post, service });
      return;
    }

    queue.push({ url: url, post: post, service: service });
  }

  @LemmyOn({ event: "postupdated" })
  async handlePostUpdate(event: LemmyEventArguments<postViewModel>) {
    const eventPost = event.data;
    if (!eventPost.community.local) return;

    const service = getAdminLogService();
    if (!service) return;

    let post = (await service.getAdminLogEntryByPostId(eventPost.post.id))
      ?.entry;

    let url = eventPost.post.thumbnail_url || eventPost.post.url;
    if (url === post?.post.thumbnail_url || url === post?.post.url || !url)
      return;

    post = post ?? eventPost;

    const isFastPass = [
      "lemmy.world/pictrs/image/",
      "media.kbin.social/media/",
    ].some((x) => url?.includes(x));
    if (isFastPass) {
      console.log("FastPassing " + url);
      FastQueue.push({ url, post, service });
      return;
    }

    queue.push({ url, post, service });
  }
}
