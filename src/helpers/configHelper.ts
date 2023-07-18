import config from "../config";
import { CommunityConfig } from "../models/iConfig";

export default function getConfig(community: string): CommunityConfig {
  const foundConfig = config.communityConfig.find((x) => {
    return x.communities.some((x) => x === community);
  });
  return foundConfig?.config || config;
}
