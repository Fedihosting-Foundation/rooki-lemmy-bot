import { Column, Entity } from "typeorm";
import baseModel from "./baseModel";
import { Person } from "lemmy-js-client";
import { User } from "discord.js";

@Entity({name: "rooki_verified_users"})
export default class verifiedUserModel extends baseModel  {
    @Column()
    lemmyUser: Person;
    @Column()
    discordUser: User;
}