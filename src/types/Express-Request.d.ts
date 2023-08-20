import { MyUserInfo } from "lemmy-js-client";

declare global {
  namespace Express {
    interface Request {
      personDetails?: MyUserInfo;
    }
  }
}