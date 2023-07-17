import BetterQueue from "better-queue";
import Queue from "better-queue";
import "reflect-metadata";

export default class baseService<T, K> {
  queue: Queue<T, K>;
  constructor(process: BetterQueue.ProcessFunction<T, K>, options?: Partial<BetterQueue.QueueOptions<T, K>>){
    this.queue = new Queue(process, options);


    this.queue.on("error", (err) => {
      console.log("QUEUE ERROR", err);
    })
    }
  start() {
    this.queue.resume();
  }
  stop() {
    this.queue.pause();
  }

  push(...data:T[]) {
    data.forEach((item) => {
      this.queue.push(item);
    });
  }
}
