import { fileToBase64 } from "../utils/imageUtils";

export const generateImageVariation = async (imageFile: File, prompt: string): Promise<string> => {
    // Converte o arquivo para base64 para enviá-lo como JSON
    const { mimeType, data: base64ImageData } = await fileToBase64(imageFile);

    // Chama nossa própria API de backend da função serverless
    const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            mimeType,
            base64ImageData,
            prompt,
        }),
    });

    const result = await response.json();

    if (!response.ok) {
        // Lança a mensagem de erro da nossa API de backend
        throw new Error(result.error || `Ocorreu um erro desconhecido na API (status: ${response.status}).`);
    }

    if (!result.imageUrl) {
        throw new Error("A API não retornou uma URL de imagem válida.");
    }

    return result.imageUrl;
};
