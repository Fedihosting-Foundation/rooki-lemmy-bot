import { PersonView, Post, PostView } from "lemmy-js-client";

export enum QueueEntryStatus {
    Pending = "pending",
    Completed = "completed",
}

export enum QueueEntryResult {
    Approved = "approved",
    Removed = "removed",
    Banned = "banned",
}

export default interface IModQueueEntry {
  id: string;

  entry: PostView;

  status: QueueEntryStatus;

  result: QueueEntryResult | null;

  modNote?: {person: PersonView, note: string}[];

  resultData?: {
    modNote: string;
    modId: number;
    reason: string;
  };
}
