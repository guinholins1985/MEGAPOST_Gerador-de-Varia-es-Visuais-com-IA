
export const fileToBase64 = (file: File): Promise<{ mimeType: string; data: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const [header, data] = result.split(',');
      const mimeTypeMatch = header.match(/:(.*?);/);
      if (!mimeTypeMatch || !mimeTypeMatch[1] || !data) {
        reject(new Error("Formato de arquivo inválido ou não foi possível ler os dados."));
      } else {
        resolve({ mimeType: mimeTypeMatch[1], data });
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

export const urlToImageFile = async (url: string): Promise<File> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
        // Attempt to give a more specific error for CORS
        if (response.type === 'opaque') {
             throw new Error("Falha ao buscar imagem devido a restrições de CORS. Tente baixar a imagem e fazer o upload manualmente.");
        }
        throw new Error(`Falha ao buscar imagem. Status: ${response.status}`);
    }
    const blob = await response.blob();
    const fileName = url.substring(url.lastIndexOf('/') + 1) || 'image-from-url';
    return new File([blob], fileName, { type: blob.type });
  } catch(e) {
      if (e instanceof TypeError && e.message === 'Failed to fetch') {
           throw new Error("Falha na rede ou problema de CORS. Verifique a URL e sua conexão com a internet.");
      }
      throw e; // Re-throw other errors
  }
};
