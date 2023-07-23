import "reflect-metadata";
import baseRepository from "./baseRepository";
import { Service } from "typedi";
import verifiedUserModel from "../models/verifiedUserModel";

@Service()
class verifiedUserRepository extends baseRepository<verifiedUserModel> {
  constructor() {
    super();
    this.repository = this.connection.getMongoRepository(verifiedUserModel);
  }
}
export default verifiedUserRepository;
