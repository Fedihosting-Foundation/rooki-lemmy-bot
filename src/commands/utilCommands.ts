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
}
