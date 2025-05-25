# Finxol Auth Server

A lightweight authentication server built with Deno and OpenAuth.

## Overview

This is a minimal auth server implementation designed to be easily forked and customized for your authentication needs.
It leverages OpenAuth for OAuth2 workflows and runs on Deno Deploy for a modern, secure runtime environment.

## Deploy

This auth server can easily be deployed to Deno Deploy by following these steps:

### Fork

1. Fork this repository
2. Clone your fork locally

### Deploy to Deno Deploy

1. Go to Deno Deploy and [create a new project](https://dash.deno.com/new_project).
2. Choose your fork in the GitHub repos list.
3. Make sure to check "Just link the repo, I’ll set up GitHub Actions myself" as the Actions workflow is already in the repo.
4. In your settings, add the required environment variables.

### Environment Variables

- `CLIENT_ID`: The client ID for the auth server. Used to authenticate requests provenence.
- `GITHUB_CLIENT_ID`: The client ID for the GitHub authentication provider.
- `GITHUB_CLIENT_SECRET`: The client secret for the GitHub authentication provider.

### Push to deploy

To actually deploy the application, deploy deploy needs a new push to the main branch to trigger the Actions workflow.
This can simply be your configuration changes.

### Configuration

The server is configured through the `config.ts` file at the project root.
Currently, the configurable options are:

- **`allowedOrigins`**: An array of allowed origins. Supports wildcards for subdomains and ports.
- **`title`**: The title of the auth server. Shown on the home page.
- **`description`**: The description of the auth server. Shown on the home page.

Example configuration:

```typescript
export default defineConfig({
    title: "My Auth Server",
    description: "A custom authentication server",
    allowedOrigins: [
        "http://localhost:*/",
        "https://yourdomain.com",
        "https://*.yourdomain.com/",
    ],
})
```

### (optional) Link a custom domain

You can optionnally link a custom domain name to your auth server in your Deploy settings.
Everything will work normally.

<details>

<summary>Run it locally</summary>

### Prerequisites

- [Deno](https://deno.land/) installed on your system

### Running the Server

Development mode with hot reload:

```bash
deno task dev
```

Production build:

```bash
deno task build
deno task start
```

## Project Structure

- `config.ts` - Main configuration file
- `src/main.ts` - Application entry point
- `src/issuer.ts` - OpenAuth issuer implementation
- `.env` - Environment variables (create your own)

</details>

## Contributing

This project is designed to be forked and customized. Feel free to modify it according to your specific authentication requirements.
