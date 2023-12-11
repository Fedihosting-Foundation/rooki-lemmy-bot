import { Person } from "lemmy-js-client";
import { Lemmy, LemmyOn } from "../decorators/lemmyPost";
import removedModLogModel from "../models/removedModLogModel";
import { LemmyEventArguments } from "../types/LemmyEvents";

class messageUsers {

    @LemmyOn({ event: "modlogcreated" })
    async checkFilteredPosts(
        event: LemmyEventArguments<removedModLogModel>
    ) {

        const data = event.data

        let url: string = ""

        let type: string = ""

        let person: Person | undefined = undefined

        let reason: string | undefined = undefined

        if (data.removed_comment !== undefined) {
            url = "https://lemmy.world/comment/" + data.removed_comment.comment.id
            type = "comment"
            person = data.removed_comment.moderator
            reason = data.removed_comment.mod_remove_comment.reason
        } else if (data.removed_post !== undefined) {
            url = "https://lemmy.world/post/" + data.removed_post.post.id
            type = "post"
            person = data.removed_post.moderator
            reason = data.removed_post.mod_remove_post.reason
        } else if (data.removed_community !== undefined) {
            url = "https://lemmy.world/c/" + data.removed_community.community.name
            type = "community"
            person = data.removed_community.moderator
            reason = data.removed_community.mod_remove_community.reason
        }

        if (url === "") return

        const message = `Your ${type} has been removed by a ${person?.name}. You can view the removed ${type} here: ${url}  
          
        The reason he gave:  
        ${reason || "No Reason given"}

        Please note: This is automated, your reply will **NOT** be read (Insults/Rule breaks will still lead to ban). If you have any questions, please contact the moderator.`

        console.log(message)

        // SEND PRIVATE MESSAGE TO USER
    }
}