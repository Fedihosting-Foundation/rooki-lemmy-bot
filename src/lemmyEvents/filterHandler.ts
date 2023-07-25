import { typeDiDependencyRegistryEngine } from "discordx";
import communityConfigService from "../services/communityConfigService";
import { LemmyOn } from "../decorators/lemmyPost";
import commentViewModel from "../models/commentViewModel";
import communityConfigModel from "../models/communityConfigModel";
import client, { getAuth } from "../main";
import LogService from "../services/logService";
import LogHelper from "../helpers/logHelper";
import { getActionForComment, getActionForPost } from "./logHandler";
import postViewModel from "../models/postViewModel";

const commConfigService = typeDiDependencyRegistryEngine.getService(
  communityConfigService
);

export default class FilterHandler {
  @LemmyOn({ event: "postcreated" })
  async checkFilteredPosts(
    postData: postViewModel,
    config: communityConfigModel
  ) {
    const filtered = config.filterConfig.filter((x) => x.posts && x.enabled);
    if (!filtered || filtered.length === 0) return;
    filtered.forEach(async (x) => {
      console.log("Checking for match!");
      console.log(x);
      const found = checkText(x.words, [
        postData.post.body || "",
        postData.post.name,
      ]);
      if (found.found) {
        console.log("Found a match!");
        console.log(found);
        switch (x.action) {
          case "ban":
            await client.banFromCommunity({
              auth: getAuth(),
              community_id: postData.community.id,
              person_id: postData.post.creator_id,
              ban: true,
              reason: `Found a filtered word: '${found.value}' !`,
            });
            setTimeout(async () => {
              await client.removeComment({
                auth: getAuth(),
                comment_id: postData.post.id,
                removed: true,
                reason: `Found a filtered word: '${found.value}' !`,
              });
            }, 5000);
            if (config.logConfig.discord.filterlog)
              LogService.Log(
                {
                  content: `Found a Match for ${x.id} in the body or title! Action: ${x.action}`,
                  embeds: [LogHelper.postToEmbed(postData)],
                  components: [getActionForPost(postData)],
                },
                {
                  channel:
                    config.logConfig.discord.filterlog?.channel ||
                    config.logConfig.discord.logChannel,
                  guild: config.logConfig.discord.logGuild,
                  options: config.logConfig.discord.filterlog,
                }
              );
            break;
          case "remove":
            await client.removePost({
              auth: getAuth(),
              post_id: postData.post.id,
              removed: true,
              reason: `Found a filtered word: '${found.value}' !`,
            });
            if (config.logConfig.discord.filterlog)
              LogService.Log(
                {
                  content: `Found a Match for ${x.id} in the body or title! Action: ${x.action}`,
                  embeds: [LogHelper.postToEmbed(postData)],
                  components: [getActionForPost(postData)],
                },
                {
                  channel:
                    config.logConfig.discord.filterlog?.channel ||
                    config.logConfig.discord.logChannel,
                  guild: config.logConfig.discord.logGuild,
                  options: config.logConfig.discord.filterlog,
                }
              );
            break;
          case "report":
            await client.createPostReport({
              auth: getAuth(),
              post_id: postData.post.id,
              reason: `Found a filtered word: '${found.value}' !`,
            });
            if (config.logConfig.discord.filterlog)
              LogService.Log(
                {
                  content: `Found a Match for ${x.id} in the body or title! Action: ${x.action}`,
                  embeds: [LogHelper.postToEmbed(postData)],
                  components: [getActionForPost(postData)],
                },
                {
                  channel:
                    config.logConfig.discord.filterlog?.channel ||
                    config.logConfig.discord.logChannel,
                  guild: config.logConfig.discord.logGuild,
                  options: config.logConfig.discord.filterlog,
                }
              );
          case "log":
          default:
            if (config.logConfig.discord.filterlog)
              LogService.Log(
                {
                  content: `Found a Match for ${x.id} in the body or title! Action: ${x.action}`,
                  embeds: [LogHelper.postToEmbed(postData)],
                  components: [getActionForPost(postData)],
                },
                {
                  channel:
                    config.logConfig.discord.filterlog?.channel ||
                    config.logConfig.discord.logChannel,
                  guild: config.logConfig.discord.logGuild,
                  options: config.logConfig.discord.filterlog,
                }
              );
            break;
        }
      }
    });
  }

