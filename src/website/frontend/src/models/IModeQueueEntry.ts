import {
  CommentReportView,
  PersonView,
  PostReportView,
  PostView,
} from "lemmy-js-client";

export enum QueueEntryStatus {
  Pending = "pending",
  Completed = "completed",
}

export enum QueueEntryResult {
  Approved = "approved",
  Removed = "removed",
  Banned = "banned",
  Unbanned = "unbanned",
  Locked = "locked",
}

export type allowedEntries = PostView | PostReportView | CommentReportView;

export default class IModQueueEntry<T extends allowedEntries> {
  id: string;

  entry: T;

  status: QueueEntryStatus;

  result: QueueEntryResult | null;

  modNote?: { person: PersonView; note: string }[];

  resultData?: {
    modNote: string;
    modId: number;
    reason: string;
  };
}


export class IModQueueUtils{
  static isPostReport(entry: allowedEntries) {
    return "post_report" in entry
  }

  static isCommentReport(entry: allowedEntries) {
    return "comment_report" in entry
  }

  static isReport(entry: allowedEntries) {
    return (
      IModQueueUtils.isPostReport(entry) || IModQueueUtils.isCommentReport(entry)
    );
  }

  static isResolved(entry: allowedEntries) {
    if(IModQueueUtils.isReport(entry)){
      return  this.isPostReport(entry) ? (entry as PostReportView).post_report.resolved : (entry as CommentReportView).comment_report.resolved
    }
    return false
  }

  static isDone(entry: IModQueueEntry<allowedEntries>) {
    return entry.status === QueueEntryStatus.Completed || this.isResolved(entry.entry);
  }
}