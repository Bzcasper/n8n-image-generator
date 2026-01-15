import { GeneratedImage } from '../types';

const SESSION_STORAGE_KEY = 'splashtool_images';
const MAX_CACHED_IMAGES = 50; // Maximum number of images to cache in session storage

export const sessionImageCache = {
  getImages: (): GeneratedImage[] => {
    try {
      const cached = sessionStorage.getItem(SESSION_STORAGE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error('Failed to read cached images:', error);
      return [];
    }
  },

  addImage: (image: GeneratedImage): void => {
    try {
      const images = sessionImageCache.getImages();
      const existingIndex = images.findIndex(img => img.id === image.id);
      
      if (existingIndex >= 0) {
        images[existingIndex] = image;
      } else {
        images.unshift(image);
      }

      const limitedImages = images.slice(0, MAX_CACHED_IMAGES);
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(limitedImages));
    } catch (error) {
      console.error('Failed to cache image:', error);
    }
  },

  removeImage: (imageId: string): void => {
    try {
      const images = sessionImageCache.getImages().filter(img => img.id !== imageId);
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(images));
    } catch (error) {
      console.error('Failed to remove cached image:', error);
    }
  },

  clearAll: (): void => {
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear cached images:', error);
    }
  }
};
