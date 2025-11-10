import React, { useState, useEffect } from 'react';
import { DownloadIcon, ImageIcon, AlertTriangleIcon, RefreshIcon } from './IconComponents';

interface ThumbnailPreviewProps {
  generatedThumbnail: string | null;
  isLoading: boolean;
  error: string | null;
}

export const ThumbnailPreview: React.FC<ThumbnailPreviewProps> = ({
  generatedThumbnail,
  isLoading,
  error,
}) => {
  const [isImageVisible, setIsImageVisible] = useState(false);

  useEffect(() => {
    if (generatedThumbnail && !isLoading) {
      // Use a short delay to allow the DOM to update before starting the transition
      const timer = setTimeout(() => setIsImageVisible(true), 50);
      return () => clearTimeout(timer);
    } else {
      setIsImageVisible(false);
    }
  }, [generatedThumbnail, isLoading]);


  const handleDownload = (format: 'png' | 'jpeg') => {
    if (!generatedThumbnail) return;

    const link = document.createElement('a');
    
    if (format === 'png') {
        link.href = generatedThumbnail;
        link.download = 'thumbnail.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        const img = new Image();
        img.src = generatedThumbnail;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            // Ensure canvas is 16:9 for JPG conversion
            canvas.width = 1280;
            canvas.height = 720;

            const ctx = canvas.getContext('2d');
            if (ctx) {
                // Draw a black background in case the source PNG has transparency
                ctx.fillStyle = '#000000';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                link.href = canvas.toDataURL('image/jpeg', 1.0); // Max quality
                link.download = 'thumbnail.jpeg';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        };
    }
  };


  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-dark-text-secondary">
          <RefreshIcon className="w-16 h-16 animate-spin text-brand-blue" />
          <p className="mt-4 text-lg font-semibold">AI is designing your thumbnail...</p>
          <p className="text-sm">This might take a moment.</p>
        </div>
      );
    }
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-red-400 p-4">
          <AlertTriangleIcon className="w-16 h-16" />
          <p className="mt-4 text-lg font-semibold">An Error Occurred</p>
          <p className="text-sm text-center">{error}</p>
        </div>
      );
    }
    if (generatedThumbnail) {
      return (
        <img 
            src={generatedThumbnail} 
            alt="Generated thumbnail" 
            className={`w-full h-full object-contain transition-opacity duration-700 ease-in-out ${isImageVisible ? 'opacity-100' : 'opacity-0'}`}
        />
      );
    }
    return (
      <div className="flex flex-col items-center justify-center h-full text-dark-text-secondary">
        <ImageIcon className="w-24 h-24" />
        <p className="mt-4 text-lg font-semibold">Your thumbnail will appear here</p>
        <p className="text-sm">Fill out the controls and click "Generate"</p>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="aspect-[16/9] w-full bg-dark-surface border-2 border-dark-border rounded-lg flex items-center justify-center overflow-hidden shadow-lg">
        {renderContent()}
      </div>
      {generatedThumbnail && !isLoading && (
        <div className="mt-4 flex items-center justify-center space-x-4">
            <button onClick={() => handleDownload('png')} className="flex items-center bg-brand-blue text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-500 transition-colors">
                <DownloadIcon className="w-5 h-5 mr-2" /> Download PNG
            </button>
            <button onClick={() => handleDownload('jpeg')} className="flex items-center bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-gray-500 transition-colors">
                <DownloadIcon className="w-5 h-5 mr-2" /> Download JPEG
            </button>
        </div>
      )}
    </div>
  );
};