import baseRepository from "./baseRepository";
import postViewModel from "../models/postViewModel";
import { Service } from "typedi";

@Service()
export default class postRepository extends baseRepository<postViewModel> {
  constructor() {
    super();
  }
}
