import "reflect-metadata";
import baseRepository from "./baseRepository";
import { Service } from "typedi";
import AdminLogModel, { adminAllowedEntries } from "../models/adminLogModel";

@Service()
class adminLogsRepository extends baseRepository<AdminLogModel<adminAllowedEntries>> {
  constructor() {
    super();
    this.repository = this.connection.getMongoRepository(AdminLogModel);
  }
}
export default adminLogsRepository;
