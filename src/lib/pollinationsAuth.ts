import { useEffect } from 'react';

export const usePollinationsAuth = () => {
  useEffect(() => {
    const handleAuthCallback = () => {
      const hash = window.location.hash;
      
      if (hash && hash.includes('api_key=')) {
        const params = new URLSearchParams(hash.slice(1));
        const apiKey = params.get('api_key');
        
        if (apiKey) {
          localStorage.setItem('pollinations_api_key', apiKey);
          localStorage.setItem('user_tier', 'paid');
          
          window.location.hash = '';
          
          window.location.reload();
        }
      }
    };

    handleAuthCallback();
  }, []);
};

export const initPollinationsAuth = () => {
  const hash = window.location.hash;
  
  if (hash && hash.includes('api_key=')) {
    const params = new URLSearchParams(hash.slice(1));
    const apiKey = params.get('api_key');
    
    if (apiKey) {
      localStorage.setItem('pollinations_api_key', apiKey);
      localStorage.setItem('user_tier', 'paid');
      
      window.location.hash = '';
      
      return true;
    }
  }
  
  return false;
};
