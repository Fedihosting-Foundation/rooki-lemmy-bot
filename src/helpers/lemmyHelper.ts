import { Community, GetCommunityResponse, GetPersonDetails, GetPersonDetailsResponse, Person } from "lemmy-js-client";
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

export const isModOfCommunityPersonResponse = async (user: GetPersonDetailsResponse, communityId: number) => {
  if(user.person_view.person.admin) return true;
  try {
    const modIds = user.moderates.map((mod) => mod.community.id);
    return modIds.includes(communityId);
  } catch (e) {
    console.log(e);
    return false;
  }
};

export const isModOfCommunityPerson = async (user: Person, communityId: number) => {
  if(user.admin) return true;
  try {
    const commService = typeDiDependencyRegistryEngine.getService(CommunityService);
    if(!commService) return false;
    const modIds = (await commService.getUser({ id: user.id }))?.moderates.map((mod) => mod.community.id);
    return modIds?.includes(communityId) === true;
  } catch (e) {
    console.log(e);
    return false;
  }
};
