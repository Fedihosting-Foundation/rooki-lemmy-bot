import baseRepository from "./baseRepository";
import { Service } from "typedi";
import commentReportViewModel from "../models/commentReportViewModel";
import "reflect-metadata";

@Service()
class commentReportViewRepository extends baseRepository<commentReportViewModel> {
  constructor() {
    super();
    this.repository = this.connection.getMongoRepository(
      commentReportViewModel
    );
  }
}
export default commentReportViewRepository;
