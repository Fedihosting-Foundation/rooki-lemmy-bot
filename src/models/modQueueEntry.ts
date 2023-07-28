import { Column, Entity } from "typeorm";
import baseModel from "./baseModel";
import { PostView } from "lemmy-js-client";
export enum QueueEntryStatus {
    Pending = "pending",
    Completed = "completed",
}
@Entity({name: "rookie_mod_queue"})
export default class ModQueueEntry extends baseModel  {
    @Column()
    entry: PostView;

    @Column()
    status: QueueEntryStatus = QueueEntryStatus.Pending;
}