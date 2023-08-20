import { typeDiDependencyRegistryEngine } from "discordx";
import express from "express";
import CommunityService from "../../services/communityService";
import communityConfigService from "../../services/communityConfigService";
import communityConfigModel from "../../models/communityConfigModel";
import { isModOfCommunityPerson, isModOfCommunityPersonResponse } from "../../helpers/lemmyHelper";
import { asyncFilter } from "../../utils/AsyncFilter";

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
const communityConfigRouter = express.Router();
communityConfigRouter.get("/", async (req, res) => {
  try {
    const communityConfigService = getCommunityConfigService();

    if (!communityConfigService) {
      res.status(500).send("Community service not found");
      return;
    }

    const user = req.personDetails;

    if (!user) {
      res.status(401).send("Not logged in");
      return;
    }

    const communities = await asyncFilter(
      await communityConfigService.getCommunityConfigs(),
      async (x) => {
        return await isModOfCommunityPersonResponse(
          user,
          x.community.id
        );
      }
    );

    res.json({ found: true, communities });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
});

communityConfigRouter.get("/:id", async (req, res) => {
  try {
    const communityId = Number(req.params.id);
    if (!communityId) {
      res.status(400).send("No community id provided");
      return;
    }

    const communityConfigService = getCommunityConfigService();

    if (!communityConfigService) {
      res.status(500).send("Community service not found");
      return;
    }

    const user = req.personDetails;
    if (!user) {
      res.status(401).send("Not logged in");
      return;
    }

    const isModeratorOf = isModOfCommunityPerson(
      user.local_user_view.person,
      communityId
    );
    if (!isModeratorOf) {
      res.status(403).send("You are not a moderator of this community");
      return;
    }

    const config = await communityConfigService.getCommunityConfig(communityId);

    res.json({ found: true, communities: [config] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

communityConfigRouter.put("/:id", async (req, res) => {
  try {
    const communityId = Number(req.params.id);
    if (!communityId) {
      res.status(400).send("No community id provided");
      return;
    }

    const communityConfigService = getCommunityConfigService();

    if (!communityConfigService) {
      res.status(500).send("Community service not found");
      return;
    }

    const user = req.personDetails;
    if (!user) {
      res.status(401).send("Not logged in");
      return;
    }

    const isModeratorOf = isModOfCommunityPersonResponse(
      user,
      communityId
    );
    if (!isModeratorOf) {
      res.status(403).send("You are not a moderator of this community");
      return;
    }

    const config = await communityConfigService.getCommunityConfig(communityId);

    if (!config) {
      res.status(404).send("Community not found");
      return;
    }

    const { id, community, ...data } =
      req.body as Partial<communityConfigModel>;

    const newConfig = {
      ...config,
      ...data,
    };

    res.json(await communityConfigService.updateCommunityConfig(newConfig));
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});
communityConfigRouter.post("/", async (req, res) => {
  try {
    const communityConfigService = getCommunityConfigService();

    if (!communityConfigService) {
      res.status(500).send("Community service not found");
      return;
    }

    const body = req.body as {
      communityId: number;
    };

    if (!body || !body.communityId) {
      res.status(400).send("No community id provided");
      return;
    }

    const foundConfig = await communityConfigService.getCommunityConfig(
      body.communityId
    );

    if (foundConfig) {
      res.status(400).send("Community already exists!");
      return;
    }

    const user = req.personDetails;
    const foundModerate = user?.moderates.find(
      (x) => x.community.id === body.communityId
    );
    if (!foundModerate) {
      res.status(403).send("You are not a moderator of this community");
      return;
    }

    const config = await communityConfigService.getCommunityConfig(
      body.communityId
    );

    if (config) {
      res.status(404).send("Community already exists!");
      return;
    }

    res.json(
      communityConfigService.createCommunityConfig(foundModerate.community)
    );
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

export default communityConfigRouter;
