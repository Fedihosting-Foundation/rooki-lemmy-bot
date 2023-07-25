import { CommunityModeratorView, Person } from "lemmy-js-client";
import { Inject, Service } from "typedi";
import "reflect-metadata";
import verifiedUserRepository from "../repository/verifiedUserRepository";
import { User } from "discord.js";
import { ObjectId } from "mongodb";

@Service()
class verifiedUserService {
  @Inject()
  repository: verifiedUserRepository;

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

  async isModeratorOf(discordUser: User, moderators: CommunityModeratorView[]) {
    const connection = await this.getConnection(undefined, discordUser);
    if (!connection) return false;
    return moderators.some((m) => m.moderator.id === connection.lemmyUser.id);
  }


  verifyCode(code: number) {
    const index = this.codes.findIndex((c) => c.code === code);
    if (index < 0) return [];
    return this.codes.splice(index, 1);
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
