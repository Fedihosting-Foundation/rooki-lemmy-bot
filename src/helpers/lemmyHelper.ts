import { GetPersonDetailsResponse, MyUserInfo, Person } from "lemmy-js-client";
import client from "../main";
import { typeDiDependencyRegistryEngine } from "discordx";
import CommunityService from "../services/communityService";
import NodeCache from "node-cache";
import { createHash } from "node:crypto";
const hashCode = (text: string, algo: string = "sha256") => {
  const hashFunc = createHash(algo); // you can also sha256, sha512 etc
  hashFunc.update(text);
  return hashFunc.digest("hex");
};

export const extractInstanceFromActorId = (actorId: string) =>
  /https?:\/\/(.*)\/(?:c|u|m|user)\/.*/.test(actorId)
    ? actorId.match(/https?:\/\/(.*)\/(?:c|u|m|user)\/.*/)![1]
    : actorId;

export const extractUserFromActorId = (actorId: string) =>
  /https?:\/\/(.*)\/(?:c|u|m|user)\/(.*)/.test(actorId)
    ? actorId.match(/https?:\/\/(.*)\/(?:c|u|m|user)\/(.*)/)![2]
    : actorId;

export const getActorId = (instance: string, user: string) =>
  `${user}@${instance}`;

export function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export const isModOfCommunityPersonResponse = (
  user: GetPersonDetailsResponse | MyUserInfo,
  communityId: number
) => {
  if (
    "person_view" in user
      ? user.person_view.person.admin
      : user.local_user_view.person.admin
  )
    return true;
  try {
    const modIds = user.moderates.map((mod) => mod.community.id);
    return modIds.includes(communityId);
  } catch (e) {
    console.log(e);
    return false;
  }
};

let request: number = 0;

export const isModOfCommunityPerson = async (
  user: Person,
  communityId: number
) => {
  if (user.admin) return true;
  request++;

  if (request % 5 === 0) {
    await sleep(1000);
  }

  try {
    const commService =
      typeDiDependencyRegistryEngine.getService(CommunityService);
    if (!commService) return false;
    const person = await commService.getUser({ id: user.id }, false, client);
    if (!person) return false;
    return isModOfCommunityPersonResponse(person, communityId);
  } catch (e) {
    console.log(e);
    return false;
  }
};
const siteCache = new NodeCache({
  deleteOnExpire: true,
  stdTTL: 60 * 5,
  checkperiod: 60,
});

export const getUserFromSite = async (token: string) => {
  if (siteCache.get(hashCode(token)))
    return siteCache.get<MyUserInfo>(hashCode(token));

  const data = await client.getSite({
    auth: token,
  });

  siteCache.set(hashCode(token), data.my_user);
  return data.my_user;
};
