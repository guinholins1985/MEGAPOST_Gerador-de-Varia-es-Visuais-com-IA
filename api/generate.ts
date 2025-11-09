import { GoogleGenAI, Modality } from "@google/genai";

// Esta é uma função serverless do Vercel, executada em um ambiente Node.js.
// Não precisa de tipos explícitos para req/res para funcionar.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { mimeType, base64ImageData, prompt } = req.body;

    if (!mimeType || !base64ImageData || !prompt) {
        return res.status(400).json({ error: 'Parâmetros ausentes: mimeType, base64ImageData, prompt são obrigatórios.' });
    }
    
    // A chave de API é acessada com segurança a partir das variáveis de ambiente no servidor.
    if (!process.env.API_KEY) {
        return res.status(500).json({ error: 'A chave de API não está configurada no servidor.' });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
        const imageUrl = `data:${imageMimeType};base64,${base64ImageBytes}`;
        return res.status(200).json({ imageUrl });
      }
    }

    // Se nenhuma parte da imagem for encontrada na resposta
    throw new Error("Nenhuma imagem foi gerada pela API.");

  } catch (error) {
    console.error('Error in /api/generate:', error);
    const errorMessage = error instanceof Error ? error.message : 'Um erro desconhecido ocorreu no servidor.';
    res.status(500).json({ error: `Falha ao gerar imagem: ${errorMessage}` });
  }
}
