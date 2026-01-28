import {GoogleGenAI} from "@google/genai";

export default class AIUtils {

    static STORAGE_GEMINI_API_KEY = "IVA_GEMINI_API_KEY";

    static getApiKey() {
        return window.localStorage.getItem(AIUtils.STORAGE_GEMINI_API_KEY) || null;
    }

    static async callGeminiAI(prompt, model = "gemini-2.5-flash") {
        const apiKey = AIUtils.getApiKey();

        if (!apiKey) {
            throw new Error("Gemini API key not configured. Please set IVA_GEMINI_API_KEY in localStorage.");
        }

        if (!prompt) {
            throw new Error("Prompt is required");
        }

        try {
            const client = new GoogleGenAI({
                apiKey: apiKey,
            });

            const response = await client.models.generateContent({
                model: model,
                contents: prompt,
            });

            return response.text;
        } catch (error) {
            console.error("Error calling Gemini AI:", error);
            throw error;
        }
    }

    static parseJsonResponse(responseText) {
        try {
            // Remove ```json ... ``` markdown formatting if present
            if (responseText && responseText.trim().startsWith("```json")) {
                responseText = responseText.trim().replace(/^```json/, "").replace(/```$/, "").trim();
            }
            return JSON.parse(responseText);
        } catch (error) {
            console.error("Error parsing JSON response from AI:", error);
        }
        return null;
    }

}
