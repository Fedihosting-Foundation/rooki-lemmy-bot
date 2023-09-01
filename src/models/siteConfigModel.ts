import { Column, Entity } from "typeorm";
import baseModel from "./baseModel";
import { GetPersonDetailsResponse } from "lemmy-js-client";

@Entity({ name: "rookie_site_config" })
export default class SiteConfigModel extends baseModel {
    nsfwFilter: {
        enabled: boolean;
        thresholds: {
            porn: number;
            hentai: number;
            combined: number;
        }
    }
}
