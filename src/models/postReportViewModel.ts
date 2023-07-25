import { Column, Entity } from "typeorm";
import baseModel from "./baseModel";
import {
  Community,
  Person,
  Post,
  PostAggregates,
  PostReport,
  PostReportView,
  SubscribedType,
} from "lemmy-js-client";

@Entity({ name: "rooki_post_report" })
export default class postReportViewModel
  extends baseModel
  implements PostReportView
{
    @Column()
    post_report: PostReport;
    @Column()
    post: Post;
    @Column()
    community: Community;
    @Column()
    creator: Person;
    @Column()
    post_creator: Person;
    @Column()
    creator_banned_from_community: boolean;
    @Column()
    my_vote?: number | undefined;
    @Column()
    counts: PostAggregates;
    @Column()
    resolver?: Person | undefined;

}