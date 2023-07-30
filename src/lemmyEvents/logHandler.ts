import { LemmyOn } from "../decorators/lemmyPost";
import LogService from "../services/logService";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import {
  CommentReportView,
  CommentView,
  PostReportView,
  PostView,
} from "lemmy-js-client";
import LogHelper from "../helpers/logHelper";
import postViewModel from "../models/postViewModel";
import commentViewModel from "../models/commentViewModel";
import communityConfigModel from "../models/communityConfigModel";
import { LemmyEventArguments } from "../types/LemmyEvents";
import commentReportViewModel from "../models/commentReportViewModel";
import postReportViewModel from "../models/postReportViewModel";

const logService = LogService;

const getActionForComment = (comment: CommentView) => {
  const row = new ActionRowBuilder<ButtonBuilder>();

  const removeButton = new ButtonBuilder()
    .setCustomId(
      `remove_comment_${!comment.comment.removed}_${comment.comment.id}`
    )
    .setLabel(`${!comment.comment.removed ? "Remove" : "Recover"} Comment`)
    .setStyle(ButtonStyle.Primary);
  const banButton = new ButtonBuilder()
    .setCustomId(
      `ban_user_${!comment.creator_banned_from_community}_true_${comment.comment.id}_${comment.creator.id}_${
        comment.community.id
      }`
    )
    .setLabel(
      `${!comment.creator_banned_from_community ? "Ban" : "Unban"} User`
    )
    .setStyle(ButtonStyle.Danger);

  const refreshButton = new ButtonBuilder()
    .setCustomId(`refresh_comment_${comment.comment.id}`)
    .setStyle(ButtonStyle.Secondary)
    .setEmoji("🔄");
  row.addComponents(removeButton, banButton, refreshButton);

  return row;
};

const getActionForPost = (post: PostView) => {
  const row = new ActionRowBuilder<ButtonBuilder>();

  const removeButton = new ButtonBuilder()
    .setCustomId(`remove_post_${!post.post.removed}_${post.post.id}`)
    .setLabel(`${!post.post.removed ? "Remove" : "Restore"} Post`)
    .setStyle(ButtonStyle.Primary);

  const banButton = new ButtonBuilder()
    .setCustomId(
      `ban_user_${!post.creator_banned_from_community}_false_${post.post.id}_${post.community.id}_${
        post.creator.id
      }`
    )
    .setLabel(`${!post.creator_banned_from_community ? "Ban" : "Unban"} User`)
    .setStyle(ButtonStyle.Danger);

  const refreshButton = new ButtonBuilder()
    .setCustomId(`refresh_post_${post.post.id}`)
    .setStyle(ButtonStyle.Secondary)
    .setEmoji("🔄");
  row.addComponents(removeButton, banButton, refreshButton);

  return row;
};

