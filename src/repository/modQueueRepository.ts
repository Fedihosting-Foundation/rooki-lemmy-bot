import "reflect-metadata";
import baseRepository from "./baseRepository";
import { Service } from "typedi";
import ModQueueEntryModel from "../models/modQueueEntry";

@Service()
class modQueueRepository extends baseRepository<ModQueueEntryModel> {
  constructor() {
    super();
    this.repository = this.connection.getMongoRepository(ModQueueEntryModel);
  }
}
export default modQueueRepository;
