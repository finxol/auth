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
    allow: (input, req) =>
        new Promise((resolve) => {
            let origin = req.headers.get("origin")

            if (!origin) {
                const referer = req.headers.get("referer")
                if (referer) {
                    try {
                        const refererUrl = new URL(referer)
                        origin = refererUrl.origin
                    } catch {
                        // Invalid referer URL, ignore
                    }
                }

                // Fall back to host-based origin if referer is not available
                if (!origin) {
                    const forwardedHost = req.headers.get("x-forwarded-host")
                    const host = forwardedHost || req.headers.get("host")

                    if (host) {
                        const forwardedProto = req.headers.get(
                            "x-forwarded-proto",
                        )
                        const protocol = forwardedProto ||
                            (forwardedHost ? "https" : "http")
                        origin = `${protocol}://${host}`
                    }
                }
            }

            if (!origin || !isOriginAllowed(origin, config.allowedOrigins)) {
                return resolve(false)
            }

            if (input.clientID !== clientID) {
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

issuer.get("/", (ctx) => {
    return ctx.html(`
        <html>
            <head>
                <title>${config.title || "auth server"}</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 0;
                        background-color: #f5f5f5;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        height: 100svh;
                    }
                    h1 {
                        font-size: 3rem;
                        color: #333;
                        text-align: center;
                    }
                    p {
                        font-size: 1.2rem;
                        color: #666;
                        text-align: center;
                    }
                </style>
            </head>
            <body>
                <h1>${config.title || "auth server"}</h1>
                <p>
                    ${config.description || "This is a simple auth server"}
                </p>
                </body>
        </html>
    `)
})

export { issuer }
