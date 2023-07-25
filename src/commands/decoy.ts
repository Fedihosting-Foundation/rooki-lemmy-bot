import { Discord, SelectMenuComponent } from "discordx";

@Discord()
class decoy{
    @SelectMenuComponent({
        id: "discordx@pagination@menu",
    })
    async paginationMenu() {
    }
}