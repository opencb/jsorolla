export default class AIUtils {

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

};
