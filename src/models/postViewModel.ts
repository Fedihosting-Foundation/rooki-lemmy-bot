import { Column, Entity } from "typeorm";
import baseModel from "./baseModel";
import { Community, Person, Post, PostAggregates, PostView, SubscribedType } from "lemmy-js-client";

@Entity({database: "rooki_post"})
export default class postViewModel extends baseModel implements PostView  {
    @Column()
    post: Post;
    @Column()
    creator: Person;
    @Column()
    community: Community;
    @Column()
    creator_banned_from_community: boolean;
    @Column()
    counts: PostAggregates;
    @Column()
    subscribed: SubscribedType;
    @Column()
    saved: boolean;
    @Column()
    read: boolean;
    @Column()
    creator_blocked: boolean;
    @Column()
    my_vote?: number;
    @Column()
    unread_comments: number;
}