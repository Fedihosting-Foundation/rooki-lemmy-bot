export type LemmyPostEvents = "postcreated" | "postupdated" | "postdeleted";
export type LemmyPostReportEvents = "postreportcreated" | "postreportupdated";
export type LemmyCommentEvents = "commentcreated" | "commentupdated" | "commentdeleted";
export type LemmyCommentReportEvents =
  | "commentreportcreated"
  | "commentreportupdated";
export type LemmyMentionEvents = "personmentioned";

export type LemmyEvents =
  | LemmyPostEvents
  | LemmyPostReportEvents
  | LemmyCommentEvents
  | LemmyCommentReportEvents
  | LemmyMentionEvents;


export type ILemmyCommand = {
    command: string;
    description?: string;
    usage?: string;
    example?: string;
    communities?: (string|number)[];
}