import { Column, Entity } from "typeorm";
import baseModel from "./baseModel";
import { GetModlogResponse, PersonView, PostView } from "lemmy-js-client";

@Entity({ name: "rookie_modlogs" })
export default class ModLogModel extends baseModel {
  @Column()
  userId: number;

  @Column()
  entries: GetModlogResponse;

  @Column()
  createdAt: number;
}
