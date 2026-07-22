export class ResponseParser {
    static stripJsonFences(text: string): string {
        let cleanText = (text || "").trim();

        if (cleanText.startsWith("```json")) {
            cleanText = cleanText.substring(7);
        } else if (cleanText.startsWith("```")) {
            cleanText = cleanText.substring(3);
        }

        if (cleanText.endsWith("```")) {
            cleanText = cleanText.substring(0, cleanText.length - 3);
        }

        return cleanText.trim();
    }

    static parseJson(text: string): unknown {
        const cleanText = ResponseParser.stripJsonFences(text);
        return JSON.parse(cleanText);
    }

    static normalizeText(text: string): string {
        return (text || "").trim().replace(/^["']|["']$/g, "");
    }
}
