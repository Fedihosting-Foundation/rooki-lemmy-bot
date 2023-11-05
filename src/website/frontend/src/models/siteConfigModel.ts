import { GetPersonDetailsResponse } from "lemmy-js-client";

export interface nsfwFilterThresholds {
    porn: number;
    pornWarning?: number;
    hentai: number;
    hentaiWarning?: number;
    combined: number;
    combinedWarning?: number;
}

export default class SiteConfigModel {
    id: string;

    nsfwFilter: {
        enabled: boolean;
        thresholds: nsfwFilterThresholds;
        banAgeHours: number;
    }
}
