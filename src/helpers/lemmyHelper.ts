import { Community, GetCommunityResponse } from "lemmy-js-client";
import client, { getAuth } from "../main";

export const extractInstanceFromActorId = (actorId: string) =>
  actorId.match(/https?:\/\/(.*)\/(?:c|u|m)\/.*/)![1];

export function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const cache: { [key: string]: GetCommunityResponse } = {};

export async function getCommunity(
  data:
    | {
        name: string;
      }
    | {
        id: number;
      }
) {
  if ("name" in data) {
    if (cache[data.name]) return cache[data.name];
    const community = await client.getCommunity({
      auth: getAuth(),
      name: data.name,
    });
    cache[data.name] = community;
    cache[community.community_view.community.id] = community;
    return community;
  } else {
    if (cache[data.id]) return cache[data.id];
    const community = await client.getCommunity({
      auth: getAuth(),
      id: data.id,
    });
    cache[data.id] = community;
    cache[community.community_view.community.name] = community;
    return community;
  }
}
