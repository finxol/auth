import { issuer as oa } from "@openauthjs/openauth"
import { createSubjects } from "@openauthjs/openauth/subject"
import { GithubProvider } from "@openauthjs/openauth/provider/github"
import { z } from "zod/v4-mini"

import { getGithubUserData } from "./github-profile-fetcher.ts"
import { DenoKV } from "./deno-kv-adapter.ts"
import config from "../config.ts"
import { isOriginAllowed } from "./utils.ts"

const clientID = Deno.env.get("CLIENT_ID")

const user = z.object({
    id: z.string(),
    email: z.email(),
    avatar: z.nullable(z.optional(z.url())),
    name: z.string(),
})

if (!clientID) {
    throw new Error(
        "CLIENT_ID environment variable is not set. It is required for the issuer to function.",
    )
}

const issuer = oa({
    subjects: createSubjects({
        user,
    }),
    storage: await DenoKV(),
    providers: {
        github: GithubProvider({
            clientID: Deno.env.get("GITHUB_CLIENT_ID")!,
            clientSecret: Deno.env.get("GITHUB_CLIENT_SECRET")!,
            scopes: ["read:user", "user:email"],
            pkce: true,
        }),
    },
    allow: (input, _req) =>
        new Promise((resolve) => {
            const redir = new URL(input.redirectURI)

            if (!redir || !isOriginAllowed(redir, config.allowedOrigins)) {
                console.log(`Origin ${redir} not allowed`)
                return resolve(false)
            }

            if (input.clientID !== clientID) {
                console.log(`Client ID ${input.clientID} not allowed`)
                return resolve(false)
            }

            return resolve(true)
        }),

    success: async (ctx, value) => {
        if (value.provider === "github") {
            const userData = await getGithubUserData(value.tokenset.access)

            if (userData.value) {
                return ctx.subject("user", {
                    id: `${userData.value.provider}:${userData.value.remoteId}`,
                    email: userData.value.email,
                    name: userData.value.name,
                    avatar: userData.value.avatar,
                })
            } else {
                console.error(
                    `Error getting GitHub user data: ${userData.error}`,
                )
                throw new Error(userData.error)
            }
        }
        throw new Error("Invalid provider")
    },
})

export { issuer }
