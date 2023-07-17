import { EmbedBuilder } from "discord.js";
import { Post, Person, Community, CommentAggregates, PostAggregates, PostReportView, CommentReportView, Comment } from "lemmy-js-client";

export default class LogHelper{
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
          .setDescription(
            (comment.content && comment.content.length > 4000
              ? comment.content.slice(0, 4000) + "..."
              : comment.content) || "No Comment body?????"
          )
          .setAuthor({
            name: creator.name,
            iconURL: creator.avatar ? creator.avatar : undefined,
          })
          .setURL(comment.ap_id)
          .setTimestamp(new Date(counts.published))
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
          },
        ]);
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
          .setURL(post.ap_id)
          .setAuthor({
            name: creator.name,
            iconURL: creator.avatar ? creator.avatar : undefined,
          })
          .setDescription(
            (post.body && post.body.length > 4000
              ? post.body.slice(0, 4000) + "..."
              : post.body) || "No Body"
          )
          .setTimestamp(new Date(counts.published))
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
        ]);
    
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
          .setTimestamp(new Date(post_report.published))
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
          .setTimestamp(new Date(comment_report.published))
          .setFooter({
            text: `Reported in ${community.name}`,
            iconURL: community.icon ? `${community.icon}` : undefined,
          });
    
        return [embed, commentEmbed];
      }
}