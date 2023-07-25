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

    setInterval(() => {
      console.log("Fetching Posts");
      this.postService.fetchAndUpdate().catch(x => {
        console.log("Post Error")
        console.log(x)
      });;
    }, config.fetchInterval.posts);
    setInterval(() => {
      console.log("Fetching Comments");
      this.commentService.fetchAndUpdate().catch(x => {
        console.log("Comments Error")
        console.log(x)
      });;
    }, config.fetchInterval.comments);
    setInterval(() => {
      console.log("Fetching Mentions");
      this.mentionService.fetchAndUpdate().catch(x => {
        console.log("Mention Error")
        console.log(x)
      });
    }, config.fetchInterval.mentions);
    setInterval(() => {
        console.log("Fetching Reports");
        this.reportService.fetchAndUpdate().catch(x => {
          console.log("Reports Error")
          console.log(x)
        });;
      }, config.fetchInterval.reports);
    this.reportService.start();
    this.mentionService.start();
    this.commentService.start();
    this.postService.start();
  }
}
export default manageService;
