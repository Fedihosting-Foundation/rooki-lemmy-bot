import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
  CommandInteraction,
  ComponentType,
} from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import client, { getAuth } from "../main";
import LogHelper from "../helpers/logHelper";
import verifiedUserService from "../services/verifiedUserService";
import { Inject } from "typedi";

@Discord()
export default class VerifyCommands {
  @Inject()
  verifiedUserService: verifiedUserService;
  @Slash({ description: "Verify a lemmy account", name: "verify" })
  async verify(
    @SlashOption({
      description:
        "The user account ID ( the /u/--THISPART-- in your profile URL )",
      name: "userid",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    userId: string,
    @SlashOption({
      description: "The code you got in your dms",
      name: "code",
      type: ApplicationCommandOptionType.String,
    })
    code: string | undefined,
    interaction: CommandInteraction
  ) {
    await interaction.deferReply({ ephemeral: true });
    if (code) {
      const verified = this.verifiedUserService.verifyCode(parseInt(code));
      if (verified.length === 0) {
        await interaction.editReply("Code not found!");
        return;
      }

      const user = verified[0].lemmyUser;
      const discordUser = interaction.user;
      try {
        await this.verifiedUserService.createConnection(user, discordUser);
        await interaction.editReply("You are now verified!");
      } catch (exc) {
        console.log(exc);
        interaction.editReply("Something went wrong");
      }
      return;
    }
    try {
      const user = await client.getPersonDetails({
        auth: getAuth(),
        username: userId,
      });

      if (!user) {
        interaction.editReply("User not found!");
        return;
      }

      const embed = LogHelper.userToEmbed(user.person_view);

      const acceptButton = new ButtonBuilder()
        .setCustomId("verify-user")
        .setLabel("Yes, this is me!")
        .setStyle(ButtonStyle.Primary)
        .setEmoji("✅");

      const denyButton = new ButtonBuilder()
        .setCustomId("deny-user")
        .setLabel("No, this is not me!")
        .setStyle(ButtonStyle.Danger)
        .setEmoji("❌");

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        acceptButton,
        denyButton
      );

      const message = await interaction.editReply({
        content: "Is this you? ( Please answer within 30 seconds!)",
        embeds: [embed],
        components: [row],
      });

      const filter = (i: any) =>
        i.user.id === interaction.user.id &&
        i.isButton() &&
        i.message.id === message.id;
      const collector = interaction.channel?.createMessageComponentCollector({
        filter,
        componentType: ComponentType.Button,
        maxUsers: 1,
        time: 30000,
      });
      collector?.on("end", async (collected) => {
        if (collected.size === 0) {
          await interaction.editReply({
            content: "You did not answer in time!",
            components: [],
          });
        }
      });
      collector?.on("collect", async (i) => {
        if ("message" in i) {
          if (i.message.deletable) await i.message.delete();
        }
        if (i.customId === "verify-user") {
          const code = this.verifiedUserService.createVerificationCode(
            user.person_view.person
          );
          client.createPrivateMessage({
            auth: getAuth(),
            recipient_id: user.person_view.person.id,
            content: `Hello ${user.person_view.person.name}! 
If you requested from discord a verification message verify yourself with: \`/verify userid:${userId} code:${code}\` in discord!  

This is to verify that you are the owner of the discord account \`${interaction.user.tag}\`!  
If you did not request this verification, please ignore this message! If i keep sending you messages, please block me!  

This message is automated! Please dont reply to this message!`,
          });

          await i.reply({
            content:
              "Ok, we i will send you a dm on lemmy with a verification code!",
            ephemeral: true,
          });
        }
        if (i.customId === "deny-user") {
          await i.reply({
            content: "Ok!",
            ephemeral: true,
          });
        }
      });
    } catch (exc) {
      console.log(exc);
      interaction.editReply("Something went wrong ( User not found? )");
    }
  }

  @Slash({ description: "Unverify yourself", name: "unverify" })
  async unverify(interaction: CommandInteraction) {
    await interaction.deferReply();

    try {
      await this.verifiedUserService.removeConnection(
        undefined,
        undefined,
        interaction.user
      );
      await interaction.editReply("You are now unverified!");
    } catch (exc) {
      console.log(exc);
      interaction.editReply("Something went wrong ( User not found? )");
    }
  }
}
