import { DataSource } from "typeorm"
import postViewModel from "./models/postViewModel";
import postReportViewModel from "./models/postReportViewModel";
import commentViewModel from "./models/commentViewModel";
import commentReportViewModel from "./models/commentReportViewModel";
import personMentionViewModel from "./models/personMentionViewModel";

const connection = new DataSource({
    type: "mongodb",
    host: process.env.MONGODB_URL || "localhost",
    port: Number(process.env.MONGODB_PORT)|| 27017,
    database: process.env.MONGODB_DB || "rooki_bot",
    username: process.env.MONGODB_USERNAME,
    password: process.env.MONGODB_PASSWORD,
    entities: [postViewModel, postReportViewModel, commentViewModel, commentReportViewModel, personMentionViewModel],
})


export default connection;
