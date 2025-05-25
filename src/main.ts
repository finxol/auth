import { issuer } from "./issuer.ts"

Deno.serve({ port: parseInt(Deno.env.get("PORT") || "8000") }, issuer.fetch)
