import IConfig from "./models/iConfig";

export const config: IConfig = {
  fetchInterval: {
    posts: 1000 * 30,
    comments: 1000 * 60,
    reports: 1000 * 60,
    resolve_reports: 1000 * 15,
    mentions: 1000 * 45,
  },
  lemmyInstance: "https://lemmy.world",
  thirdParty: {
    photon: {
      enabled: true,
      url: "https://photon.xylight.dev",
    },
    alexandrite: {
      enabled: true,
      url: "https://a.lemmy.world",
    },
  },
  
  firstRun: false,
};

// communityConfig: [
//   {
//     communities: ["hdev", "world"],
//     config: {
//       discordTeam: ["710213572898193428"],
//       logs: {
//         discord: {
//           enabled: true,
//           logChannel: "1117095595597901914",
//           logGuild: "932286006156222495",
//           comments: { enabled: true },
//           posts: { enabled: true },
//           reports: { enabled: true },
//           profanity: {
//             enabled: true,
//             channel: "932286006156222497",
//             appendTextToLogMessage: "<@&1038182121572929586> Profanity detected!"
//           }
//         },
//       },
//     },
//   },
// ],
// logs: {
//   discord: {
//     logChannel: "1117095595597901914",
//     logGuild: "932286006156222495",
//     enabled: true,
//     comments: { enabled: true },
//     posts: { enabled: true },
//     reports: { enabled: true },
//   },
// },

export default config;
