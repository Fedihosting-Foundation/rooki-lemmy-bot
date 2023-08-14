import { typeDiDependencyRegistryEngine } from "discordx";
import express from "express";
import CommunityService from "../../services/communityService";

let communityServ: CommunityService | undefined;

function getCommunityService() {
  if (!communityServ) {
    communityServ =
      typeDiDependencyRegistryEngine.getService(CommunityService) || undefined;
  }
  return communityServ;
}
const communityRouter = express.Router();

communityRouter.get("/", async (req, res) => {
 
});

export default communityRouter;