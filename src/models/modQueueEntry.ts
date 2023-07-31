import { Column, Entity } from "typeorm";
import baseModel from "./baseModel";
import { PersonView, PostView } from "lemmy-js-client";
export enum QueueEntryStatus {
  Pending = "pending",
  Completed = "completed",
}
export enum QueueEntryResult {
  Approved = "approved",
  Removed = "removed",
  Banned = "banned",
}

@Entity({ name: "rookie_mod_queue" })
export default class ModQueueEntryModel extends baseModel {
  @Column()
  entry: PostView;

  @Column()
  status: QueueEntryStatus = QueueEntryStatus.Pending;

  @Column({nullable: true})
  result: QueueEntryResult | null;

  @Column()
  resultData?: {
    modId: number;
    reason: string;
  };

  @Column()
  modNote?: {person: PersonView, note: string}[];
}
