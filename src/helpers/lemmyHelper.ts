

export const extractInstanceFromActorId = (actorId: string) =>
  actorId.match(/https?:\/\/(.*)\/(?:c|u|m)\/.*/)![1];
