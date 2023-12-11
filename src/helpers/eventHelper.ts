import config from "../config";
import { getEvent } from "../decorators/lemmyPost";
import { LemmyEventArguments, LemmyEvents } from "../types/LemmyEvents";

export default function emitEvent<T extends LemmyEvents, G>(eventName: T, args: LemmyEventArguments<G>) {
  console.log("Emitting event", eventName);
  if (config.firstRun) return console.log("Skipping event because first run");
  getEvent(eventName).forEach((x) => x.fn(args));
}
