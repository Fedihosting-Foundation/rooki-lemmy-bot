import { ListingType } from "lemmy-js-client";

export type FetchIntervals = "posts" | "comments" | "reports" | "mentions";

export type CommunityConfig = Omit<
  IConfig,
  "communityConfig" | "fetchInterval" | "logs"
> & {
  discordTeam?: string[]
  logs: {
    discord: {
      enabled: boolean;
      logChannel: string;
      logGuild: string;
      posts: LogOptions;
      comments: LogOptions;
      reports: LogOptions;
    };
  };
};

export type LogOptions = (
  | {
      channel?: string;
      threadId?: string;
      webhook?: string;
    }
) & {
  enabled: boolean;
};

export default interface IConfig {
  /***
   * The Fetch Intervals
   */
  fetchInterval: { [key in FetchIntervals]: number };

  logs: {
    discord: {
      enabled: boolean;
      logChannel: string;
      logGuild: string;
      posts: LogOptions;
      comments: LogOptions;
      reports: LogOptions;
    };
  };

  communityConfig: {
    communities: string[];
    config: CommunityConfig;
  }[];
}
