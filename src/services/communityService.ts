import { GetCommunityResponse, GetPersonDetails, GetPersonDetailsResponse } from "lemmy-js-client";
import client, { getAuth } from "../main";
import { Service } from "typedi";

@Service()
export default class CommunityService {
  communityCache: {
    [key: string]: GetCommunityResponse & { cacheTime: number };
  } = {};
  userCache: { [key: string]: GetPersonDetailsResponse & { cacheTime: number } } = {};

  constructor() {
    setInterval(() => {
      this.communityCache = {};
    }, 1000 * 60 * 60);
    setInterval(() => {
      this.userCache = {};
    }, 1000 * 60 * 5);
  }

  async getUser(
    data:
      | {
          name: string;
        }
      | {
          id: number;
        },
    force = false
  ) {
    try {
      if ("name" in data) {
        if (!force && this.userCache[data.name])
          return this.userCache[data.name];
        const user = await client.getPersonDetails({
          auth: getAuth(),
          username: data.name,
        });
        const now = new Date().getTime();
        const newData = { ...user, cacheTime: now };
        this.userCache[data.name] = newData;
        this.userCache[user.person_view.person.id] = newData;
        return user;
      } else {
        if (!force && this.userCache[data.id]) return this.userCache[data.id];
        const user = await client.getPersonDetails({
          auth: getAuth(),
          person_id: data.id,
        });
        const now = new Date().getTime();
        const newData = { ...user, cacheTime: now };
        this.userCache[data.id] = newData;
        this.userCache[user.person_view.person.name] = newData;
        return user;
      }
    } catch (e) {
      console.log(e);
      return;
    }
  }

  async getCommunity(
    data:
      | {
          name: string;
        }
      | {
          id: number;
        },
    force = false
  ) {
    try {
      if ("name" in data) {
        if (!force && this.communityCache[data.name])
          return this.communityCache[data.name];
        const community = await client.getCommunity({
          auth: getAuth(),
          name: data.name,
        });
        const now = new Date().getTime();
        const newData = { ...community, cacheTime: now };
        this.communityCache[data.name] = newData;
        this.communityCache[community.community_view.community.id] = newData;
        return community;
      } else {
        if (!force && this.communityCache[data.id])
          return this.communityCache[data.id];
        const community = await client.getCommunity({
          auth: getAuth(),
          id: data.id,
        });
        const now = new Date().getTime();
        const newData = { ...community, cacheTime: now };
        this.communityCache[data.id] = newData;
        this.communityCache[community.community_view.community.name] = newData;
        return community;
      }
    } catch (e) {
      console.log(e);
      return;
    }
  }
}
