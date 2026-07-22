export class RetryHandler {
    static shouldRetryOnce(error: unknown): boolean {
        const message = (error as any)?.message || String(error || "");
        const lower = message.toLowerCase();

        // Preserve the existing behavior: retry once when parsing/validation fails,
        // but do NOT retry for auth/rate limit errors (those should propagate).
        const isAuthOrInvalidKey =
            message.includes("401") ||
            lower.includes("api_key_invalid") ||
            lower.includes("invalid key") ||
            (error as any)?.status === 401;

        if (isAuthOrInvalidKey) return false;

        const isRateLimit =
            (error as any)?.status === 429 ||
            ((message.includes("429") ||
            lower.includes("rate limit") ||
            lower.includes("quota") ||
            lower.includes("resource_exhausted")) &&
            (error as any)?.status !== 500);

        if (isRateLimit) return false;

        // For everything else (typically parsing/validation), retry once.
        return true;
    }
}
