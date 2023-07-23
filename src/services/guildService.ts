import { GetCommunityResponse } from "lemmy-js-client";
import client, { getAuth } from "../main";
import { Service } from "typedi";

@Service()
export default class CommunityService {
  cache: { [key: string]: GetCommunityResponse & { cacheTime: number } } = {};

  constructor() {
    setInterval(() => {
      this.cache = {};
    }, 1000 * 60 * 60);
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
    if ("name" in data) {
      if (!force && this.cache[data.name]) return this.cache[data.name];
      const community = await client.getCommunity({
        auth: getAuth(),
        name: data.name,
      });
      const now = new Date().getTime();
      const newData = { ...community, cacheTime: now };
      this.cache[data.name] = newData;
      this.cache[community.community_view.community.id] = newData;
      return community;
    } else {
      if (!force && this.cache[data.id]) return this.cache[data.id];
      const community = await client.getCommunity({
        auth: getAuth(),
        id: data.id,
      });
      const now = new Date().getTime();
      const newData = { ...community, cacheTime: now };
      this.cache[data.id] = newData;
      this.cache[community.community_view.community.name] = newData;
      return community;
    }
  }
}
