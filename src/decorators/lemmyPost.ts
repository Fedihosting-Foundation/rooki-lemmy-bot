import { ILemmyCommand, LemmyEvents } from "../types/LemmyEvents";

const events: { data: ILemmyOn; fn: (...args: any) => Promise<unknown> }[] = [];


export function Lemmy<T extends { new(...args: any[]): {} }>(Base: T) {
  return class extends Base {
    constructor(...args: any[]) {
      super(...args);
     }
  };
}

export interface ILemmyOn {
  event: LemmyEvents;
  community?: string[];
  priority?: number;
}
export function LemmyOn(data: ILemmyOn) {
  return function (
    target: Object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<any>
  ) {
    events.push({ data: data, fn: descriptor.value });
    return descriptor;
  };
}

export const LemmyOnEvents = events;

export function getEvents() {
  return events;
}

export function getEvent(event: LemmyEvents) {
  return events
    .filter((x) => x.data.event === event)
    .sort((a, b) => {
      if (a.data.priority && b.data.priority) {
        return a.data.priority - b.data.priority;
      }
      if (a.data.priority) {
        return -1;
      }
      if (b.data.priority) {
        return 1;
      }
      return 0;
    });
}

export interface ILemmyComm {
  data: ILemmyCommand;
  community?: (string | number)[];
}

const lemmyCommandEvents: {
  data: ILemmyComm;
  fn: (...args: any) => Promise<unknown>;
}[] = [];

export function LemmyCommand(data: ILemmyComm) {
  return function (
    target: Object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<any>
  ) {
    lemmyCommandEvents.push({ data: data, fn: descriptor.value });
    return descriptor;
  };
}
export const LemmyCommandEvents = lemmyCommandEvents;

export function getCommands() {
  return lemmyCommandEvents;
}

export function getCommand(command: string) {
  return lemmyCommandEvents.find((x) => x.data.data.command === command);
}