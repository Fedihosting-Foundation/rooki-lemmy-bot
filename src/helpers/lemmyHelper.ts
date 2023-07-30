import { Community, GetCommunityResponse, Person } from "lemmy-js-client";
import client, { getAuth } from "../main";
import { typeDiDependencyRegistryEngine } from "discordx";
import CommunityService from "../services/communityService";

export const extractInstanceFromActorId = (actorId: string) =>
  actorId.match(/https?:\/\/(.*)\/(?:c|u|m)\/.*/)![1];

export function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export const instanceUrl = process.env.LEMMY_URL || "https://lemmy.world";

export const isModOfCommunity = async (user: Person, community: Community) => {
  if(user.admin) return true;
  try {
    const response = await typeDiDependencyRegistryEngine.getService(CommunityService)?.getCommunity({
      id: community.id,
    });
    if (!response) return false;
    const modIds = response.moderators.map((mod) => mod.moderator.id);
    return modIds.includes(user.id);
  } catch (e) {
    console.log(e);
    return false;
  }
};
