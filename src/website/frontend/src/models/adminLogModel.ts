import { PostView } from "lemmy-js-client";

export enum AdminQueueEntryResult {
  Nothing = "nothing",
  Removed = "removed",
  Banned = "banned",
}
export type adminAllowedEntries = PostView;

export default class AdminLogModel<T extends adminAllowedEntries> {
  id: string;

  entry: T;

  result: AdminQueueEntryResult | null;

  reason: string;

  predictions: any[];
}
