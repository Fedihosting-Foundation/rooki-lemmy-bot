import { LemmyHttp } from "lemmy-js-client";
import config from "./config";

const client = new LemmyHttp(config.instance, {
  headers: {
    "User-Agent": "From rookis-modqueue",
  },
});

export default client