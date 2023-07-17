import { Column, Entity } from "typeorm";
import baseModel from "./baseModel";
import { Comment, CommentAggregates, CommentView, Community, Person, Post, SubscribedType } from "lemmy-js-client";

@Entity({name: "rooki_comment"})
export default class commentViewModel extends baseModel implements CommentView  {
    @Column()
    comment: Comment;
    @Column()
    creator: Person;
    @Column()
    post: Post;
    @Column()
    community: Community;
    @Column()
    counts: CommentAggregates;
    @Column()
    creator_banned_from_community: boolean;
    @Column()
    subscribed: SubscribedType;
    @Column()
    saved: boolean;
    @Column()
    creator_blocked: boolean;
    @Column()
    my_vote?: number | undefined;
}