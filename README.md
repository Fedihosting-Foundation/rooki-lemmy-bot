# rooki-lemmy-bot

This is a bot for Owners/Moderators of communities who want to add a automod, autoposts and (optional) discord logging and partial control on discord.
The reason why i used discord is that i dont have enough experience to port it to matrix ( or other more privacy focused platform ) but i am open for a PR for that.

It (has the capability) to Log: 
- Posts
- Comments
- Reprots

Because of the issue with discords privacy policy. I am in the work of a dedicated Webpage for the mods of the community.

## Requirements

1. Lemmy Account ( Marked as Bot of course )
2. A Mongodb Server (Best use self hosted or get one for free on mongodb compass website )
3. (optional) A Discord Bot Token

## Setup

1. Run `npm install`
2. Rename .env.example to .env
3. Put everything you want in
4. For quick testing run `npm run dev` otherwise for a smoother experience run `npm run build` and `npm run start` ( Everytime you change something in the .ts files! )

## Contributions are open!

As i am not experienced with Matrix and their api any contribution adding the capability to do the logging to Matrix are open and wanted!

## For Questions

Ask roooooooooooooooooooooooooooooki on discord

Just ask!

