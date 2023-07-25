import { Column, Entity } from "typeorm";
import baseModel from "./baseModel";
import {
  Comment,
  CommentAggregates,
  CommentReport,
  CommentReportView,
  Community,
  Person,
  Post,
} from "lemmy-js-client";

@Entity({ name: "rooki_comment_report" })
export default class commentReportViewModel
  extends baseModel
  implements CommentReportView
{
  @Column()
  comment_report: CommentReport;
  @Column()
  comment_creator: Person;
  @Column()
  resolver?: Person | undefined;
  @Column()
  comment: Comment;
  @Column()
  post: Post;
  @Column()
  creator: Person;
  @Column()
  community: Community;
  @Column()
  creator_banned_from_community: boolean;
  @Column()
  counts: CommentAggregates;
  @Column()
  my_vote?: number;
}
