import { getEvent } from "../decorators/lemmyPost";
import { LemmyEvents } from "../types/LemmyEvents";

export default function emitEvent(eventName: LemmyEvents, ...data: any) {
  console.log("Emitting event", eventName);

  getEvent(eventName).forEach((x) => x.fn(...data));
}
