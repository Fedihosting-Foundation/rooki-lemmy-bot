import { EmbedBuilder } from "discord.js";
import {
  Post,
  Person,
  Community,
  CommentAggregates,
  PostAggregates,
  PostReportView,
  CommentReportView,
  Comment,
  PersonView,
  PersonAggregates,
} from "lemmy-js-client";
import { instanceUrl } from "./lemmyHelper";

export default class LogHelper {
  static commentToEmbed({
    post,
    comment,
    creator,
    community,
    counts,
  }: {
    post: Post;
    comment: Comment;
    creator: Person;
    community: Community;
    counts: CommentAggregates;
  }) {
    const embed = new EmbedBuilder()
      .setTitle("Commented:")
      .setDescription(
        (comment.content && comment.content.length > 4000
          ? comment.content.slice(0, 4000) + "..."
          : comment.content) || "No Comment body?????"
      )
      .setAuthor({
        name: creator.name,
        iconURL: creator.avatar ? creator.avatar : undefined,
      })
      .setURL(`${instanceUrl}/comment/${comment.id}`)
      .setTimestamp(new Date(counts.published + "Z"))
      .setFooter({
        text: `Posted in ${community.name}`,
        iconURL: community.icon ? `${community.icon}` : undefined,
      });
    embed.addFields([
      {
        name: "Votes",
        value: `${counts.upvotes} Upvotes | ${counts.downvotes} Downvotes`,
        inline: true,
      },
      {
        name: "Replies",
        value: `${counts.child_count}`,
        inline: true,
      },
      {
        name: "Deleted",
        value:
          comment.deleted || comment.removed
            ? comment.removed
              ? "Removed by moderator"
              : "Yes"
            : "No",
        inline: true,
      },
      {
        name: "Parent NSFW",
        value: post.nsfw ? "Yes" : "No",
        inline: true,
      },
    ]);
    if (comment.removed) embed.setColor(0xff0000);

    return embed;
  }

  static postToEmbed({
    post,
    creator,
    community,
    counts,
  }: {
    post: Post;
    creator: Person;
    community: Community;
    counts: PostAggregates;
  }) {
    const embed = new EmbedBuilder()
      .setTitle(
        post.name.length > 256 ? post.name.slice(0, 250) + "..." : post.name
      )
      .setURL(`${instanceUrl}/post/${post.id}`)
      .setAuthor({
        name: creator.name,
        iconURL: creator.avatar ? creator.avatar : undefined,
      })
      .setDescription(
        (post.body && post.body.length > 4000
          ? post.body.slice(0, 4000) + "..."
          : post.body) || "No Body"
      )
      .setTimestamp(new Date(counts.published + "Z"))
      .setFooter({
        text: `Posted in ${community.name}`,
        iconURL: community.icon ? `${community.icon}` : undefined,
      })
      .setColor(0x00ff00);

    embed.addFields([
      {
        name: "Votes",
        value: `${counts.upvotes} Upvotes | ${counts.downvotes} Downvotes`,
        inline: true,
      },
      {
        name: "Comments",
        value: `${counts.comments} Comments`,
        inline: true,
      },
      {
        name: "Deleted",
        value:
          post.deleted || post.removed
            ? post.removed
              ? "Removed by moderator"
              : "Yes"
            : "No",
        inline: true,
      },
      {
        name: "NSFW",
        value: post.nsfw ? "Yes" : "No",
        inline: true,
      },
    ]);

    if (post.removed) embed.setColor(0xff0000);

    try {
      embed.setImage(post.thumbnail_url || post.url || null);
    } catch (exc) {
      console.log(exc);
    }
    return embed;
  }

  static postReportToEmbed({
    post,
    post_creator,
    creator,
    counts,
    community,
    post_report,
  }: PostReportView) {
    const postEmbed = this.postToEmbed({
      post: post,
      creator: post_creator,
      counts: counts,
      community: community,
    });

    const embed = new EmbedBuilder()
      .setTitle("Post Report")
      .setAuthor({
        name: creator.name,
        iconURL: creator.avatar ? creator.avatar : undefined,
      })
      .setDescription(post_report.reason)
      .setTimestamp(new Date(post_report.published + "Z"))
      .setFooter({
        text: `Reported in ${community.name}`,
        iconURL: community.icon ? `${community.icon}` : undefined,
      });

    return [embed, postEmbed];
  }

  static commentReportToEmbed({
    post,
    comment,
    comment_creator,
    creator,
    counts,
    community,
    comment_report,
  }: CommentReportView) {
    const commentEmbed = this.commentToEmbed({
      post: post,
      comment: comment,
      creator: comment_creator,
      counts: counts,
      community: community,
    });

    const embed = new EmbedBuilder()
      .setTitle("Comment Report")
      .setAuthor({
        name: creator.name,
        iconURL: creator.avatar ? creator.avatar : undefined,
      })
      .setDescription(comment_report.reason)
      .setTimestamp(new Date(comment_report.published + "Z"))
      .setFooter({
        text: `Reported in ${community.name}`,
        iconURL: community.icon ? `${community.icon}` : undefined,
      });

    return [embed, commentEmbed];
  }

  static userToEmbed({ counts, person }: {counts?: PersonAggregates, person: Person }) {
    const embed = new EmbedBuilder()
      .setTitle("Person Detail")
      .setDescription(person.bio || "**User has no Bio**")
      .setAuthor({
        name: person.name,
        iconURL: person.avatar ? person.avatar : undefined,
      })
      .setTimestamp(new Date(person.published + "Z"))
      .addFields([
        { name: "ID", value: String(person.id), inline: true },
        { name: "Admin", value: person.admin ? "Yes" : "No", inline: true },
              ])
      .setURL(`${instanceUrl}/u/${person.name}`)
      .setFooter({
        text: `User`,
      });

    if (counts) {
      embed.addFields([
        { name: "Posts", value: String(counts.post_count), inline: true },
        { name: "Comments", value: String(counts.comment_count), inline: true },
        {
          name: "Comment Score",
          value: String(counts.comment_score),
          inline: true,
        },
        { name: "Post Score", value: String(counts.post_score), inline: true },
      ]);
    }

    return embed;
  }
}
