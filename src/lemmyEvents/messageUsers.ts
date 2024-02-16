import { Person } from "lemmy-js-client";
import { LemmyOn } from "../decorators/lemmyPost";
import removedModLogModel from "../models/removedModLogModel";
import { LemmyEventArguments } from "../types/LemmyEvents";
import Container from "typedi";
import CommunityService from "../services/communityService";
import client, { getAuth } from "../main";
import { extractInstanceFromActorId } from "../helpers/lemmyHelper";

const getCommunityService = () => {
    return Container.get(CommunityService);
}

class messageUsers {

    @LemmyOn({ event: "modlogcreated" })
    async checkFilteredPosts(
        event: LemmyEventArguments<removedModLogModel>
    ) {

        const data = event.data

        let url: string = ""

        let type: string = ""

        let moderator: Person | undefined = undefined

        let person_id: number | number[] | undefined = undefined

        let reason: string | undefined = undefined

        if (data.removed_comment !== undefined) {
            if (!data.removed_comment.mod_remove_comment.removed) return
            url = "https://lemmy.world/comment/" + data.removed_comment.comment.id
            type = "comment"
            moderator = data.removed_comment.moderator
            reason = data.removed_comment.mod_remove_comment.reason
            person_id = data.removed_comment.comment.creator_id

            if (!data.removed_comment.comment.local && !moderator?.local) {
                return
            }
        } else if (data.removed_post !== undefined) {
            if (!data.removed_post.mod_remove_post.removed) return
            url = "https://lemmy.world/post/" + data.removed_post.post.id
            type = "post"
            moderator = data.removed_post.moderator
            reason = data.removed_post.mod_remove_post.reason
            person_id = data.removed_post.post.creator_id
            if (!data.removed_post.post.local && !moderator?.local) {
                return
            }
        } else if (data.removed_community !== undefined) {
            if (!data.removed_community.mod_remove_community.removed) return
            url = "https://lemmy.world/c/" + data.removed_community.community.name
            type = "community"
            moderator = data.removed_community.moderator
            reason = data.removed_community.mod_remove_community.reason
            const mods = (await getCommunityService().getCommunity({ id: data.removed_community.community.id }))?.moderators
            if (mods !== undefined) {
                person_id = mods.map(mod => mod.moderator.id)
            } else {
                return
            }
            if (!data.removed_community.community.local && !moderator?.local) {
                return
            }
        } else {
            return
        }


        if (url === "" || moderator === undefined) return

        const message = `Your ${type} has been removed.
You can view the removed ${type} here: ${url}  
          
The reason he gave:  
${reason || "No Reason given"}

Please note: This is automated, your reply will **NOT** be read (Insults/Rule breaks will still lead to a ban).`

        // SEND PRIVATE MESSAGE TO USER

        if (person_id === undefined) return
        if (typeof person_id === "number") {
            console.log("Sending message to " + person_id)
            await client.createPrivateMessage({
                auth: getAuth(),
                recipient_id: person_id,
                content: message,
            })
        } else {
            for (const id of person_id) {
                console.log("Sending message to " + person_id)
                await client.createPrivateMessage({
                    auth: getAuth(),
                    recipient_id: id,
                    content: message,
                })
            }
        }
    }
}