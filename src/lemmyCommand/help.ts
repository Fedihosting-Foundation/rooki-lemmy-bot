import { LemmyHttp } from "lemmy-js-client";
import { LemmyCommand, getCommands } from "../decorators/lemmyPost";
import { getAuth } from "../main";
import { LemmyCommandArguments } from "../types/LemmyEvents";
import { isModOfCommunityPerson } from "../helpers/lemmyHelper";
import CommunityService from "../services/communityService";
import { typeDiDependencyRegistryEngine } from "discordx";

let communityServ: CommunityService | undefined;

function getCommunityService() {
  if (!communityServ) {
    communityServ =
      typeDiDependencyRegistryEngine.getService(CommunityService) || undefined;
  }
  return communityServ;
}

class helpCommand {
  @LemmyCommand({
    data: {
      command: "help",
      description: "Shows this help message",
      example: "help",
    },
  })
  async help(client: LemmyHttp, event: LemmyCommandArguments) {
    const service = getCommunityService();
    if (!service) return;

    const user = await service.getUser({ id: event.data.comment.creator_id });
    if (!user) return;
    const isMod = await isModOfCommunityPerson(
      event.data.creator,
      event.data.community.id
    );
    const commands = getCommands();
    const helpMessage = commands
      .filter((x) => {
        return (
          (!x.data.data.modOnly || isMod) &&
          (!x.data.community ||
            x.data.community.some((x) => {
              return (
                x === event.data.community.id || x === event.data.community.name
              );
            }))
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
