import React, { useState } from 'react';
import { Download, Maximize, Palette, Heart } from 'lucide-react';
import { GeneratedImage } from '../types';

interface ImageDisplayProps {
  image: GeneratedImage | null;
  isLoading: boolean;
  error: string | null;
  onDownload: (image: GeneratedImage) => void;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ image, isLoading, error, onDownload }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleFullscreen = () => {
    setIsFullscreen(true);
  };

  const handleCloseFullscreen = () => {
    setIsFullscreen(false);
  };

  if (isLoading) {
    return (
      <div className="bg-white/90 backdrop-blur-md rounded-20 shadow-xl p-6 border border-navy/10 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 border-4 border-blue border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-mint/30 border-b-transparent rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="text-black font-black font-sniglet text-xl mb-1 uppercase tracking-tight">Splashing Colors...</p>
          <p className="text-[10px] text-navy/40 font-black font-varela uppercase tracking-widest">AI is creating your masterpiece</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/90 backdrop-blur-md rounded-20 shadow-xl p-6 border-b-4 border-red-500 h-full flex items-center justify-center text-center">
        <div className="max-w-xs">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
             <span className="text-2xl font-black">!</span>
          </div>
          <h3 className="text-lg font-black font-sniglet text-black mb-2">SPLASH FAILED</h3>
          <p className="text-xs font-bold font-varela text-red-600/70 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  if (!image) {
    return (
      <div className="bg-white/90 backdrop-blur-md rounded-20 shadow-xl p-6 border border-navy/10 h-full flex items-center justify-center text-center">
        <div>
          <div className="w-20 h-20 bg-navy/5 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Palette className="w-10 h-10 text-navy/20" />
          </div>
          <h3 className="text-2xl font-black font-sniglet text-black uppercase tracking-tight">Ready to Splash</h3>
          <p className="text-xs font-bold font-varela text-navy/40 max-w-xs mx-auto">
            Your AI-generated vision will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white/90 backdrop-blur-md rounded-20 shadow-xl p-4 border border-navy/10 h-full flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div>
            <h3 className="text-xl font-black font-sniglet text-black uppercase tracking-tight leading-none">Your Splash</h3>
            <p className="text-[10px] text-navy/40 font-black font-varela uppercase tracking-widest mt-1">AI-Powered Masterpiece</p>
          </div>
          <div className="flex space-x-1.5">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`p-2.5 rounded-xl transition-all duration-300 ${
                isLiked 
                  ? 'bg-red-500 text-white shadow-lg' 
                  : 'bg-navy/5 text-navy/40 hover:bg-red-50 hover:text-red-500'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleFullscreen}
              className="p-2.5 bg-navy/5 text-navy/40 rounded-xl hover:bg-blue/10 hover:text-blue transition-all duration-300"
            >
              <Maximize className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDownload(image)}
              className="p-2.5 bg-gradient-to-r from-blue to-navy text-white rounded-xl hover:shadow-lg transition-all duration-300"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="relative flex-grow flex items-center justify-center bg-navy/[0.02] rounded-xl overflow-hidden border border-navy/5 shadow-inner p-2 group">
          <img
            src={image.url}
            alt={image.prompt}
            className={`max-w-full max-h-full object-contain rounded-lg shadow-2xl transition-all duration-500 ${
              imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
            onLoad={handleImageLoad}
          />
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-blue border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          
          {/* Subtle Overlay Info */}
          <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
             <div className="bg-black/40 backdrop-blur-md p-3 rounded-xl border border-white/10">
                <p className="text-[10px] font-bold font-varela text-white line-clamp-2">{image.prompt}</p>
             </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2 flex-shrink-0">
          <div className="flex flex-col items-center p-2 bg-navy/5 rounded-xl border border-navy/5">
            <span className="text-[8px] font-black text-navy/30 uppercase tracking-tighter">Style</span>
            <span className="text-[10px] font-black font-sniglet text-navy uppercase truncate w-full text-center">{image.style}</span>
          </div>
          <div className="flex flex-col items-center p-2 bg-navy/5 rounded-xl border border-navy/5">
            <span className="text-[8px] font-black text-navy/30 uppercase tracking-tighter">Size</span>
            <span className="text-[10px] font-black font-sniglet text-navy uppercase truncate w-full text-center">{image.size}</span>
          </div>
          <div className="flex flex-col items-center p-2 bg-navy/5 rounded-xl border border-navy/5">
            <span className="text-[8px] font-black text-navy/30 uppercase tracking-tighter">Model</span>
            <span className="text-[10px] font-black font-sniglet text-navy uppercase truncate w-full text-center">{image.model}</span>
          </div>
          <div className="flex flex-col items-center p-2 bg-navy/5 rounded-xl border border-navy/5">
            <span className="text-[8px] font-black text-navy/30 uppercase tracking-tighter">Quality</span>
            <span className="text-[10px] font-black font-sniglet text-navy uppercase truncate w-full text-center">{image.quality}</span>
          </div>
        </div>
      </div>

      {isFullscreen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <button
            onClick={handleCloseFullscreen}
            className="absolute top-6 right-6 p-4 bg-white/10 text-white rounded-2xl hover:bg-white/20 transition-all duration-300 z-10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={image.url}
            alt={image.prompt}
            className="max-w-full max-h-full object-contain rounded-2xl shadow-[0_0_100px_rgba(0,180,255,0.3)]"
          />
        </div>
      )}
    </>
  );
};

export default ImageDisplay;