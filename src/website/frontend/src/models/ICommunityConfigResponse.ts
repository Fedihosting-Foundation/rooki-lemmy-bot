import communityConfigModel from "./communityConfigModel";

export interface ICommunityConfigResponse {
    found: boolean;
    communities?: communityConfigModel[]
}