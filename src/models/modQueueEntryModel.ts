import { Column, Entity } from "typeorm";
import baseModel from "./baseModel";
import { CommentReportView, PersonView, PostReportView, PostView } from "lemmy-js-client";
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

@Entity({ name: "rookie_mod_queue" })
export default class ModQueueEntryModel<T extends allowedEntries> extends baseModel {
  @Column()
  entry: T;

  @Column()
  status: QueueEntryStatus = QueueEntryStatus.Pending;

  @Column({ nullable: true })
  result: QueueEntryResult | null;

  @Column()
  resultData?: {
    modId: number;
    reason: string;
  };

  @Column()
  modNote?: { person: PersonView; note: string }[];
}
