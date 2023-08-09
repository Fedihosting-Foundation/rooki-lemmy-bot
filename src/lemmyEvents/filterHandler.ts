import { LemmyOn } from "../decorators/lemmyPost";
import commentViewModel from "../models/commentViewModel";
import client, { getAuth } from "../main";
import LogService from "../services/logService";
import LogHelper from "../helpers/logHelper";
import { getActionForComment, getActionForPost } from "./logHandler";
import postViewModel from "../models/postViewModel";
import { LemmyEventArguments } from "../types/LemmyEvents";

export default class FilterHandler {
  @LemmyOn({ event: "postcreated" })
  async checkFilteredPosts(
    event: LemmyEventArguments<postViewModel>
  ) {
    const filtered = event.config?.filterConfig.filter((x) => x.posts && x.enabled);
    if (!filtered || filtered.length === 0) return;
    filtered.forEach(async (x) => {
      const found = checkText(x.words, [
        event.data.post.body || "",
        event.data.post.name,
        event.data.post.url,
      ]);
      if (found.found) {
        switch (x.action) {
          case "ban":
            await client.banFromCommunity({
              auth: getAuth(),
              community_id: event.data.community.id,
              person_id: event.data.post.creator_id,
              ban: true,
              reason: `Found a filtered word: '${found.value}' !`,
            });
            setTimeout(async () => {
              await client.removeComment({
                auth: getAuth(),
                comment_id: event.data.post.id,
                removed: true,
                reason: `Found a filtered word: '${found.value}' !`,
              });
            }, 5000);
            if (event.config?.logConfig.discord.filterlog)
              LogService.Log(
                {
                  content: `Found a Match for ${x.id} in the body or title! Action: ${x.action}`,
                  embeds: [LogHelper.postToEmbed(event.data)],
                  components: [...getActionForPost(event.data)],
                },
                {
                  channel:
                    event.config?.logConfig.discord.filterlog?.channel ||
                    event.config?.logConfig.discord.logChannel,
                  guild: event.config?.logConfig.discord.logGuild,
                  options: event.config?.logConfig.discord.filterlog,
                }
              );
            break;
          case "remove":
            await client.removePost({
              auth: getAuth(),
              post_id: event.data.post.id,
              removed: true,
              reason: `Found a filtered word: '${found.value}' !`,
            });
            if (event.config?.logConfig.discord.filterlog)
              LogService.Log(
                {
                  content: `Found a Match for ${x.id} in the body or title! Action: ${x.action}`,
                  embeds: [LogHelper.postToEmbed(event.data)],
                  components: [...getActionForPost(event.data)],
                },
                {
                  channel:
                    event.config?.logConfig.discord.filterlog?.channel ||
                    event.config?.logConfig.discord.logChannel,
                  guild: event.config?.logConfig.discord.logGuild,
                  options: event.config?.logConfig.discord.filterlog,
                }
              );
            break;
          case "report":
            await client.createPostReport({
              auth: getAuth(),
              post_id: event.data.post.id,
              reason: `Found a filtered word: '${found.value}' !`,
            });
            if (event.config?.logConfig.discord.filterlog)
              LogService.Log(
                {
                  content: `Found a Match for ${x.id} in the body or title! Action: ${x.action}`,
                  embeds: [LogHelper.postToEmbed(event.data)],
                  components: [...getActionForPost(event.data)],
                },
                {
                  channel:
                    event.config?.logConfig.discord.filterlog?.channel ||
                    event.config?.logConfig.discord.logChannel,
                  guild: event.config?.logConfig.discord.logGuild,
                  options: event.config?.logConfig.discord.filterlog,
                }
              );
          case "log":
          default:
            if (event.config?.logConfig.discord.filterlog)
              LogService.Log(
                {
                  content: `Found a Match for ${x.id} in the body or title! Action: ${x.action}`,
                  embeds: [LogHelper.postToEmbed(event.data)],
                  components: [...getActionForPost(event.data)],
                },
                {
                  channel:
                    event.config?.logConfig.discord.filterlog?.channel ||
                    event.config?.logConfig.discord.logChannel,
                  guild: event.config?.logConfig.discord.logGuild,
                  options: event.config?.logConfig.discord.filterlog,
                }
              );
            break;
        }
      }
    });
  }

