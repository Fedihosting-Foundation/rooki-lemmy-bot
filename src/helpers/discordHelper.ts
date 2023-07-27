import { bot } from "../main";

export async function getUser(id: string) {
  let user = bot.users.cache.get(id);
  try {
    user = await bot.users.fetch(id);
  } catch (exc) {
    console.log(exc);
  }
  return user;
}
