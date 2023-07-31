import express from "express";
import modQueueService from "../../services/modQueueService";
import { typeDiDependencyRegistryEngine } from "discordx";
import { QueueEntryStatus } from "../../models/modQueueEntry";
import verifiedUserService from "../../services/verifiedUserService";
import {
  isModOfCommunityPerson,
  isModOfCommunityPersonResponse,
} from "../../helpers/lemmyHelper";
import CommunityService from "../../services/communityService";
import postService from "../../services/postService";

let modService: modQueueService | undefined;

function getModQueueService() {
  if (!modService) {
    modService =
      typeDiDependencyRegistryEngine.getService(modQueueService) || undefined;
  }
  return modService;
}
let communityServ: CommunityService | undefined;

function getCommunityService() {
  if (!communityServ) {
    communityServ =
      typeDiDependencyRegistryEngine.getService(CommunityService) || undefined;
  }
  return communityServ;
}

let postServ: postService | undefined;

function getPostService() {
  if (!postServ) {
    postServ =
      typeDiDependencyRegistryEngine.getService(postService) || undefined;
  }
  return postServ;
}

const apiRouter = express.Router();

apiRouter.get("/test", async (req, res) => {
  res.send("Hello World!");
});

apiRouter.get("/modqueue", async (req, res) => {
  const service = getModQueueService();
  if (!service) {
    res.status(500).send("Service not found");
    return;
  }
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

    const foundUser = await getCommunityService()?.getUser({ id: user });

    if (!foundUser) {
      res.status(401).send("User not found");
      return;
    }

  const entries = await service.getModQueueEntries();
  entries.filter((entry) => {
    return foundUser.moderates.some(x => x.community.id  === entry.entry.community.id)
  })
  res.json(entries);
});

apiRouter.put("/modqueue/resolve", async (req, res) => {
  const service = getModQueueService();
  if (!service) {
    res.status(500).send("Service not found");
    return;
  }
  try {
    const body = req.body;
    const reason = body.reason || "No Reason given";
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

    const foundUser = await getCommunityService()?.getUser({ id: user });

    if (!foundUser) {
      res.status(401).send("User not found");
      return;
    }

    const post = await getPostService()?.getPost(body.postId);
    if (!post) {
      res.status(404).send("Post not found");
      return;
    }

    if (
      !isModOfCommunityPerson(foundUser.person_view.person, post.community.id)
    ) {
      res.status(401).send("User is not mod");
      return;
    }

    const entry = await service.getModQueueEntry(post.post.id);
    if (!entry) {
      res.status(404).send("Entry not found");
      return;
    }

    if (!body.result) {
      entry.status = QueueEntryStatus.Pending;
      entry.result = null;
    } else {
      entry.result = body.result;
      entry.status = QueueEntryStatus.Completed;
    }
    console.log(entry);

    entry.resultData = {
      modId: user,
      reason: reason,
    };

    entry.modNote = entry.modNote || [];

    entry.modNote.push({
      person: foundUser.person_view,
      note: `${body.result || "reopened"} - ${reason}`,
    });

    res.json(await service.updateModQueueEntry(entry));
  } catch (e) {
    console.log(e);
    res.status(500).send("Error");
  }
});

apiRouter.put("/modqueue/addnote", async (req, res) => {
  const service = getModQueueService();
  if (!service) {
    res.status(500).send("Service not found");
    return;
  }
  try {
    const body = req.body;
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

    const foundUser = await getCommunityService()?.getUser({ id: user });

    if (!foundUser) {
      res.status(401).send("User not found");
      return;
    }

    const post = await getPostService()?.getPost(body.postId);
    if (!post) {
      res.status(404).send("Post not found");
      return;
    }

    if (
      !isModOfCommunityPerson(foundUser.person_view.person, post.community.id)
    ) {
      res.status(401).send("User is not mod");
      return;
    }

    const entry = await service.getModQueueEntry(post.post.id);
    if (!entry) {
      res.status(404).send("Entry not found");
      return;
    }

    entry.modNote = entry.modNote || [];
    entry.modNote.push({ person: foundUser.person_view, note: body.modNote });

    res.json(await service.updateModQueueEntry(entry));
  } catch (e) {
    console.log(e);
    res.status(500).send("Error");
  }
});
export default apiRouter;
