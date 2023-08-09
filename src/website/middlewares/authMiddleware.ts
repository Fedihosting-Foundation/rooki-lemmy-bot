import { NextFunction, Request, Response } from "express";
import CommunityService from "../../services/communityService";
import { typeDiDependencyRegistryEngine } from "discordx";
import { getLemmyClient } from "../../helpers/clientHelper";
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
  const user = Number(headers.user);
  if (!user) {
    res.status(401).send("No User");
    return;
  }
  const instance = headers.instance;
  if (!instance) {
    res.status(401).send("No Instance");
    return;
  }


  const foundUser = await getCommunityService()?.getUser({ id: user }, false, getLemmyClient(instance as string));

  if (!foundUser) {
    res.status(401).send("User not found");
    return;
  }
  next();
};
export default authMiddleware;
