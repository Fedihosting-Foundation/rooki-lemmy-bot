import { Column, Entity } from "typeorm";
import baseModel from "./baseModel";
import {
  PostView,
} from "lemmy-js-client";

export enum AdminQueueEntryResult {
  Nothing = "nothing",
  Removed = "removed",
  Banned = "banned",
}
export type adminAllowedEntries = PostView;

@Entity({ name: "rookie_admin_queue" })
export default class AdminLogModel<
  T extends adminAllowedEntries
> extends baseModel {
  @Column()
  entry: T;

  @Column({ nullable: true })
  result: AdminQueueEntryResult | null;

  @Column()
  reason: string;

  @Column()
  predictions: any[];
}
