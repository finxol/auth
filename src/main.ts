import { Hono } from "hono"
import { issuer } from "./issuer.ts"
import config from "../config.ts"
import { uaBlocker } from "@hono/ua-blocker"
import { aiBots, useAiRobotsTxt } from "@hono/ua-blocker/ai-bots"

const app = new Hono()
    .get("/robots.txt", useAiRobotsTxt())
    .use(
        "*",
        config.blockAiBots !== false
            ? uaBlocker({
                blocklist: aiBots,
            })
            : async (_c, next) => await next(),
    )
    .route("/", issuer)
    .get("/", (ctx) => {
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

Deno.serve({ port: parseInt(Deno.env.get("PORT") || "8000") }, app.fetch)
