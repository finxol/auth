import { build } from "esbuild"
import { tryCatch } from "../src/utils.ts"

console.info("Bundling API...")

const start = Date.now()

const result = await tryCatch(
    build({
        entryPoints: ["src/main.ts"],
        bundle: true,
        minify: true,
        platform: "node",
        target: "esnext",
        format: "esm",
        outdir: "out",
        metafile: true,
        external: ["node:*", "bun:*"],
        splitting: true,
        outExtension: { ".js": ".mjs" },
        conditions: ["deno"]
    })
)

if (!result.success) {
    console.error("Build failed:", result.error)
    throw result.error
}

const end = Date.now()
const duration = end - start
const bytes = Object.keys(result.value.metafile.outputs)
    .map((name) => result.value.metafile.outputs[name]?.bytes)
    .reduce((acc, size) => acc! + size!, 0)

console.debug(
    `Generated ${Object.keys(result.value.metafile.outputs).length} chunks`
)

console.info(
    `⚡ Bundled API in ${duration}ms (${(bytes! / 1024).toFixed(2)} kB)`
)
