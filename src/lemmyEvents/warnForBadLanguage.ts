import { LemmyOn } from "../decorators/lemmyPost";
import LogHelper from "../helpers/logHelper";
import { bot } from "../main";
import commentViewModel from "../models/commentViewModel";
import postViewModel from "../models/postViewModel";
import { getActionForComment, getActionForPost } from "./logHandler";
import badWords from "../badlanguage.json";
import { AnyThreadChannel, GuildBasedChannel, ThreadChannel } from "discord.js";
import communityConfigModel from "../models/communityConfigModel";

async function checkForBadLanguage(
  textToFilter: string[],
  config: communityConfigModel,
  data: postViewModel | commentViewModel
) {
  if (!config.logConfig.enabled || !config.logConfig.discord.profanity?.enabled)
    return;
  const hasProfanity = textToFilter.some((x) => {
    return badWords.some((badWord) => {
      return x.toLowerCase().includes(" " + badWord + " ");
    });
  });

  if (hasProfanity) {
    const guild = bot.guilds.cache.get(config.logConfig.discord.logGuild);
    if (!guild) {
      console.log("Invalid Guild!");
      return;
    }
    let channel:
      | GuildBasedChannel
      | AnyThreadChannel
      | ThreadChannel
      | undefined = guild.channels.cache.get(
      config.logConfig.discord.profanity.channel!
    );

    if (!channel) {
      channel =
        (await guild.channels.fetch(
          config.logConfig.discord.profanity.channel!
        )) || undefined;
    }

    if (!channel || !("send" in channel) || !("threads" in channel)) {
      console.log("Invalid Channel!");
      return;
    }
    if ("comment" in data) {
      const embed = LogHelper.commentToEmbed(data);
      embed.setColor("#FFF000");
      if (config.logConfig.discord.profanity.threadId) {
        channel =
          channel.threads.cache.get(
            config.logConfig.discord.profanity.threadId
          ) ||
          (await channel.threads.fetch(
            config.logConfig.discord.profanity.threadId
          )) ||
          undefined;
      }
      if (!channel) return;
      channel.send({
        content: "Profanity detected!",
        embeds: [embed],
        components: [getActionForComment(data)],
      });
    } else {
      const embed = LogHelper.postToEmbed(data);
      embed.setColor("#FFF000");
      if (config.logConfig.discord.profanity.threadId) {
        channel =
          channel.threads.cache.get(
            config.logConfig.discord.profanity.threadId
          ) ||
          (await channel.threads.fetch(
            config.logConfig.discord.profanity.threadId
          )) ||
          undefined;
      }
      if (!channel) return;
      channel.send({
        content: "Profanity detected!",
        embeds: [embed],
        components: [getActionForPost(data)],
      });
    }
  }
}

class warnForBadLanguage {
  @LemmyOn({ event: "postcreated" })
  async checkForBadPost(postData: postViewModel, config: communityConfigModel) {
    checkForBadLanguage(
      [postData.post.body || "", postData.post.name],
      config,
      postData
    ).catch((x) => {
      console.log(x);
      console.log("Something went wrong CHECKPOST");
    });
  }

  @LemmyOn({ event: "commentcreated" })
  async checkForBadComment(
    commentData: commentViewModel,
    config: communityConfigModel
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
