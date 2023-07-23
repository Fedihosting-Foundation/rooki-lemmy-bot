import { Community, GetCommunityResponse } from "lemmy-js-client";
import client, { getAuth } from "../main";

export const extractInstanceFromActorId = (actorId: string) =>
  actorId.match(/https?:\/\/(.*)\/(?:c|u|m)\/.*/)![1];

export function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export const instanceUrl = process.env.LEMMY_URL || "https://lemmy.world";