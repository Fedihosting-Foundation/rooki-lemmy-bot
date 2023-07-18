import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ModalActionRowComponentBuilder,
  ModalBuilder,
  ModalSubmitInteraction,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { ButtonComponent, Discord } from "discordx";
import client, { getAuth } from "../main";

@Discord()
export default class LogCommands {
  @ButtonComponent({ id: /remove_comment_(true|false)_(.*)/ })
  async removeCommentButton(initialInteraction: ButtonInteraction) {
    const args = initialInteraction.customId.split("_");
    const removed = args[2] === "true";
    try {
      const modal = new ModalBuilder()
        .setCustomId("remove_comment_modal")
        .setTitle(`${removed ? "Remove" : "Restore"} Comment`);

      const reason = new TextInputBuilder()
        .setCustomId("reason")
        .setRequired(true)
        .setLabel("Reason:")
        .setStyle(TextInputStyle.Short);
      const firstRow =
        new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
          reason
        );
      modal.addComponents(firstRow);

      const collectorFilter = (i: ModalSubmitInteraction) => {
        i.deferUpdate();
        return i.user.id === initialInteraction.user.id;
      };
      await initialInteraction.showModal(modal);

      const interaction = await initialInteraction.awaitModalSubmit({
        time: 120000,
        filter: collectorFilter,
      });
      const result = ["reason"].map((key) =>
        interaction.fields.getTextInputValue(key)
      );

      const post = await client.removeComment({
        auth: getAuth(),
        comment_id: parseInt(args[3]),
        removed: Boolean(args[2]),
        reason: `${
          removed ? "Removed" : "Restored"
        } by ${interaction.user.toString()} with the reason: ${result[0]}`,
      });

      await initialInteraction.message.edit({
        content: `Comment was ${
          removed ? "removed" : "restored"
        } by ${interaction.user.toString()}!`,
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
              .setCustomId(`remove_comment_${!removed}_${args[3]}`)
              .setLabel(`${removed ? "Restore" : "Remove"} Comment`)
              .setStyle(ButtonStyle.Primary)
          ),
        ],
      });
      await interaction.editReply({
        content: `Comment ${removed ? "removed" : "restored"}!`,
      });
    } catch (exc) {
      console.log(exc);
      initialInteraction.channel?.send(
        `Something went wrong ${initialInteraction.user.toString()}!}`
      );
    }
  }

  @ButtonComponent({ id: /remove_post_(true|false)_(.*)/ })
  async removePostButton(initialInteraction: ButtonInteraction) {
    const args = initialInteraction.customId.split("_");
    const removed = args[2] === "true";
    try {
      const modal = new ModalBuilder()
        .setCustomId("remove_post_modal")
        .setTitle(`${removed ? "Remove" : "Restore"} Post`);

      const reason = new TextInputBuilder()
        .setCustomId("reason")
        .setLabel("Reason:")
        .setRequired(true)
        .setStyle(TextInputStyle.Short);
      const firstRow =
        new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
          reason
        );
      modal.addComponents(firstRow);

      const collectorFilter = (i: ModalSubmitInteraction) => {
        i.deferUpdate();
        return i.user.id === initialInteraction.user.id;
      };
      await initialInteraction.showModal(modal);
      const interaction = await initialInteraction.awaitModalSubmit({
        time: 120000,
        filter: collectorFilter,
      });

      const result = ["reason"].map((key) =>
        interaction.fields.getTextInputValue(key)
      );

      const post = await client.removePost({
        auth: getAuth(),
        post_id: parseInt(args[3]),
        removed: removed,
        reason: `${
          removed ? "Removed" : "Restored"
        } by ${interaction.user.toString()} with the reason: ${result[0]}`,
      });

      await initialInteraction.message.edit({
        content: `Post was ${
          removed ? "removed" : "restored"
        } by ${interaction.user.toString()}!`,
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
              .setCustomId(`remove_post_${!removed}_${args[3]}`)
              .setLabel(`${removed ? "Restore" : "Remove"} Post`)
              .setStyle(ButtonStyle.Primary)
          ),
        ],
      });
      await interaction.editReply({
        content: `Post ${removed ? "removed" : "restored"}!`,
      });
    } catch (exc) {
      console.log(exc);
      initialInteraction.channel?.send(
        `Something went wrong ${initialInteraction.user.toString()}!`
      );
    }
  }

  @ButtonComponent({ id: /resolve_postreport_(true|false)_(.*)/ })
  async resolvePostReport(initialInteraction: ButtonInteraction) {
    const args = initialInteraction.customId.split("_");
    const resolved = args[2] === "true";
    try {
      const modal = new ModalBuilder()
        .setCustomId("resolve_postreport_modal")
        .setTitle(`${resolved ? "Resolve" : "Unrestore"} Post Report`);

      const reason = new TextInputBuilder()
        .setCustomId("reason")
        .setLabel("Reason:")
        .setRequired(false)
        .setStyle(TextInputStyle.Short);
      const firstRow =
        new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
          reason
        );
      modal.addComponents(firstRow);

      const collectorFilter = (i: ModalSubmitInteraction) => {
        i.deferUpdate();
        return i.user.id === initialInteraction.user.id;
      };

      await initialInteraction.showModal(modal);
      const interaction = await initialInteraction.awaitModalSubmit({
        time: 120000,
        filter: collectorFilter,
      });

      const result = ["reason"].map((key) =>
        interaction.fields.getTextInputValue(key)
      );

      const post = await client.resolvePostReport({
        auth: getAuth(),
        report_id: parseInt(args[3]),
        resolved: resolved,
      });

      await initialInteraction.message.edit({
        content: `Post Report was ${
          resolved ? "resolved" : "unresolved"
        } by ${interaction.user.toString()} with the reason: ${
          result[0] || "no reason given"
        }!`,
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
              .setCustomId(`resolve_postreport_${!resolved}_${args[3]}`)
              .setLabel(`${resolved ? "Unresolve" : "Resolve"} Post Report by ${interaction.user.toString()} with the reason: ${result[0]}`)
              .setStyle(resolved ? ButtonStyle.Primary : ButtonStyle.Danger)
          ),
        ],
      });
      await interaction.editReply({
        content: `Post ${resolved ? "resolved" : "unresolved"}!`,
      });
    } catch (exc) {
      console.log(exc);
      initialInteraction.channel?.send(
        `Something went wrong ${initialInteraction.user.toString()}!`
      );
    }
  }

  @ButtonComponent({ id: /resolve_commentreport_(true|false)_(.*)/ })
  async resolveCommentReport(initialInteraction: ButtonInteraction) {
    const args = initialInteraction.customId.split("_");
    const resolved = args[2] === "true";
    try {
      const modal = new ModalBuilder()
        .setCustomId("resolve_commentreport_modal")
        .setTitle(`${resolved ? "Resolve" : "Unrestore"} Comment Report`);

      const reason = new TextInputBuilder()
        .setCustomId("reason")
        .setLabel("Reason:")
        .setRequired(false)
        .setStyle(TextInputStyle.Short);
      const firstRow =
        new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
          reason
        );
      modal.addComponents(firstRow);

      const collectorFilter = (i: ModalSubmitInteraction) => {
        i.deferUpdate();
        return i.user.id === initialInteraction.user.id;
      };
      await initialInteraction.showModal(modal);
      const interaction = await initialInteraction.awaitModalSubmit({
        time: 120000,
        filter: collectorFilter,
      });

      const result = ["reason"].map((key) =>
        interaction.fields.getTextInputValue(key)
      );

      const comment = await client.resolveCommentReport({
        auth: getAuth(),
        report_id: parseInt(args[3]),
        resolved: resolved,
      });

      await initialInteraction.message.edit({
        content: `Post Report was ${
          resolved ? "resolved" : "unresolved"
        } by ${interaction.user.toString()} with the reason: ${
          result[0] || "no reason given"
        }!`,
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
              .setCustomId(`resolve_postreport_${!resolved}_${args[3]}`)
              .setLabel(`${resolved ? "Unresolve" : "Resolve"} Post Report`)
              .setStyle(resolved ? ButtonStyle.Primary : ButtonStyle.Danger)
          ),
        ],
      });
      await interaction.editReply({
        content: `Post ${resolved ? "resolved" : "unresolved"}!`,
      });
    } catch (exc) {
      console.log(exc);
      initialInteraction.channel?.send(
        `Something went wrong ${initialInteraction.user.toString()}!`
      );
    }
  }
}
