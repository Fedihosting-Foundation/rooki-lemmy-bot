import { GetPersonDetailsResponse } from "lemmy-js-client";
import ModLogModel from "./modLogModel";


export default interface UserInfoResponse {
    success: boolean;
    modLog: ModLogModel;
    person: GetPersonDetailsResponse;
}