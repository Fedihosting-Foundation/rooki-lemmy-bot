import {
  DataSource,
  FilterOperators,
  MongoRepository,
  ObjectLiteral,
} from "typeorm";
import { MongoFindManyOptions } from "typeorm/find-options/mongodb/MongoFindManyOptions";
import { MongoFindOneOptions } from "typeorm/find-options/mongodb/MongoFindOneOptions";
import connection from "../connection";
import { Service } from "typedi";

@Service()
class baseRepository<T extends ObjectLiteral> {
  connection: DataSource;
  repository: MongoRepository<T>;
  constructor() {
    this.connection = connection;
  }
  create() {
    return this.repository.create();
  }
  async delete(item: T) {
    return await this.repository.remove(item);
  }
  async save(item: T) {
    return await this.repository.save(item);
  }
  async find(
    options: MongoFindManyOptions<T> | Partial<T> | FilterOperators<T>
  ) {
    return await this.repository.find(options);
  }
  async findAll() {
    return await this.repository.find();
  }
  async findOne(options: MongoFindOneOptions<T>) {
    return await this.repository.findOne(options);
  }
}
export default baseRepository;
