import { LemmyHttp } from "lemmy-js-client";
import { LemmyCommand } from "../decorators/lemmyPost";
import { getAuth } from "../main";
import { LemmyCommandArguments } from "../types/LemmyEvents";

class usermanagementCommand {
  @LemmyCommand({
    data: {
      command: "ban",
      description: "Ban a user",
      example:
        "ban [username - u/THISPART] (duration - days) (delete posts - true/false) (reason - Spaces allowed)",
      modOnly: true,
    },
  })
  async ban(client: LemmyHttp, event: LemmyCommandArguments) {
    try {
      const userName = event.restArgs[0];
      if (!userName) {
        await client.createComment({
          content:
            "You must specify a user for example: [@me] ban [username - u/THISPART] (duration - days) (delete posts - true/false) (reason - Spaces allowed)",
          parent_id: event.data.comment.id,
          auth: getAuth(),
          post_id: event.data.post.id,
          language_id: event.data.comment.language_id,
        });
        return;
      }

      if (event.data.creator.actor_id.includes(userName)) {
        await client.createComment({
          content: "You can't ban yourself.",
          parent_id: event.data.comment.id,
          auth: getAuth(),
          post_id: event.data.post.id,
          language_id: event.data.comment.language_id,
        });
        return;
      }

      const user = await client.getPersonDetails({
        auth: getAuth(),
        username: userName,
      });
      console.log(user)
      if(!user) {
        await client.createComment({
          content: "User not found.",
          parent_id: event.data.comment.id,
          auth: getAuth(),
          post_id: event.data.post.id,
          language_id: event.data.comment.language_id,
        });
        return;
      }
      const duration =
        Number(event.restArgs[1]) === -1
          ? undefined
          : Number(event.restArgs[1]) || undefined;
      const deletePosts = event.restArgs[2];

      const restArguments = event.restArgs.splice(0, 3);
      const reason = restArguments.join(" ") || "No reason provided";

      await client.banFromCommunity({
        auth: getAuth(),
        person_id: user.person_view.person.id,
        community_id: event.data.post.community_id,
        reason: `Ban Requested by ${event.data.creator.actor_id} -  with the reason: ${reason}`,
        expires: duration,
        remove_data: deletePosts === "true",
        ban: true,
      });

      await client.createComment({
        content: "Successfully banned the user.",
        parent_id: event.data.comment.id,
        auth: getAuth(),
        post_id: event.data.post.id,
        language_id: event.data.comment.language_id,
      });
    } catch (e) {
      console.log("ERROR");
      console.log(e);
      await client.createComment({
        content: "An error occured while banning the user.",
        parent_id: event.data.comment.id,
        auth: getAuth(),
        post_id: event.data.post.id,
        language_id: event.data.comment.language_id,
      });
    }
  }

  @LemmyCommand({
    data: {
      command: "unban",
      description: "Unban a user",
      example: "unban [username - u/THISPART]",
      modOnly: true,
    },
  })
  async unBan(client: LemmyHttp, event: LemmyCommandArguments) {
    try {
      const userName = event.restArgs[0];
      if (!userName) {
        await client.createComment({
          content:
            "You must specify a user for example: [@me] ban [username - u/THISPART] (reason) (duration - days) (delete posts - true/false)",
          parent_id: event.data.comment.id,
          auth: getAuth(),
          post_id: event.data.post.id,
          language_id: event.data.comment.language_id,
        });
        return;
      }

      if (event.data.creator.actor_id.includes(userName)) {
        await client.createComment({
          content: "You can't unban yourself.",
          parent_id: event.data.comment.id,
          auth: getAuth(),
          post_id: event.data.post.id,
          language_id: event.data.comment.language_id,
        });
        return;
      }

      const user = await client.getPersonDetails({
        auth: getAuth(),
        username: userName,
        community_id: event.data.post.community_id,
      });

      await client.banFromCommunity({
        auth: getAuth(),
        person_id: user.person_view.person.id,
        community_id: event.data.post.community_id,
        reason: `Unban Requested by ${event.data.creator.actor_id}`,
        ban: false,
      });

      await client.createComment({
        content: "Successfully unbanned the user.",
        parent_id: event.data.comment.id,
        auth: getAuth(),
        post_id: event.data.post.id,
        language_id: event.data.comment.language_id,
      });
    } catch (e) {
      console.log(e);
      await client.createComment({
        content: "An error occured while unbanning the user.",
        parent_id: event.data.comment.id,
        auth: getAuth(),
        post_id: event.data.post.id,
        language_id: event.data.comment.language_id,
      });
    }
  }
}
