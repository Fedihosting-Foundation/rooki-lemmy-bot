import { LemmyCommand, LemmyOn, getCommand } from "../decorators/lemmyPost";
import client from "../main";
import { CommunityConfig } from "../models/iConfig";
import personMentionViewModel from "../models/personMentionViewModel";

class CommandHandler {
  @LemmyOn({ event: "personmentioned" })
  async handleCommand(
    mentionData: personMentionViewModel,
    config: CommunityConfig
  ) {
    const mention = `(${mentionData.recipient.actor_id})`;
    const body = mentionData.comment.content.replace(/\r|\n/gim, "\r\n");
    const newlines =
      body.indexOf("\r\n", body.indexOf(mention) + mention.length) + 1;
    const strippedComment = body.slice(
      body.indexOf(mention) + mention.length,
      newlines > 0 ? newlines : undefined
    );
    const restArgs = strippedComment.split(" ");

    const command = restArgs[0]?.toLowerCase() || "help";

    const commandData = getCommand(command);
    if (!commandData) return;
    const { data, fn } = commandData;

    if (data.community) {
      const isValid = data.community.some((x) => {
        if (
          x === mentionData.community.name ||
          x === mentionData.community.id
        ) {
          return true;
        }
      });
      if (!isValid) {
        console.log(
          "Invalid community:",
          mentionData.community.name,
          mentionData.community.id
        );
        return;
      }
    }
    restArgs.shift();
    await fn(client, restArgs, config, mentionData);
  }
}
