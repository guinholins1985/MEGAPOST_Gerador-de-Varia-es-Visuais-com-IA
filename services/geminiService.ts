
import { GoogleGenAI, Modality } from "@google/genai";
import { fileToBase64 } from "../utils/imageUtils";

export const generateImageVariation = async (imageFile: File, prompt: string, apiKey: string): Promise<string> => {
    if (!apiKey) {
      throw new Error("API key não configurada. Defina a variável de ambiente API_KEY.");
    }
    
    const ai = new GoogleGenAI({ apiKey });

    const { mimeType, data: base64ImageData } = await fileToBase64(imageFile);

    const imagePart = {
        inlineData: {
            data: base64ImageData,
            mimeType: mimeType,
        },
    };

    const textPart = {
        text: prompt,
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [imagePart, textPart],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });
    
    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            const imageMimeType = part.inlineData.mimeType;
            return `data:${imageMimeType};base64,${base64ImageBytes}`;
        }
    }
    
    throw new Error("Nenhuma imagem foi gerada pela API.");
};