const getActionForPostReport = (post: PostReportView) => {
  const row = new ActionRowBuilder<ButtonBuilder>();

  const removeButton = new ButtonBuilder()
    .setCustomId(`remove_postreport_${!post.post.removed}_${post.post.id}_${post.post_report.id}`)
    .setLabel(`${!post.post.removed ? "Remove" : "Restore"} Post`)
    .setStyle(ButtonStyle.Danger);

  const banButton = new ButtonBuilder()
    .setCustomId(
      `ban_user_${!post.creator_banned_from_community}_false_${post.post.id}_${post.community.id}_${
        post.creator.id
      }`
    )
    .setLabel(`${!post.creator_banned_from_community ? "Ban" : "Unban"} User`)
    .setStyle(ButtonStyle.Danger);

  const resolveButton = new ButtonBuilder()
    .setCustomId(
      `resolve_postreport_${!post.post_report.resolved}_${
        post.post_report.id
      }_${post.community.id}`
    )
    .setLabel(
      `${!post.post_report.resolved ? "Resolve" : "Unresolve"} Post Report`
    )
    .setStyle(ButtonStyle.Primary);

  row.addComponents(removeButton, banButton, resolveButton);

  return row;
};
const getActionForCommentReport = (comment: CommentReportView) => {
  const row = new ActionRowBuilder<ButtonBuilder>();

  const removeButton = new ButtonBuilder()
    .setCustomId(
      `remove_commentreport_${!comment.comment.removed}_${comment.comment.id}_${comment.comment_report.id}`
    )
    .setLabel(`${!comment.comment.removed ? "Remove" : "Recover"} Comment`)
    .setStyle(ButtonStyle.Primary);

  const banButton = new ButtonBuilder()
    .setCustomId(
      `ban_user_${!comment.creator_banned_from_community}_true_${comment.comment.id}_${comment.creator.id}_${
        comment.community.id
      }`
    )
    .setLabel(
      `${!comment.creator_banned_from_community ? "Ban" : "Unban"} User`
    )
    .setStyle(ButtonStyle.Danger);

  const resolveButton = new ButtonBuilder()
    .setCustomId(
      `resolve_commentreport_${!comment.comment_report.resolved}_${
        comment.comment_report.id
      }_${comment.community.id}`
    )
    .setLabel(
      `${
        !comment.comment_report.resolved ? "Resolve" : "Unresolve"
      } Comment Report`
    )
    .setStyle(ButtonStyle.Danger);

  row.addComponents(removeButton, banButton, resolveButton);

  return row;
};

export {
  getActionForComment,
  getActionForPost,
  getActionForPostReport,
  getActionForCommentReport,
};

class LogHandler {
  @LemmyOn({ event: "postcreated" })
  async handlePost(
    event: LemmyEventArguments<postViewModel>

  ) {
    if (!event.config?.logConfig.discord.posts.enabled) return;
    logService.Log(
      {
        content: "Post created!",
        embeds: [LogHelper.postToEmbed(event.data)],
        components: [getActionForPost(event.data)],
      },
      {
        channel:
          event.config.logConfig.discord.posts.channel ||
          event.config.logConfig.discord.logChannel,
        guild: event.config.logConfig.discord.logGuild,
        options: event.config.logConfig.discord.posts,
      }
    );
  }
  @LemmyOn({ event: "commentcreated" })
  async handleComments(
    event: LemmyEventArguments<commentViewModel>
  ) {
    if (!event.config?.logConfig.discord.comments.enabled) return;
    logService.Log(
      {
        content: "Comment created!",
        embeds: [LogHelper.commentToEmbed(event.data)],
        components: [getActionForComment(event.data)],
      },
      {
        channel:
        event.config.logConfig.discord.comments.channel ||
        event.config.logConfig.discord.logChannel,
        guild: event.config.logConfig.discord.logGuild,
        options: event.config.logConfig.discord.comments,
      }
    );
  }
  @LemmyOn({ event: "commentreportcreated" })
  async logCommentReports(
    event: LemmyEventArguments<commentReportViewModel>
  ) {
    if (!event.config?.logConfig.discord.reports.enabled) return;
    await logService.Log(
      {
        content: "New Comment Report!",
        embeds: LogHelper.commentReportToEmbed(event.data),
        components: [getActionForCommentReport(event.data)],
      },
      {
        channel:
        event.config.logConfig.discord.reports.channel ||
        event.config.logConfig.discord.logChannel,
        guild: event.config.logConfig.discord.logGuild,
        options: event.config.logConfig.discord.reports,
      }
    );
  }

  @LemmyOn({ event: "postreportcreated" })
  async logPostReports(
    event: LemmyEventArguments<postReportViewModel>

  ) {
    if (!event.config?.logConfig.discord.reports.enabled) return;
    await logService.Log(
      {
        content: "New Post Report!",
        embeds: LogHelper.postReportToEmbed(event.data),
        components: [getActionForPostReport(event.data)],
      },
      {
        channel:
        event.config.logConfig.discord.reports.channel ||
        event.config.logConfig.discord.logChannel,
        guild: event.config.logConfig.discord.logGuild,
        options: event.config.logConfig.discord.reports,
      }
    );
  }
}
