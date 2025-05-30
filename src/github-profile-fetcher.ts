import { tryCatch } from "./utils.ts"
import { ofetch } from "ofetch"

type ProfileData = {
    provider: "github"
    email: string
    remoteId: string
    avatar?: string
    name: string
}

// Define constants for URLs and common headers
const GITHUB_API_BASE = "https://api.github.com"
const GITHUB_API_VERSION = "2022-11-28"

/* Copied from https://github.com/octokit/octokit-next.js/blob/main/packages/types-openapi-ghec-diff-to-api.github.com/index.d.ts   #L979 */
type GithubUserProfile = {
    name?: string | null
    email?: string | null
    /** @example octocat */
    login: string
    /** @example 1 */
    id: number
    /** @example MDQ6VXNlcjE= */
    node_id: string
    /**
     * Format: uri
     * @example https://github.com/images/error/octocat_happy.gif
     */
    avatar_url: string
    /** @example 41d064eb2195891e12d0413f63227ea7 */
    gravatar_id: string | null
    /**
     * Format: uri
     * @example https://api.github.com/users/octocat
     */
    url: string
    /**
     * Format: uri
     * @example https://github.com/octocat
     */
    html_url: string
    /**
     * Format: uri
     * @example https://api.github.com/users/octocat/followers
     */
    followers_url: string
    /** @example https://api.github.com/users/octocat/following{/other_user} */
    following_url: string
    /** @example https://api.github.com/users/octocat/gists{/gist_id} */
    gists_url: string
    /** @example https://api.github.com/users/octocat/starred{/owner}{/repo} */
    starred_url: string
    /**
     * Format: uri
     * @example https://api.github.com/users/octocat/subscriptions
     */
    subscriptions_url: string
    /**
     * Format: uri
     * @example https://api.github.com/users/octocat/orgs
     */
    organizations_url: string
    /**
     * Format: uri
     * @example https://api.github.com/users/octocat/repos
     */
    repos_url: string
    /** @example https://api.github.com/users/octocat/events{/privacy} */
    events_url: string
    /**
     * Format: uri
     * @example https://api.github.com/users/octocat/received_events
     */
    received_events_url: string
    /** @example User */
    type: string
    site_admin: boolean
    /** @example "2020-07-09T00:17:55Z" */
    starred_at?: string
} | null

/* Infered from https://docs.github.com/en/rest/users/emails?apiVersion=2022-11-28#list-email-addresses-for-the-authenticated-user */
type GithubEmails = {
    email: string
    primary: boolean
    verified: boolean
    visibility: string | null
}[]

/**
 * Fetches the authenticated user's profile and email addresses from GitHub
 *
 * @param token The GitHub access token.
 * @returns A Result containing the combined profile and email data, or an error string.
 */
export async function getGithubUserData(token: string) {
    const headers = {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": GITHUB_API_VERSION,
    }

    const [profileResult, emailsResult] = await Promise.all([
        tryCatch(
            ofetch<GithubUserProfile>(`${GITHUB_API_BASE}/user`, {
                headers,
            }),
        ),
        tryCatch(
            ofetch<GithubEmails>(`${GITHUB_API_BASE}/user/emails`, {
                headers,
            }),
        ),
    ])

    if (!profileResult.success || profileResult.value === null) {
        console.error("Failed to fetch user profile", profileResult.error)
        return { success: false, error: "Failed to fetch user profile" }
    }

    if (!emailsResult.success || emailsResult.value === null) {
        console.error("Failed to fetch user emails", emailsResult.error)
        return { success: false, error: "Failed to fetch user emails" }
    }

    const profile = profileResult.value

    const email = emailsResult.value.find((email) => email.primary)

    const profileData: ProfileData = {
        provider: "github",
        email: email?.email ?? "",
        remoteId: profile.id.toString(),
        avatar: profile.avatar_url,
        name: profile.name ?? profile.login,
    }

    return { success: true, value: profileData }
}
