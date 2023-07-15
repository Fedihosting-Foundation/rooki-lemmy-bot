import { DataSource } from "typeorm"
import postViewModel from "./models/postViewModel";

const connection = new DataSource({
    type: "mongodb",
    host: process.env.MONGODB_URL || "localhost",
    port: Number(process.env.MONGODB_PORT)|| 27017,
    database: process.env.MONGODB_DB || "rooki_lemmy_bot",
    username: process.env.MONGODB_USERNAME,
    password: process.env.MONGODB_PASSWORD,
    entities: [postViewModel],
})

export default connection;
