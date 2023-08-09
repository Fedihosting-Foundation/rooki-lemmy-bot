import { Column, Entity } from "typeorm";
import baseModel from "./baseModel";
import { GetPersonDetailsResponse } from "lemmy-js-client";

@Entity({ name: "rookie_userinfo" })
export default class UserInfoModel extends baseModel {
  @Column()
  userId: number;

  @Column()
  person: GetPersonDetailsResponse;

  @Column()
  flaged: boolean = false;
}
