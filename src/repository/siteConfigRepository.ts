import "reflect-metadata";
import baseRepository from "./baseRepository";
import { Service } from "typedi";
import AdminLogModel, { adminAllowedEntries } from "../models/adminLogModel";
import SiteConfigModel from "../models/siteConfigModel";

@Service()
class siteConfigRepository extends baseRepository<SiteConfigModel> {
  constructor() {
    super();
    this.repository = this.connection.getMongoRepository(SiteConfigModel);
  }
}
export default siteConfigRepository;
