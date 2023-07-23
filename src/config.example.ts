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
      communities: ["nostupidquestions", "reddit"],
      config: {
        discordTeam: ["710213572898193428", "466017970158698497", "512511895820042240", "555572537426444288", "403272094227365889", "1129840347338518550", "431794187562778656"],
        logs: {
          discord: {
            enabled: true,
            logChannel: "1129862373986009188",
            logGuild: "1128644575276318801",
            comments: { enabled: true, threadId: "1130863319658549330" },
            posts: { enabled: true, threadId: "1130863254080606248" },
            reports: { enabled: true, threadId: "1130863368903864330" },
            profanity: {
              enabled: true,
              channel: "1129862373986009188",
              threadId: "1131667502120837150",
              appendTextToLogMessage: "Profanity detected!"
            }
          },
        },
      },
    },
    {
      communities: ["world"],
      config: {
        discordTeam: ["1075277375408967750"],
        logs: {
          discord: {
            enabled: true,
            logChannel: "1128649872346714112",
            logGuild: "1128644575276318801",
            comments: { enabled: true, threadId: "1131545267406118973" },
            posts: { enabled: true, threadId: "1131545226692005949" },
            reports: { enabled: true, threadId: "1131545226692005949" },
            profanity: {
              enabled: true,
              channel: "1128649872346714112",
              threadId: "1131667867415367700",
              appendTextToLogMessage: "Profanity detected!"
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
