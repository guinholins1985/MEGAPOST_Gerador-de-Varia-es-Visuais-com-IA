import React, { useState, useCallback } from 'react';
import { ImageInput } from './components/ImageInput';
import { GeneratedImages } from './components/GeneratedImages';
import { generateImageVariation } from './services/geminiService';
import { urlToImageFile } from './utils/imageUtils';

interface OriginalImage {
  file: File;
  previewUrl: string;
}

export default function App() {
  const [originalImage, setOriginalImage] = useState<OriginalImage | null>(null);
  const [prompt, setPrompt] = useState<string>('Crie uma variação criativa desta imagem.');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);


  const handleGeneration = useCallback(async (imageFile: File, currentPrompt: string) => {
    setIsLoading(true);
    setError(null);
    setGeneratedImages([]);

    try {
      const result = await generateImageVariation(imageFile, currentPrompt);
      setGeneratedImages([result]);
    } catch (err) {
      if (err instanceof Error) {
        // A mensagem de erro do serviço agora é autocontida e amigável para o usuário.
        setError(err.message);
      } else {
        setError('Ocorreu um erro desconhecido.');
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleImageSelected = useCallback((file: File, previewUrl: string) => {
    setOriginalImage({ file, previewUrl });
    handleGeneration(file, prompt);
  }, [prompt, handleGeneration]);
  
  const handleUrlSubmitted = useCallback(async (url: string) => {
      if (!url) return;
      setIsLoading(true);
      setError(null);
      setOriginalImage(null);
      setGeneratedImages([]);
      try {
        const file = await urlToImageFile(url);
        const previewUrl = URL.createObjectURL(file);
        setOriginalImage({ file, previewUrl });
        await handleGeneration(file, prompt);
      } catch(err) {
        if (err instanceof Error) {
          setError(`Não foi possível carregar a imagem da URL: ${err.message}`);
        } else {
          setError('Ocorreu um erro desconhecido ao carregar a imagem da URL.');
        }
        setIsLoading(false);
      }
  }, [prompt, handleGeneration]);


  const regenerate = () => {
    if (originalImage) {
      handleGeneration(originalImage.file, prompt);
    }
  };

  const clearAll = () => {
    setOriginalImage(null);
    setGeneratedImages([]);
    setError(null);
    setIsLoading(false);
    setPrompt('Crie uma variação criativa desta imagem.');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <main className="container mx-auto p-4 md:p-8">
        <header className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
            Gerador de Variações Visuais com IA
          </h1>
          <p className="mt-4 text-lg text-gray-400">
            Envie uma imagem, descreva a alteração e deixe a IA criar algo novo para você.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6 p-6 bg-gray-800/50 rounded-2xl border border-gray-700">
            <h2 className="text-2xl font-semibold border-b border-gray-600 pb-3">Controles</h2>
            <ImageInput onImageSelected={handleImageSelected} onUrlSubmit={handleUrlSubmitted} isLoading={isLoading} />
            
            <div>
              <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">
                2. Descreva a Variação (Prompt)
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ex: Mude o fundo para uma praia ensolarada."
                rows={4}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                disabled={isLoading}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
               <button
                onClick={regenerate}
                disabled={!originalImage || isLoading}
                className="w-full flex-1 text-center py-3 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-indigo-900 disabled:text-gray-400 disabled:cursor-not-allowed transition duration-200"
              >
                {isLoading ? 'Gerando...' : 'Gerar Variação'}
              </button>
               <button
                onClick={clearAll}
                disabled={isLoading}
                className="w-full flex-1 text-center py-3 px-4 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 disabled:bg-gray-800 disabled:cursor-not-allowed transition duration-200"
              >
                Limpar
              </button>
            </div>

          </div>

          <div className="lg:col-span-8 p-6 bg-gray-800/50 rounded-2xl border border-gray-700 min-h-[500px]">
            <h2 className="text-2xl font-semibold border-b border-gray-600 pb-3 mb-6">Resultados</h2>
            {error && <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg">{error}</div>}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {originalImage && (
                    <div className="space-y-2">
                        <h3 className="text-lg font-medium text-gray-400">Original</h3>
                        <img src={originalImage.previewUrl} alt="Original" className="rounded-lg w-full h-auto object-cover" />
                    </div>
                )}

                <GeneratedImages images={generatedImages} isLoading={isLoading} hasOriginal={!!originalImage} />
            </div>
            
            {!originalImage && !isLoading && (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 pt-16">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <p>A imagem original e as variações geradas aparecerão aqui.</p>
                </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
