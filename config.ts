import { defineConfig } from "./src/utils.ts"

export default defineConfig({
    allowedOrigins: [
        "http://localhost/",
        "http://localhost:*/",
        "https://finxol.io",
        "https://*.finxol.io/",
        "https://finxol.dev/",
        "https://*.finxol.dev/",
    ],
})
