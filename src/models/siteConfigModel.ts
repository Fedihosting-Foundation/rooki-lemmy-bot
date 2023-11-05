import { Column, Entity } from "typeorm";
import baseModel from "./baseModel";

@Entity({ name: "rookie_site_config" })
export default class SiteConfigModel extends baseModel {
    @Column()
    nsfwFilter: {
        enabled: boolean;
        thresholds: {
            porn: number;
            pornWarning?: number;
            hentai: number;
            hentaiWarning?: number;
            combined: number;
            combinedWarning?: number;
        }
        banAgeHours: number;
    }
}
