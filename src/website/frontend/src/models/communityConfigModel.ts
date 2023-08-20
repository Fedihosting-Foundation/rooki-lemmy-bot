import { Community } from "lemmy-js-client";
import { CommunityFilterConfig, CommunityTimedConfig } from "./iConfig";

export default interface communityConfigModel {
  id: string;

  community: Community;

  filterConfig: CommunityFilterConfig[];

  timedConfig: CommunityTimedConfig[];

  modQueueSettings: {
    enabled: boolean;
    modQueueType: "active" | "passive";
  };
}
