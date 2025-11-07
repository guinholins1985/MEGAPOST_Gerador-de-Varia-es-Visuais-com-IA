
import React, { useState, useRef, useCallback } from 'react';
import { UploadIcon, LinkIcon } from './icons';

type InputMode = 'upload' | 'url';

interface ImageInputProps {
  onImageSelected: (file: File, previewUrl: string) => void;
  onUrlSubmit: (url: string) => void;
  isLoading: boolean;
}

export const ImageInput: React.FC<ImageInputProps> = ({ onImageSelected, onUrlSubmit, isLoading }) => {
  const [mode, setMode] = useState<InputMode>('upload');
  const [url, setUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      onImageSelected(file, previewUrl);
    }
  };

  const handleUrlBlur = () => {
    if (url.trim()) {
        onUrlSubmit(url.trim());
    }
  };
  
  const handleUrlKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
        onUrlSubmit(url.trim());
    }
  };


  const getButtonClass = (buttonMode: InputMode) => {
    return `flex-1 py-2 px-4 text-sm font-medium text-center rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 ${
      mode === buttonMode ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
    }`;
  };

  return (
    <div className="space-y-4">
      <p className="block text-sm font-medium text-gray-300">1. Forneça uma Imagem</p>
      <div className="flex space-x-2 bg-gray-900 p-1 rounded-lg">
        <button onClick={() => setMode('upload')} className={getButtonClass('upload')}>
          <UploadIcon className="inline-block w-4 h-4 mr-2" />
          Upload
        </button>
        <button onClick={() => setMode('url')} className={getButtonClass('url')}>
          <LinkIcon className="inline-block w-4 h-4 mr-2" />
          URL
        </button>
      </div>

      {mode === 'upload' && (
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
            disabled={isLoading}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="w-full flex items-center justify-center py-4 px-4 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:bg-gray-700/50 hover:border-indigo-500 transition duration-200 disabled:cursor-not-allowed disabled:bg-gray-800"
          >
            <UploadIcon className="w-6 h-6 mr-3" />
            Clique para selecionar um arquivo
          </button>
        </div>
      )}

      {mode === 'url' && (
        <div className="flex">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onBlur={handleUrlBlur}
            onKeyDown={handleUrlKeyDown}
            placeholder="Cole o URL direto da imagem..."
            className="flex-grow bg-gray-900 border border-gray-600 rounded-l-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 disabled:bg-gray-800"
            disabled={isLoading}
          />
        </div>
      )}
    </div>
  );
};
