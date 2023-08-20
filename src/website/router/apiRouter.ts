import express from "express";
import modQueueService from "../../services/modQueueService";
import { typeDiDependencyRegistryEngine } from "discordx";
import {
  isModOfCommunityPerson,
  isModOfCommunityPersonResponse,
} from "../../helpers/lemmyHelper";
import CommunityService from "../../services/communityService";
import postService from "../../services/postService";
import client from "../../main";
import communityConfigService from "../../services/communityConfigService";
import {
  QueueEntryResult,
  QueueEntryStatus,
} from "../../models/modQueueEntryModel";
import UserInfoResponse from "../../models/userInfoResponse";
import modLogService from "../../services/modLogService";
import authMiddleware from "../middlewares/authMiddleware";
import communityConfigRouter from "./communityConfigApiRouter";
import utilRouter from "./utilRouter";
import { CommentReportView, PostReportView } from "lemmy-js-client";
import { asyncFilter } from "../../utils/AsyncFilter";

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

const refreshTimers = new Map<number, NodeJS.Timeout>();

const apiRouter = express.Router();

apiRouter.get("/test", async (req, res) => {
  res.send("Hello World!");
});

apiRouter.use(authMiddleware);

apiRouter.use("/utils", utilRouter);
apiRouter.use("/config", communityConfigRouter);

apiRouter.post("/modqueue", async (req, res) => {
  const service = getModQueueService();
  if (!service) {
    res.status(500).send("Service not found");
    return;
  }
  const user = req.personDetails;

  if (!user) {
    res.status(401).send("User not found");
    return;
  }

  const body = req.body as {id: string | undefined, communities: number[] };


  const entries = await service.getModQueueEntriesAfterId(body.id, body.communities.length > 0 ? (user.local_user_view.person.admin ? body.communities : user.moderates.map(x => x.community.id).filter(x => body.communities.includes(x)) ) : (user.local_user_view.person.admin ? false : user.moderates.map(x => x.community.id)), 20);
  res.json(entries);
});
apiRouter.get("/modqueue/getone/:id", async (req, res) => {
  const service = getModQueueService();
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

  const entry = await service.getModQueueEntryById(id);

  if (!entry) {
    res.status(404).send("Entry not found");
    return;
  }

  if (!(await isModOfCommunityPersonResponse(user, entry.entry.community.id))) {
    res.status(401).send("User is not mod");
    return;
  }
});
apiRouter.get("/modqueue/refresh/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      res.status(400).send("No id given!");
      return;
    }

    const service = getModQueueService();
    if (!service) {
      res.status(500).send("Service not found");
      return;
    }

    const user = req.personDetails;

    if (!user) {
      res.status(401).send("User not found");
      return;
    }

    const entry = await service.getModQueueEntryById(id);

    if (!entry) {
      res.status(404).send("Entry not found");
      return;
    }

    if (
      !(await isModOfCommunityPersonResponse(user, entry.entry.community.id))
    ) {
      res.status(401).send("User is not mod");
      return;
    }

    const config = await getCommunityConfigService()?.getCommunityConfig(
      entry.entry.community.id
    );

    if (!config) {
      res.status(404).send("Config not found");
      return;
    }

    const result = await service.refreshModQueueEntry(entry);

    res.json(result);
  } catch (e) {
    console.log(e);
    res.status(500).send("Internal Server Error");
  }
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

    const token = headers.authorization?.split(" ")[1] as string;
    const user = req.personDetails;

    if (!user) {
      res.status(401).send("User not found");
      return;
    }
    const entry = await service.getModQueueEntryById(body.id);
    if (!entry) {
      res.status(404).send("Entry not found");
      return;
    }
    if (!isModOfCommunityPersonResponse(user, entry.entry.community.id)) {
      res.status(401).send("User is not mod");
      return;
    }

    const isReport =
      "comment_report" in entry.entry || "post_report" in entry.entry;

    const isCommentReport = "comment_report" in entry.entry;

    const config = await getCommunityConfigService()?.getCommunityConfig(
      entry.entry.community.id
    );

    if (!config) {
      res.status(404).send("Config not found");
      return;
    }
    const wasBan = entry.result === QueueEntryResult.Banned;
    if (!body.result) {
      entry.status = QueueEntryStatus.Pending;
      entry.result = null;
    } else {
      entry.result = body.result;
      entry.status = QueueEntryStatus.Completed;
    }
    switch (entry.result) {
      case QueueEntryResult.Approved:
        if (
          !isReport &&
          (config.modQueueSettings.modQueueType === "active" ||
            (config.modQueueSettings.modQueueType === "passive" &&
              entry.entry.post.removed))
        ) {
          await client.removePost({
            auth: token,
            post_id: entry.entry.post.id,
            removed: false,
            reason: `Approved with the reason:- ${reason}`,
          });
        }

        if (wasBan) {
          await client.banFromCommunity({
            auth: token,
            community_id: entry.entry.community.id,
            person_id: entry.entry.post.creator_id,
            ban: false,
          });
        }

        if (isReport) {
          if (isCommentReport) {
            await client.resolveCommentReport({
              auth: token,
              report_id: (entry.entry as CommentReportView).comment_report.id,
              resolved: true,
            });
          } else {
            await client.resolvePostReport({
              auth: token,
              report_id: (entry.entry as PostReportView).post_report.id,
              resolved: true,
            });
          }
        }

        break;
      case QueueEntryResult.Removed:
        await client.removePost({
          auth: token,
          post_id: entry.entry.post.id,
          removed: true,
          reason: `Removed with the reason:- ${reason}`,
        });
        break;
      case QueueEntryResult.Locked:
        await client.lockPost({
          auth: token,
          post_id: entry.entry.post.id,
          locked: true,
        });
        break;
      case QueueEntryResult.Banned:
        await client.banFromCommunity({
          auth: token,
          community_id: entry.entry.community.id,
          person_id: entry.entry.creator.id,
          ban: true,
          reason: `Banned with the reason:- ${reason}`,
        });
        break;
      case null:
        if (
          !isReport &&
          (config.modQueueSettings.modQueueType === "active" ||
            (config.modQueueSettings.modQueueType === "passive" &&
              entry.entry.post.removed))
        ) {
          await client.removePost({
            auth: token,
            post_id: entry.entry.post.id,
            removed: config.modQueueSettings.modQueueType === "active",
            reason: `Reopened Mod Queue Entry with the reason:- ${reason}`,
          });
        }

        if (isReport) {
          if (wasBan) {
            await client.banFromCommunity({
              auth: token,
              community_id: entry.entry.community.id,
              person_id: entry.entry.creator.id,
              ban: false,
            });
          }

          if (isCommentReport) {
            await client.resolveCommentReport({
              auth: token,
              report_id: (entry.entry as CommentReportView).comment_report.id,
              resolved: false,
            });
          } else {
            await client.resolvePostReport({
              auth: token,
              report_id: (entry.entry as PostReportView).post_report.id,
              resolved: false,
            });
          }
        } else {
          if (wasBan) {
            await client.banFromCommunity({
              auth: token,
              community_id: entry.entry.community.id,
              person_id: entry.entry.post.creator_id,
              ban: false,
            });
          }
        }

        setTimeout(async () => {
          await service.refreshModQueueEntry(entry);
        }, 5000);
        break;
      default:
        res.status(500).send("Error");
        return;
    }
    const timer = refreshTimers.get(entry.entry.post.id);
    if (timer) {
      clearTimeout(timer);
      refreshTimers.delete(entry.entry.post.id);
    }
    refreshTimers.set(
      entry.entry.post.id,
      setTimeout(async () => {
        await service.refreshModQueueEntry(entry);
      }, 5000)
    );

    entry.resultData = {
      modId: user.local_user_view.person.id,
      reason: reason,
    };

    entry.modNote = entry.modNote || [];

    const person = await getCommunityService()?.getUser(
      { id: user.local_user_view.person.id },
      false,
      client
    );
    if (!person) {
      res.status(404).send("User not found");
      return;
    }

    entry.modNote.push({
      person: person?.person_view!,
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

    const user = req.personDetails;

    if (!user) {
      res.status(401).send("User not found");
      return;
    }

    const entry = await service.getModQueueEntryById(body.id);
    if (!entry) {
      res.status(404).send("Entry not found");
      return;
    }
    if (!isModOfCommunityPersonResponse(user, entry.entry.community.id)) {
      res.status(401).send("User is not mod");
      return;
    }
    const person = await getCommunityService()?.getUser(
      { id: user.local_user_view.person.id },
      false,
      client
    );
    if (!person) {
      res.status(404).send("User not found");
      return;
    }

    entry.modNote = entry.modNote || [];
    entry.modNote.push({ person: person.person_view, note: body.modNote });

    res.json(await service.updateModQueueEntry(entry));
  } catch (e) {
    console.log(e);
    res.status(500).send("Error");
  }
});

