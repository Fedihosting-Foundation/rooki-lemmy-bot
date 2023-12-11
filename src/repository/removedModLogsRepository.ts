import "reflect-metadata";
import baseRepository from "./baseRepository";
import { Service } from "typedi";
import RemovedModLogModel from "../models/removedModLogModel";

@Service()
class removedModLogRepository extends baseRepository<RemovedModLogModel> {
  constructor() {
    super();
    this.repository = this.connection.getMongoRepository(RemovedModLogModel);
  }
}
export default removedModLogRepository;
