import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  CommandInteraction,
  ComponentType,
  GuildTextBasedChannel,
  GuildTextChannelType,
  PublicThreadChannel,
} from "discord.js";
import {
  Discord,
  Slash,
  SlashChoice,
  SlashChoiceType,
  SlashGroup,
  SlashOption,
} from "discordx";
import client, { getAuth } from "../main";
import LogHelper from "../helpers/logHelper";
import verifiedUserService from "../services/verifiedUserService";
import { Inject } from "typedi";
import communityConfigService from "../services/communityConfigService";
import CommunityService from "../services/guildService";

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
      name: "All",
      value: "general",
    })
    @SlashOption({
      description: "The type of log to set.",
      name: "logtype",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    logType: "post" | "comments" | "profanity" | "reports" | "general",
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
        case "general":
        default:
          if (isThread) {
            interaction.editReply("You can't set the general log to a thread!");
          } else {
            config.logConfig.discord.logChannel = channel.id;
          }
          break;
      }

      await this.communityConfigService.updateCommunityConfig(
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
      name: "All",
      value: "general",
    })
    @SlashOption({
      description: "The type of log to set.",
      name: "logtype",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    logType: "post" | "comments" | "profanity" | "reports" | "general",
    interaction: CommandInteraction
  ) {
    await interaction.deferReply();
    try {
      const community = await this.communityService.getCommunity({
        name: communityName,
      });
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
          config.logConfig.discord.reports.enabled = false;
          break;
        case "reports":
          config.logConfig.discord.profanity = config.logConfig.discord
            .profanity || {
            enabled: false,
          };
          config.logConfig.discord.profanity.enabled = false;
          break;
        case "general":
        default:
          config.logConfig.enabled = false;
          break;
      }
      await this.communityConfigService.updateCommunityConfig(
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
}
