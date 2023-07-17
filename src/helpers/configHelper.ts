import { Community } from "lemmy-js-client";
import config from "../config";
import { CommunityConfig } from "../models/iConfig";

export default function getConfig(community: Community):CommunityConfig {
    const foundConfig = config.communityConfig.find(x => {
        return x.communities.some(x => x === community.name)
    })
    return foundConfig?.config || config;
}