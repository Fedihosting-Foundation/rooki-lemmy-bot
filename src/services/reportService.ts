import "reflect-metadata";
import {
  CommentReportView,
  ListCommentReports,
  ListCommentReportsResponse,
  ListPostReportsResponse,
  PostReportView,
} from "lemmy-js-client";
import { Inject, Service } from "typedi";
import baseService from "./baseService";
import client, { getAuth } from "../main";
import { sleep } from "../helpers/lemmyHelper";
import emitEvent from "../helpers/eventHelper";
import commentReportViewRepository from "../repository/commentReportViewRepository";
import postReportViewRepository from "../repository/postReportViewRepository";
import postReportViewModel from "../models/postReportViewModel";
import commentReportViewModel from "../models/commentReportViewModel";
import CommunityService from "./communityService";
import communityConfigService from "./communityConfigService";

@Service()
class reportService extends baseService<
  CommentReportView | PostReportView,
  commentReportViewModel | postReportViewModel
> {
  @Inject()
  commentRepository: commentReportViewRepository;

  @Inject()
  postRepository: postReportViewRepository;

  @Inject()
  CommunityService: CommunityService;

  @Inject()
  CommunityConfigService: communityConfigService;

  commentReportCache: CommentReportView[] = [];

  postReportCache: PostReportView[] = [];

  constructor() {
    super(
      async (input, cb) => {
        const data = input as CommentReportView | PostReportView;
        const config = await this.CommunityConfigService.getCommunityConfig(
          data.community.id
        ) || undefined;
        try {
          if ("comment_report" in data) {
            const foundCommentReport = await this.commentRepository.findOne({
              where: { "comment_report.id": { $eq: data.comment_report.id } },
            });
            if (foundCommentReport) {
              const updatedReport = { ...foundCommentReport, ...data };
              const result = await this.commentRepository.save(updatedReport);
              if (
                foundCommentReport.comment_report.resolved !==
                data.comment_report.resolved
              ) {
                emitEvent("commentreportupdated", {
                  data: foundCommentReport,
                  config: config,
                  oldData: foundCommentReport,
                });
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

            emitEvent("commentreportcreated", { data: result, config: config });
            console.log("Handled Comment Report", data.comment.id);
            cb(null, result);
            return;
          } else {
            const foundPostReport = await this.postRepository.findOne({
              where: { "post_report.id": { $eq: data.post_report.id } },
            });
            if (foundPostReport) {
              const updatedReport = { ...foundPostReport, ...data };
              const result = await this.postRepository.save(updatedReport);
              if (
                data.post_report.resolved !==
                foundPostReport.post_report.resolved
              ) {
                emitEvent("postreportupdated", {
                  data: foundPostReport,
                  config: config,
                  oldData: foundPostReport,
                });
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
            emitEvent("postreportcreated", { data: result, config: config });
            console.log("Handled Post Report", data.post.id);
            cb(null, result);
            return;
          }
        } catch (e) {
          console.log(e);
          cb(e);
        }
      },
      {
        concurrent: 4,
      }
    );
    setInterval(async () => {
      try {
        await this.getCommentReports(true);
        await this.getPostReports(true);
      } catch (e) {
        console.log(e);
      }
    }, 1000 * 60 * 15);
  }

  async fetchAndUpdate() {
    const postReports: PostReportView[] = [];
    const commentReports: CommentReportView[] = [];
    for (let i = 0; i < 10; i++) {
      try {
        const postResult = await client.listPostReports({
          auth: getAuth(),
          page: i,
          unresolved_only: false,
        });
        console.log("Fetched Post Reports. Page: " + i + " of 9");
        this.push(...postResult.post_reports);
        postReports.push(...postResult.post_reports);
        await sleep(2000);
        const commentResult = await client.listCommentReports({
          auth: getAuth(),
          page: i,
          unresolved_only: false,
        });
        console.log("Fetched Comment Reports. Page: " + i + " of 9");
        this.push(...commentResult.comment_reports);
        commentReports.push(...commentResult.comment_reports);
      } catch (e) {
        console.log("Report Fetch Error");
        console.log(e);
      }
      await sleep(15000);
    }
    return [postReports, commentReports];
  }

  async getPostReports(force: boolean = false) {
    if (!force) {
      const cachedReports = this.postReportCache;
      if (cachedReports.length > 0) {
        return cachedReports;
      }
    }
    const reports: PostReportView[] = [];

    for (let i = 1; i <= 5; i++) {
      try {
        reports.push(
          ...(await client.listPostReports({ auth: getAuth() })).post_reports
        );
      } catch (e) {
        console.log(e);
      }
      await sleep(2500);
    }
    this.postReportCache = reports;

    return this.postReportCache;
  }

  async getCommentReports(force: boolean = false) {
    if (!force) {
      const cachedReports = this.commentReportCache;
      if (cachedReports.length > 0) {
        return cachedReports;
      }
    }
    const reports: CommentReportView[] = [];

    for (let i = 1; i <= 3; i++) {
      try {
        reports.push(
          ...(await client.listCommentReports({ auth: getAuth() }))
            .comment_reports
        );
      } catch (e) {
        console.log(e);
      }
      await sleep(5000);
    }
    this.commentReportCache = reports;

    return this.commentReportCache;
  }

  async getPostReport(reportId: number) {
    return this.postReportCache.find((x) => x.post_report.id === reportId);
  }

  async getCommentReport(reportId: number) {
    return this.postReportCache.find((x) => x.post_report.id === reportId);
  }
}

export default reportService;
