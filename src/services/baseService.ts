import BetterQueue from "better-queue";
import Queue from "better-queue";
import "reflect-metadata";

export default class baseService<T, K> {
  queue: Queue<T, K>;
  process: BetterQueue.ProcessFunction<T, K>;
  options: Partial<BetterQueue.QueueOptions<T, K>> | undefined;
  constructor(process: BetterQueue.ProcessFunction<T, K>, options?: Partial<BetterQueue.QueueOptions<T, K>>) {
    this.process = process;
    this.options = options;
    this.queue = new Queue(this.process, this.options);


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

  push(...data: T[]) {
    data.forEach((item) => {
      this.queue.push(item);
    });
  }

  async clear() {
    await new Promise((resolve, reject) => {
      try {
        this.queue.destroy(() => {
          this.queue = new Queue(this.process, this.options);
          resolve(true);
        });
      }
      catch (x) {
        console.log("QUEUE CLEAR ERROR", x);
        reject(x);
      }
    });

  }
}
