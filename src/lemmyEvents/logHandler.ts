import { LemmyOn } from "../decorators/lemmyPost";
import LogService from "../services/logService";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import {
  CommentReportView,
  CommentView,
  PostReportView,
  PostView,
} from "lemmy-js-client";
import { activeCommunities } from "../config";
import LogHelper from "../helpers/logHelper";
import { CommunityConfig } from "../models/iConfig";
import postViewModel from "../models/postViewModel";
import commentViewModel from "../models/commentViewModel";

const logService = LogService;

const getActionForComment = (comment: CommentView) => {
  const row = new ActionRowBuilder<ButtonBuilder>();

  const removeButton = new ButtonBuilder()
    .setCustomId("remove_comment_true_" + comment.comment.id)
    .setLabel("Remove Comment")
    .setStyle(ButtonStyle.Danger);

  row.addComponents(removeButton);

  return row;
};

const getActionForPost = (post: PostView) => {
  const row = new ActionRowBuilder<ButtonBuilder>();

  const removeButton = new ButtonBuilder()
    .setCustomId("remove_post_true_" + post.post.id)
    .setLabel("Remove Post")
    .setStyle(ButtonStyle.Danger);

  row.addComponents(removeButton);

  return row;
};

const getActionForPostReport = (post: PostReportView) => {
  const row = new ActionRowBuilder<ButtonBuilder>();

  const resolveButton = new ButtonBuilder()
    .setCustomId("resolve_postreport_true_" + post.post_report.id)
    .setLabel("Resolve Post Report")
    .setStyle(ButtonStyle.Danger);

  row.addComponents(resolveButton);

  return row;
};
const getActionForCommentReport = (post: CommentReportView) => {
  const row = new ActionRowBuilder<ButtonBuilder>();

  const resolveButton = new ButtonBuilder()
    .setCustomId("resolve_commentreport_true_" + post.comment_report.id)
    .setLabel("Resolve Comment Report")
    .setStyle(ButtonStyle.Danger);

  row.addComponents(resolveButton);

  return row;
};

export {
  getActionForComment,
  getActionForPost,
  getActionForPostReport,
  getActionForCommentReport,
}

class LogHandler {
  @LemmyOn({ event: "postcreated" })
  async handlePost(postData: postViewModel, communityConfig: CommunityConfig) {
    if (
      !communityConfig.logs.discord.enabled ||
      !communityConfig.logs.discord.posts.enabled
    )
      return;
    logService.Log(
      {
        content: "Post created!",
        embeds: [LogHelper.postToEmbed(postData)],
        components: [getActionForPost(postData)],
      },
      {
        channel:
          communityConfig.logs.discord.posts.channel ||
          communityConfig.logs.discord.logChannel,
        guild: communityConfig.logs.discord.logGuild,
        options: communityConfig.logs.discord.posts,
      }
    );
  }
  @LemmyOn({ event: "commentcreated" })
  async handleComments(
    commentData: commentViewModel,
    communityConfig: CommunityConfig
  ) {
    
    if (
      !communityConfig.logs.discord.enabled ||
      !communityConfig.logs.discord.comments.enabled
    )
      return;
    logService.Log(
      {
        content: "Comment created!",
        embeds: [LogHelper.commentToEmbed(commentData)],
        components: [getActionForComment(commentData)],
      },
      {
        channel:
          communityConfig.logs.discord.posts.channel ||
          communityConfig.logs.discord.logChannel,
        guild: communityConfig.logs.discord.logGuild,
        options: communityConfig.logs.discord.posts,
      }
    );
  }
  @LemmyOn({ event: "commentreportcreated", community: activeCommunities })
  async logCommentReports(
    reportView: CommentReportView,
    communityConfig: CommunityConfig
  ) {
    if (
      !communityConfig.logs.discord.enabled ||
      !communityConfig.logs.discord.reports.enabled
    )
      return;
    await logService.Log(
      {
        content: "New Comment Report!",
        embeds: LogHelper.commentReportToEmbed(reportView),
        components: [getActionForCommentReport(reportView)],
      },
      {
        channel:
          communityConfig.logs.discord.reports.channel ||
          communityConfig.logs.discord.logChannel,
        guild: communityConfig.logs.discord.logGuild,
        options: communityConfig.logs.discord.reports,
      }
    );
  }

  @LemmyOn({ event: "postreportcreated", community: activeCommunities })
  async logPostReports(
    reportView: PostReportView,
    communityConfig: CommunityConfig
  ) {
    if (
      !communityConfig.logs.discord.enabled ||
      !communityConfig.logs.discord.reports.enabled
    )
      return;
    await logService.Log(
      {
        content: "New Post Report!",
        embeds: LogHelper.postReportToEmbed(reportView),
        components: [getActionForPostReport(reportView)],
      },
      {
        channel:
          communityConfig.logs.discord.reports.channel ||
          communityConfig.logs.discord.logChannel,
        guild: communityConfig.logs.discord.logGuild,
        options: communityConfig.logs.discord.reports,
      }
    );
  }
}
