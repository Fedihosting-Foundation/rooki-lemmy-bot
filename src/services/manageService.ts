import { Inject, Service } from "typedi";
import postService from "./postService";
import commentService from "./commentService";
import config from "../config";
import "reflect-metadata";
import mentionService from "./mentionService";
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

    setInterval(async () => {
      console.log("Fetching Posts");
      try {
        await this.postService.fetchAndUpdate();
      } catch (x) {
        console.log("Post Error");
        console.log(x);
      }
    }, config.fetchInterval.posts);
    setInterval(async () => {
      console.log("Fetching Comments");
      try {
        await this.commentService.fetchAndUpdate();
      } catch (x) {
        console.log("Comments Error");
        console.log(x);
      }
    }, config.fetchInterval.comments);
    setInterval(async () => {
      console.log("Fetching Mentions");
      try {
        await this.mentionService.fetchAndUpdate();
      } catch (x) {
        console.log("Mention Error");
        console.log(x);
      }
    }, config.fetchInterval.mentions);
    setInterval(async () => {
      console.log("Fetching Reports");

      try {
        await this.reportService.fetchAndUpdate();
      } catch (x) {
        console.log("Reports Error");
        console.log(x);
      }
    }, config.fetchInterval.reports);
    this.reportService.start();
    this.mentionService.start();
    this.commentService.start();
    this.postService.start();
  }
}
export default manageService;
