export class TokenEstimator {
    /**
     * Lightweight estimator to avoid complex tokenizers.
     * Only used for guardrails and logging; must not change behavior.
     */
    static estimatePromptSize(chars: string): number {
        // Rough heuristic: ~4 chars per token for English.
        return Math.ceil((chars || "").length / 4);
    }
}
