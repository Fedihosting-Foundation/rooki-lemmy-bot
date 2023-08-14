import { LemmyHttp } from "lemmy-js-client";
import config from "./config";

const client = new LemmyHttp(config.instance);

export default client