  @LemmyOn({ event: "commentcreated" })
  async checkFilteredComments(
    commentData: commentViewModel,
    config: communityConfigModel
  ) {
    const filtered = config.filterConfig.filter((x) => x.comments && x.enabled);
    if (!filtered || filtered.length === 0) return;
    filtered.forEach(async (x) => {
      console.log("Checking for match!");
      console.log(x);
      const found = checkText(x.words, [commentData.comment.content]);
      if (found.found) {
        console.log("Found a match!");
        console.log(found);
        switch (x.action) {
          case "ban":
            await client.banFromCommunity({
              auth: getAuth(),
              community_id: commentData.community.id,
              person_id: commentData.comment.creator_id,
              ban: true,
              reason: `Found a filtered word: '${found.value}' !`,
            });
            setTimeout(async () => {
              await client.removeComment({
                auth: getAuth(),
                comment_id: commentData.comment.id,
                removed: true,
                reason: `Found a filtered word: '${found.value}' !`,
              });
            }, 5000);
            if (config.logConfig.discord.filterlog)
              LogService.Log(
                {
                  content: `Found a Match for ${x.id} in ${commentData.comment.content}! Action: ${x.action}`,
                  embeds: [LogHelper.commentToEmbed(commentData)],
                  components: [getActionForComment(commentData)],
                },
                {
                  channel:
                    config.logConfig.discord.filterlog?.channel ||
                    config.logConfig.discord.logChannel,
                  guild: config.logConfig.discord.logGuild,
                  options: config.logConfig.discord.filterlog,
                }
              );
            break;
          case "remove":
            await client.removeComment({
              auth: getAuth(),
              comment_id: commentData.comment.id,
              removed: true,
              reason: `Found a filtered word: '${found.value}' !`,
            });
            if (config.logConfig.discord.filterlog)
              LogService.Log(
                {
                  content: `Found a Match for ${x.id} in ${commentData.comment.content}! Action: ${x.action}`,
                  embeds: [LogHelper.commentToEmbed(commentData)],
                  components: [getActionForComment(commentData)],
                },
                {
                  channel:
                    config.logConfig.discord.filterlog?.channel ||
                    config.logConfig.discord.logChannel,
                  guild: config.logConfig.discord.logGuild,
                  options: config.logConfig.discord.filterlog,
                }
              );
            break;
          case "report":
            await client.createCommentReport({
              auth: getAuth(),
              comment_id: commentData.comment.id,
              reason: `Found a filtered word: '${found.value}' !`,
            });
            if (config.logConfig.discord.filterlog)
              LogService.Log(
                {
                  content: `Found a Match for ${x.id} in ${commentData.comment.content}! Action: ${x.action}`,
                  embeds: [LogHelper.commentToEmbed(commentData)],
                  components: [getActionForComment(commentData)],
                },
                {
                  channel:
                    config.logConfig.discord.filterlog?.channel ||
                    config.logConfig.discord.logChannel,
                  guild: config.logConfig.discord.logGuild,
                  options: config.logConfig.discord.filterlog,
                }
              );
            break;
          case "log":
          default:
            if (config.logConfig.discord.filterlog)
              LogService.Log(
                {
                  content: `Found a Match for ${x.id} in ${commentData.comment.content}!`,
                  embeds: [LogHelper.commentToEmbed(commentData)],
                  components: [getActionForComment(commentData)],
                },
                {
                  channel:
                    config.logConfig.discord.filterlog?.channel ||
                    config.logConfig.discord.logChannel,
                  guild: config.logConfig.discord.logGuild,
                  options: config.logConfig.discord.filterlog,
                }
              );
            break;
        }
      }
    });
  }
}

const checkText = (
  filterText: string[],
  words: string[]
): { found: boolean; value?: string } => {
  const data: { found: boolean; value?: string } = {
    found: false,
    value: undefined,
  };
  const found = words.findIndex((word) => {
    let regex: RegExp | string = word;
    try {
      regex = new RegExp(word, "gim");
    } catch (e) {
      console.log(e);
    }
    if (filterText.find((x) => x.match(regex))) {
      return true;
    }
  });
  if (found !== -1) {
    data.found = true;
    data.value = words[found];
  }
  return data;
};
