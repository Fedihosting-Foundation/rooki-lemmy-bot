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
const utilRouter = express.Router();

utilRouter.post("/person", async (req, res) => {
    const service = getCommunityService();
    if (!service) {
        return res.status(500).send("Service not found");
    }
    const person = await service.getUser({id: Number(req.body.userId)});

    if (!person) {
        return res.status(404).send("Person not found");
    }

    return res.json(person);

});

export default utilRouter;