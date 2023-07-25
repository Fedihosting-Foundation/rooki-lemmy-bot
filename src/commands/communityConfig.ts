import {
  ApplicationCommandOptionType,
  Attachment,
  ChannelType,
  CommandInteraction,
  EmbedBuilder,
  GuildTextBasedChannel,
  PublicThreadChannel,
} from "discord.js";
import { Discord, Slash, SlashChoice, SlashGroup, SlashOption } from "discordx";
import verifiedUserService from "../services/verifiedUserService";
import { Inject } from "typedi";
import communityConfigService from "../services/communityConfigService";
import CommunityService from "../services/guildService";
import {
  Pagination,
  PaginationItem,
  PaginationType,
} from "@discordx/pagination";
import axios from "axios";

@Discord()
@SlashGroup({ name: "community", description: "Community Config Commands" })
@SlashGroup("community")
export default class CommunityConfigCommands {
  @Inject()
  verifiedUserService: verifiedUserService;

  @Inject()
  communityConfigService: communityConfigService;

  @Inject()
  communityService: CommunityService;

  @Slash({ description: "Add a Community to the bot", name: "add" })
  async addCommunity(
    @SlashOption({
      description:
        "The community name ( the /c/--THISPART-- in the community URL )",
      name: "communityname",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    communityName: string,
    interaction: CommandInteraction
  ) {
    await interaction.deferReply();
    try {
      const community = await this.communityService.getCommunity({
        name: communityName,
      });
      if (!community) {
        await interaction.editReply(`Community ${communityName} not found!`);
        return;
      }
      const config = await this.communityConfigService.getCommunityConfig(
        community.community_view.community
      );
      if (config) {
        await interaction.editReply(
          `Community ${communityName} already exists!`
        );
        return;
      }
      await this.communityConfigService.createCommunityConfig(
        community.community_view.community
      );
      await interaction.editReply(`Added ${communityName} to the bot!`);
    } catch (exc) {
      console.log(exc);
      interaction.editReply("Something went wrong");
    }
  }

  @Slash({ description: "Removes a Community to the bot", name: "remove" })
  async removeCommunity(
    @SlashOption({
      description:
        "The community name ( the /c/--THISPART-- in the community URL )",
      name: "communityname",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    communityName: string,
    interaction: CommandInteraction
  ) {
    await interaction.deferReply();
    try {
      const community = await this.communityService.getCommunity({
        name: communityName,
      });

      if (!community) {
        await interaction.editReply("Community not found!");
        return;
      }

      if (
        !this.verifiedUserService.isModeratorOf(
          interaction.user,
          community.moderators
        )
      ) {
        await interaction.editReply(
          "You are not a moderator of this community! ( **If you didnt verified yourself already please do it with /verify** )!"
        );
        return;
      }

      const config = await this.communityConfigService.getCommunityConfig(
        community.community_view.community
      );
      if (!config) {
        await interaction.editReply(`Community ${communityName} not found!`);
        return;
      }
      await this.communityConfigService.removeCommunityConfig(config);
      await interaction.editReply(`Removed ${communityName} from the bot!`);
    } catch (exc) {
      console.log(exc);
      interaction.editReply("Something went wrong");
    }
  }

  @Slash({ description: "Sets the logging channel", name: "setlog" })
  async setLogs(
    @SlashOption({
      description:
        "The community name ( the /c/--THISPART-- in the community URL )",
      name: "communityname",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    communityName: string,

    @SlashChoice({
      name: "Log Post",
      value: "post",
    })
    @SlashChoice({
      name: "Log Comments",
      value: "comments",
    })
    @SlashChoice({
      name: "Log Reports",
      value: "reports",
    })
    @SlashChoice({
      name: "Profanity Filter",
      value: "profanity",
    })
    @SlashChoice({
      name: "Action Log",
      value: "action",
    })
    @SlashChoice({
      name: "All",
      value: "general",
    })
    @SlashOption({
      description: "The type of log to set.",
      name: "logtype",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    logType:
      | "post"
      | "comments"
      | "profanity"
      | "reports"
      | "general"
      | "action",
    @SlashOption({
      description: "The Channel to log to",
      name: "logchannel",
      required: true,
      channelTypes: [ChannelType.GuildText, ChannelType.PublicThread],
      type: ApplicationCommandOptionType.Channel,
    })
    channel: GuildTextBasedChannel | PublicThreadChannel,
    interaction: CommandInteraction
  ) {
    await interaction.deferReply();
    try {
      const community = await this.communityService.getCommunity({
        name: communityName,
      });

      if (!community) {
        await interaction.editReply("Community not found!");
        return;
      }

      if (
        !this.verifiedUserService.isModeratorOf(
          interaction.user,
          community.moderators
        )
      ) {
        await interaction.editReply(
          "You are not a moderator of this community! ( **If you didnt verified yourself already please do it with /verify** )!"
        );
        return;
      }
      
      const config = await this.communityConfigService.getCommunityConfig(
        community.community_view.community
      );
      if (!config) {
        await interaction.editReply(
          `Community ${communityName} not found! Add the community first!`
        );
        return;
      }
      const isThread = channel.isThread();
      config.logConfig.discord.logGuild = channel.guildId;
      config.logConfig.enabled = true;
      switch (logType) {
        case "post":
          if (isThread) {
            config.logConfig.discord.posts.enabled = true;
            config.logConfig.discord.posts.threadId = channel.id;
            config.logConfig.discord.posts.channel =
              channel.parentId || undefined;
          } else {
            config.logConfig.discord.posts.channel = channel.id;
          }
          break;
        case "comments":
          if (isThread) {
            config.logConfig.discord.comments.enabled = true;
            config.logConfig.discord.comments.threadId = channel.id;
            config.logConfig.discord.comments.channel =
              channel.parentId || undefined;
          } else {
            config.logConfig.discord.comments.channel = channel.id;
          }
          break;
        case "reports":
          if (isThread) {
            config.logConfig.discord.reports.enabled = true;
            config.logConfig.discord.reports.threadId = channel.id;
            config.logConfig.discord.reports.channel =
              channel.parentId || undefined;
          } else {
            config.logConfig.discord.reports.channel = channel.id;
          }
          break;
        case "profanity":
          config.logConfig.discord.profanity = config.logConfig.discord
            .profanity || {
            enabled: false,
          };
          if (isThread) {
            config.logConfig.discord.profanity.enabled = true;
            config.logConfig.discord.profanity.threadId = channel.id;
            config.logConfig.discord.profanity.channel =
              channel.parentId || undefined;
          } else {
            config.logConfig.discord.profanity.channel = channel.id;
          }
          break;
        case "action":
          config.logConfig.discord.filterlog = config.logConfig.discord
            .filterlog || {
            enabled: false,
          };
          if (isThread) {
            config.logConfig.discord.filterlog.enabled = true;
            config.logConfig.discord.filterlog.threadId = channel.id;
            config.logConfig.discord.filterlog.channel =
              channel.parentId || undefined;
          } else {
            config.logConfig.discord.filterlog.channel = channel.id;
          }
          break;
        case "general":
        default:
          if (isThread) {
            interaction.editReply("You can't set the general log to a thread!");
          } else {
            config.logConfig.discord.logChannel = channel.id;
          }
          break;
      }

      await this.communityConfigService.updateLogOptions(
        community.community_view.community,
        config.logConfig
      );

      await interaction.editReply(
        `Changed the config for ${community.community_view.community.name}!`
      );
    } catch (exc) {
      console.log(exc);
      interaction.editReply("Something went wrong");
    }
  }

  @Slash({ description: "Removes the log channel", name: "removelog" })
  async removeLogs(
    @SlashOption({
      description:
        "The community name ( the /c/--THISPART-- in the community URL )",
      name: "communityname",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    communityName: string,

    @SlashChoice({
      name: "Log Post",
      value: "post",
    })
    @SlashChoice({
      name: "Log Comments",
      value: "comments",
    })
    @SlashChoice({
      name: "Log Reports",
      value: "reports",
    })
    @SlashChoice({
      name: "Profanity Filter",
      value: "profanity",
    })
    @SlashChoice({
      name: "Action Log",
      value: "action",
    })
    @SlashChoice({
      name: "All",
      value: "general",
    })
    @SlashOption({
      description: "The type of log to set.",
      name: "logtype",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    logType:
      | "post"
      | "comments"
      | "profanity"
      | "reports"
      | "general"
      | "action",
    interaction: CommandInteraction
  ) {
    await interaction.deferReply();
    try {
      const community = await this.communityService.getCommunity({
        name: communityName,
      });

      if (!community) {
        await interaction.editReply("Community not found!");
        return;
      }

      if (
        !this.verifiedUserService.isModeratorOf(
          interaction.user,
          community.moderators
        )
      ) {
        await interaction.editReply(
          "You are not a moderator of this community! ( **If you didnt verified yourself already please do it with /verify** )!"
        );
        return;
      }

      const config = await this.communityConfigService.getCommunityConfig(
        community.community_view.community
      );
      if (!config) {
        await interaction.editReply(
          `Community ${communityName} not found! Add the community first!`
        );
        return;
      }

      switch (logType) {
        case "post":
          config.logConfig.discord.posts.enabled = false;
          break;
        case "comments":
          config.logConfig.discord.comments.enabled = false;
          break;
        case "reports":
          config.logConfig.discord.profanity = config.logConfig.discord
            .profanity || {
            enabled: false,
          };
          config.logConfig.discord.profanity.enabled = false;
          break;
        case "action":
          config.logConfig.discord.filterlog = config.logConfig.discord
            .filterlog || {
            enabled: false,
          };
          config.logConfig.discord.filterlog.enabled = false;
          break;
        case "general":
        default:
          config.logConfig.enabled = false;
          break;
      }
      await this.communityConfigService.updateLogOptions(
        community.community_view.community,
        config.logConfig
      );

      await interaction.editReply(
        `Removed the logs for ${logType} in the config for ${community.community_view.community.name}!`
      );
    } catch (exc) {
      console.log(exc);
      interaction.editReply("Something went wrong");
    }
  }

  @Slash({ description: "Add a filter", name: "addfilter" })
  async addFilter(
    @SlashOption({
      description:
        "The community name ( the /c/--THISPART-- in the community URL )",
      name: "communityname",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    communityName: string,
    @SlashOption({
      description: "The name of the filter",
      name: "filtername",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    filtername: string,
    @SlashChoice({ name: "Remove", value: "remove" })
    @SlashChoice({ name: "Ban", value: "ban" })
    @SlashChoice({ name: "Report", value: "report" })
    @SlashChoice({ name: "Log", value: "log" })
    @SlashOption({
      description: "What action should be triggered if anything triggers.",
      name: "filteraction",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    action: "remove" | "ban" | "report" | "log",
    @SlashOption({
      description: "The words to filter",
      name: "filterwords",
      required: true,
      type: ApplicationCommandOptionType.Attachment,
    })
    words: Attachment,
    @SlashChoice({
      name: "Log Post",
      value: "post",
    })
    @SlashOption({
      description: "Should it filter posts.",
      name: "filterposts",
      required: false,
      type: ApplicationCommandOptionType.Boolean,
    })
    postFilter: boolean,
    @SlashOption({
      description: "Should it filter comments.",
      name: "filtercomments",
      required: false,
      type: ApplicationCommandOptionType.Boolean,
    })
    commentFilter: boolean,
    interaction: CommandInteraction
  ) {
    await interaction.deferReply();
    try {
      if (!words.contentType?.includes("text/plain")) {
        await interaction.editReply("The file must be a text file!");
        return;
      }
      const community = await this.communityService.getCommunity({
        name: communityName,
      });
      if (!community) {
        await interaction.editReply("Community not found!");
        return;
      }

      if (
        !this.verifiedUserService.isModeratorOf(
          interaction.user,
          community.moderators
        )
      ) {
        await interaction.editReply(
          "You are not a moderator of this community! ( **If you didnt verified yourself already please do it with /verify** )!"
        );
        return;
      }

      const config = await this.communityConfigService.getCommunityConfig(
        community.community_view.community
      );
      if (!config) {
        await interaction.editReply(
          `Community ${communityName} not found! Add the community first!`
        );
        return;
      }
      const filterConfig = config.filterConfig;
      if (filterConfig.find((x) => x.id === filtername)) {
        await interaction.editReply(`Filter ${filtername} already exists!`);
        return;
      }
      let wordText = await (await fetch(words.url)).text();
      wordText = wordText.replace(/\r/gim, "\n");
      const wordList = wordText
        .split("\n")
        .map((x) => x.trim())
        .filter((x) => x.length > 0);
      filterConfig.push({
        id: filtername,
        action,
        comments: commentFilter,
        posts: postFilter,
        words: wordList,
        enabled: true,
      });
      config.filterConfig = filterConfig;
      await this.communityConfigService.updateFilterOptions(
        community.community_view.community,
        config.filterConfig
      );
      await interaction.editReply(
        `Added the filter ${filtername} to the config for ${community.community_view.community.name}!`
      );
    } catch (exc) {
      console.log(exc);
      interaction.editReply("Something went wrong");
    }
  }

  @Slash({ description: "Change filter settings", name: "changefilter" })
  async changeFilter(
    @SlashOption({
      description:
        "The community name ( the /c/--THISPART-- in the community URL )",
      name: "communityname",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    communityName: string,
    @SlashOption({
      description: "The name of the filter",
      name: "filtername",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    filtername: string,
    @SlashChoice({ name: "Remove", value: "remove" })
    @SlashChoice({ name: "Ban", value: "ban" })
    @SlashChoice({ name: "Report", value: "report" })
    @SlashChoice({ name: "Log", value: "log" })
    @SlashOption({
      description: "What action should be triggered if anything triggers.",
      name: "filteraction",
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    action: "remove" | "ban" | "report" | "log",
    @SlashOption({
      description: "The words to filter",
      name: "filterwords",
      required: false,
      type: ApplicationCommandOptionType.Attachment,
    })
    words: Attachment | undefined,
    @SlashChoice({
      name: "Log Post",
      value: "post",
    })
    @SlashOption({
      description: "Should it filter posts.",
      name: "filterposts",
      required: false,
      type: ApplicationCommandOptionType.Boolean,
    })
    postFilter: boolean | undefined,
    @SlashOption({
      description: "Should it filter comments.",
      name: "filtercomments",
      required: false,
      type: ApplicationCommandOptionType.Boolean,
    })
    commentFilter: boolean | undefined,
    interaction: CommandInteraction
  ) {
    await interaction.deferReply();
    try {
      if (words && !words.contentType?.includes("text/plain")) {
        await interaction.editReply("The file must be a text file!");
        return;
      }
      const community = await this.communityService.getCommunity({
        name: communityName,
      });
      if (!community) {
        await interaction.editReply("Community not found!");
        return;
      }

      if (
        !this.verifiedUserService.isModeratorOf(
          interaction.user,
          community.moderators
        )
      ) {
        await interaction.editReply(
          "You are not a moderator of this community! ( **If you didnt verified yourself already please do it with /verify** )!"
        );
        return;
      }

      const config = await this.communityConfigService.getCommunityConfig(
        community.community_view.community
      );
      if (!config) {
        await interaction.editReply(
          `Community ${communityName} not found! Add the community first!`
        );
        return;
      }
      const filterConfig = config.filterConfig;
      const currentConfigId = filterConfig.findIndex(
        (x) => x.id === filtername
      );
      if (currentConfigId === -1) {
        await interaction.editReply(`Filter ${filtername} does not exists!`);
        return;
      }
      const currentConfig = filterConfig[currentConfigId];
      let wordText;
      if (words) {
        wordText = (await axios.get(words.url)).data as string;
        wordText = wordText.replace(/\r/gim, "\n");
        const wordList = wordText
          .split("\n")
          .map((x) => x.trim())
          .filter((x) => x.length > 0);
      }
      const wordList =
        (wordText &&
          wordText
            .split("\n")
            .map((x) => x.trim())
            .filter((x) => x.length > 0)) ||
        currentConfig.words;

      filterConfig[currentConfigId] = {
        ...filterConfig[currentConfigId],
        action,
        comments: commentFilter || currentConfig.comments,
        posts: postFilter || currentConfig.posts,
        words: wordList,
      };
      config.filterConfig = filterConfig;
      await this.communityConfigService.updateFilterOptions(
        community.community_view.community,
        config.filterConfig
      );
      await interaction.editReply(
        `Updated the filter ${filtername} to the config for ${community.community_view.community.name}!`
      );
    } catch (exc) {
      console.log(exc);
      interaction.editReply("Something went wrong");
    }
  }

  @Slash({ description: "Enable a filter", name: "enablefilter" })
  async enableFilter(
    @SlashOption({
      description:
        "The community name ( the /c/--THISPART-- in the community URL )",
      name: "communityname",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    communityName: string,
    @SlashOption({
      description: "The name of the filter",
      name: "filtername",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    filtername: string,
    interaction: CommandInteraction
  ) {
    await interaction.deferReply();
    try {
      const community = await this.communityService.getCommunity({
        name: communityName,
      });
      if (!community) {
        await interaction.editReply("Community not found!");
        return;
      }

      if (
        !this.verifiedUserService.isModeratorOf(
          interaction.user,
          community.moderators
        )
      ) {
        await interaction.editReply(
          "You are not a moderator of this community! ( **If you didnt verified yourself already please do it with /verify** )!"
        );
        return;
      }

      const config = await this.communityConfigService.getCommunityConfig(
        community.community_view.community
      );
      if (!config) {
        await interaction.editReply(
          `Community ${communityName} not found! Add the community first!`
        );
        return;
      }
      const filterConfig = config.filterConfig;
      const currentConfigId = filterConfig.findIndex(
        (x) => x.id === filtername
      );
      if (currentConfigId === -1) {
        await interaction.editReply(`Filter ${filtername} does not exists!`);
        return;
      }
      const currentConfig = filterConfig[currentConfigId];
      currentConfig.enabled = true;
      filterConfig[currentConfigId] = currentConfig;
      config.filterConfig = filterConfig;
      await this.communityConfigService.updateFilterOptions(
        community.community_view.community,
        config.filterConfig
      );
      await interaction.editReply(
        `Activated the filter ${filtername} to the config for ${community.community_view.community.name}!`
      );
    } catch (exc) {
      console.log(exc);
      interaction.editReply("Something went wrong");
    }
  }

  @Slash({ description: "Disable a filter", name: "disablefilter" })
  async disableFilter(
    @SlashOption({
      description:
        "The community name ( the /c/--THISPART-- in the community URL )",
      name: "communityname",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    communityName: string,
    @SlashOption({
      description: "The name of the filter",
      name: "filtername",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    filtername: string,
    interaction: CommandInteraction
  ) {
    await interaction.deferReply();
    try {
      const community = await this.communityService.getCommunity({
        name: communityName,
      });

      if (!community) {
        await interaction.editReply("Community not found!");
        return;
      }

      if (
        !this.verifiedUserService.isModeratorOf(
          interaction.user,
          community.moderators
        )
      ) {
        await interaction.editReply(
          "You are not a moderator of this community! ( **If you didnt verified yourself already please do it with /verify** )!"
        );
        return;
      }

      const config = await this.communityConfigService.getCommunityConfig(
        community.community_view.community
      );
      if (!config) {
        await interaction.editReply(
          `Community ${communityName} not found! Add the community first!`
        );
        return;
      }
      const filterConfig = config.filterConfig;
      const currentConfigId = filterConfig.findIndex(
        (x) => x.id === filtername
      );
      if (currentConfigId === -1) {
        await interaction.editReply(`Filter ${filtername} does not exists!`);
        return;
      }
      const currentConfig = filterConfig[currentConfigId];
      currentConfig.enabled = false;
      filterConfig[currentConfigId] = currentConfig;
      config.filterConfig = filterConfig;
      await this.communityConfigService.updateFilterOptions(
        community.community_view.community,
        config.filterConfig
      );
      await interaction.editReply(
        `Deactivated the filter ${filtername} to the config for ${community.community_view.community.name}!`
      );
    } catch (exc) {
      console.log(exc);
      interaction.editReply("Something went wrong");
    }
  }

  @Slash({ description: "Removes a filter", name: "removefilter" })
  async removeFilter(
    @SlashOption({
      description:
        "The community name ( the /c/--THISPART-- in the community URL )",
      name: "communityname",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    communityName: string,
    @SlashOption({
      description: "The name of the filter",
      name: "filtername",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    filtername: string,
    interaction: CommandInteraction
  ) {
    await interaction.deferReply();
    try {
      const community = await this.communityService.getCommunity({
        name: communityName,
      });
      if (!community) {
        await interaction.editReply("Community not found!");
        return;
      }
      const config = await this.communityConfigService.getCommunityConfig(
        community.community_view.community
      );
      if (!config) {
        await interaction.editReply(
          `Community ${communityName} not found! Add the community first!`
        );
        return;
      }
      const filterConfig = config.filterConfig;
      const currentConfigId = filterConfig.findIndex(
        (x) => x.id === filtername
      );
      if (currentConfigId === -1) {
        await interaction.editReply(`Filter ${filtername} does not exists!`);
        return;
      }
      delete filterConfig[currentConfigId];
      await this.communityConfigService.updateFilterOptions(
        community.community_view.community,
        config.filterConfig
      );
      await interaction.editReply(
        `Removed the filter ${filtername} to the config for ${community.community_view.community.name}!`
      );
    } catch (exc) {
      console.log(exc);
      interaction.editReply("Something went wrong");
    }
  }

  @Slash({ description: "Get all filters", name: "getfilter" })
  async getFilters(
    @SlashOption({
      description:
        "The community name ( the /c/--THISPART-- in the community URL )",
      name: "communityname",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    communityName: string,
    interaction: CommandInteraction
  ) {
    await interaction.deferReply();
    try {
      const community = await this.communityService.getCommunity({
        name: communityName,
      });
      if (!community) {
        await interaction.editReply("Community not found!");
        return;
      }
      const config = await this.communityConfigService.getCommunityConfig(
        community.community_view.community
      );
      if (!config) {
        await interaction.editReply(
          `Community ${communityName} not found! Add the community first!`
        );
        return;
      }
      const filterConfig = config.filterConfig;

      const pages: PaginationItem[] = filterConfig.map((x) => {
        let words = x.words.join("\n");
        if (words.length > 4000) {
          words = words.substring(0, 4000) + "...";
        }
        return {
          content: "Filter: " + x.id,
          embeds: [
            new EmbedBuilder().setDescription(words).addFields([
              {
                name: "Enabled",
                value: x.enabled ? "Yes" : "No",
              },
              {
                name: "Action",
                value: x.action,
              },
              {
                name: "Posts",
                value: x.posts ? "Yes" : "No",
              },
              {
                name: "Comments",
                value: x.comments ? "Yes" : "No",
              },
            ]),
          ],
        };
      });
      const pagination = new Pagination(interaction, pages, {
        onTimeout: () => interaction.deleteReply(),
        time: 300 * 1000,
        enableExit: true,
        pageText: filterConfig.map((x) => x.id),
        type: PaginationType.SelectMenu,
      });
      await pagination.send();
    } catch (exc) {
      console.log(exc);
      interaction.editReply("Something went wrong");
    }
  }
}
