import { typeDiDependencyRegistryEngine } from "discordx";
import express from "express";
import CommunityService from "../../services/communityService";
import communityConfigService from "../../services/communityConfigService";
import communityConfigModel from "../../models/communityConfigModel";
import {
  isModOfCommunityPerson,
  isModOfCommunityPersonResponse,
} from "../../helpers/lemmyHelper";
import { asyncFilter } from "../../utils/AsyncFilter";
import modQueueService from "../../services/modQueueService";
import { adminAuthMiddleware } from "../middlewares/authMiddleware";
import siteConfigService from "../../services/siteConfigService";
import SiteConfigModel from "../../models/siteConfigModel";

let communityServ: CommunityService | undefined;

function getCommunityService() {
  if (!communityServ) {
    communityServ =
      typeDiDependencyRegistryEngine.getService(CommunityService) || undefined;
  }
  return communityServ;
}

let communityConfigServ: communityConfigService | undefined;

function getCommunityConfigService() {
  if (!communityConfigServ) {
    communityConfigServ =
      typeDiDependencyRegistryEngine.getService(communityConfigService) ||
      undefined;
  }
  return communityConfigServ;
}

let siteConfigServ: siteConfigService | undefined;

function getSiteConfigService() {
  if (!siteConfigServ) {
    siteConfigServ =
      typeDiDependencyRegistryEngine.getService(siteConfigService) || undefined;
  }
  return siteConfigServ;
}

const siteConfigApiRouter = express.Router();
siteConfigApiRouter.use(adminAuthMiddleware);

siteConfigApiRouter.get("/", async (req, res) => {
  try {
    const siteConfigService = getSiteConfigService();

    if (!siteConfigService) {
      res.status(500).send("SiteConfig service not found");
      return;
    }

    const user = req.personDetails;

    if (!user) {
      res.status(401).send("Not logged in");
      return;
    }
    const siteConfig = await siteConfigService.getConfig();

    res.json({ found: true, data: siteConfig });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
});

siteConfigApiRouter.post("/", async (req, res) => {
  try {
    const data = req.body as Partial<Omit<SiteConfigModel, "id">>

    const siteConfigService = getSiteConfigService();

    if (!siteConfigService) {
      res.status(500).send("SiteConfig service not found");
      return;
    }

    const user = req.personDetails;

    if (!user) {
      res.status(401).send("Not logged in");
      return;
    }
    const siteConfig = await siteConfigService.getConfig();
    const newSiteConfig = {...siteConfig, ...data};
    await siteConfigService.updateConfig(newSiteConfig);
    res.json({ found: true, data: newSiteConfig });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
});
export default siteConfigApiRouter;
