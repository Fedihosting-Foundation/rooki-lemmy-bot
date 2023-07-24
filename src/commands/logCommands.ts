import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import client, { getAuth } from "../main";
import LogHelper from "../helpers/logHelper";

@Discord()
export default class LogCommands {
  @Slash({ description: "Fetch a post from Lemmy", name: "fetchpost" })
  async fetchPost(
    @SlashOption({
      description: "The post ID",
      name: "postid",
      required: true,
      type: ApplicationCommandOptionType.Number,
    })
    postId: number,
    interaction: CommandInteraction
  ) {
    await interaction.deferReply();
    try {
      const post = await client.getPost({
        auth: getAuth(),
        id: postId,
      });

      const embed = LogHelper.postToEmbed(post.post_view);

      await interaction.editReply({ embeds: [embed] });
    } catch (exc) {
      console.log(exc);
      interaction.editReply("Something went wrong");
    }
  }

  @Slash({ description: "Fetch a comment from Lemmy", name: "fetchcomment" })
  async fetchComment(
    @SlashOption({
      description: "The comment ID",
      name: "commentid",
      required: true,
      type: ApplicationCommandOptionType.Number,
    })
    postId: number,
    interaction: CommandInteraction
  ) {
    await interaction.deferReply();

    try {
      const post = await client.getPost({
        auth: getAuth(),
        id: postId,
      });

      const embed = LogHelper.postToEmbed(post.post_view);

      await interaction.editReply({ embeds: [embed] });
    } catch (exc) {
      console.log(exc);
      interaction.editReply("Something went wrong");
    }
  }

  @Slash({ description: "Fetch a user from Lemmy", name: "fetchuser" })
  async getUser(
    @SlashOption({
      description: "The user ID",
      name: "userid",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    userId: string,
    interaction: CommandInteraction
  ) {
    await interaction.deferReply();
    try {
      const user = await client.getPersonDetails({
        auth: getAuth(),
        username: userId,
      });

      const embed = LogHelper.userToEmbed(user.person_view);

      await interaction.editReply({ embeds: [embed] });
    } catch (exc) {
      console.log(exc);
      interaction.editReply("Something went wrong");
    }
  }
}
