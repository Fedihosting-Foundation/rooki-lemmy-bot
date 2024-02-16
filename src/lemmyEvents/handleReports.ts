import { LemmyOn } from "../decorators/lemmyPost";
import postViewModel from "../models/postViewModel";
import { LemmyEventArguments } from "../types/LemmyEvents";

import commentReportViewModel from "../models/commentReportViewModel";
import postReportViewModel from "../models/postReportViewModel";
import filterText from "../../report_highlighted.json";
import { getSlackWebhook } from "../services/adminLogService";

class Report {
  @LemmyOn({ event: "postreportcreated" })
  async handlePost(event: LemmyEventArguments<postReportViewModel>) {
    const report = event.data.post_report;
    const isTriggered = filterText.some((text) => {
      const ex = new RegExp(text, "gim");
      return report.reason?.match(ex);
    });
    if (isTriggered) {
      getSlackWebhook(process.env.SLACK_WEBHOOK_REPORTS)?.send({
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `<!here> Post Report with alarming reason got created: ${report.post_id} with reason: ${report.reason}`,
            },
          },
          {
            type: "actions",
            elements: [
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "Go to Post",
                },
                url: `https://lemmy.world/post/${report.post_id}`,
              },
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "Go to reports",
                },
                url: "https://lemmy.world/reports",
              },
            ],
          },
        ],
      });
    }
  }

  @LemmyOn({ event: "commentreportcreated" })
  async handlePostUpdate(event: LemmyEventArguments<commentReportViewModel>) {
    const report = event.data.comment_report;
    const isTriggered = filterText.some((text) => {
      const ex = new RegExp(text, "gim");
      return report.reason?.match(ex);
    });
    if (isTriggered) {
      getSlackWebhook(process.env.SLACK_WEBHOOK_REPORTS)?.send({
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `<!here> Comment Report with alarming reason got created: ${report.comment_id} with reason: ${report.reason}`,
            },
          },
          {
            type: "actions",
            elements: [
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "Go to Post",
                },
                url: `https://lemmy.world/comment/${report.comment_id}`,
              },
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "Go to reports",
                },
                url: "https://lemmy.world/reports",
              },
            ],
          },
        ],
      });
    }
  }
}
