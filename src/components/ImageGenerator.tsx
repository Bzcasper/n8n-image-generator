import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import GenerationForm from './GenerationForm';
import ImageDisplay from './ImageDisplay';
import ImageGallery from './ImageGallery';
import { GenerationParams, GeneratedImage } from '../types';
import { sessionImageCache } from '../lib/imageCache';
import { useAuth, fetchWithAuth } from '../lib/backendAuth';
import { MODELS } from '../lib/models';

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

  const { user, isAuthenticated, accessToken, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
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
    const urls = objectUrlsRef.current;
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
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
      const selectedModel = MODELS.find(m => m.id === params.model) || MODELS[0];
      const pollenBalance = user?.pollen || 0;

      // Enforcement logic
      if (selectedModel.isPaidOnly && (!isAuthenticated || user?.tier === 'SEED')) {
        setError(`Upgrade required. ${selectedModel.name} is a Diamond model.`);
        setIsLoading(false);
        return;
      }

      if (pollenBalance < selectedModel.cost) {
        setError(`Insufficient Pollen. Needed: ${selectedModel.cost}, Available: ${pollenBalance.toFixed(3)}`);
        setIsLoading(false);
        return;
      }

      const [width, height] = params.size.split('x').map(Number);

      const styleMap: Record<string, string> = {
        photorealistic: '',
        artistic: 'oil painting style, masterpiece',
        cartoon: 'cartoon style, animated',
        cyberpunk: 'cyberpunk aesthetic, neon lights',
        fantasy: 'fantasy art, magical',
        minimalist: 'minimalist design, clean',
        vintage: 'vintage style, retro',
      };

      const promptWithStyle = params.style !== 'photorealistic' && styleMap[params.style]
        ? `${params.message}, ${styleMap[params.style]}`
        : params.message;

      const encodedPrompt = encodeURIComponent(promptWithStyle);
      const queryParams = new URLSearchParams({
        width: width.toString(),
        height: height.toString(),
        seed: params.seed.toString(),
        model: selectedModel.id,
        enhance: params.quality === 'high' ? 'true' : 'false',
      });

      const imageUrl = `https://gen.pollinations.ai/image/${encodedPrompt}?${queryParams}`;

      const apiKey = import.meta.env.VITE_POLLINATIONS_API_KEY;
      const referrer = import.meta.env.VITE_APP_URL || 'http://localhost:5173';

      const response = await fetch(imageUrl, {
        method: 'GET',
        headers: {
          'Accept': 'image/*',
          'Referer': referrer,
          ...(apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {}),
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
      const blobUrl = URL.createObjectURL(imageBlob);

      const generatedImage: GeneratedImage = {
        id: Date.now().toString(),
        url: blobUrl,
        prompt: params.message,
        style: params.style,
        size: params.size,
        quality: params.quality,
        model: selectedModel.name,
        seed: params.seed,
        timestamp: new Date().toISOString(),
        cost: selectedModel.cost
      };

      setCurrentImage(generatedImage);
      setImageHistory((prev) => [generatedImage, ...prev]);

      objectUrlsRef.current.add(blobUrl);
      sessionImageCache.addImage(generatedImage);

      if (isAuthenticated && accessToken) {
        await fetchWithAuth('/api/users/images', {
          method: 'POST',
          body: JSON.stringify({
            prompt: params.message,
            imageUrl: generatedImage.url,
            style: params.style,
            size: params.size,
            quality: params.quality,
            model: selectedModel.id,
            cost: selectedModel.cost,
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
  }, [isAuthenticated, accessToken, user]);

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

      <div className="relative z-10 flex flex-col h-screen overflow-hidden">
        <div className="absolute top-4 right-4 z-20 flex items-center gap-3">
          {isAuthenticated && user && (
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white/80 backdrop-blur-md rounded-full shadow-sm border border-blue/20">
                <Diamond className="w-3.5 h-3.5 text-blue" />
                <span className="text-xs font-black font-sniglet text-blue">
                  {user.pollen.toFixed(3)}
                </span>
                <span className="text-[8px] font-black text-navy/30 uppercase tracking-widest ml-1">Pollen</span>
              </div>
              <span className="text-[8px] font-black text-navy/40 uppercase tracking-widest mt-1 mr-2">
                Tier: {user.tier}
              </span>
            </div>
          )}
          <button
            onClick={() => navigate('/account/profile')}
            className="px-5 py-2.5 border-2 border-white/20 rounded-16 font-varela font-bold text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #48E5B6 0%, #00B4FF 100%)',
            }}
          >
            Dashboard
          </button>
        </div>
        <Header onBackToLanding={onBackToLanding} />

        <main className="flex-grow flex flex-col px-4 md:px-6 py-2 overflow-hidden h-full">
          <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 overflow-hidden max-w-[1600px] mx-auto w-full h-full min-h-0">
            {/* Left Column: Form */}
            <div className="lg:col-span-4 h-full min-h-0 flex flex-col overflow-hidden">
              <GenerationForm
                onGenerate={generateImage}
                isLoading={isLoading}
                error={error}
              />
            </div>

            {/* Right Column: Main Image Display */}
            <div className="lg:col-span-8 h-full min-h-0 flex flex-col overflow-hidden">
              <ImageDisplay
                image={currentImage}
                isLoading={isLoading}
                error={error}
                onDownload={handleDownload}
              />
            </div>
          </div>

          {/* Bottom Section: History */}
          <div className="mt-4 flex-shrink-0 overflow-hidden">
            <ImageGallery
              images={imageHistory}
              onImageSelect={handleImageSelect}
              onDownload={handleDownload}
            />
          </div>
        </main>

        <footer className="py-1 text-center text-[8px] font-black uppercase tracking-widest text-navy/30 font-varela flex-shrink-0">
          Powered by AI Tool Pool
        </footer>
      </div>
    </div>
  );
};

export default ImageGenerator;
