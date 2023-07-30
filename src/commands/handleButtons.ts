import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonComponentData,
  ButtonInteraction,
  ButtonStyle,
  ModalActionRowComponentBuilder,
  ModalBuilder,
  ModalSubmitInteraction,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { ButtonComponent, Discord } from "discordx";
import client, { getAuth } from "../main";
import LogHelper from "../helpers/logHelper";
import {
  getActionForComment,
  getActionForCommentReport,
  getActionForPost,
  getActionForPostReport,
} from "../lemmyEvents/logHandler";
import communityConfigService from "../services/communityConfigService";
import { Inject } from "typedi";
import CommunityService from "../services/communityService";
import verifiedUserService from "../services/verifiedUserService";

@Discord()
export default class LogCommands {
  @Inject()
  communityConfigService: communityConfigService;
  @Inject()
  communityService: CommunityService;
  @Inject()
  verifiedUserService: verifiedUserService;

  @ButtonComponent({ id: /refresh_(comment|post)_(.*)/ })
  async refreshEmbed(initialInteraction: ButtonInteraction) {
    await initialInteraction.deferReply({ ephemeral: true });
    try {
      const args = initialInteraction.customId.split("_");
      const isComment = args[1] === "comment";
      const data = isComment
        ? (
            await client.getComment({
              auth: getAuth(),
              id: Number(args[args.length - 1]),
            })
          ).comment_view
        : (
            await client.getPost({
              auth: getAuth(),
              id: Number(args[args.length - 1]),
            })
          ).post_view;

      const community = await this.communityService.getCommunity({
        id: data.community.id,
      });
      if (!community) {
        await initialInteraction.editReply({
          content: "**Community not found!**",
        });
        return;
      }
      if (
        !(await this.verifiedUserService.isModeratorOf(
          initialInteraction.user,
          community.community_view.community.id
        ))
      ) {
        await initialInteraction.editReply(
          "You are not a moderator of this community! ( **If you didnt verified yourself already please do it with /verify** )!"
        );
        return;
      }
      const embed =
        "comment" in data
          ? LogHelper.commentToEmbed(data)
          : LogHelper.postToEmbed(data);

      const isRemoved = embed.data.color === 0xff0000;

      embed.addFields(
        {
          name: "Last Updated",
          value: `<t:${Math.floor(Date.now() / 1000)}:R>`,
          inline: true,
        },
        {
          name: "Update requested by",
          value: `<@${initialInteraction.user.id}>`,
        }
      );

      await initialInteraction.message.edit({
        embeds: [embed],
        components: [
          "comment" in data
            ? getActionForComment(data)
            : getActionForPost(data),
        ],
      });
      initialInteraction.editReply({
        content: "Updated!",
      });
    } catch (exc) {
      console.log(exc);
      initialInteraction.editReply({
        content: "Something went wrong!",
      });
    }
  }
  @ButtonComponent({
    id: /ban_user_(true|false)_(true|false)_([^_]*)_([^_]*)_(.*)/,
  })
  async banUserButton(initialInteraction: ButtonInteraction) {
    const args = initialInteraction.customId.split("_");
    const communityId = Number(args[args.length - 1]);
    const community = await this.communityService.getCommunity({
      id: communityId,
    });
    if (!community) {
      await initialInteraction.reply({
        content: "**Community not found!** (Contact the owner of the Bot!)",
        ephemeral: true,
      });
      return;
    }

    if (
      !(await this.verifiedUserService.isModeratorOf(
        initialInteraction.user,
        community.community_view.community.id
      ))
    ) {
      await initialInteraction.editReply(
        "You are not a moderator of this community! ( **If you didnt verified yourself already please do it with /verify** )!"
      );
      return;
    }

    const banned = args[2] === "true";
    const comment = args[3] === "true";
    const dataId = Number(args[args.length - 3]);
    try {
      const modal = new ModalBuilder()
        .setCustomId("remove_comment_modal")
        .setTitle(`${banned ? "Remove" : "Restore"} Comment`);

      const reason = new TextInputBuilder()
        .setCustomId("reason")
        .setRequired(true)
        .setLabel("Reason:")
        .setStyle(TextInputStyle.Short);

      const deleteData = new TextInputBuilder()
        .setCustomId("deleteData")
        .setRequired(true)
        .setLabel("Delete Data? (y or n, n is default):")
        .setPlaceholder("n")
        .setStyle(TextInputStyle.Short);
      const firstRow =
        new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
          reason,
          deleteData
        );
      modal.addComponents(firstRow);

      const collectorFilter = (i: ModalSubmitInteraction) => {
        i.deferUpdate();
        return i.user.id === initialInteraction.user.id;
      };
      await initialInteraction.showModal(modal);

      const interaction = await initialInteraction.awaitModalSubmit({
        time: 120000,
        filter: collectorFilter,
      });
      const result = ["reason", "deleteData"].map((key) =>
        interaction.fields.getTextInputValue(key)
      );

      const banResult = await client.banFromCommunity({
        auth: getAuth(),
        ban: banned,
        community_id: communityId,
        person_id: Number(args[args.length - 2]),
        remove_data: result[1] === "y",
        reason: `${
          banned ? "Banned" : "Unbanned"
        } by ${interaction.user.toString()} with the reason: ${result[0]}`,
      });

      await initialInteraction.message.edit({
        content: `User was ${
          banned ? "banned" : "unbanned"
        } by ${interaction.user.toString()}!`,
        components: [
          comment
            ? getActionForComment(
                (
                  await client.getComment({ auth: getAuth(), id: dataId })
                ).comment_view
              )
            : getActionForPost(
                (
                  await client.getPost({ auth: getAuth(), id: dataId })
                ).post_view
              ),
        ],
      });
      await interaction.editReply({
        content: `User ${banned ? "banned" : "unbanned"}!`,
      });
    } catch (exc) {
      console.log(exc);
      initialInteraction.channel?.send(
        `Something went wrong ${initialInteraction.user.toString()}!}`
      );
    }
  }
  @ButtonComponent({ id: /remove_comment_(true|false)_(.*)/ })
  async removeCommentButton(initialInteraction: ButtonInteraction) {
    const args = initialInteraction.customId.split("_");
    const removed = args[2] === "true";

    try {
      try {
        const oldComment = await client.getComment({
          auth: getAuth(),
          id: parseInt(args[3]),
        });

        if (
          !(await this.verifiedUserService.isModeratorOf(
            initialInteraction.user,
            oldComment.comment_view.community.id
          ))
        ) {
          await initialInteraction.editReply(
            "You are not a moderator of this community! ( **If you didnt verified yourself already please do it with /verify** )!"
          );
          return;
        }
      } catch (e) {
        await initialInteraction.reply({
          content: "**Comment not found!**",
          ephemeral: true,
        });
        return;
      }
      const modal = new ModalBuilder()
        .setCustomId("remove_comment_modal")
        .setTitle(`${removed ? "Remove" : "Restore"} Comment`);

      const reason = new TextInputBuilder()
        .setCustomId("reason")
        .setRequired(true)
        .setLabel("Reason:")
        .setStyle(TextInputStyle.Short);
      const firstRow =
        new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
          reason
        );
      modal.addComponents(firstRow);

      const collectorFilter = (i: ModalSubmitInteraction) => {
        i.deferUpdate();
        return i.user.id === initialInteraction.user.id;
      };
      await initialInteraction.showModal(modal);

      const interaction = await initialInteraction.awaitModalSubmit({
        time: 120000,
        filter: collectorFilter,
      });
      const result = ["reason"].map((key) =>
        interaction.fields.getTextInputValue(key)
      );

      const post = await client.removeComment({
        auth: getAuth(),
        comment_id: parseInt(args[3]),
        removed: Boolean(args[2]),
        reason: `${
          removed ? "Removed" : "Restored"
        } by ${interaction.user.toString()} with the reason: ${result[0]}`,
      });

      await initialInteraction.message.edit({
        content: `Comment was ${
          removed ? "removed" : "restored"
        } by ${interaction.user.toString()}!`,
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
              .setCustomId(`remove_comment_${!removed}_${args[3]}`)
              .setLabel(`${removed ? "Restore" : "Remove"} Comment`)
              .setStyle(ButtonStyle.Primary),
            ...initialInteraction.message?.components[0].components
              .filter((x) => !x.customId?.includes("remove_comment_"))
              .map((x) => new ButtonBuilder(x as ButtonComponentData))
          ),
        ],
      });
      await interaction.editReply({
        content: `Comment ${removed ? "removed" : "restored"}!`,
      });
    } catch (exc) {
      console.log(exc);
      initialInteraction.channel?.send(
        `Something went wrong ${initialInteraction.user.toString()}!}`
      );
    }
  }

  @ButtonComponent({ id: /remove_post_(true|false)_(.*)/ })
  async removePostButton(initialInteraction: ButtonInteraction) {
    const args = initialInteraction.customId.split("_");
    const removed = args[2] === "true";

    try {
      try {
        const oldPost = await client.getPost({
          auth: getAuth(),
          id: parseInt(args[3]),
        });

        if (
          !(await this.verifiedUserService.isModeratorOf(
            initialInteraction.user,
            oldPost.post_view.community.id
          ))
        ) {
          await initialInteraction.editReply(
            "You are not a moderator of this community! ( **If you didnt verified yourself already please do it with /verify** )!"
          );
          return;
        }
      } catch (e) {
        await initialInteraction.reply({
          content: "**Comment not found!**",
          ephemeral: true,
        });
        return;
      }

      const modal = new ModalBuilder()
        .setCustomId("remove_post_modal")
        .setTitle(`${removed ? "Remove" : "Restore"} Post`);

      const reason = new TextInputBuilder()
        .setCustomId("reason")
        .setLabel("Reason:")
        .setRequired(true)
        .setStyle(TextInputStyle.Short);
      const firstRow =
        new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
          reason
        );
      modal.addComponents(firstRow);

      const collectorFilter = (i: ModalSubmitInteraction) => {
        i.deferUpdate();
        return i.user.id === initialInteraction.user.id;
      };
      await initialInteraction.showModal(modal);
      const interaction = await initialInteraction.awaitModalSubmit({
        time: 120000,
        filter: collectorFilter,
      });

      const result = ["reason"].map((key) =>
        interaction.fields.getTextInputValue(key)
      );

      const post = await client.removePost({
        auth: getAuth(),
        post_id: parseInt(args[3]),
        removed: removed,
        reason: `${
          removed ? "Removed" : "Restored"
        } by ${interaction.user.toString()} with the reason: ${result[0]}`,
      });

      await initialInteraction.message.edit({
        content: `Post was ${
          removed ? "removed" : "restored"
        } by ${interaction.user.toString()}!`,
        components: [getActionForPost(post.post_view)],
      });
      await interaction.editReply({
        content: `Post ${removed ? "removed" : "restored"}!`,
      });
    } catch (exc) {
      console.log(exc);
      initialInteraction.channel?.send(
        `Something went wrong ${initialInteraction.user.toString()}!`
      );
    }
  }

  @ButtonComponent({ id: /resolve_postreport_(true|false)_(.*)_(.*)/ })
  async resolvePostReport(initialInteraction: ButtonInteraction) {
    const args = initialInteraction.customId.split("_");
    const resolved = args[2] === "true";
    try {
      try {
        if (
          !(await this.verifiedUserService.isModeratorOf(
            initialInteraction.user,
            Number(args[4])
          ))
        ) {
          await initialInteraction.editReply(
            "You are not a moderator of this community! ( **If you didnt verified yourself already please do it with /verify** )!"
          );
          return;
        }
      } catch (e) {
        await initialInteraction.reply({
          content: "**Report not found!**",
          ephemeral: true,
        });
        return;
      }
      const modal = new ModalBuilder()
        .setCustomId("resolve_postreport_modal")
        .setTitle(`${resolved ? "Resolve" : "Unrestore"} Post Report`);

      const reason = new TextInputBuilder()
        .setCustomId("reason")
        .setLabel("Reason:")
        .setRequired(false)
        .setStyle(TextInputStyle.Short);
      const firstRow =
        new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
          reason
        );
      modal.addComponents(firstRow);

      const collectorFilter = (i: ModalSubmitInteraction) => {
        i.deferUpdate();
        return i.user.id === initialInteraction.user.id;
      };

      await initialInteraction.showModal(modal);
      const interaction = await initialInteraction.awaitModalSubmit({
        time: 120000,
        filter: collectorFilter,
      });

      const result = ["reason"].map((key) =>
        interaction.fields.getTextInputValue(key)
      );

      const post = await client.resolvePostReport({
        auth: getAuth(),
        report_id: parseInt(args[3]),
        resolved: resolved,
      });

      await initialInteraction.message.edit({
        content: `Post Report was ${
          resolved ? "resolved" : "unresolved"
        } by ${interaction.user.toString()} with the reason: ${
          result[0] || "no reason given"
        }!`,
        components: [getActionForPostReport(post.post_report_view)],
      });
      await interaction.editReply({
        content: `Post ${resolved ? "resolved" : "unresolved"}!`,
      });
    } catch (exc) {
      console.log(exc);
      initialInteraction.channel?.send(
        `Something went wrong ${initialInteraction.user.toString()}!`
      );
    }
  }

  @ButtonComponent({ id: /resolve_commentreport_(true|false)_(.*)_(.*)/ })
  async resolveCommentReport(initialInteraction: ButtonInteraction) {
    const args = initialInteraction.customId.split("_");
    const resolved = args[2] === "true";
    try {
      try {
        if (
          !(await this.verifiedUserService.isModeratorOf(
            initialInteraction.user,
            Number(args[4])
          ))
        ) {
          await initialInteraction.editReply(
            "You are not a moderator of this community! ( **If you didnt verified yourself already please do it with /verify** )!"
          );
          return;
        }
      } catch (e) {
        await initialInteraction.reply({
          content: "**Report not found!**",
          ephemeral: true,
        });
        return;
      }

      const modal = new ModalBuilder()
        .setCustomId("resolve_commentreport_modal")
        .setTitle(`${resolved ? "Resolve" : "Unrestore"} Comment Report`);

      const reason = new TextInputBuilder()
        .setCustomId("reason")
        .setLabel("Reason:")
        .setRequired(false)
        .setStyle(TextInputStyle.Short);
      const firstRow =
        new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
          reason
        );
      modal.addComponents(firstRow);

      const collectorFilter = (i: ModalSubmitInteraction) => {
        i.deferUpdate();
        return i.user.id === initialInteraction.user.id;
      };
      await initialInteraction.showModal(modal);
      const interaction = await initialInteraction.awaitModalSubmit({
        time: 120000,
        filter: collectorFilter,
      });

      const result = ["reason"].map((key) =>
        interaction.fields.getTextInputValue(key)
      );

      const comment = await client.resolveCommentReport({
        auth: getAuth(),
        report_id: parseInt(args[3]),
        resolved: resolved,
      });

      await initialInteraction.message.edit({
        content: `Post Report was ${
          resolved ? "resolved" : "unresolved"
        } by ${interaction.user.toString()} with the reason: ${
          result[0] || "no reason given"
        }!`,
        components: [getActionForCommentReport(comment.comment_report_view)],
      });
      await interaction.editReply({
        content: `Post ${resolved ? "resolved" : "unresolved"}!`,
      });
    } catch (exc) {
      console.log(exc);
      initialInteraction.channel?.send(
        `Something went wrong ${initialInteraction.user.toString()}!`
      );
    }
  }
  @ButtonComponent({ id: /remove_postreport_(true|false)_(.*)/ })
  async removePostReportButton(initialInteraction: ButtonInteraction) {
    const args = initialInteraction.customId.split("_");
    const removed = args[2] === "true";
    const resolved = true;

    try {
      try {
        const oldPost = await client.getPost({
          auth: getAuth(),
          id: parseInt(args[3]),
        });

        if (
          !(await this.verifiedUserService.isModeratorOf(
            initialInteraction.user,
            oldPost.post_view.community.id
          ))
        ) {
          await initialInteraction.editReply(
            "You are not a moderator of this community! ( **If you didnt verified yourself already please do it with /verify** )!"
          );
          return;
        }
      } catch (e) {
        await initialInteraction.reply({
          content: "**Comment not found!**",
          ephemeral: true,
        });
        return;
      }

      const modal = new ModalBuilder()
        .setCustomId("remove_post_modal")
        .setTitle(`${removed ? "Remove" : "Restore"} Post`);

      const reason = new TextInputBuilder()
        .setCustomId("reason")
        .setLabel("Reason:")
        .setRequired(true)
        .setStyle(TextInputStyle.Short);
      const firstRow =
        new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
          reason
        );
      modal.addComponents(firstRow);

      const collectorFilter = (i: ModalSubmitInteraction) => {
        i.deferUpdate();
        return i.user.id === initialInteraction.user.id;
      };
      await initialInteraction.showModal(modal);
      const interaction = await initialInteraction.awaitModalSubmit({
        time: 120000,
        filter: collectorFilter,
      });

      const result = ["reason"].map((key) =>
        interaction.fields.getTextInputValue(key)
      );

      const post = await client.removePost({
        auth: getAuth(),
        post_id: parseInt(args[3]),
        removed: removed,
        reason: `${
          removed ? "Removed" : "Restored"
        } by ${interaction.user.toString()} with the reason: ${result[0]}`,
      });

      const resoPost = await client.resolvePostReport({
        auth: getAuth(),
        report_id: parseInt(args[4]),
        resolved: resolved,
      });

      await initialInteraction.message.edit({
        content: `Post was ${
          removed ? "removed" : "restored"
        } by ${interaction.user.toString()}!`,
        components: [getActionForPost(post.post_view)],
      });
      await interaction.editReply({
        content: `Post ${removed ? "removed" : "restored"}!`,
      });
    } catch (exc) {
      console.log(exc);
      initialInteraction.channel?.send(
        `Something went wrong ${initialInteraction.user.toString()}!`
      );
    }
  }
  @ButtonComponent({ id: /remove_commentreport_(true|false)_(.*)/ })
  async removeCommentReportButton(initialInteraction: ButtonInteraction) {
    const args = initialInteraction.customId.split("_");
    const removed = args[2] === "true";
    const resolved = true;

    try {
      try {
        const oldComment = await client.getComment({
          auth: getAuth(),
          id: parseInt(args[3]),
        });

        if (
          !(await this.verifiedUserService.isModeratorOf(
            initialInteraction.user,
            oldComment.comment_view.community.id
          ))
        ) {
          await initialInteraction.editReply(
            "You are not a moderator of this community! ( **If you didnt verified yourself already please do it with /verify** )!"
          );
          return;
        }
      } catch (e) {
        await initialInteraction.reply({
          content: "**Comment not found!**",
        });
        return;
      }

      const modal = new ModalBuilder()
        .setCustomId("remove_comment_modal")
        .setTitle(`${removed ? "Remove" : "Restore"} Comment`);

      const reason = new TextInputBuilder()
        .setCustomId("reason")
        .setLabel("Reason:")
        .setRequired(true)
        .setStyle(TextInputStyle.Short);
      const firstRow =
        new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
          reason
        );
      modal.addComponents(firstRow);

      const collectorFilter = (i: ModalSubmitInteraction) => {
        i.deferUpdate();
        return i.user.id === initialInteraction.user.id;
      };

      await initialInteraction.showModal(modal);
      const interaction = await initialInteraction.awaitModalSubmit({
        time: 120000,
        filter: collectorFilter,
      });

      const result = ["reason"].map((key) =>
        interaction.fields.getTextInputValue(key)
      );

      const post = await client.removeComment({
        auth: getAuth(),
        comment_id: parseInt(args[3]),
        removed: removed,
        reason: `${
          removed ? "Removed" : "Restored"
        } by ${interaction.user.toString()} with the reason: ${result[0]}`,
      });

      const resoComment = await client.resolveCommentReport({
        auth: getAuth(),
        report_id: parseInt(args[4]),
        resolved: resolved,
      });

      await initialInteraction.message.edit({
        content: `Comment was ${
          removed ? "removed" : "restored"
        } by ${interaction.user.toString()}!`,
      });

      await interaction.editReply({
        content: `Comment ${removed ? "removed" : "restored"}!`,
      });
    } catch (exc) {
      console.log(exc);
      initialInteraction.channel?.send(
        `Something went wrong ${initialInteraction.user.toString()}!`
      );
    }
  }
}