  @LemmyOn({ event: "commentcreated" })
  async checkFilteredComments(
    event: LemmyEventArguments<commentViewModel>

  ) {
    const filtered = event.config?.filterConfig.filter((x) => x.comments && x.enabled);
    if (!filtered || filtered.length === 0) return;
    filtered.forEach(async (x) => {
      const found = checkText(x.words, [event.data.comment.content]);
      if (found.found) {
        switch (x.action) {
          case "ban":
            await client.banFromCommunity({
              auth: getAuth(),
              community_id: event.data.community.id,
              person_id: event.data.comment.creator_id,
              ban: true,
              reason: `Found a filtered word: '${found.value}' !`,
            });
            setTimeout(async () => {
              await client.removeComment({
                auth: getAuth(),
                comment_id: event.data.comment.id,
                removed: true,
                reason: `Found a filtered word: '${found.value}' !`,
              });
            }, 5000);
            if (event.config?.logConfig.discord.filterlog)
              LogService.Log(
                {
                  content: `Found a Match for ${x.id} in ${event.data.comment.content}! Action: ${x.action}`,
                  embeds: [LogHelper.commentToEmbed(event.data)],
                  components: [...getActionForComment(event.data)],
                },
                {
                  channel:
                    event.config.logConfig.discord.filterlog?.channel ||
                    event.config.logConfig.discord.logChannel,
                  guild: event.config.logConfig.discord.logGuild,
                  options: event.config.logConfig.discord.filterlog,
                }
              );
            break;
          case "remove":
            await client.removeComment({
              auth: getAuth(),
              comment_id: event.data.comment.id,
              removed: true,
              reason: `Found a filtered word: '${found.value}' !`,
            });
            if (event.config?.logConfig.discord.filterlog)
              LogService.Log(
                {
                  content: `Found a Match for ${x.id} in ${event.data.comment.content}! Action: ${x.action}`,
                  embeds: [LogHelper.commentToEmbed(event.data)],
                  components: [...getActionForComment(event.data)],
                },
                {
                  channel:
                    event.config.logConfig.discord.filterlog?.channel ||
                    event.config.logConfig.discord.logChannel,
                  guild: event.config.logConfig.discord.logGuild,
                  options: event.config.logConfig.discord.filterlog,
                }
              );
            break;
          case "report":
            await client.createCommentReport({
              auth: getAuth(),
              comment_id: event.data.comment.id,
              reason: `Found a filtered word: '${found.value}' !`,
            });
            if (event.config?.logConfig.discord.filterlog)
              LogService.Log(
                {
                  content: `Found a Match for ${x.id} in ${event.data.comment.content}! Action: ${x.action}`,
                  embeds: [LogHelper.commentToEmbed(event.data)],
                  components: [...getActionForComment(event.data)],
                },
                {
                  channel:
                    event.config?.logConfig.discord.filterlog?.channel ||
                    event.config?.logConfig.discord.logChannel,
                  guild: event.config?.logConfig.discord.logGuild,
                  options: event.config?.logConfig.discord.filterlog,
                }
              );
            break;
          case "log":
          default:
            if (event.config?.logConfig.discord.filterlog)
              LogService.Log(
                {
                  content: `Found a Match for ${x.id} in ${event.data.comment.content}!`,
                  embeds: [LogHelper.commentToEmbed(event.data)],
                  components: [...getActionForComment(event.data)],
                },
                {
                  channel:
                    event.config?.logConfig.discord.filterlog?.channel ||
                    event.config?.logConfig.discord.logChannel,
                  guild: event.config?.logConfig.discord.logGuild,
                  options: event.config?.logConfig.discord.filterlog,
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
  words: (string | undefined)[]
): { found: boolean; value?: string } => {
  const data: { found: boolean; value?: string } = {
    found: false,
    value: undefined,
  };
  const found = words.findIndex((word) => {
    if (!word) return false;
    let regex: RegExp | string = word;
    try {
      regex = new RegExp(word, "im");
    } catch (e) {
      console.log(e);
    }
    if (filterText.find((x) => regex instanceof RegExp ? x.match(regex) : x.includes(word))) {
      return true;
    }
  });
  if (found !== -1) {
    data.found = true;
    data.value = words[found];
  }
  return data;
};
