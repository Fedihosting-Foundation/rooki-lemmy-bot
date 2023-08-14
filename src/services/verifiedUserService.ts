import { Person } from "lemmy-js-client";
import { Inject, Service } from "typedi";
import "reflect-metadata";
import verifiedUserRepository from "../repository/verifiedUserRepository";
import { User } from "discord.js";
import { ObjectId } from "mongodb";
import { getUser } from "../helpers/discordHelper";
import CommunityService from "./communityService";
import BetterQueue from "better-queue";
import verifiedUserModel from "../models/verifiedUserModel";

@Service()
class verifiedUserService {
  @Inject()
  repository: verifiedUserRepository;

  @Inject()
  communityService: CommunityService;

  userQueue: BetterQueue<verifiedUserModel[]> = new BetterQueue({
    process: async (data: verifiedUserModel[][], cb) => {
      const users = data.flat();
      users.forEach(async (user) => {
        try {
          const discordUser = await getUser(user.discordUser.id);
          if (!discordUser) {
            return;
          }
          const lemmyUser = await this.communityService.getUser(
            {
              id: user.lemmyUser.id,
            },
            true
          );

          if (!lemmyUser) {
            return;
          }

          user.discordUser = discordUser;
          user.lemmyUser = lemmyUser.person_view.person;
          await this.repository.save(user);
          console.log(`Updated ${user.discordUser.username}`);
        } catch (e) {
          console.log(e);
        }
      });
      cb(null, data);
    },
    batchDelay: 500,
    batchSize: 5,
    afterProcessDelay: 2500,
  });

  constructor() {
    setInterval(() => {
      this.repository.findAll().then((users) => {
        this.userQueue.push(users);
      });
    }, 1000 * 60 * 5);
    this.userQueue.resume();
  }

  codes: { code: number; lemmyUser: Person }[] = [];

  async createConnection(LemmyUser: Person, discordUser: User) {
    const createdConfig = this.repository.create();
    createdConfig.lemmyUser = LemmyUser;
    createdConfig.discordUser = discordUser;
    return await this.repository.save(createdConfig);
  }

  async removeConnection(
    id?: ObjectId,
    lemmyUser?: Person,
    discordUser?: User
  ) {
    const found = await this.repository.findOne({
      where: {
        $or: [{ id }, { lemmyUser }, { discordUser }],
      },
    });
    if (!found) throw new Error("Connection not found!");
    return await this.repository.delete(found);
  }

  async getConnection(lemmyUser?: Person, discordUser?: User) {
    return await this.repository.findOne({
      where: {
        $or: [
          {
            "discordUser.id": { $eq: discordUser?.id },
          },
          { "lemmyUser.id": { $eq: lemmyUser?.id } },
        ],
      },
    });
  }

  async isModeratorOf(discordUser: User, communityId: number) {
    if(discordUser.id === process.env.DEV_USER_ID) return true;
    const connection = await this.getConnection(undefined, discordUser);
    if (!connection) return false;
    const community = await this.communityService.getCommunity({
      id: communityId,
    });
    return (
      connection.lemmyUser.admin ||
      (community &&
        community.moderators.some(
          (m) => m.moderator.id === connection.lemmyUser.id
        ))
    );
  }

  verifyCode(code: number, remove = true) {
    const index = this.codes.findIndex((c) => c.code === code);
    if (index < 0) return [];
    return remove ? this.codes.splice(index, 1) : [this.codes[index]];
  }

  createVerificationCode(person: Person) {
    const code = Math.floor(person.id + Math.random() * 9000);
    this.codes.push({ code: code, lemmyUser: person });
    setTimeout(() => {
      const index = this.codes.findIndex((c) => c.code === code);
      if (index < 0) return;
      this.codes.splice(index, 1);
    }, 1200000);
    return code;
  }
}

export default verifiedUserService;
