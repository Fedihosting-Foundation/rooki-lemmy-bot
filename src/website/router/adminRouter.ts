import { typeDiDependencyRegistryEngine } from "discordx";
import modQueueService from "../../services/modQueueService";
import { Community } from "lemmy-js-client";
import { isModOfCommunityPersonResponse } from "../../helpers/lemmyHelper";
import communityConfigService from "../../services/communityConfigService";
import CommunityService from "../../services/communityService";
import modLogService from "../../services/modLogService";
import postService from "../../services/postService";
import { asyncFilter } from "../../utils/AsyncFilter";
import express from "express";
import { adminAuthMiddleware } from "../middlewares/authMiddleware";
import adminLogService from "../../services/adminLogService";

let erv: adminLogService | undefined;

function getervice() {
  if (!erv) {
    erv =
      typeDiDependencyRegistryEngine.getService(adminLogService) || undefined;
  }
  return erv;
}

let communityServ: CommunityService | undefined;

function getCommunityService() {
  if (!communityServ) {
    communityServ =
      typeDiDependencyRegistryEngine.getService(CommunityService) || undefined;
  }
  return communityServ;
}

let modLogServ: modLogService | undefined;

function getModLogService() {
  if (!modLogServ) {
    modLogServ =
      typeDiDependencyRegistryEngine.getService(modLogService) || undefined;
  }
  return modLogServ;
}
let postServ: postService | undefined;

function getPostService() {
  if (!postServ) {
    postServ =
      typeDiDependencyRegistryEngine.getService(postService) || undefined;
  }
  return postServ;
}

let communityConfig: communityConfigService | undefined;

function getCommunityConfigService() {
  if (!communityConfig) {
    communityConfig =
      typeDiDependencyRegistryEngine.getService(communityConfigService) ||
      undefined;
  }
  return communityConfig;
}

const adminApiRouter = express.Router();

adminApiRouter.use(adminAuthMiddleware);

adminApiRouter.post("/", async (req, res) => {
  const service = getervice();
  if (!service) {
    res.status(500).send("Service not found");
    return;
  }
  const user = req.personDetails;

  if (!user) {
    res.status(401).send("User not found");
    return;
  }

  const body = req.body as {
    id: string | undefined;
    communities: number[];
    amount?: number;
  };
  const entries = await service.getAdminLogEntriesAfterId(
    body.id,
    body.communities.length > 0 ? body.communities : false,
    body.amount ? body.amount : 20
  );
  res.json(entries);
});

adminApiRouter.get("/communities", async (req, res) => {
  try {
    const modQueueService = getervice();

    if (!modQueueService) {
      res.status(500).send("Community service not found");
      return;
    }

    const user = req.personDetails;

    if (!user) {
      res.status(401).send("Not logged in");
      return;
    }
    const communities: Community[] = [];

    await asyncFilter(await modQueueService.fetchCommunities(), (x) => {
      const isGood =
        isModOfCommunityPersonResponse(user, x.entry.community.id) &&
        !communities.some((v) => v.id === x.entry.community.id);
      if (isGood) communities.push(x.entry.community);
      return isGood;
    });
    console.log(communities);

    res.json({ found: true, communities });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
});

adminApiRouter.get("/getone/:id", async (req, res) => {
  const service = getervice();
  if (!service) {
    res.status(500).send("Service not found");
    return;
  }
  const user = req.personDetails;

  if (!user) {
    res.status(401).send("User not found");
    return;
  }

  const id = req.params.id;
  if (!id) {
    res.status(400).send("No id given!");
    return;
  }

  const entry = await service.getAdminLogEntryById(id);

  if (!entry) {
    res.status(404).send("Entry not found");
    return;
  }

  res.json(entry);
});

export default adminApiRouter;
