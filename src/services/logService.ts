import { MessageCreateOptions } from "discord.js";
import { bot } from "../main";
import { LogOptions } from "../models/iConfig";


export default class LogService {
  static async Log(
    message: MessageCreateOptions,
    logData: { guild: string; channel: string; options: LogOptions }
  ) {
    try {
      const guild = bot.guilds.cache.get(logData.guild);

      let channel = guild?.channels.cache.get(logData.channel);
      if (!channel) {
        channel = (await guild?.channels.fetch(logData.channel)) || undefined;
      }
      if (!channel || !("send" in channel)) return;

      channel.send(message)

    } catch (err) {
      console.log(err);
    }
  }
}
