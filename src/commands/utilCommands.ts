import {
  ApplicationCommandOptionType,
  CommandInteraction,
  GuildMember,
} from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { Inject } from "typedi";
import verifiedUserService from "../services/verifiedUserService";
import LogHelper from "../helpers/logHelper";

@Discord()
export default class UtilCommands {
  @Inject()
  verifiedUserService: verifiedUserService;

  @Slash({ name: "ping", description: "Ping!" })
  async ping(interaction: CommandInteraction) {
    await interaction.reply("Pong!");
  }

  @Slash({ name: "whois", description: "Get info about a user" })
  async whois(
    @SlashOption({
      name: "user",
      description: "The user to get info about",
      required: true,
      type: ApplicationCommandOptionType.User,
    })
    user: GuildMember,
    interaction: CommandInteraction
  ) {
    await interaction.deferReply();
    const verifiedUser = await this.verifiedUserService.getConnection(
      undefined,
      user.user
    );
    if (!verifiedUser) {
      await interaction.editReply("User not found!");
      return;
    }
    const embed = LogHelper.userToEmbed({ person: verifiedUser.lemmyUser });

    await interaction.editReply({
      content: `**Discord:** ${verifiedUser.discordUser.username}
**Lemmy:** ${verifiedUser.lemmyUser.name}`,
      embeds: [embed],
    });
  }
}
