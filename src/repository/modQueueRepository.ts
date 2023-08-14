import "reflect-metadata";
import baseRepository from "./baseRepository";
import { Service } from "typedi";
import ModQueueEntryModel, { allowedEntries } from "../models/modQueueEntryModel";

@Service()
class modQueueRepository extends baseRepository<ModQueueEntryModel<allowedEntries>> {
  constructor() {
    super();
    this.repository = this.connection.getMongoRepository(ModQueueEntryModel);
  }
}
export default modQueueRepository;
