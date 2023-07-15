import { ListingType } from "lemmy-js-client";

export type FetchIntervals = "posts" | "comments" | "reports"

export default interface IConfig {
    /***
     * The federation Type
     */
    federation: ListingType | {communities: string[], instance: string[]};

    /***
     * The Fetch Intervals
     */
    fetchInterval: {[key in FetchIntervals]: number};
}