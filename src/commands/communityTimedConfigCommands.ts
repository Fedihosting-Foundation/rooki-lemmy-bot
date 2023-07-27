import {
  ApplicationCommandOptionType,
  Attachment,
  CommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Discord, Slash, SlashGroup, SlashOption } from "discordx";
import verifiedUserService from "../services/verifiedUserService";
import { Inject } from "typedi";
import communityConfigService from "../services/communityConfigService";
import CommunityService from "../services/communityService";
import {
  Pagination,
  PaginationItem,
  PaginationType,
} from "@discordx/pagination";
import axios from "axios";
import cron from "node-cron";
import timedPostService from "../services/timedPostService";

@Discord()
@SlashGroup({ name: "community", description: "Community Config Commands" })
@SlashGroup("community")
export default class communityTimedConfigCommands {
  @Inject()
  verifiedUserService: verifiedUserService;

  @Inject()
  communityConfigService: communityConfigService;

  @Inject()
  communityService: CommunityService;

  @Inject()
  timedPostService: timedPostService;

  @Slash({ description: "Add a timed posts", name: "addtimedposts" })
  async addTimedPosts(
    @SlashOption({
      description:
        "The community name ( the /c/--THISPART-- in the community URL )",
      name: "communityname",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    communityName: string,
    @SlashOption({
      description: "The id of this timed post.",
      name: "id",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    id: string,
    @SlashOption({
      description: "The title of the timed post.",
      name: "title",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    title: string,

    @SlashOption({
      description: "The content of the timed post",
      name: "content",
      required: true,
      type: ApplicationCommandOptionType.Attachment,
    })
    content: Attachment,
    @SlashOption({
      description:
        "The interval of the timed post (Like the unix Cronjob, in our case node-cron )",
      name: "interval",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    interval: string,
    @SlashOption({
      description: "Is it NSFW?",
      name: "nsfw",
      type: ApplicationCommandOptionType.Boolean,
    })
    nsfw: boolean | undefined,
    @SlashOption({
      description: "Lock the post after posting",
      name: "lock",
      type: ApplicationCommandOptionType.Boolean,
    })
    lock: boolean | undefined,
    interaction: CommandInteraction
  ) {
    await interaction.deferReply();
    try {
      if (cron.validate(interval) === false) {
        await interaction.editReply("The interval is not valid!");
        return;
      }

      if (!content.contentType?.includes("text/plain")) {
        await interaction.editReply("The content must be a text file!");
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
        !(await this.verifiedUserService.isModeratorOf(
          interaction.user,
          community.community_view.community.id
        ))
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

      const timedConfig = config.timedConfig;
      if (timedConfig.find((x) => x.id === title)) {
        await interaction.editReply(
          "Timed Post with that title already exists!"
        );
        return;
      }

      const text = (await axios.get(content.url)).data;
      const newTimedConfig = {
        id: id,
        title: title,
        content: text,
        enabled: true,
        interval: interval,
        nsfw: nsfw ?? false,
        lock: lock ?? false,
      };
      timedConfig.push(newTimedConfig);
      await this.communityConfigService.updateTimedPostsOptions(
        community.community_view.community,
        timedConfig
      );

      this.timedPostService.addCronJob(config, newTimedConfig);
      await interaction.editReply("Timed Post added!");
    } catch (exc) {
      console.log(exc);
      interaction.editReply("Something went wrong");
    }
  }

  @Slash({ description: "Remove a timed posts", name: "removetimedposts" })
  async removeTimedPosts(
    @SlashOption({
      description:
        "The community name ( the /c/--THISPART-- in the community URL )",
      name: "communityname",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    communityName: string,
    @SlashOption({
      description: "The id of this timed post.",
      name: "id",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    id: string,
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
        !(await this.verifiedUserService.isModeratorOf(
          interaction.user,
          community.community_view.community.id
        ))
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
      const timedConfig = config.timedConfig;
      const index = timedConfig.findIndex((x) => x.id === id);
      if (index === -1) {
        await interaction.editReply("Timed Post not found!");
        return;
      }
      this.timedPostService.removeCronJob(config, timedConfig[index]);
      timedConfig.splice(index, 1);
      await this.communityConfigService.updateTimedPostsOptions(
        community.community_view.community,
        timedConfig
      );

      await interaction.editReply("Timed Post removed!");
    } catch (exc) {
      console.log(exc);
      interaction.editReply("Something went wrong");
    }
  }

  @Slash({ description: "Enable a timed posts", name: "enabletimedposts" })
  async enableTimedPosts(
    @SlashOption({
      description:
        "The community name ( the /c/--THISPART-- in the community URL )",
      name: "communityname",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    communityName: string,
    @SlashOption({
      description: "The id of this timed post.",
      name: "id",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    id: string,
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
        !(await this.verifiedUserService.isModeratorOf(
          interaction.user,
          community.community_view.community.id
        ))
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
      const timedConfig = config.timedConfig;
      const index = timedConfig.findIndex((x) => x.id === id);
      if (index === -1) {
        await interaction.editReply("Timed Post not found!");
        return;
      }
      timedConfig[index].enabled = true;
      await this.communityConfigService.updateTimedPostsOptions(
        community.community_view.community,
        timedConfig
      );

      await this.timedPostService.enableCronJob(config, timedConfig[index]);

      await interaction.editReply("Timed Post enabled!");
    } catch (exc) {
      console.log(exc);
      interaction.editReply("Something went wrong");
    }
  }

  @Slash({ description: "Disable a timed posts", name: "disabletimedposts" })
  async disableTimedPosts(
    @SlashOption({
      description:
        "The community name ( the /c/--THISPART-- in the community URL )",
      name: "communityname",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    communityName: string,
    @SlashOption({
      description: "The id of this timed post.",
      name: "id",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    id: string,
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
        !(await this.verifiedUserService.isModeratorOf(
          interaction.user,
          community.community_view.community.id
        ))
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
      const timedConfig = config.timedConfig;
      const index = timedConfig.findIndex((x) => x.id === id);
      if (index === -1) {
        await interaction.editReply("Timed Post not found!");
        return;
      }
      timedConfig[index].enabled = false;
      await this.communityConfigService.updateTimedPostsOptions(
        community.community_view.community,
        timedConfig
      );
      await this.timedPostService.disableCronJob(config, timedConfig[index]);
      await interaction.editReply("Timed Post disabled!");
    } catch (exc) {
      console.log(exc);
      interaction.editReply("Something went wrong");
    }
  }

  @Slash({ description: "Update a timed posts", name: "updatetimedposts" })
  async updateTimedPosts(
    @SlashOption({
      description:
        "The community name ( the /c/--THISPART-- in the community URL )",
      name: "communityname",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    communityName: string,
    @SlashOption({
      description: "The id of this timed post.",
      name: "id",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    id: string,
    @SlashOption({
      description: "The title of the timed post.",
      name: "title",
      type: ApplicationCommandOptionType.String,
    })
    title: string,
    @SlashOption({
      description: "The content of the timed post",
      name: "content",
      type: ApplicationCommandOptionType.Attachment,
    })
    content: Attachment | undefined,
    @SlashOption({
      description:
        "The interval of the timed post (Like the unix Cronjob, in our case node-cron )",
      name: "interval",
      type: ApplicationCommandOptionType.String,
    })
    interval: string | undefined,
    @SlashOption({
      description: "Lock the post after posting",
      name: "lock",
      type: ApplicationCommandOptionType.Boolean,
    })
    lock: boolean | undefined,
    interaction: CommandInteraction
  ) {
    await interaction.deferReply();
    try {
      if (interval && cron.validate(interval) === false) {
        await interaction.editReply("The interval is not valid!");
        return;
      }

      if (content && !content.contentType?.includes("text/plain")) {
        await interaction.editReply("The content must be a text file!");
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
        !(await this.verifiedUserService.isModeratorOf(
          interaction.user,
          community.community_view.community.id
        ))
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

      const timedConfig = config.timedConfig;
      const index = timedConfig.findIndex((x) => x.id === id);
      if (index === -1) {
        await interaction.editReply("Timed Post not found!");
        return;
      }

      if (title) {
        timedConfig[index].title = title;
      }

      if (content) {
        const text = (await axios.get(content.url)).data;
        timedConfig[index].content = text;
      }
      if (interval) {
        timedConfig[index].interval = interval;
      }
      if (lock) {
        timedConfig[index].lock = lock;
      }
      await this.communityConfigService.updateTimedPostsOptions(
        community.community_view.community,
        timedConfig
      );

      this.timedPostService.removeCronJob(config, timedConfig[index]);
      this.timedPostService.addCronJob(config, timedConfig[index]);

      await interaction.editReply("Timed Post updated!");
    } catch (exc) {
      console.log(exc);
      interaction.editReply("Something went wrong");
    }
  }

  @Slash({ description: "Get all timed posts", name: "gettimedposts" })
  async getTimedPosts(
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
        !(await this.verifiedUserService.isModeratorOf(
          interaction.user,
          community.community_view.community.id
        ))
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
      const timedConfig = config.timedConfig;

      const pages: PaginationItem[] = timedConfig.map((x) => {
        return {
          content: "Timed Post: " + x.id,
          embeds: [
            new EmbedBuilder().setDescription(x.content).addFields([
              {
                name: "Enabled",
                value: x.enabled ? "Yes" : "No",
              },
              {
                name: "Interval",
                value: `\`${x.interval}\``,
              },
              {
                name: "Last Execution",
                value: x.lastExecutionTimestamp
                  ? new Date(x.lastExecutionTimestamp).toISOString()
                  : "Never",
              },
              {
                name: "Lock after posting",
                value: x.lock ? "Yes" : "No",
              },
            ]),
          ],
        };
      });
      const pagination = new Pagination(interaction, pages, {
        onTimeout: () => interaction.deleteReply(),
        time: 300 * 1000,
        enableExit: true,
        pageText: timedConfig.map((x) => x.id),
        type: PaginationType.SelectMenu,
      });
      await pagination.send();
    } catch (exc) {
      console.log(exc);
      interaction.editReply("Something went wrong");
    }
  }
}
