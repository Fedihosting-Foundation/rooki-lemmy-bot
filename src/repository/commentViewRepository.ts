import baseRepository from "./baseRepository";
import { Service } from "typedi";
import commentViewModel from "../models/commentViewModel";
import "reflect-metadata";

@Service()
class commentViewRepository extends baseRepository<commentViewModel> {
  constructor() {
    super();
    this.repository = this.connection.getMongoRepository(commentViewModel);
  }
}

export default commentViewRepository;