apiRouter.post("/user/info", async (req, res) => {
  const headers = req.headers;
  const token = headers.authorization?.split(" ")[1]!;

  const user = req.personDetails;

  if (!user) {
    res.status(401).send("User not found");
    return;
  }
  const service = getCommunityService();
  if (!service) {
    res.status(500).send("Service not found");
    return;
  }
  const modLogService = getModLogService();
  try {
    const userId = Number(req.body.userId);
    const communityId = Number(req.body.communityId);

    const foundUser = await getCommunityService()?.getUser({ id: userId });

    if (!foundUser) {
      res.status(404).send("User not found");
      return;
    }

    const modLogEntry = await modLogService?.getModLogEntriesForUser(
      token,
      foundUser.person_view.person.id,
      communityId
    );
    if (!modLogEntry) {
      res.status(200).json({ success: false });
      return;
    }
    const response: UserInfoResponse = {
      success: true,
      modLog: modLogEntry,
      person: foundUser,
    };

    res.json(response);
  } catch (e) {
    console.log(e);
    res.status(500).send("Error");
  }
});

// TODO
apiRouter.post("/user/update", async (req, res) => {
  const body = req.body;
  const headers = req.headers;
  const token = headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).send("No Token");
    return;
  }

  const user = req.personDetails;

  const foundUser = user?.local_user_view.person;

  if (!foundUser) {
    res.status(401).send("User not found");
    return;
  }
  const service = getModQueueService();
  if (!service) {
    res.status(500).send("Service not found");
    return;
  }
  try {
  } catch (e) {
    console.log(e);
    res.status(500).send("Error");
  }
});
export default apiRouter;
