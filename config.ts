import { defineConfig } from "./src/utils.ts"

export default defineConfig({
    title: "finxol auth",
    description:
        "This is the personal auth server for <a href='https://finxol.io'>finxol</a>'s projects.",
    allowedOrigins: [
        "https://finxol.io",
        "https://*.finxol.io/",
        "https://finxol.dev/",
        "https://*.finxol.dev/",
        "http://localhost/",
    ],
})
