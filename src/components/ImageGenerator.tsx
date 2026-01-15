import React, { useState, useCallback } from 'react';
import Header from './Header';
import GenerationForm from './GenerationForm';
import ImageDisplay from './ImageDisplay';
import ImageGallery from './ImageGallery';
import { GenerationParams, GeneratedImage } from '../types';

interface ImageGeneratorProps {
  onBackToLanding: () => void;
}

const ImageGenerator: React.FC<ImageGeneratorProps> = ({ onBackToLanding }) => {
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);
  const [imageHistory, setImageHistory] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateImage = useCallback(async (params: GenerationParams) => {
    setIsLoading(true);
    setError(null);

    try {
      // Webhook URL from environment variable
      const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;

      if (!webhookUrl) {
        throw new Error('Webhook URL not configured. Please set VITE_N8N_WEBHOOK_URL in your .env file.');
      }
      
      const queryParams = new URLSearchParams({
        message: params.message,
        style: params.style,
        size: params.size,
        quality: params.quality,
        model: params.model,
        seed: params.seed.toString(),
      });

      const response = await fetch(`${webhookUrl}?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment before trying again.');
        }
        throw new Error(`Failed to generate image: ${response.statusText}`);
      }

      const imageBlob = await response.blob();
      const imageUrl = URL.createObjectURL(imageBlob);

      const generatedImage: GeneratedImage = {
        id: Date.now().toString(),
        url: imageUrl,
        prompt: params.message,
        style: params.style,
        size: params.size,
        quality: params.quality,
        model: params.model,
        seed: params.seed,
        timestamp: new Date().toISOString(),
      };

      setCurrentImage(generatedImage);
      setImageHistory(prev => [generatedImage, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleImageSelect = useCallback((image: GeneratedImage) => {
    setCurrentImage(image);
  }, []);

  const handleDownload = useCallback(async (image: GeneratedImage) => {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ai-image-${image.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    }
  }, []);

  return (
    <div className="h-screen bg-[#F0F2F5] relative overflow-hidden flex flex-col">
      {/* Dynamic Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full blur-[120px] opacity-20 bg-mint pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full blur-[120px] opacity-20 bg-blue pointer-events-none" />

      <div className="relative z-10 flex flex-col h-full">
        <Header onBackToLanding={onBackToLanding} />
        
        <main className="flex-grow flex flex-col overflow-hidden px-6 py-4">
          <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden max-w-[1600px] mx-auto w-full">
            {/* Left Column: Form */}
            <div className="lg:col-span-5 h-full overflow-y-auto pr-2 custom-scrollbar">
              <GenerationForm
                onGenerate={generateImage}
                isLoading={isLoading}
                error={error}
              />
            </div>
            
            {/* Right Column: Main Image Display */}
            <div className="lg:col-span-7 h-full flex flex-col overflow-hidden">
              <ImageDisplay
                image={currentImage}
                isLoading={isLoading}
                error={error}
                onDownload={handleDownload}
              />
            </div>
          </div>

          {/* Bottom Section: History */}
          <div className="mt-6 h-48 flex-shrink-0">
            <ImageGallery
              images={imageHistory}
              onImageSelect={handleImageSelect}
              onDownload={handleDownload}
            />
          </div>
        </main>

        <footer className="py-2 text-center text-[10px] font-black uppercase tracking-widest text-navy/30 font-varela">
          Powered by AI Tool Pool
        </footer>
      </div>
    </div>
  );
};

export default ImageGenerator;