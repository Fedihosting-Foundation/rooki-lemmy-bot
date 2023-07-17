import "reflect-metadata";
import baseRepository from "./baseRepository";
import postViewModel from "../models/postViewModel";
import { Service } from "typedi";

@Service()
class postViewRepository extends baseRepository<postViewModel> {
  constructor() {
    super();
    this.repository = this.connection.getMongoRepository(postViewModel);
  }
}
export default postViewRepository;
