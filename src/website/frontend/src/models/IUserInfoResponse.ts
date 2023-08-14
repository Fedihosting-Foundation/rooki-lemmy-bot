import { GetModlogResponse, GetPersonDetailsResponse } from "lemmy-js-client";
export interface ModLogModel {
    userId: number;
    entries: GetModlogResponse;
    createdAt: number;
  }

export default interface IUserInfoResponse {
    success: boolean;
    modLog?: ModLogModel;
    person?: GetPersonDetailsResponse;
}