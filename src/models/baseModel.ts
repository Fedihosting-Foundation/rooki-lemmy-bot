import { Entity, ObjectId, ObjectIdColumn, ObjectLiteral } from "typeorm";

@Entity()
export default abstract class baseModel implements ObjectLiteral  {
    @ObjectIdColumn()
    id: ObjectId;
}