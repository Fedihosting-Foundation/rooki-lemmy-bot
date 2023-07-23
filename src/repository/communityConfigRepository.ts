import "reflect-metadata";
import baseRepository from "./baseRepository";
import { Service } from "typedi";
import communityConfigModel from "../models/communityConfigModel";

@Service()
class communityConfigRepository extends baseRepository<communityConfigModel> {
  constructor() {
    super();
    this.repository = this.connection.getMongoRepository(communityConfigModel);
  }
}
export default communityConfigRepository;
