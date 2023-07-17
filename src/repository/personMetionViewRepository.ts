import baseRepository from "./baseRepository";
import { Service } from "typedi";
import "reflect-metadata";
import personMentionViewModel from "../models/personMentionViewModel";

@Service()
class personMetionViewRepository extends baseRepository<personMentionViewModel> {
  constructor() {
    super();
    this.repository = this.connection.getMongoRepository(
      personMentionViewModel
    );
  }
}
export default personMetionViewRepository;
