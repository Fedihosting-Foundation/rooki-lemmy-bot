import IConfig from "./models/iConfig";

export const config: IConfig = {
  fetchInterval: {
    posts: 1000 * 30,
    comments: 1000 * 30,
    reports: 1000 * 60,
    mentions: 1000 * 15,
  },
  communityConfig: [
    {
      communities: ["nostupidquestions"],
      config: {
        discordTeam: ["710213572898193428", "466017970158698497", "512511895820042240", "555572537426444288", "403272094227365889", "1129840347338518550", "431794187562778656"],
        logs: {
          discord: {
            enabled: true,
            logChannel: "1129862373986009188",
            logGuild: "1128644575276318801",
            comments: { enabled: true, threadId: "1130863254080606248" },
            posts: { enabled: true, threadId: "1130863319658549330" },
            reports: { enabled: true, threadId: "1130863368903864330" },
            profanity: {
              enabled: false,
              channel: "1129862373986009188",
              appendTextToLogMessage: "<@&1129839222040313907> Profanity detected!"
            }
          },
        },
      },
    },
  ],
  logs: {
    discord: {
      logChannel: "1129862373986009188",
      logGuild: "1128644575276318801",
      enabled: true,
      comments: { enabled: true },
      posts: { enabled: true },
      reports: { enabled: true },
    },
  },
};

export const activeCommunities = config.communityConfig
  .map((c) => c.communities)
  .flat();

export default config;
