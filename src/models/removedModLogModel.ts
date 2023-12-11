import { Column, Entity } from "typeorm";
import baseModel from "./baseModel";
import { AdminPurgeCommentView, AdminPurgeCommunityView, AdminPurgePersonView, AdminPurgePostView, GetModlogResponse, ModAddCommunityView, ModAddView, ModBanFromCommunityView, ModBanView, ModFeaturePostView, ModHideCommunityView, ModLockPostView, ModRemoveCommentView, ModRemoveCommunityView, ModRemovePostView, ModTransferCommunityView, PersonView, PostView } from "lemmy-js-client";

@Entity({ name: "rookie_removed_modlogs" })
export default class removedModLogModel extends baseModel {
  @Column()
  removed_post?: ModRemovePostView;
  @Column()
  removed_comment?: ModRemoveCommentView;
  @Column()
  removed_community?: ModRemoveCommunityView;
}
