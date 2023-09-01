import { DataSource } from "typeorm"
import postViewModel from "./models/postViewModel";
import postReportViewModel from "./models/postReportViewModel";
import commentViewModel from "./models/commentViewModel";
import commentReportViewModel from "./models/commentReportViewModel";
import personMentionViewModel from "./models/personMentionViewModel";
import verifiedUserModel from "./models/verifiedUserModel";
import communityConfigModel from "./models/communityConfigModel";
import ModQueueEntryModel from "./models/modQueueEntryModel";
import ModLogModel from "./models/modLogModel";
import UserInfoModel from "./models/userInfoModel";
import AdminLogModel from "./models/adminLogModel";
import SiteConfigModel from "./models/siteConfigModel";

const connection = new DataSource({
    type: "mongodb",
    host: process.env.MONGODB_URL || "localhost",
    port: Number(process.env.MONGODB_PORT)|| 27017,
    database: process.env.MONGODB_DB || "rooki_bot",
    username: process.env.MONGODB_USERNAME,
    password: process.env.MONGODB_PASSWORD,
    authSource: process.env.MONGODB_AUTHSOURCE || "admin",
    entities: [postViewModel, postReportViewModel, commentViewModel, commentReportViewModel, personMentionViewModel, verifiedUserModel, communityConfigModel, ModQueueEntryModel, ModLogModel, UserInfoModel, AdminLogModel, SiteConfigModel],
})


export default connection;
