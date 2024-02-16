import Container from "typedi";
import { LemmyOn } from "../decorators/lemmyPost";
import client, { getAuth } from "../main";
import postViewModel from "../models/postViewModel";
import { getSlackWebhook } from "../services/adminLogService";
import userInfoService from "../services/userInfoService";
import { LemmyEventArguments } from "../types/LemmyEvents";
import commentViewModel from "../models/commentViewModel";
import filterUrls from "../../blacklistedurls.json";

const getPersonService = () => {
  return Container.get(userInfoService);
};

// Regex: @TEST@domain.com or [@TEST]
const regex = /(?:@\S+@.*){5}/gim;

export default class filterUrl {
  @LemmyOn({ event: "postcreated" })
  async checkPingSpam(event: LemmyEventArguments<postViewModel>) {
    const { post } = event.data;

    if (
      post.removed ||
      post.deleted ||
      (await getPersonService().getUserInfo(post.creator_id))?.person
        .person_view.person.admin
    )
      return;

    const isSpam = regex.test(post.body ?? "") || regex.test(post.name ?? "");

    if (isSpam) {
      await client.removePost({
        auth: getAuth(),
        post_id: post.id,
        removed: true,
        reason: "Ping Spam",
      });

      await client.banPerson({
        auth: getAuth(),
        person_id: post.creator_id,
        ban: true,
        reason: "Ping Spam",
      });
      const webhook = getSlackWebhook();
      if (webhook) {
        await webhook.send({
          text: `${event.data.creator.name} (${post.creator_id}) has been banned for sending a ping spam!  
          
          Post: https://lemmy.world/post/${post.id}  
          `,
        });
      }
    }
  }

  @LemmyOn({ event: "commentcreated" })
  async checkPingSpamComments(event: LemmyEventArguments<commentViewModel>) {
    const { comment } = event.data;

    if (
      comment.removed ||
      comment.deleted ||
      (await getPersonService().getUserInfo(comment.creator_id))?.person
        .person_view.person.admin
    )
      return;

    const isSpam = regex.test(comment.content ?? "");

    if (isSpam) {
      await client.removeComment({
        auth: getAuth(),
        comment_id: comment.id,
        removed: true,
        reason: "Ping Spam",
      });

      await client.banPerson({
        auth: getAuth(),
        person_id: comment.creator_id,
        ban: true,
        reason: "Ping Spam",
      });
      const webhook = getSlackWebhook();
      if (webhook) {
        await webhook.send({
          text: `${event.data.creator.name} (${comment.creator_id}) has been banned for sending a ping spam!
          
          Comment: https://lemmy.world/comment/${comment.id}`,
        });
      }
    }
  }

  @LemmyOn({ event: "postcreated" })
  async checkFilteredPosts(event: LemmyEventArguments<postViewModel>) {
    const { post } = event.data;

    if (
      post.removed ||
      post.deleted ||
      (await getPersonService().getUserInfo(post.creator_id))?.person
        .person_view.person.admin
    )
      return;

    const isFiltered = filterUrls.some((url_exp) => {
      const ex = new RegExp(url_exp, "gim");
      return (
        post.body?.match(ex) || post.url?.match(ex) || post.name?.match(ex)
      );
    });

    if (isFiltered) {
      await client.removePost({
        auth: getAuth(),
        post_id: post.id,
        removed: true,
        reason: "Blacklisted URL",
      });

      await client.banPerson({
        auth: getAuth(),
        person_id: post.creator_id,
        ban: true,
        reason: "Send a Blacklisted URL",
      });
      const webhook = getSlackWebhook();
      if (webhook) {
        await webhook.send({
          text: `${event.data.creator.name} (${post.creator_id}) has been banned for sending a blacklisted URL!  
          
          Post: https://lemmy.world/post/${post.id}  
          `,
        });
      }
    }
  }

  @LemmyOn({ event: "commentcreated" })
  async checkFilteredComments(event: LemmyEventArguments<commentViewModel>) {
    const { comment } = event.data;

    if (
      comment.removed ||
      comment.deleted ||
      (await getPersonService().getUserInfo(comment.creator_id))?.person
        .person_view.person.admin
    )
      return;
    const isFiltered = filterUrls.some((url_exp) => {
      const ex = new RegExp(url_exp, "gim");
      return comment.content?.match(ex);
    });
    if (isFiltered) {
      await client.removeComment({
        auth: getAuth(),
        comment_id: comment.id,
        removed: true,
        reason: "Blacklisted URL",
      });

      await client.banPerson({
        auth: getAuth(),
        person_id: comment.creator_id,
        ban: true,
        reason: "Send a Blacklisted URL",
      });
      const webhook = getSlackWebhook();
      if (webhook) {
        await webhook.send({
          text: `${event.data.creator.name} (${comment.creator_id}) has been banned for sending a blacklisted URL!
          
          Comment: https://lemmy.world/comment/${comment.id}`,
        });
      }
    }
  }
}
