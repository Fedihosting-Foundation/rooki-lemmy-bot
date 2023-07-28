import { Box } from "@mui/material";
import { Post } from "../components/Post";
import IModQueueEntry, { QueueEntryStatus } from "../models/IModeQueueEntry";

export const ModQueue = () => {
  const modQueue: IModQueueEntry[] = [
    {
      id: "6150b1b3e3b9a3b3a4b7b3a4",
      status: QueueEntryStatus.Pending,
      entry: {
        post: {
          id: 2312921,
          name: "Federal government posts $1.5-billion surplus for first two months of fiscal year",
          url: "https://www.theglobeandmail.com/business/article-federal-government-posts-15-billion-surplus-for-first-two-months-of/",
          creator_id: 225407,
          community_id: 38603,
          removed: false,
          locked: false,
          published: "2023-07-28T18:05:44.650697",
          deleted: false,
          nsfw: false,
          embed_title:
            "Federal government posts $1.5-billion surplus for first two months of fiscal year",
          embed_description:
            "Revenues rose by $1.3-billion or 1.8% due to higher interest and employment insurance premiums, on top of greater proceeds from personal income tax and a carbon pricing hike",
          thumbnail_url:
            "https://lemmy.world/pictrs/image/462dcdbf-ff09-4435-a5fe-8529cd099c13.jpeg",
          ap_id: "https://lemmy.world/post/2312921",
          local: true,
          language_id: 0,
          featured_community: false,
          featured_local: false,
        },
        creator: {
          id: 225407,
          inbox_url: "https://lemmy.world/u/DoctorTYVM/inbox",
          name: "DoctorTYVM",
          banned: false,
          published: "2023-06-18T12:55:46.921594",
          actor_id: "https://lemmy.world/u/DoctorTYVM",
          local: true,
          deleted: false,
          admin: false,
          bot_account: false,
          instance_id: 1,
        },
        community: {
          id: 38603,
          name: "canadapolitics",
          title: "Canada Politics",
          followers_url: "https://lemmy.world/c/canadapolitics/followers",
          inbox_url: "https://lemmy.world/c/canadapolitics/inbox",

          description: "A place to discuss Canadian Politics",
          removed: false,
          published: "2023-06-26T22:10:15.837173",
          deleted: false,
          nsfw: false,
          actor_id: "https://lemmy.world/c/canadapolitics",
          local: true,
          icon: "https://lemmy.world/pictrs/image/7a2bd227-7cd1-42d8-9375-aa00811d0ee7.png",
          banner:
            "https://lemmy.world/pictrs/image/05f542ec-e5ef-4813-936c-36f55cd82cf4.png",
          hidden: false,
          posting_restricted_to_mods: false,
          instance_id: 1,
        },
        creator_banned_from_community: false,
        counts: {
          community_id: 38603,
          controversy_rank: 0,
          creator_id: 225407,
          id: 438451,
          post_id: 2312921,
          comments: 0,
          score: 1,
          upvotes: 1,
          downvotes: 0,
          published: "2023-07-28T18:05:44.650697",
          newest_comment_time_necro: "2023-07-28T18:05:44.650697",
          newest_comment_time: "2023-07-28T18:05:44.650697",
          featured_community: false,
          featured_local: false,
          hot_rank: 1728,
          hot_rank_active: 1728,
        },
        subscribed: "NotSubscribed",
        saved: false,
        read: false,
        creator_blocked: false,
        my_vote: 0,
        unread_comments: 0,
      },
    },
  ];
  return (
    <Box sx={{width: "100%", height: "100%"}}>
      {modQueue.map((post) => (
        <Post key={post.entry.post.id} data={post} sx={{
            width: "25%",
            marginLeft: "50%",
            transform: "translateX(-50%)",
        }}/>
      ))}
    </Box>
  );
};
