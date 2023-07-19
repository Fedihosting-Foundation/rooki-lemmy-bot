import IConfig from "./models/iConfig";

export const config: IConfig = {
  fetchInterval: {
    posts: 1000 * 15,
    comments: 1000 * 20,
    reports: 1000 * 60,
    mentions: 1000 * 15,
  },
  communityConfig: [
    {
      communities: ["support", "moderators"],
      config: {
        discordTeam: ["1130506618388349059"],
        logs: {
          discord: {
            enabled: true,
            logChannel: "1131208030235672656",
            logGuild: "1128644575276318801",
            comments: { enabled: true, threadId: "1131293634893975623" },
            posts: { enabled: true, threadId: "1131293260237766808" },
            reports: { enabled: true, threadId: "1131293522021077043" },
            profanity: {
              enabled: false,
              channel: "932286006156222497",
              appendTextToLogMessage: "<@&1038182121572929586> Profanity detected!"
            }
          },
        },
      },
    },
  ],
  logs: {
    discord: {
      logChannel: "1131208030235672656",
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
