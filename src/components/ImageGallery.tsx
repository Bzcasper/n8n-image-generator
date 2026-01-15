import React, { useState } from 'react';
import { Download, Calendar, Settings, Monitor, Palette, X, Heart } from 'lucide-react';
import { GeneratedImage } from '../types';

interface ImageGalleryProps {
  images: GeneratedImage[];
  onImageSelect: (image: GeneratedImage) => void;
  onDownload: (image: GeneratedImage) => void;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, onImageSelect, onDownload }) => {
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [likedImages, setLikedImages] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'photorealistic' | 'artistic' | 'cartoon' | 'cyberpunk' | 'fantasy'>('all');

  const filteredImages = filter === 'all' ? images : images.filter(img => img.style === filter);

  const handleImageClick = (image: GeneratedImage) => {
    setSelectedImage(image);
    onImageSelect(image);
  };

  const toggleLike = (imageId: string) => {
    const newLikedImages = new Set(likedImages);
    if (newLikedImages.has(imageId)) {
      newLikedImages.delete(imageId);
    } else {
      newLikedImages.add(imageId);
    }
    setLikedImages(newLikedImages);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <>
      <div className="bg-white/80 backdrop-blur-sm rounded-20 shadow-xl p-4 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-black font-sniglet text-black uppercase tracking-tight">Your Gallery</h3>
            <p className="text-[10px] text-navy/50 font-varela font-bold uppercase tracking-wider">
              {images.length} {images.length === 1 ? 'Image' : 'Images'}
            </p>
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'photorealistic' | 'artistic' | 'cartoon' | 'cyberpunk' | 'fantasy')}
            className="text-[10px] font-black font-varela bg-white border-2 border-navy/10 rounded-lg px-3 py-1.5 outline-none focus:border-blue transition-colors uppercase tracking-wider cursor-pointer"
          >
            <option value="all">All Styles</option>
            <option value="photorealistic">Photorealistic</option>
            <option value="artistic">Artistic</option>
            <option value="cartoon">Cartoon</option>
            <option value="cyberpunk">Cyberpunk</option>
            <option value="fantasy">Fantasy</option>
          </select>
        </div>

        {filteredImages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-mint/15 rounded-20 flex items-center justify-center mx-auto mb-3">
              <Palette className="w-8 h-8 text-mint" />
            </div>
            <p className="text-sm font-black font-varela text-navy/60 mb-1">No Images Yet</p>
            <p className="text-[10px] font-bold font-varela text-navy/40 uppercase tracking-wider">
              Generate your first masterpiece
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {filteredImages.map((image) => (
              <div
                key={image.id}
                className={`relative group aspect-square rounded-12 overflow-hidden cursor-pointer transition-all duration-200 ${
                  selectedImage?.id === image.id ? 'ring-2 ring-blue shadow-lg scale-105' : 'hover:ring-2 hover:ring-mint hover:scale-105'
                }`}
                onClick={() => handleImageClick(image)}
              >
                <img
                  src={image.url}
                  alt={image.prompt}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                <div className="absolute top-2 right-2 flex gap-1">
                  {likedImages.has(image.id) && (
                    <div className="p-1.5 bg-pink-500 rounded-full shadow-lg">
                      <Heart className="w-3 h-3 text-white fill-current" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-8"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] bg-white rounded-20 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/30 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            <div className="flex flex-col md:flex-row max-h-[90vh]">
              <div className="flex-1 flex items-center justify-center bg-[#F0F2F5] p-6">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.prompt}
                  className="max-w-full max-h-[70vh] object-contain rounded-16 shadow-xl"
                />
              </div>

              <div className="w-full md:w-80 bg-white p-6 flex flex-col overflow-y-auto">
                <h4 className="text-lg font-black font-sniglet text-black uppercase tracking-tight mb-4">
                  Image Details
                </h4>

                <div className="space-y-4 flex-grow">
                  <div>
                    <p className="text-[10px] font-black font-varela text-navy/50 uppercase tracking-widest mb-1">
                      Prompt
                    </p>
                    <p className="text-sm font-bold font-varela text-slate-700 leading-relaxed">
                      {selectedImage.prompt}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-navy/5 rounded-xl">
                      <Settings className="w-4 h-4 text-navy mb-1.5" />
                      <p className="text-[10px] font-black font-varela text-navy uppercase">
                        {selectedImage.model}
                      </p>
                    </div>
                    <div className="p-3 bg-blue/5 rounded-xl">
                      <Monitor className="w-4 h-4 text-blue mb-1.5" />
                      <p className="text-[10px] font-black font-varela text-blue uppercase">
                        {selectedImage.size}
                      </p>
                    </div>
                    <div className="p-3 bg-mint/5 rounded-xl">
                      <Palette className="w-4 h-4 text-mint mb-1.5" />
                      <p className="text-[10px] font-black font-varela text-mint uppercase">
                        {selectedImage.style}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-navy/50" />
                    <p className="text-[10px] font-bold font-varela text-navy/60 uppercase tracking-wider">
                      {formatTimestamp(selectedImage.timestamp)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <button
                    onClick={() => toggleLike(selectedImage.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-black font-sniglet text-sm uppercase tracking-wider transition-all duration-200 ${
                      likedImages.has(selectedImage.id)
                        ? 'bg-pink-500 text-white hover:bg-pink-600'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${likedImages.has(selectedImage.id) ? 'fill-current' : ''}`} />
                    <span>{likedImages.has(selectedImage.id) ? 'Liked' : 'Like'}</span>
                  </button>

                  <button
                    onClick={() => {
                      onDownload(selectedImage);
                      setSelectedImage(null);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-black font-sniglet text-sm uppercase tracking-wider text-white transition-all duration-200 hover:-translate-y-1 shadow-lg"
                    style={{
                      background: 'linear-gradient(135deg, #48E5B6 0%, #00B4FF 50%, #006D88 100%)',
                    }}
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageGallery;
