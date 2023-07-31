import { typeDiDependencyRegistryEngine } from "discordx";
import { LemmyOn, getCommand } from "../decorators/lemmyPost";
import { isModOfCommunityPerson } from "../helpers/lemmyHelper";
import client from "../main";
import personMentionViewModel from "../models/personMentionViewModel";
import CommunityService from "../services/communityService";
import {
  LemmyCommandArguments,
  LemmyEventArguments,
} from "../types/LemmyEvents";

let communityServ: CommunityService | undefined;

function getCommunityService() {
  if (!communityServ) {
    communityServ =
      typeDiDependencyRegistryEngine.getService(CommunityService) || undefined;
  }
  return communityServ;
}

class CommandHandler {
  @LemmyOn({ event: "personmentioned", priority: 1 })
  async handleCommand(event: LemmyEventArguments<personMentionViewModel>) {
    const mentionReg = /\[[^\]]*\]\(([^\)]*)\) /gim;
    const body = event.data.comment.content.replace(/\r|\n/gim, "\r\n");
    const matches = [...body.matchAll(mentionReg)].find((x) => {
      return x[1].includes(event.data.recipient.actor_id);
    });
    console.log(!matches || matches.length === 0);
    if (!matches || matches.length === 0) return;

    const mention = matches[0];
    const url = matches[1];

    const totalMention = mention; // IDK WHY
    const lines = body.split("\r\n");
    const commandLine = lines.find((x) => x.includes(totalMention));
    if (!commandLine) return;

    const index = commandLine.indexOf(totalMention);
    if (index !== 0) return;

    const cleanLine = commandLine.replace(totalMention, "").trim();
    const restArgs = cleanLine.split(" ");

    const command = restArgs[0]?.toLowerCase() || "help";
    if (restArgs.length > 0) restArgs.shift();

    const commandData = getCommand(command);
    if (!commandData) return;
    const { data, fn } = commandData;

    const isMod = await isModOfCommunityPerson(event.data.creator, event.data.community.id);

    if (data.data.modOnly && !isMod) {
      console.log("Not mod");
      return;
    }

    if (data.community) {
      const isValid = data.community.some((x) => {
        if (x === event.data.community.name || x === event.data.community.id) {
          return true;
        }
      });
      if (!isValid) {
        console.log(
          "Invalid community:",
          event.data.community.name,
          event.data.community.id
        );
        return;
      }
    }
    await fn(client, {
      restArgs: restArgs,
      config: event.config,
      data: event.data,
    } as LemmyCommandArguments);
  }
}
