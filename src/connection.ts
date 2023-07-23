import { DataSource } from "typeorm"
import postViewModel from "./models/postViewModel";
import postReportViewModel from "./models/postReportViewModel";
import commentViewModel from "./models/commentViewModel";
import commentReportViewModel from "./models/commentReportViewModel";
import personMentionViewModel from "./models/personMentionViewModel";
import verifiedUserModel from "./models/verifiedUserModel";
import communityConfigModel from "./models/communityConfigModel";

const connection = new DataSource({
    type: "mongodb",
    host: process.env.MONGODB_URL || "localhost",
    port: Number(process.env.MONGODB_PORT)|| 27017,
    database: process.env.MONGODB_DB || "rooki_bot",
    username: process.env.MONGODB_USERNAME,
    password: process.env.MONGODB_PASSWORD,
    authSource: process.env.MONGODB_AUTHSOURCE || "admin",
    entities: [postViewModel, postReportViewModel, commentViewModel, commentReportViewModel, personMentionViewModel, verifiedUserModel, communityConfigModel],
})


export default connection;
