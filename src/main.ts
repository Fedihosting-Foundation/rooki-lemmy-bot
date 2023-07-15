import { LemmyHttp } from "lemmy-js-client";
import "reflect-metadata";

const client: LemmyHttp = new LemmyHttp(process.env.LEMMY_URL || "https://lemmy.world")
let jwt: string
async function start(){
    const results = await client.login({
        password: process.env.LEMMY_PASSWORD || "",
        username_or_email: process.env.LEMMY_USERNAME || "",
    })

    if(!results.jwt){
        throw new Error("Could not log in to Lemmy")
    }
    jwt = results.jwt

    const posts = await client.getPosts({
        auth: jwt,
        type_: "Local",
    })
}

function getAuth(){
    return jwt
}


export default client