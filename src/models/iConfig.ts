export type LogOptions = {
  channel?: string;
  threadId?: string;
} & {
  enabled: boolean;
};

export type CommunityLogConfig = {
  enabled: boolean;
  discord: {
    logChannel: string;
    logGuild: string;
    posts: LogOptions;
    comments: LogOptions;
    reports: LogOptions;

    profanity?: LogOptions;

    filterlog?: LogOptions;
  };
};

export type CommunityFilterConfig = {
  id: string;
  enabled: boolean;
  posts: boolean;
  comments: boolean;
  words: string[];
  action: "remove" | "ban" | "report" | "log";
};

export type FetchIntervals = "posts" | "comments" | "reports" | "mentions";

export default interface IConfig {
  /***
   * The Fetch Intervals
   */
  fetchInterval: { [key in FetchIntervals]: number };
}
