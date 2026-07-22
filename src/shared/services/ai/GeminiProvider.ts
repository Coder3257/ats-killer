import { GoogleGenAI } from "@google/genai";

export class GeminiProvider {
    static async generateContent(params: {
        apiKey: string;
        model: string;
        contents: string;
        responseMimeType?: "application/json";
    }): Promise<{ text: string }> {
        const ai = new GoogleGenAI({ apiKey: params.apiKey });

        const response = await ai.models.generateContent({
            model: params.model,
            contents: params.contents,
            config: params.responseMimeType
                ? { responseMimeType: params.responseMimeType }
                : undefined,
        });

        return { text: response.text || "" };
    }
}
