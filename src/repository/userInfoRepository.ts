import "reflect-metadata";
import baseRepository from "./baseRepository";
import { Service } from "typedi";
import UserInfoModel from "../models/userInfoModel";

@Service()
class userInfoRepository extends baseRepository<UserInfoModel> {
  constructor() {
    super();
    this.repository = this.connection.getMongoRepository(UserInfoModel);
  }
}
export default userInfoRepository;
