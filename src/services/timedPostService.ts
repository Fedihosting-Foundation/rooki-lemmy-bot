import { Inject, Service } from "typedi";
import communityConfigService from "./communityConfigService";
import cron from "node-cron";
import client, { getAuth } from "../main";
import { CommunityTimedConfig } from "../models/iConfig";
import communityConfigModel from "../models/communityConfigModel";

@Service()
export default class timedPostService {
  @Inject()
  configService: communityConfigService;

  constructor() {
    setTimeout(() => {
      console.log("Starting timed post service");
      this.configService.repository.findAll().then((configs) => {
        configs.forEach((config) => {
          config.timedConfig.forEach(async (timedConfig) => {
            this.addCronJob(config, timedConfig);
          });
        });
      });
    }, 1000 * 5);
  }

  async addCronJob(
    config: communityConfigModel,
    timedConfig: CommunityTimedConfig
  ) {
    const job = cron.schedule(
      timedConfig.interval,
      async () => {
        const community =
          await this.configService.CommunityService.getCommunity({
            id: config.community.id,
          });
        if (!community) return;
        await client.createPost({
          auth: getAuth(),
          community_id: community.community_view.community.id,
          name: timedConfig.title,
          body: timedConfig.content,
          url: timedConfig.url,
          nsfw: timedConfig.nsfw,
          language_id: timedConfig.language_id,
        });

        this.configService.setExecuteTime(config.community, timedConfig.id);
      },
      { name: `${config.community.id}-${timedConfig.id}`,timezone: "UTC"}
    );
    if (!timedConfig.enabled) job.stop();
    return job;
  }

  async removeCronJob(
    config: communityConfigModel,
    timedConfig: CommunityTimedConfig
  ) {
    cron.getTasks().get(`${config.community.id}-${timedConfig.id}`)?.stop();
    cron.getTasks().delete(`${config.community.id}-${timedConfig.id}`);
  }

  async enableCronJob(
    config: communityConfigModel,
    timedConfig: CommunityTimedConfig
  ) {
    cron.getTasks().get(`${config.community.id}-${timedConfig.id}`)?.start();
  }

  async disableCronJob(
    config: communityConfigModel,
    timedConfig: CommunityTimedConfig
  ) {
    cron.getTasks().get(`${config.community.id}-${timedConfig.id}`)?.stop();
  }
}
