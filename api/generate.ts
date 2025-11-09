// Esta é uma função serverless do Vercel.
// Ela foi reescrita para usar a API REST nativa em vez do SDK para máxima compatibilidade.
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
    
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'A chave de API não está configurada no servidor.' });
    }

    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`;

    const requestBody = {
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64ImageData,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseModalities: ['IMAGE'],
      },
    };

    const geminiResponse = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
    });

    if (!geminiResponse.ok) {
        const errorData = await geminiResponse.json();
        console.error('Gemini API Error:', errorData);
        const errorMessage = errorData.error?.message || `Erro na API Gemini: ${geminiResponse.statusText}`;
        return res.status(geminiResponse.status).json({ error: errorMessage });
    }

    const responseData = await geminiResponse.json();
    
    // Extrai os dados da imagem da estrutura da resposta REST
    const imagePart = responseData.candidates?.[0]?.content?.parts?.find(p => p.inlineData);

    if (imagePart && imagePart.inlineData) {
      const base64ImageBytes = imagePart.inlineData.data;
      const imageMimeType = imagePart.inlineData.mimeType;
      const imageUrl = `data:${imageMimeType};base64,${base64ImageBytes}`;
      return res.status(200).json({ imageUrl });
    }

    // Se nenhuma parte da imagem for encontrada na resposta
    throw new Error("Nenhuma imagem foi gerada pela API ou a resposta teve um formato inesperado.");

  } catch (error) {
    console.error('Error in /api/generate:', error);
    const errorMessage = error instanceof Error ? error.message : 'Um erro desconhecido ocorreu no servidor.';
    res.status(500).json({ error: `Falha ao gerar imagem: ${errorMessage}` });
  }
}
