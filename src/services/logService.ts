import { GuildBasedChannel, MessageCreateOptions, TextChannel, ThreadChannel } from "discord.js";
import { bot } from "../main";
import { LogOptions } from "../models/iConfig";


export default class LogService {
  static async Log(
    message: MessageCreateOptions,
    logData: { guild: string; channel: string; options: LogOptions }
  ) {
    try {
      const guild = bot.guilds.cache.get(logData.guild);

      let channel: GuildBasedChannel | ThreadChannel | undefined = guild?.channels.cache.get(logData.channel);
      if (!channel) {
        channel = (await guild?.channels.fetch(logData.channel)) || undefined;
      }
      if (!channel || !("send" in channel) || !("threads" in channel)) return;
      if(logData.options.threadId){
        channel = (channel.threads.cache.get(logData.options.threadId) || await channel.threads.fetch(logData.options.threadId)) ||undefined;
      }
      if (!channel) return;
      await channel.send(message)

    } catch (err) {
      console.log(err);
    }
  }
}
