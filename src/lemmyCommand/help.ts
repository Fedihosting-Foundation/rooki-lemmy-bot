import { LemmyHttp } from "lemmy-js-client";
import { LemmyCommand, getCommands } from "../decorators/lemmyPost";
import { getAuth } from "../main";
import { LemmyCommandArguments } from "../types/LemmyEvents";

class helpCommand {
  @LemmyCommand({
    data: {
      command: "help",
      description: "Shows this help message",
      example: "help",
    },
  })
  async help(client: LemmyHttp, event: LemmyCommandArguments) {
    const commands = getCommands();
    const helpMessage = commands
      .filter((x) => {
        return (
          !x.data.community ||
          x.data.community.some((x) => {
            return (
              x === event.data.community.id || x === event.data.community.name
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
      parent_id: event.data.comment.id,
      auth: getAuth(),
      post_id: event.data.post.id,
      language_id: event.data.comment.language_id,
    });
  }
}
