
import React from 'react';
import { SpinnerIcon, DownloadIcon } from './icons';

interface GeneratedImagesProps {
  images: string[];
  isLoading: boolean;
  hasOriginal: boolean;
}

export const GeneratedImages: React.FC<GeneratedImagesProps> = ({ images, isLoading, hasOriginal }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 h-64">
        <SpinnerIcon className="w-12 h-12" />
        <p className="text-gray-400">A IA está trabalhando... Isso pode levar um momento.</p>
      </div>
    );
  }

  if (images.length === 0 && hasOriginal) {
      return (
        <div className="flex items-center justify-center text-center text-gray-500 h-64">
            <p>Sua imagem gerada aparecerá aqui. <br/>Clique em "Gerar Variação" para começar.</p>
        </div>
      );
  }

  return (
    <div className="space-y-2">
       {images.length > 0 && <h3 className="text-lg font-medium text-gray-400">Variação Gerada</h3>}
        {images.map((imgSrc, index) => (
          <div key={index} className="group relative">
            <img src={imgSrc} alt={`Generated variation ${index + 1}`} className="rounded-lg w-full h-auto object-cover" />
            <a
              href={imgSrc}
              download={`variacao-${Date.now()}.png`}
              className="absolute bottom-4 right-4 bg-black bg-opacity-60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-opacity-80"
              aria-label="Download image"
            >
              <DownloadIcon className="w-6 h-6" />
            </a>
          </div>
        ))}
    </div>
  );
};
