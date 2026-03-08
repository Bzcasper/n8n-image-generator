import React, { useState, useCallback } from 'react';
import { ExternalLink, Key, Check, X, Zap } from 'lucide-react';

interface PollinationsAuthProps {
  onTierChange?: (tier: string) => void;
}

const POLLINATIONS_AUTH_URL = 'https://enter.pollinations.ai/authorize';

const PollinationsAuth: React.FC<PollinationsAuthProps> = ({ onTierChange }) => {
  const [apiKey, setApiKey] = useState<string>(localStorage.getItem('pollinations_api_key') || '');
  const [showInput, setShowInput] = useState(false);

  const handleConnect = useCallback(() => {
    const redirectUrl = window.location.origin + window.location.pathname;
    const authUrl = `${POLLINATIONS_AUTH_URL}?redirect_url=${encodeURIComponent(redirectUrl)}&models=flux,zimage,klein,klein-large,imagen-4,grok-imagine`;
    window.location.href = authUrl;
  }, []);

  const handleSaveKey = useCallback(() => {
    if (apiKey.trim()) {
      localStorage.setItem('pollinations_api_key', apiKey.trim());
      localStorage.setItem('user_tier', 'paid');
      onTierChange?.('paid');
      setShowInput(false);
    }
  }, [apiKey, onTierChange]);

  const handleDisconnect = useCallback(() => {
    localStorage.removeItem('pollinations_api_key');
    localStorage.setItem('user_tier', 'free');
    setApiKey('');
    onTierChange?.('free');
  }, [onTierChange]);

  const isConnected = !!localStorage.getItem('pollinations_api_key');

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-20 shadow-xl p-4 border border-navy/10">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-navy/5 rounded-lg">
          <Zap className="w-5 h-5 text-navy" />
        </div>
        <div>
          <h3 className="text-lg font-black font-sniglet text-black uppercase tracking-tight">
            Pollinations AI
          </h3>
          <p className="text-[10px] text-navy/40 font-black font-varela uppercase tracking-widest">
            {isConnected ? 'Premium Connected' : 'Free Tier'}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {isConnected ? (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-green-600 text-sm font-bold font-varela">
              <Check className="w-4 h-4" />
              <span>API Key Connected</span>
            </div>
            <p className="text-[10px] text-navy/50 font-varela">
              Premium models unlocked: Z-Image, Klein, Imagen-4, Grok Imagine
            </p>
            <button
              onClick={handleDisconnect}
              className="w-full py-2 px-4 bg-red-50 text-red-600 rounded-lg text-sm font-bold font-varela hover:bg-red-100 transition-colors flex items-center justify-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Disconnect</span>
            </button>
          </div>
        ) : showInput ? (
          <div className="space-y-3">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Pollinations API key"
              className="w-full px-3 py-2 border-2 border-navy/10 rounded-lg text-sm font-varela focus:border-blue focus:outline-none"
            />
            <div className="flex space-x-2">
              <button
                onClick={handleSaveKey}
                className="flex-1 py-2 px-4 bg-navy text-white rounded-lg text-sm font-bold font-varela hover:bg-navy/90 transition-colors"
              >
                Save Key
              </button>
              <button
                onClick={() => setShowInput(false)}
                className="py-2 px-4 bg-gray-100 text-gray-600 rounded-lg text-sm font-bold font-varela hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
              <p className="text-[11px] text-navy/70 font-varela leading-relaxed">
                <span className="font-black">Free:</span> 3 images/day using Flux model
              </p>
              <p className="text-[11px] text-navy/70 font-varela leading-relaxed mt-1">
                <span className="font-black">Premium:</span> Unlimited images with Z-Image, Klein & more
              </p>
            </div>
            <button
              onClick={handleConnect}
              className="w-full py-2 px-4 bg-gradient-to-r from-[#48E5B6] to-[#00B4FF] text-white rounded-lg text-sm font-bold font-varela hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Connect Pollinations Account</span>
            </button>
            <button
              onClick={() => setShowInput(true)}
              className="w-full py-2 px-4 border-2 border-navy/10 text-navy rounded-lg text-sm font-bold font-varela hover:bg-navy/5 transition-colors flex items-center justify-center space-x-2"
            >
              <Key className="w-4 h-4" />
              <span>Enter API Key Manually</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PollinationsAuth;
