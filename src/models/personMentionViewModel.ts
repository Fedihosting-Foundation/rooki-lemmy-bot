import { Column, Entity } from "typeorm";
import baseModel from "./baseModel";
import { Comment, CommentAggregates, CommentView, Community, Person, PersonMention, PersonMentionView, Post, SubscribedType } from "lemmy-js-client";

@Entity({name: "rooki_mention"})
export default class personMentionViewModel extends baseModel implements PersonMentionView  {
    @Column()
    person_mention: PersonMention;
    @Column()
    comment: Comment;
    @Column()
    creator: Person;
    @Column()
    post: Post;
    @Column()
    community: Community;
    @Column()
    recipient: Person;
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