import baseRepository from "./baseRepository";
import { Service } from "typedi";
import postReportViewModel from "../models/postReportViewModel";
import "reflect-metadata";

@Service()
class postReportViewRepository extends baseRepository<postReportViewModel> {
  constructor() {
    super();
    this.repository = this.connection.getMongoRepository(postReportViewModel);
  }
}
export default postReportViewRepository