import { Inject, Service } from "typedi";
import postService from "./postService";
import commentService from "./commentService";
import config from "../config";
import "reflect-metadata";
import mentionService from "./mentionService";
import client, { getAuth } from "../main";
import reportService from "./reportService";
@Service()
class manageService {
  @Inject()
  postService: postService;
  @Inject()
  commentService: commentService;
  @Inject()
  mentionService: mentionService;
    @Inject()
    reportService: reportService;


  startTimers() {
    console.log("Starting timers");

    setInterval(() => {
      console.log("Fetching Posts");
      this.postService.fetchAndUpdate();
    }, config.fetchInterval.posts);
    setInterval(() => {
      console.log("Fetching Comments");
      this.commentService.fetchAndUpdate();
    }, config.fetchInterval.comments);
    setInterval(() => {
      console.log("Fetching Mentions");
      this.mentionService.fetchAndUpdate();
    }, config.fetchInterval.mentions);
    setInterval(() => {
        console.log("Fetching Reports");
        this.reportService.fetchAndUpdate();
      }, config.fetchInterval.reports);
    this.reportService.start();
    this.mentionService.start();
    this.commentService.start();
    this.postService.start();
  }
}
export default manageService;
