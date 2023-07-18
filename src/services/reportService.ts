import "reflect-metadata";
import {
  CommentReportView,
  PostReportView,
} from "lemmy-js-client";
import { Inject, Service } from "typedi";
import getConfig from "../helpers/configHelper";
import baseService from "./baseService";
import client, { getAuth } from "../main";
import { sleep } from "../helpers/lemmyHelper";
import emitEvent from "../helpers/eventHelper";
import commentReportViewRepository from "../repository/commentReportViewRepository";
import postReportViewRepository from "../repository/postReportViewRepository";
import postReportViewModel from "../models/postReportViewModel";
import commentReportViewModel from "../models/commentReportViewModel";

@Service()
class reportService extends baseService<
  CommentReportView | PostReportView,
  commentReportViewModel | postReportViewModel
> {
  @Inject()
  commentRepository: commentReportViewRepository;
  @Inject()
  postRepository: postReportViewRepository;
  constructor() {
    super(
      async (input, cb) => {
        const data = input as CommentReportView | PostReportView;
        const config = getConfig(data.community.name);

        try {
          if ("comment" in data) {
            const foundCommentReport = await this.commentRepository.findOne({
              where: { "comment_report.id": { $eq: data.comment_report.id } },
            });
            if (foundCommentReport) {
              console.log(
                "Comment Report already exists in database " +
                  data.comment_report.id
              );
              const updatedReport = { ...foundCommentReport, ...data };
              const result = await this.commentRepository.save(updatedReport);
              if (
                foundCommentReport.comment_report.resolved !==
                data.comment_report.resolved
              ) {
                emitEvent("commentreportupdated", foundCommentReport, config);
              }
              cb(null, foundCommentReport);
              return;
            }
            const repositoryCommentReport = this.commentRepository.create();
            const createdCommentReport = {
              ...repositoryCommentReport,
              ...data,
            };

            const result = await this.commentRepository.save(
              createdCommentReport
            );

            emitEvent("commentreportcreated", result, config);
            console.log("Handled Post Report", data.post.id);
            cb(null, result);
            return;
          } else {
            const foundPostReport = await this.postRepository.findOne({
              where: { "post_report.id": { $eq: data.post_report.id } },
            });
            if (foundPostReport) {
              console.log(
                "Post Report already exists in database " + data.post.id
              );
              const updatedReport = { ...foundPostReport, ...data };
              const result = await this.postRepository.save(updatedReport);
              if (
                data.post_report.resolved !==
                foundPostReport.post_report.resolved
              ) {
                emitEvent("postreportupdated", foundPostReport, config);
              }
              cb(null, result);
              return;
            }
            const repositoryPostReport = this.postRepository.create();
            const createdPostReport = {
              ...repositoryPostReport,
              ...data,
            };

            const result = await this.postRepository.save(createdPostReport);
            emitEvent("postreportcreated", result, config);
            console.log("Handled Post Report", data.post.id);
            cb(null, result);
            return;
          }

          // TODO: Handle Post
        } catch (e) {
          console.log(e);
          cb(e);
        }
      },
      {
        concurrent: 4,
      }
    );
  }

  async fetchAndUpdate() {
    const postReports: PostReportView[] = [];
    const commentReports: CommentReportView[] = [];
    try {
      const postResult = await client.listPostReports({
        auth: getAuth(),
      });
      console.log("Fetched Post Reports");
      this.push(...postResult.post_reports);
      postReports.push(...postResult.post_reports);
      await sleep(1000);
      const commentResult = await client.listCommentReports({
        auth: getAuth(),
      });
      console.log("Fetched Post Reports");
      this.push(...commentResult.comment_reports);
      commentReports.push(...commentResult.comment_reports);
    } catch (e) {
      console.log(e);
    }
    return [postReports, commentReports];
  }
}

export default reportService;
