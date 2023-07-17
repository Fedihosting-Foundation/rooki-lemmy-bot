// import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
// import { Discord, Slash, SlashOption } from "discordx";
// import lemmyService, { getAuth } from "../services/lemmyService";

// @Discord()
// export default class LogCommands {
//   @Slash({ description: "Fetch a post from Lemmy", name: "fetchpost" })
//   async fetchPost(
//     @SlashOption({
//       description: "The post ID",
//       name: "postid",
//       required: true,
//       type: ApplicationCommandOptionType.Number,
//     })
//     postId: number,
//     interaction: CommandInteraction
//   ) {
//     await interaction.deferReply();
//     try {
//       const post = await lemmyService.client.getPost({
//         auth: getAuth(),
//         id: postId,
//       });

//       const embed = lemmyService.postToEmbed(post.post_view);

//       await interaction.editReply({ embeds: [embed] });
//     } catch (exc) {
//       console.log(exc);
//       interaction.editReply("Something went wrong");
//     }
//   }

//   @Slash({ description: "Fetch a comment from Lemmy", name: "fetchcomment" })
//   async fetchComment(
//     @SlashOption({
//       description: "The comment ID",
//       name: "commentid",
//       required: true,
//       type: ApplicationCommandOptionType.Number,
//     })
//     postId: number,
//     interaction: CommandInteraction
//   ) {
//     await interaction.deferReply();
//     try {
//       const post = await lemmyService.client.getPost({
//         auth: getAuth(),
//         id: postId,
//       });

//       const embed = lemmyService.postToEmbed(post.post_view);

//       await interaction.editReply({ embeds: [embed] });
//     } catch (exc) {
//       console.log(exc);
//       interaction.editReply("Something went wrong");
//     }
//   }
// }
