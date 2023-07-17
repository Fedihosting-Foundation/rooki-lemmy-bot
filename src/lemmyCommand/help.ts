import { LemmyHttp, PersonMentionView } from "lemmy-js-client";
import { LemmyCommand, getCommands } from "../decorators/lemmyPost";
import { CommunityConfig } from "../models/iConfig";
import { getAuth } from "../main";

class helpCommand {
  @LemmyCommand({
    data: {
      command: "help",
      description: "Shows this help message",
      example: "help",
    },
  })
  async help(
    client: LemmyHttp,
    commandArgs: string[],
    config: CommunityConfig,
    mentionData: PersonMentionView
  ) {
    const commands = getCommands();
    const helpMessage = commands
      .filter((x) => {
        return (
          !x.data.community ||
          x.data.community.some((x) => {
            return (
              x === mentionData.community.id || x === mentionData.community.name
            );
          })
        );
      })
      .map((x) => {
        const data = x.data.data;
        return `**${data.command}**  
> ${data.description}   
> Example: @me ${data.example}`;
      })
      .join("  \n\n");
    await client.createComment({
      content: helpMessage,
      parent_id: mentionData.comment.id,
      auth: getAuth(),
      post_id: mentionData.post.id,
      language_id: mentionData.comment.language_id,
    });
  }
}
