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
}

export default class filterUrl {
  @LemmyOn({ event: "postcreated" })
  async checkFilteredPosts(
    event: LemmyEventArguments<postViewModel>
  ) {
    const { post } = event.data;

    if (post.removed || post.deleted || (await getPersonService().getUserInfo(post.creator_id))?.person.person_view.person.admin) return;
    const isFiltered = filterUrls.some((url) =>
      post.url?.includes(url) || post.body?.includes(url) || post.name?.includes(url) || post.name?.includes(url)
    );
    if (isFiltered) {
      await client.removePost({
        auth: getAuth(),
        post_id: post.id,
        removed: true,
        reason: "Blacklisted URL"
      });

      await client.banPerson({
        auth: getAuth(),
        person_id: post.creator_id,
        ban: true,
        reason: "Send a Blacklisted URL"
      });
      const webhook = getSlackWebhook();
      if (webhook) {
        await webhook.send({
          text: `${event.data.creator.name} (${post.creator_id}) has been banned for sending a blacklisted URL!  
          
          Post: ${post.ap_id}  
          `
        });
      }
    }
  }

  @LemmyOn({ event: "commentcreated" })
  async checkFilteredComments(
    event: LemmyEventArguments<commentViewModel>
  ) {
    const { comment } = event.data;

    if (comment.removed || comment.deleted || (await getPersonService().getUserInfo(comment.creator_id))?.person.person_view.person.admin) return;
    const isFiltered = filterUrls.some((url) =>
      comment.content?.includes(url)
    );
    if (isFiltered) {
      await client.removeComment({
        auth: getAuth(),
        comment_id: comment.id,
        removed: true,
        reason: "Blacklisted URL"
      });

      await client.banPerson({
        auth: getAuth(),
        person_id: comment.creator_id,
        ban: true,
        reason: "Send a Blacklisted URL"
      });
      const webhook = getSlackWebhook();
      if (webhook) {
        await webhook.send({
          text: `${event.data.creator.name} (${comment.creator_id}) has been banned for sending a blacklisted URL!
          
          Comment: ${comment.content}`
        });
      }
    }
  }
}