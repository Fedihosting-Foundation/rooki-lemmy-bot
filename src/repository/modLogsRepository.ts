import "reflect-metadata";
import baseRepository from "./baseRepository";
import { Service } from "typedi";
import ModLogModel from "../models/modLogModel";

@Service()
class modLogRepository extends baseRepository<ModLogModel> {
  constructor() {
    super();
    this.repository = this.connection.getMongoRepository(ModLogModel);
  }
}
export default modLogRepository;
