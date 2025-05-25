/**
 * Wraps a promise in a try/catch block and returns a Result object representing
 * either a successful value or an error.
 *
 * This utility function provides a more structured way to handle asynchronous operations
 * without using try/catch blocks throughout your codebase. It follows a pattern similar
 * to Rust's Result type, allowing for more predictable error handling.
 *
 * @template T - The type of the value returned by the promise on success
 * @template E - The type of the error object (defaults to Error)
 *
 * @param promise - The promise to wrap and execute
 *
 * @returns A Promise resolving to a discriminated union object with:
 *   - On success: `{ success: true, value: T, error: null }`
 *   - On failure: `{ success: false, value: null, error: E }`
 *
 * @example
 * // Success case
 * const successResult = await tryCatch(Promise.resolve('data'));
 * if (successResult.success) {
 *   console.log(successResult.value); // 'data'
 * }
 *
 * @example
 * // Error case
 * const errorResult = await tryCatch(Promise.reject(new Error('Failed')));
 * if (!errorResult.success) {
 *   console.error(errorResult.error.message); // 'Failed'
 * }
 *
 * @example
 * // Using with custom error type
 * interface ApiError { code: number; message: string }
 * const apiCall = tryCatch<UserData, ApiError>(fetchUserData());
 */
export async function tryCatch<T, E = Error>(
    promise: Promise<T>,
): Promise<
    | {
        success: true
        value: T
        error: null
    }
    | {
        success: false
        value: null
        error: E
    }
> {
    try {
        const value = await promise
        return { success: true, value, error: null }
    } catch (error) {
        return { success: false, value: null, error: error as E }
    }
}

type Config = {
    allowedOrigins: (`http://${string}` | `https://${string}`)[]
    title?: string
    description?: string
}

export function defineConfig(config: Config): Config {
    return config
}

export function isOriginAllowed(
    origin: URL,
    allowedOrigins: string[],
): boolean {
    const sep = String.fromCharCode(0x0)

    return allowedOrigins.some((allowed) => {
        // Handle protocol differences
        if (allowed.startsWith("http://") && origin.protocol !== "http:") {
            return false
        }
        if (allowed.startsWith("https://") && origin.protocol !== "https:") {
            return false
        }

        // Handle hostname differences
        let allowedHost: string
        if (!allowed.includes("*")) {
            allowedHost = new URL(allowed).hostname
        } else {
            allowedHost = new URL(allowed.replace(/\*/g, sep))
                .hostname
                .replace(sep, ".")
        }

        const regex = new RegExp(`^${allowedHost}$`)
        return regex.test(origin.hostname)
    })
}
