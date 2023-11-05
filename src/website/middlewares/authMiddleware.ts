import { NextFunction, Request, Response } from "express";
import CommunityService from "../../services/communityService";
import { typeDiDependencyRegistryEngine } from "discordx";
import { getUserFromSite } from "../../helpers/lemmyHelper";
import { GetPersonDetails } from "lemmy-js-client";
let communityServ: CommunityService | undefined;

function getCommunityService() {
  if (!communityServ) {
    communityServ =
      typeDiDependencyRegistryEngine.getService(CommunityService) || undefined;
  }
  return communityServ;
}
const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const headers = req.headers;
  const token = headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).send("No Token");
    return;
  }
  const details = await getUserFromSite(token);
  if(!details){
    res.status(401).send("User not valid");
    return;
  }
  
  req.personDetails = details;

  next();
};

export const adminAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const headers = req.headers;
  const token = headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).send("No Token");
    return;
  }
  const details = await getUserFromSite(token);
  if(!details){
    res.status(401).send("User not valid");
    return;
  }
  
  req.personDetails = details;
  if(!details.local_user_view.person.admin && (!process.env.DEVELOPER || process.env.DEVELOPER !== details.local_user_view.person.name)){
    res.status(401).send("User not admin");
    return;
  }
  next();
};
export default authMiddleware;
