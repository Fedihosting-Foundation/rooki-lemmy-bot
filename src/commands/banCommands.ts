import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import client, { getAuth } from "../main";
import { Inject } from "typedi";
import verifiedUserService from "../services/verifiedUserService";

@Discord()
export default class BanCommands {
    @Inject()
    verifiedUserService: verifiedUserService;
    @Slash({ description: "Ban a user from community", name: "banlemmyuser" })
    async banUser(
        @SlashOption({
            description: "The user name",
            name: "username",
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        userId: string,
        @SlashOption({
            description: "Community Name",
            name: "communityname",
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        communityName: string,
        @SlashOption({
            description: "Expires",
            name: "numberofdays",
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        expiresIn: Number,
        @SlashOption({
            description: "Ban Reason",
            name: "banreason",
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        banReason: string,
        interaction: CommandInteraction
    ) {
        await interaction.deferReply();
        try {
            const commId = await client.getCommunity({
                auth: getAuth(),
                name: communityName,
            })

            if (
                !(await this.verifiedUserService.isModeratorOf(
                    interaction.user,
                    commId.community_view.community.id
                ))
            ) {
                await interaction.editReply(
                    "You are not a moderator of this community! ( **If you didnt verified yourself already please do it with /verify** )!"
                );
                return;
            }

            const user = await client.getPersonDetails({
                auth: getAuth(),
                username: userId,
            });

            let expiresDate = (((new Date()).getTime() + (86400000 * Number(expiresIn))) / 1000) | 0;

            const banCall = await client.banFromCommunity({
                auth: getAuth(),
                ban: Boolean(true),
                community_id: Number(commId.community_view.community.id),
                person_id: Number(user.person_view.person.id),
                expires: Number(expiresDate),
                reason: String(banReason),
            })

            await interaction.editReply(`Successfully banned ${userId} from ${communityName}.`);
        } catch (exc) {
            console.log(exc);
            //interaction.editReply(`Something went wrong!`);
        }
    }
    @Slash({ description: "Unban a user from community", name: "unbanlemmyuser" })
    async unbanUser(
        @SlashOption({
            description: "The user name",
            name: "username",
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        userId: string,
        @SlashOption({
            description: "Community Name",
            name: "communityname",
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        communityName: string,
        @SlashOption({
            description: "Unban Reason",
            name: "unbanreason",
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        unbanReason: string,
        interaction: CommandInteraction
    ) {
        await interaction.deferReply();
        try {
            const commId = await client.getCommunity({
                auth: getAuth(),
                name: communityName,
            })

            if (
                !(await this.verifiedUserService.isModeratorOf(
                    interaction.user,
                    commId.community_view.community.id
                ))
            ) {
                await interaction.editReply(
                    "You are not a moderator of this community! ( **If you didnt verified yourself already please do it with /verify** )!"
                );
                return;
            }

            const user = await client.getPersonDetails({
                auth: getAuth(),
                username: userId,
            });

            const unbanCall = await client.banFromCommunity({
                auth: getAuth(),
                ban: Boolean(false),
                community_id: Number(commId.community_view.community.id),
                person_id: Number(user.person_view.person.id),
                reason: String(unbanReason),
            })

            await interaction.editReply(`Successfully unbanned ${userId} from ${communityName}.`);
        } catch (exc) {
            console.log(exc);
            interaction.editReply("Something went wrong");
        }
    }
}
