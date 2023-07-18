import { Lemmy, LemmyOn } from "../decorators/lemmyPost";
import LogHelper from "../helpers/logHelper";
import { bot } from "../main";
import commentViewModel from "../models/commentViewModel";
import { CommunityConfig } from "../models/iConfig";
import postViewModel from "../models/postViewModel";
import { getActionForComment, getActionForPost } from "./logHandler";
import badWords from "../badlanguage.json";

async function checkForBadLanguage(
  textToFilter: string[],
  config: CommunityConfig,
  data: postViewModel | commentViewModel
) {
  if (!config.logs.discord.enabled || !config.logs.discord.profanity?.enabled)
    return;
  const hasProfanity = textToFilter.some((x) => {
    return badWords.some((badWord) => {
      return x.toLowerCase().trim().includes(badWord);
    });
  });

  if (hasProfanity) {
    const guild = bot.guilds.cache.get(config.logs.discord.logGuild);
    if (!guild) {
      console.log("Invalid Guild!");
      return;
    }
    let channel = guild.channels.cache.get(
      config.logs.discord.profanity.channel!
    );

    if (!channel) {
      channel =
        (await guild.channels.fetch(config.logs.discord.profanity.channel!)) ||
        undefined;
    }

    if (!channel || !("send" in channel)) {
      console.log("Invalid Channel!");
      return;
    }
    if ("comment" in data) {
      const embed = LogHelper.commentToEmbed(data);
      embed.setColor("#FF0000");

      channel.send({
        content: config.logs.discord.profanity.appendTextToLogMessage,
        embeds: [embed],
        components: [getActionForComment(data)],
      });
    } else {
      const embed = LogHelper.postToEmbed(data);
      embed.setColor("#FF0000");

      channel.send({
        content: config.logs.discord.profanity.appendTextToLogMessage,
        embeds: [embed],
        components: [getActionForPost(data)],
      });
    }
  }
}

class warnForBadLanguage {
  @LemmyOn({ event: "postcreated" })
  async checkForBadPost(postData: postViewModel, config: CommunityConfig) {
    checkForBadLanguage(
      [postData.post.body || "", postData.post.name],
      config,
      postData
    ).catch((x) => {
      console.log(x);
      console.log("Something went wrong CHECKCOMMENT");
    });
  }

  @LemmyOn({ event: "commentcreated" })
  async checkForBadComment(
    commentData: commentViewModel,
    config: CommunityConfig
  ) {
    checkForBadLanguage(
      [commentData.comment.content],
      config,
      commentData
    ).catch((x) => {
      console.log(x);
      console.log("Something went wrong CHECKCOMMENT");
    });
  }
}
