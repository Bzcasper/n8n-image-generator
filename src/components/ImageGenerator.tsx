import React, { useState, useCallback, useEffect, useRef } from 'react';
import Header from './Header';
import GenerationForm from './GenerationForm';
import ImageDisplay from './ImageDisplay';
import ImageGallery from './ImageGallery';
import { GenerationParams, GeneratedImage } from '../types';
import { sessionImageCache } from '../lib/imageCache';
import { useAuth, fetchWithAuth } from '../lib/backendAuth';

interface ImageGeneratorProps {
  onBackToLanding: () => void;
}

const ImageGenerator: React.FC<ImageGeneratorProps> = ({ onBackToLanding }) => {
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);
  const [imageHistory, setImageHistory] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const { isAuthenticated, accessToken, isLoading: authLoading } = useAuth();
  const abortControllerRef = React.useRef<AbortController | null>(null);
  const objectUrlsRef = React.useRef<Set<string>>(new Set());

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;

      const x = (clientX / innerWidth) * 2 - 1;
      const y = (clientY / innerHeight) * 2 - 1;

      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrlsRef.current.clear();
    };
  }, []);

  const fetchUserImages = useCallback(async () => {
    if (!accessToken) return;

    try {
      const response = await fetchWithAuth('/api/users/images');

      if (response.ok) {
        const data = await response.json();
        setImageHistory(data.images || []);
      }
    } catch (err) {
      console.error('Failed to fetch user images:', err);
    }
  }, [accessToken]);

  useEffect(() => {
    if (authLoading) return;

    if (isAuthenticated) {
      fetchUserImages();
    } else {
      const cachedImages = sessionImageCache.getImages();
      setImageHistory(cachedImages);
    }
  }, [isAuthenticated, authLoading, fetchUserImages]);

  const generateImage = useCallback(async (params: GenerationParams) => {
    setIsLoading(true);
    setError(null);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const timeoutId = setTimeout(() => {
      abortController.abort();
      setError('Image generation timed out. Please try again.');
    }, 60000);

    try {
      const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;

      if (!webhookUrl) {
        throw new Error('Webhook URL not configured. Please set VITE_N8N_WEBHOOK_URL in your .env file.');
      }

      // Sanitize input by trimming whitespace
      const sanitizedMessage = params.message.trim();

      const queryParams = new URLSearchParams({
        message: sanitizedMessage,
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
        signal: abortController.signal,
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
      setImageHistory((prev) => [generatedImage, ...prev]);

      objectUrlsRef.current.add(imageUrl);

      sessionImageCache.addImage(generatedImage);

      await fetch('/api/increment-generation', {
        method: 'POST',
      }).catch((err) => console.error('Failed to increment rate limit:', err));

      if (isAuthenticated && accessToken) {
        await fetchWithAuth('/api/users/images', {
          method: 'POST',
          body: JSON.stringify({
            prompt: params.message,
            imageUrl: generatedImage.url,
            style: params.style,
            size: params.size,
            quality: params.quality,
            seed: params.seed,
          }),
        }).catch((err) => console.error('Failed to save image:', err));
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Image generation timed out. Please try again.');
      } else {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      }
    } finally {
      clearTimeout(timeoutId);
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  }, [isAuthenticated, accessToken]);

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
    <div
      ref={containerRef}
      className="min-h-screen bg-[#F0F2F5] relative overflow-x-hidden flex flex-col"
    >
      {/* Dynamic Background Blobs */}
      <div
        className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full blur-[120px] opacity-40 mix-blend-multiply transition-transform duration-75 ease-out will-change-transform pointer-events-none"
        style={{
          backgroundColor: '#48E5B6',
          transform: `translate(${mousePos.x * -40}px, ${mousePos.y * -40}px)`
        }}
      />
      <div
        className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full blur-[140px] opacity-40 mix-blend-multiply transition-transform duration-100 ease-out will-change-transform pointer-events-none"
        style={{
          backgroundColor: '#00B4FF',
          transform: `translate(${mousePos.x * 50}px, ${mousePos.y * 50}px)`
        }}
      />
      <div
        className="absolute top-[20%] right-[20%] w-[30vw] h-[30vw] rounded-full blur-[100px] opacity-30 mix-blend-multiply transition-transform duration-150 ease-out will-change-transform pointer-events-none"
        style={{
          backgroundColor: '#006D88',
          transform: `translate(${mousePos.x * -20}px, ${mousePos.y * -20}px)`
        }}
      />

      <div className="relative z-10 flex flex-col h-full">
        <Header onBackToLanding={onBackToLanding} />

        <main className="flex-grow flex flex-col px-4 md:px-6 py-4">
          <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 overflow-hidden max-w-[1600px] mx-auto w-full min-h-0">
            {/* Left Column: Form */}
            <div className="lg:col-span-4 min-h-0 flex flex-col">
              <GenerationForm
                onGenerate={generateImage}
                isLoading={isLoading}
                error={error}
              />
            </div>

            {/* Right Column: Main Image Display */}
            <div className="lg:col-span-8 min-h-0 flex flex-col">
              <ImageDisplay
                image={currentImage}
                isLoading={isLoading}
                error={error}
                onDownload={handleDownload}
              />
            </div>
          </div>

          {/* Bottom Section: History */}
          <div className="mt-4 md:mt-6 flex-shrink-0 h-40 md:h-48">
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
