import {
  ApplicationCommandOptionType,
  CommandInteraction,
  GuildMember,
} from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { Inject } from "typedi";
import verifiedUserService from "../services/verifiedUserService";
import LogHelper from "../helpers/logHelper";
import CommunityService from "../services/communityService";
import { GetPersonDetailsResponse } from "lemmy-js-client";
import { getActorId, extractInstanceFromActorId } from "../helpers/lemmyHelper";
import config from "../config";

@Discord()
export default class UtilCommands {
  @Inject()
  verifiedUserService: verifiedUserService;

  @Inject()
  communityService: CommunityService;

  @Slash({ name: "ping", description: "Ping!" })
  async ping(interaction: CommandInteraction) {
    await interaction.reply("Pong!");
  }
  personToEmbed(personView: GetPersonDetailsResponse) {
    const baseEmbed = LogHelper.userToEmbed(personView.person_view);

    const moderatorOf = personView.moderates.map((c) => {
      return `[${
        c.community.local
          ? c.community.name
          : getActorId(
              extractInstanceFromActorId(c.community.actor_id),
              c.community.name
            )
      }](${config.lemmyInstance}/c/${
        c.community.local
          ? c.community.name
          : getActorId(
              extractInstanceFromActorId(c.community.actor_id),
              c.community.name
            )
      })`;
    });

    if (moderatorOf.length > 0) {
      const text = "> " + moderatorOf.join("\n> ");
      baseEmbed.addFields([
        {
          name: "Moderator of",
          value: text.length >= 1024 ? text.substring(0, 1021) + "..." : text,
        },
      ]);
    }

    return baseEmbed;
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
    const person = await this.communityService.getUser({id: verifiedUser.lemmyUser.id});
    if (!person) {
      await interaction.editReply("User not found!");
      return;
    }
    const embed = this.personToEmbed(person);

    await interaction.editReply({
      content: `**Discord:** ${verifiedUser.discordUser.username}
**Lemmy:** ${verifiedUser.lemmyUser.name}`,
      embeds: [embed],
    });
  }
}
