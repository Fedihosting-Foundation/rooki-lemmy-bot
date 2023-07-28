import { Post, PostView } from "lemmy-js-client";

export enum QueueEntryStatus {
    Pending = "pending",
    Completed = "completed",
}

export default interface IModQueueEntry {
  id: string;

  entry: PostView;

  status: QueueEntryStatus;
}
